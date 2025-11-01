import { useEffect, useRef } from "react";
import { useGameStore, type Position } from "@/lib/stores/useGameStore";

interface PathNode {
  position: Position;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

function findPath(start: Position, end: Position, gridSize: number, tiles: any[][]): Position[] {
  const openSet: PathNode[] = [];
  const closedSet: Set<string> = new Set();
  
  const heuristic = (pos: Position): number => {
    return Math.abs(pos.x - end.x) + Math.abs(pos.y - end.y);
  };
  
  const posKey = (pos: Position): string => `${pos.x},${pos.y}`;
  
  const startNode: PathNode = {
    position: start,
    g: 0,
    h: heuristic(start),
    f: heuristic(start),
    parent: null,
  };
  
  openSet.push(startNode);
  
  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;
    
    if (current.position.x === end.x && current.position.y === end.y) {
      const path: Position[] = [];
      let node: PathNode | null = current;
      while (node) {
        path.unshift(node.position);
        node = node.parent;
      }
      return path.slice(1);
    }
    
    closedSet.add(posKey(current.position));
    
    const neighbors = [
      { x: current.position.x + 1, y: current.position.y },
      { x: current.position.x - 1, y: current.position.y },
      { x: current.position.x, y: current.position.y + 1 },
      { x: current.position.x, y: current.position.y - 1 },
      { x: current.position.x + 1, y: current.position.y + 1 },
      { x: current.position.x + 1, y: current.position.y - 1 },
      { x: current.position.x - 1, y: current.position.y + 1 },
      { x: current.position.x - 1, y: current.position.y - 1 },
    ];
    
    for (const neighbor of neighbors) {
      if (
        neighbor.x < 0 ||
        neighbor.x >= gridSize ||
        neighbor.y < 0 ||
        neighbor.y >= gridSize
      ) {
        continue;
      }
      
      const tile = tiles[neighbor.y]?.[neighbor.x];
      if (!tile || !tile.isWalkable) {
        continue;
      }
      
      const neighborKey = posKey(neighbor);
      if (closedSet.has(neighborKey)) continue;
      
      const isDiagonal =
        neighbor.x !== current.position.x && neighbor.y !== current.position.y;
      const moveCost = isDiagonal ? 1.414 : 1;
      const g = current.g + moveCost;
      
      const existingNode = openSet.find(
        (n) => n.position.x === neighbor.x && n.position.y === neighbor.y
      );
      
      if (existingNode) {
        if (g < existingNode.g) {
          existingNode.g = g;
          existingNode.f = g + existingNode.h;
          existingNode.parent = current;
        }
      } else {
        const h = heuristic(neighbor);
        openSet.push({
          position: neighbor,
          g,
          h,
          f: g + h,
          parent: current,
        });
      }
    }
  }
  
  return [];
}

export function MovementController() {
  const player = useGameStore((state) => state.player);
  const targetPosition = useGameStore((state) => state.targetPosition);
  const currentPath = useGameStore((state) => state.currentPath);
  const isMoving = useGameStore((state) => state.isMoving);
  const isCollecting = useGameStore((state) => state.isCollecting);
  const gridSize = useGameStore((state) => state.gridSize);
  const tiles = useGameStore((state) => state.tiles);
  const collectibles = useGameStore((state) => state.collectibles);
  const artifacts = useGameStore((state) => state.artifacts);
  const setPath = useGameStore((state) => state.setPath);
  const setIsMoving = useGameStore((state) => state.setIsMoving);
  const updatePlayerPosition = useGameStore((state) => state.updatePlayerPosition);
  const updateVisualPosition = useGameStore((state) => state.updateVisualPosition);
  const setPlayerRotation = useGameStore((state) => state.setPlayerRotation);
  const setTargetPosition = useGameStore((state) => state.setTargetPosition);
  const highlightPath = useGameStore((state) => state.highlightPath);
  const clearHighlights = useGameStore((state) => state.clearHighlights);
  const activePowerUps = useGameStore((state) => state.activePowerUps);
  const getTravelTime = useGameStore((state) => state.getTravelTime);
  const startTravel = useGameStore((state) => state.startTravel);
  const startCollection = useGameStore((state) => state.startCollection);
  const completeCollection = useGameStore((state) => state.completeCollection);
  const collectionStartTime = useGameStore((state) => state.collectionStartTime);
  const collectionDuration = useGameStore((state) => state.collectionDuration);
  const getEstimatedCollectionTime = useGameStore((state) => state.getEstimatedCollectionTime);
  const collectArtifact = useGameStore((state) => state.collectArtifact);
  
  const movementProgress = useRef(0);
  const lastTime = useRef(performance.now());
  const TILE_TRANSITION_TIME = 600;
  
  useEffect(() => {
    if (targetPosition && !isMoving && !isCollecting) {
      const path = findPath(player.position, targetPosition, gridSize, tiles);
      
      if (path.length > 0) {
        const distance = path.length;
        const travelTime = getTravelTime(distance);
        console.log(`Path found with ${path.length} steps, ETA: ${(travelTime / 1000).toFixed(1)}s`);
        setPath(path);
        highlightPath(path);
        setIsMoving(true);
        startTravel(travelTime);
        movementProgress.current = 0;
      } else {
        console.log("No path found to target");
        setTargetPosition(null);
      }
    }
  }, [targetPosition, player.position, isMoving, isCollecting, gridSize, setPath, setIsMoving, setTargetPosition, highlightPath, getTravelTime, startTravel]);
  
  useEffect(() => {
    let animationFrameId: number;
    
    const animate = () => {
      const now = performance.now();
      const delta = (now - lastTime.current) / 1000;
      lastTime.current = now;
      
      const state = useGameStore.getState();
      
      if (state.isCollecting && state.collectionStartTime && state.collectionDuration) {
        const elapsed = Date.now() - state.collectionStartTime;
        if (elapsed >= state.collectionDuration) {
          completeCollection();
        }
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      
      if (!state.isMoving || state.currentPath.length === 0) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      
      movementProgress.current += delta * 1000;
      
      const nextPosition = state.currentPath[0];
      const t = Math.min(movementProgress.current / TILE_TRANSITION_TIME, 1);
      
      const currentX = state.player.position.x;
      const currentY = state.player.position.y;
      const targetX = nextPosition.x;
      const targetY = nextPosition.y;
      
      const visualX = currentX + (targetX - currentX) * t;
      const visualY = currentY + (targetY - currentY) * t;
      
      updateVisualPosition(visualX, visualY);
      
      const dx = targetX - currentX;
      const dy = targetY - currentY;
      if (dx !== 0 || dy !== 0) {
        const rotation = Math.atan2(dy, dx) + Math.PI / 2;
        setPlayerRotation(rotation);
      }
      
      if (movementProgress.current >= TILE_TRANSITION_TIME) {
        updatePlayerPosition(nextPosition);
        
        const remainingPath = state.currentPath.slice(1);
        setPath(remainingPath);
        
        if (remainingPath.length === 0) {
          setIsMoving(false);
          clearHighlights();
          console.log("Destination reached");
          
          const artifact = state.artifacts.find(
            a => !a.isCollected && a.position.x === nextPosition.x && a.position.y === nextPosition.y
          );
          
          if (artifact) {
            collectArtifact(artifact.id);
          } else {
            const collectible = state.collectibles.find(
              c => c.position.x === nextPosition.x && c.position.y === nextPosition.y
            );
            
            if (collectible) {
              const estimatedTime = getEstimatedCollectionTime(collectible.collectionTime);
              startCollection(collectible.id, estimatedTime);
            }
          }
        } else {
          highlightPath(remainingPath);
        }
        
        movementProgress.current = 0;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isMoving, isCollecting, collectionStartTime, collectionDuration, currentPath, player, updateVisualPosition, setPlayerRotation, updatePlayerPosition, setPath, setIsMoving, clearHighlights, collectArtifact, startCollection, getEstimatedCollectionTime, highlightPath, completeCollection, artifacts, collectibles]);
  
  return null;
}
