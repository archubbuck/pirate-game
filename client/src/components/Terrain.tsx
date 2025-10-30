import { useMemo } from "react";
import { useFightSimulator } from "@/lib/stores/useFightSimulator";
import * as THREE from "three";

export function Terrain() {
  const tiles = useFightSimulator((state) => state.tiles);
  const gridSize = useFightSimulator((state) => state.gridSize);
  const setHoveredTile = useFightSimulator((state) => state.setHoveredTile);
  const selectedTile = useFightSimulator((state) => state.selectedTile);
  const player = useFightSimulator((state) => state.player);
  const moveEntity = useFightSimulator((state) => state.moveEntity);
  const clearHighlights = useFightSimulator((state) => state.clearHighlights);
  const highlightTiles = useFightSimulator((state) => state.highlightTiles);
  const isValidMove = useFightSimulator((state) => state.isValidMove);
  const phase = useFightSimulator((state) => state.phase);

  const tileSize = 1;
  const tileSpacing = 0.02;

  const hexagonShape = useMemo(() => {
    const shape = new THREE.Shape();
    const radius = tileSize / 2;
    const sides = 6;
    
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2 + Math.PI / 6;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    shape.closePath();
    
    return shape;
  }, [tileSize]);

  const tileColors = useMemo(() => {
    const grayShades = ['#8a9ba8', '#9ba8b2', '#aab5be', '#b5bec5', '#c5ccd1', '#999999', '#aaaaaa', '#bbbbbb'];
    const colors: string[][] = [];
    for (let y = 0; y < gridSize; y++) {
      colors[y] = [];
      for (let x = 0; x < gridSize; x++) {
        colors[y][x] = grayShades[Math.floor(Math.random() * grayShades.length)];
      }
    }
    return colors;
  }, [gridSize]);

  const darkenColor = (color: string, factor: number = 0.8) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    const newR = Math.floor(r * factor);
    const newG = Math.floor(g * factor);
    const newB = Math.floor(b * factor);
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };

  const handleTileClick = (x: number, y: number) => {
    if (phase !== "playing") return;
    
    const tile = tiles[y][x];
    
    if (tile.isHighlighted && tile.highlightType === "move") {
      moveEntity("player", { x, y });
      clearHighlights();
    } else {
      const validMoves: { x: number; y: number }[] = [];
      
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const newX = player.position.x + dx;
          const newY = player.position.y + dy;
          
          if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
            if (isValidMove(player.position, { x: newX, y: newY })) {
              validMoves.push({ x: newX, y: newY });
            }
          }
        }
      }
      
      highlightTiles("move", validMoves);
    }
  };

  const handleTileHover = (x: number, y: number, isHovering: boolean) => {
    if (isHovering) {
      setHoveredTile({ x, y });
    } else {
      setHoveredTile(null);
    }
  };

  return (
    <group>
      {tiles.map((row, y) =>
        row.map((tile, x) => {
          const radius = tileSize / 2;
          const hexWidth = 2 * radius;
          const hexHeight = radius * Math.sqrt(3);
          
          const horizontalSpacing = (hexWidth * 0.75) + tileSpacing;
          const verticalSpacing = hexHeight + tileSpacing;
          
          const colOffset = (x % 2) * (verticalSpacing / 2);
          
          const posX = (x - gridSize / 2) * horizontalSpacing;
          const posZ = (y - gridSize / 2) * verticalSpacing + colOffset;
          
          let borderColor = "#4a4a4a";
          let baseColor = tileColors[y][x];
          
          if (tile.isHighlighted) {
            if (tile.highlightType === "move") {
              borderColor = "#4a9eff";
              baseColor = "#2a5f9f";
            } else if (tile.highlightType === "attack") {
              borderColor = "#ff4a4a";
              baseColor = "#9f2a2a";
            }
          }
          
          const isSelected = selectedTile?.x === x && selectedTile?.y === y;
          
          return (
            <group key={`${x}-${y}`} position={[posX, 0.01, posZ]}>
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                onClick={() => handleTileClick(x, y)}
                onPointerOver={() => handleTileHover(x, y, true)}
                onPointerOut={() => handleTileHover(x, y, false)}
              >
                <shapeGeometry args={[hexagonShape]} />
                <meshStandardMaterial
                  color={baseColor}
                  emissive={isSelected ? "#ffffff" : "#000000"}
                  emissiveIntensity={isSelected ? 0.2 : 0}
                  metalness={0.1}
                  roughness={0.9}
                />
              </mesh>
              
              <lineLoop rotation={[-Math.PI / 2, 0, 0]}>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    count={6}
                    array={new Float32Array([
                      Math.cos(0 * Math.PI / 3 + Math.PI / 6) * (tileSize / 2), Math.sin(0 * Math.PI / 3 + Math.PI / 6) * (tileSize / 2), 0,
                      Math.cos(1 * Math.PI / 3 + Math.PI / 6) * (tileSize / 2), Math.sin(1 * Math.PI / 3 + Math.PI / 6) * (tileSize / 2), 0,
                      Math.cos(2 * Math.PI / 3 + Math.PI / 6) * (tileSize / 2), Math.sin(2 * Math.PI / 3 + Math.PI / 6) * (tileSize / 2), 0,
                      Math.cos(3 * Math.PI / 3 + Math.PI / 6) * (tileSize / 2), Math.sin(3 * Math.PI / 3 + Math.PI / 6) * (tileSize / 2), 0,
                      Math.cos(4 * Math.PI / 3 + Math.PI / 6) * (tileSize / 2), Math.sin(4 * Math.PI / 3 + Math.PI / 6) * (tileSize / 2), 0,
                      Math.cos(5 * Math.PI / 3 + Math.PI / 6) * (tileSize / 2), Math.sin(5 * Math.PI / 3 + Math.PI / 6) * (tileSize / 2), 0,
                    ])}
                    itemSize={3}
                  />
                </bufferGeometry>
                <lineBasicMaterial
                  color={borderColor}
                  linewidth={2}
                  opacity={tile.isHighlighted ? 1 : 0.5}
                  transparent
                />
              </lineLoop>
            </group>
          );
        })
      )}
      
      <gridHelper
        args={[gridSize * (tileSize + tileSpacing), gridSize, "#222222", "#0a0a0a"]}
        position={[0, -0.01, 0]}
      />
    </group>
  );
}
