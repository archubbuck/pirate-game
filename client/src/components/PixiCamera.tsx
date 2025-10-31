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
  private minZoom: number = 0.3;
  private maxZoom: number = 2;
  private touchDistance: number = 0;

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
    
    const zoomAmount = e.deltaY > 0 ? 0.9 : 1.1;
    this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.targetZoom * zoomAmount));
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
        this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * zoomAmount));
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
    const tileSize = 40;
    
    this.container.x = this.app.screen.width / 2;
    this.container.y = this.app.screen.height / 2;
    
    this.container.pivot.x = (gridSize * tileSize) / 2;
    this.container.pivot.y = (gridSize * tileSize) / 2;
  }

  public update() {
    this.zoom += (this.targetZoom - this.zoom) * 0.1;
    this.container.scale.set(this.zoom);
    
    const player = useGameStore.getState().player;
    const isCameraFollowing = useGameStore.getState().isCameraFollowing;
    
    if (isCameraFollowing) {
      const tileSize = 40;
      const targetPivotX = player.visualPosition.x * tileSize;
      const targetPivotY = player.visualPosition.y * tileSize;
      
      this.container.pivot.x += (targetPivotX - this.container.pivot.x) * 0.1;
      this.container.pivot.y += (targetPivotY - this.container.pivot.y) * 0.1;
    }
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
