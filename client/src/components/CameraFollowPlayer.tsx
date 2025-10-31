import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/lib/stores/useGameStore";
import * as THREE from "three";

export function CameraFollowPlayer() {
  const { camera, gl } = useThree();
  const player = useGameStore((state) => state.player);
  const gridSize = useGameStore((state) => state.gridSize);
  const isCameraFollowing = useGameStore((state) => state.isCameraFollowing);
  const cameraOffset = useGameStore((state) => state.cameraOffset);
  const setCameraOffset = useGameStore((state) => state.setCameraOffset);
  const zoomLevel = useGameStore((state) => state.zoomLevel);
  
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartOffset = useRef({ x: 0, y: 0 });
  
  const tileSize = 1;
  const tileSpacing = 0.02;
  
  useEffect(() => {
    const canvas = gl.domElement;
    
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        e.preventDefault();
        setIsDragging(true);
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        dragStartOffset.current = { x: cameraOffset.x, y: cameraOffset.z };
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = (e.clientX - dragStartPos.current.x) * 0.05;
        const dy = (e.clientY - dragStartPos.current.y) * 0.05;
        
        setCameraOffset({
          x: dragStartOffset.current.x - dx,
          z: dragStartOffset.current.y + dy,
        });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    const handleContextMenu = (e: Event) => {
      e.preventDefault();
    };
    
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [gl, isDragging, cameraOffset, setCameraOffset]);
  
  useFrame(() => {
    const targetX = (player.visualPosition.x - gridSize / 2) * (tileSize + tileSpacing);
    const targetZ = (player.visualPosition.y - gridSize / 2) * (tileSize + tileSpacing);
    
    const zoomFactor = 100 / zoomLevel;
    const baseHeight = 35 * zoomFactor;
    const baseDistance = 20 * zoomFactor;
    
    const baseOffset = new THREE.Vector3(0, baseHeight, baseDistance);
    const panOffset = new THREE.Vector3(cameraOffset.x, 0, cameraOffset.z);
    
    let targetPosition: THREE.Vector3;
    if (isCameraFollowing) {
      targetPosition = new THREE.Vector3(targetX, 0, targetZ).add(baseOffset);
    } else {
      targetPosition = new THREE.Vector3(targetX, 0, targetZ).add(baseOffset).add(panOffset);
    }
    
    camera.position.lerp(targetPosition, isCameraFollowing ? 0.1 : 0.05);
    
    const lookAtTarget = new THREE.Vector3(
      targetX + (isCameraFollowing ? 0 : cameraOffset.x * 0.3),
      0,
      targetZ + (isCameraFollowing ? 0 : cameraOffset.z * 0.3)
    );
    camera.lookAt(lookAtTarget);
  });
  
  return null;
}
