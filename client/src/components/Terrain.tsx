import { useMemo } from "react";
import { useGameStore, type Tile } from "@/lib/stores/useGameStore";
import * as THREE from "three";

export function Terrain() {
  const tiles = useGameStore((state) => state.tiles);
  const gridSize = useGameStore((state) => state.gridSize);
  const setHoveredTile = useGameStore((state) => state.setHoveredTile);
  const setTargetPosition = useGameStore((state) => state.setTargetPosition);
  const phase = useGameStore((state) => state.phase);
  const player = useGameStore((state) => state.player);

  const tileSize = 1;
  const tileSpacing = 0.02;

  const octagonShape = useMemo(() => {
    const shape = new THREE.Shape();
    const radius = tileSize / (2 * Math.cos(Math.PI / 8));
    const sides = 8;
    
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2 + Math.PI / 8;
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

  const handleTileClick = (x: number, y: number) => {
    if (phase !== "playing") return;
    
    setTargetPosition({ x, y });
    console.log(`Target set to (${x}, ${y})`);
  };

  const handleTileHover = (x: number, y: number, isHovering: boolean) => {
    if (isHovering) {
      setHoveredTile({ x, y });
    } else {
      setHoveredTile(null);
    }
  };

  const visibleTiles = useMemo(() => {
    const visible: Array<{tile: Tile, x: number, y: number}> = [];
    tiles.forEach((row, y) => {
      row.forEach((tile, x) => {
        const distanceToPlayer = Math.abs(x - player.position.x) + Math.abs(y - player.position.y);
        if (distanceToPlayer <= 8) {
          visible.push({ tile, x, y });
        }
      });
    });
    return visible;
  }, [tiles, player.position.x, player.position.y]);

  return (
    <group>
      {visibleTiles.map(({ tile, x, y }) => {
          const posX = (x - gridSize / 2) * (tileSize + tileSpacing);
          const posZ = (y - gridSize / 2) * (tileSize + tileSpacing);
          
          let borderColor = "#4a4a4a";
          let baseColor = tileColors[y][x];
          
          const opacity = tile.isExplored ? 1 : 0.1;
          
          if (tile.isHighlighted && tile.isExplored) {
            borderColor = "#4a9eff";
          }
          
          return (
            <group key={`${x}-${y}`} position={[posX, 0.01, posZ]}>
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                onClick={() => handleTileClick(x, y)}
                onPointerOver={() => handleTileHover(x, y, true)}
                onPointerOut={() => handleTileHover(x, y, false)}
                receiveShadow
              >
                <shapeGeometry args={[octagonShape]} />
                <meshStandardMaterial
                  color={baseColor}
                  opacity={opacity}
                  transparent={!tile.isExplored}
                  emissive={tile.isHighlighted && tile.isExplored ? "#1a3a5a" : "#000000"}
                  emissiveIntensity={tile.isHighlighted && tile.isExplored ? 0.3 : 0}
                />
              </mesh>
              
              <lineLoop position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    count={8}
                    array={new Float32Array(
                      Array.from({ length: 8 }, (_, i) => {
                        const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
                        const radius = tileSize / (2 * Math.cos(Math.PI / 8));
                        return [Math.cos(angle) * radius, Math.sin(angle) * radius, 0];
                      }).flat()
                    )}
                    itemSize={3}
                  />
                </bufferGeometry>
                <lineBasicMaterial
                  color={borderColor}
                  linewidth={2}
                  opacity={tile.isExplored ? (tile.isHighlighted ? 1 : 0.5) : 0.05}
                  transparent
                />
              </lineLoop>
            </group>
          );
      })}
      
      <gridHelper
        args={[gridSize * (tileSize + tileSpacing), gridSize, "#222222", "#0a0a0a"]}
        position={[0, -0.01, 0]}
      />
    </group>
  );
}
