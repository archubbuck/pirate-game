import * as PIXI from "pixi.js";
import { useGameStore } from "@/lib/stores/useGameStore";

export class PixiCamera {
  private app: PIXI.Application;
  private container: PIXI.Container;
  private isDragging: boolean = false;
  private dragStart: { x: number; y: number } = { x: 0, y: 0 };
  private lastMousePos: { x: number; y: number } = { x: 0, y: 0 };
  private zoom: number = 1;
  private targetZoom: number = 1;
  private minZoom: number = 0.5;
  private maxZoom: number = 6;
  private touchDistance: number = 0;
  private tileSize: number = 40;

  constructor(app: PIXI.Application, container: PIXI.Container) {
    this.app = app;
    this.container = container;
    this.setupEventListeners();
    this.centerCamera();
  }

  private setupEventListeners() {
    const canvas = this.app.canvas;

    canvas.addEventListener('mousedown', this.handleMouseDown);
    canvas.addEventListener('mousemove', this.handleMouseMove);
    canvas.addEventListener('mouseup', this.handleMouseUp);
    canvas.addEventListener('wheel', this.handleWheel, { passive: false });
    
    canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', this.handleTouchEnd);
  }

  private handleMouseDown = (e: MouseEvent) => {
    if (e.button === 0 || e.button === 2) {
      this.isDragging = true;
      this.dragStart = { x: e.clientX, y: e.clientY };
      this.lastMousePos = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (this.isDragging) {
      const dx = e.clientX - this.lastMousePos.x;
      const dy = e.clientY - this.lastMousePos.y;
      
      this.container.x += dx;
      this.container.y += dy;
      
      this.lastMousePos = { x: e.clientX, y: e.clientY };
    }
  };

  private handleMouseUp = () => {
    this.isDragging = false;
  };

  private handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    
    const currentZoom = useGameStore.getState().zoomLevel;
    const zoomAmount = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.round(currentZoom * zoomAmount);
    useGameStore.getState().setZoomLevel(newZoom);
  };

  private handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      this.touchDistance = Math.sqrt(dx * dx + dy * dy);
      e.preventDefault();
    } else if (e.touches.length === 1) {
      this.isDragging = true;
      this.lastMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  private handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (this.touchDistance > 0) {
        const zoomAmount = distance / this.touchDistance;
        const currentZoom = useGameStore.getState().zoomLevel;
        const newZoom = Math.round(currentZoom * zoomAmount);
        useGameStore.getState().setZoomLevel(newZoom);
        this.touchDistance = distance;
      }
      e.preventDefault();
    } else if (e.touches.length === 1 && this.isDragging) {
      const dx = e.touches[0].clientX - this.lastMousePos.x;
      const dy = e.touches[0].clientY - this.lastMousePos.y;
      
      this.container.x += dx;
      this.container.y += dy;
      
      this.lastMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  private handleTouchEnd = () => {
    this.isDragging = false;
    this.touchDistance = 0;
  };

  private centerCamera() {
    const gridSize = useGameStore.getState().gridSize;
    
    this.container.x = this.app.screen.width / 2;
    this.container.y = this.app.screen.height / 2;
    
    this.container.pivot.x = (gridSize * this.tileSize) / 2;
    this.container.pivot.y = (gridSize * this.tileSize) / 2;
  }

  private getExploredBounds(): { minX: number; maxX: number; minY: number; maxY: number } | null {
    const tiles = useGameStore.getState().tiles;
    const gridSize = useGameStore.getState().gridSize;
    
    let minX = gridSize;
    let maxX = 0;
    let minY = gridSize;
    let maxY = 0;
    let hasExplored = false;
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (tiles[y][x].isExplored) {
          hasExplored = true;
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }
    
    if (!hasExplored) return null;
    
    return { minX, maxX, minY, maxY };
  }

  private calculateMaxZoom(): number {
    const bounds = this.getExploredBounds();
    if (!bounds) return this.maxZoom;
    
    const exploredWidth = (bounds.maxX - bounds.minX + 1) * this.tileSize;
    const exploredHeight = (bounds.maxY - bounds.minY + 1) * this.tileSize;
    
    const screenWidth = this.app.screen.width;
    const screenHeight = this.app.screen.height;
    
    const maxZoomX = (screenWidth * 0.95) / exploredWidth;
    const maxZoomY = (screenHeight * 0.95) / exploredHeight;
    
    const calculatedMaxZoom = Math.min(maxZoomX, maxZoomY);
    
    return Math.max(this.minZoom, Math.min(this.maxZoom, calculatedMaxZoom));
  }

  private clampCameraToBounds() {
    const bounds = this.getExploredBounds();
    if (!bounds) return;
    
    const exploredMinX = bounds.minX * this.tileSize;
    const exploredMaxX = (bounds.maxX + 1) * this.tileSize;
    const exploredMinY = bounds.minY * this.tileSize;
    const exploredMaxY = (bounds.maxY + 1) * this.tileSize;
    
    const screenWidth = this.app.screen.width;
    const screenHeight = this.app.screen.height;
    
    const visibleWidth = screenWidth / this.zoom;
    const visibleHeight = screenHeight / this.zoom;
    
    const padding = 20;
    const minPivotX = exploredMinX + visibleWidth / 2 - padding;
    const maxPivotX = exploredMaxX - visibleWidth / 2 + padding;
    const minPivotY = exploredMinY + visibleHeight / 2 - padding;
    const maxPivotY = exploredMaxY - visibleHeight / 2 + padding;
    
    if (maxPivotX > minPivotX) {
      this.container.pivot.x = Math.max(minPivotX, Math.min(maxPivotX, this.container.pivot.x));
    }
    if (maxPivotY > minPivotY) {
      this.container.pivot.y = Math.max(minPivotY, Math.min(maxPivotY, this.container.pivot.y));
    }
  }

  public update() {
    const dynamicMaxZoom = this.calculateMaxZoom();
    const maxZoomPercent = dynamicMaxZoom * 100;
    
    let zoomLevel = useGameStore.getState().zoomLevel;
    if (zoomLevel > maxZoomPercent) {
      zoomLevel = maxZoomPercent;
      useGameStore.getState().setZoomLevel(Math.floor(maxZoomPercent));
    }
    
    this.targetZoom = Math.min(zoomLevel / 100, dynamicMaxZoom);
    
    this.zoom += (this.targetZoom - this.zoom) * 0.1;
    this.container.scale.set(this.zoom);
    
    const player = useGameStore.getState().player;
    const isCameraFollowing = useGameStore.getState().isCameraFollowing;
    
    if (isCameraFollowing) {
      const targetPivotX = player.visualPosition.x * this.tileSize;
      const targetPivotY = player.visualPosition.y * this.tileSize;
      
      this.container.pivot.x += (targetPivotX - this.container.pivot.x) * 0.1;
      this.container.pivot.y += (targetPivotY - this.container.pivot.y) * 0.1;
    }
    
    this.clampCameraToBounds();
  }

  public onResize() {
    this.container.x = this.app.screen.width / 2;
    this.container.y = this.app.screen.height / 2;
  }

  public destroy() {
    const canvas = this.app.canvas;
    canvas.removeEventListener('mousedown', this.handleMouseDown);
    canvas.removeEventListener('mousemove', this.handleMouseMove);
    canvas.removeEventListener('mouseup', this.handleMouseUp);
    canvas.removeEventListener('wheel', this.handleWheel);
    canvas.removeEventListener('touchstart', this.handleTouchStart);
    canvas.removeEventListener('touchmove', this.handleTouchMove);
    canvas.removeEventListener('touchend', this.handleTouchEnd);
  }
}
