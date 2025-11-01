import * as PIXI from "pixi.js";
import { useGameStore } from "@/lib/stores/useGameStore";
import type { PixiCamera } from "./PixiCamera";

export class PixiTerrain {
  private container: PIXI.Container;
  private tileContainer: PIXI.Container;
  private hexSize: number = 24;
  private tileGraphics: Map<string, { tile: PIXI.Graphics; border: PIXI.Graphics }> = new Map();
  private lastExploredState: Map<string, boolean> = new Map();
  private tileColors: Map<string, number> = new Map();
  private waterShades = [0x1e7ba5, 0x2685ad, 0x2a8fb5, 0x1f7ca8, 0x22809d, 0x2588b0, 0x1a719f];
  private viewportMargin: number = 2;
  private destroyMargin: number = 10;
  private hexWidth: number;
  private hexHeight: number;

  constructor(parent: PIXI.Container) {
    this.container = new PIXI.Container();
    this.tileContainer = new PIXI.Container();
    this.container.addChild(this.tileContainer);
    parent.addChild(this.container);
    
    this.hexWidth = Math.sqrt(3) * this.hexSize;
    this.hexHeight = 2 * this.hexSize;
    
    this.initializeTileColors();
  }
  
  private initializeTileColors() {
    const gridSize = useGameStore.getState().gridSize;
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const key = `${x}-${y}`;
        const color = this.waterShades[Math.floor(Math.random() * this.waterShades.length)];
        this.tileColors.set(key, color);
      }
    }
  }

  private getHexPosition(x: number, y: number): { posX: number; posY: number } {
    const posX = x * this.hexWidth + (y % 2) * (this.hexWidth / 2);
    const posY = y * (this.hexHeight * 0.75);
    return { posX, posY };
  }

  private drawHexagon(graphics: PIXI.Graphics, centerX: number, centerY: number) {
    const points: number[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + Math.PI / 6;
      const x = centerX + this.hexSize * Math.cos(angle);
      const y = centerY + this.hexSize * Math.sin(angle);
      points.push(x, y);
    }
    graphics.poly(points);
  }

  private createTile(x: number, y: number, tile: any) {
    const key = `${x}-${y}`;
    
    if (this.tileGraphics.has(key)) {
      return;
    }

    const tileGraphic = new PIXI.Graphics();
    const borderGraphic = new PIXI.Graphics();

    const { posX, posY } = this.getHexPosition(x, y);

    tileGraphic.position.set(0, 0);
    borderGraphic.position.set(0, 0);

    this.tileContainer.addChild(tileGraphic);
    this.tileContainer.addChild(borderGraphic);

    this.tileGraphics.set(key, { tile: tileGraphic, border: borderGraphic });
    this.lastExploredState.set(key, tile.isExplored);

    tileGraphic.eventMode = 'static';
    tileGraphic.cursor = 'pointer';
    tileGraphic.on('pointerdown', () => {
      const phase = useGameStore.getState().phase;
      if (phase === 'playing') {
        useGameStore.getState().setTargetPositionWithConfirmation({ x, y });
        console.log(`Target set to (${x}, ${y})`);
      }
    });

    this.renderTile(x, y, tile);
  }

  private destroyTile(key: string) {
    const graphics = this.tileGraphics.get(key);
    if (graphics) {
      graphics.tile.destroy();
      graphics.border.destroy();
      this.tileGraphics.delete(key);
    }
  }

  private renderTile(x: number, y: number, tile: any) {
    const key = `${x}-${y}`;
    const graphics = this.tileGraphics.get(key);
    if (!graphics) return;

    const { tile: tileGraphic, border: borderGraphic } = graphics;
    const { posX, posY } = this.getHexPosition(x, y);

    const baseColor = this.tileColors.get(key) || 0x2685ad;

    tileGraphic.clear();
    this.drawHexagon(tileGraphic, posX, posY);
    tileGraphic.fill({ color: baseColor, alpha: 1 });

    borderGraphic.clear();
    this.drawHexagon(borderGraphic, posX, posY);
    borderGraphic.stroke({ color: 0x0d3d4f, width: 1, alpha: 0.6 });
  }

  public update(camera?: PixiCamera) {
    const tiles = useGameStore.getState().tiles;
    const gridSize = useGameStore.getState().gridSize;
    const player = useGameStore.getState().player;
    
    if (!camera) {
      return;
    }

    const bounds = camera.getViewportBounds();
    
    const minTileX = Math.max(0, Math.floor(bounds.minX / this.hexWidth) - this.viewportMargin);
    const maxTileX = Math.min(gridSize - 1, Math.ceil(bounds.maxX / this.hexWidth) + this.viewportMargin);
    const minTileY = Math.max(0, Math.floor(bounds.minY / (this.hexHeight * 0.75)) - this.viewportMargin);
    const maxTileY = Math.min(gridSize - 1, Math.ceil(bounds.maxY / (this.hexHeight * 0.75)) + this.viewportMargin);

    const destroyMinTileX = Math.max(0, Math.floor(bounds.minX / this.hexWidth) - this.destroyMargin);
    const destroyMaxTileX = Math.min(gridSize - 1, Math.ceil(bounds.maxX / this.hexWidth) + this.destroyMargin);
    const destroyMinTileY = Math.max(0, Math.floor(bounds.minY / (this.hexHeight * 0.75)) - this.destroyMargin);
    const destroyMaxTileY = Math.min(gridSize - 1, Math.ceil(bounds.maxY / (this.hexHeight * 0.75)) + this.destroyMargin);

    const visibleTileKeys = new Set<string>();
    
    for (let y = minTileY; y <= maxTileY; y++) {
      for (let x = minTileX; x <= maxTileX; x++) {
        if (y >= 0 && y < gridSize && x >= 0 && x < gridSize) {
          const key = `${x}-${y}`;
          visibleTileKeys.add(key);
          
          const tile = tiles[y][x];
          const wasExplored = this.lastExploredState.get(key);

          if (!this.tileGraphics.has(key)) {
            this.createTile(x, y, tile);
          } else if (tile.isExplored !== wasExplored) {
            this.renderTile(x, y, tile);
            this.lastExploredState.set(key, tile.isExplored);
          }
          
          const graphics = this.tileGraphics.get(key);
          if (graphics) {
            graphics.tile.visible = true;
            graphics.border.visible = true;
          }
        }
      }
    }

    this.tileGraphics.forEach((graphics, key) => {
      const [xStr, yStr] = key.split('-');
      const x = parseInt(xStr);
      const y = parseInt(yStr);
      
      if (!visibleTileKeys.has(key)) {
        graphics.tile.visible = false;
        graphics.border.visible = false;
        
        if (x < destroyMinTileX || x > destroyMaxTileX || y < destroyMinTileY || y > destroyMaxTileY) {
          this.destroyTile(key);
        }
      }
    });
  }

  public getHexPositionForPlayer(x: number, y: number): { posX: number; posY: number } {
    return this.getHexPosition(x, y);
  }

  public destroy() {
    this.tileGraphics.forEach(({ tile, border }) => {
      tile.destroy();
      border.destroy();
    });
    this.tileGraphics.clear();
    this.lastExploredState.clear();
    this.tileColors.clear();
    this.container.destroy();
  }
}
