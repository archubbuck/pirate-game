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
  const tileSpacing = 0.05;

  const octagonShape = useMemo(() => {
    const shape = new THREE.Shape();
    const radius = tileSize / 2;
    const sides = 8;
    
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
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
          const posX = (x - gridSize / 2) * (tileSize + tileSpacing);
          const posZ = (y - gridSize / 2) * (tileSize + tileSpacing);
          
          let color = "#2a2a2a";
          
          if (tile.isHighlighted) {
            if (tile.highlightType === "move") {
              color = "#4a9eff";
            } else if (tile.highlightType === "attack") {
              color = "#ff4a4a";
            }
          }
          
          const isSelected = selectedTile?.x === x && selectedTile?.y === y;
          
          return (
            <mesh
              key={`${x}-${y}`}
              position={[posX, 0, posZ]}
              rotation={[-Math.PI / 2, 0, 0]}
              onClick={() => handleTileClick(x, y)}
              onPointerOver={() => handleTileHover(x, y, true)}
              onPointerOut={() => handleTileHover(x, y, false)}
            >
              <shapeGeometry args={[octagonShape]} />
              <meshStandardMaterial
                color={color}
                emissive={isSelected ? "#ffffff" : tile.isHighlighted ? color : "#000000"}
                emissiveIntensity={isSelected ? 0.3 : tile.isHighlighted ? 0.4 : 0}
                metalness={0.2}
                roughness={0.8}
              />
            </mesh>
          );
        })
      )}
      
      <gridHelper
        args={[gridSize * (tileSize + tileSpacing), gridSize, "#333333", "#1a1a1a"]}
        position={[0, -0.01, 0]}
      />
    </group>
  );
}
