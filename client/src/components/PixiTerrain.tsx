import * as PIXI from "pixi.js";
import { useGameStore } from "@/lib/stores/useGameStore";
import type { PixiCamera } from "./PixiCamera";

export class PixiTerrain {
  private container: PIXI.Container;
  private tileContainer: PIXI.Container;
  private tileSize: number = 40;
  private tileGraphics: Map<string, { tile: PIXI.Graphics; border: PIXI.Graphics }> = new Map();
  private lastExploredState: Map<string, boolean> = new Map();
  private tileColors: Map<string, number> = new Map();
  private waterShades = [0x0a3d52, 0x0b4058, 0x09384d, 0x0c4560, 0x0d4a68, 0x083449, 0x0e4d6b];
  private viewportMargin: number = 2;
  private destroyMargin: number = 10;

  constructor(parent: PIXI.Container) {
    this.container = new PIXI.Container();
    this.tileContainer = new PIXI.Container();
    this.container.addChild(this.tileContainer);
    parent.addChild(this.container);
    
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

  private createTile(x: number, y: number, tile: any) {
    const key = `${x}-${y}`;
    
    if (this.tileGraphics.has(key)) {
      return;
    }

    const tileGraphic = new PIXI.Graphics();
    const borderGraphic = new PIXI.Graphics();

    const posX = x * this.tileSize;
    const posY = y * this.tileSize;

    tileGraphic.position.set(posX, posY);
    borderGraphic.position.set(posX, posY);

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

    const baseColor = this.tileColors.get(key) || 0x0a4d68;

    tileGraphic.clear();
    tileGraphic.rect(0, 0, this.tileSize - 2, this.tileSize - 2);
    tileGraphic.fill({ color: baseColor, alpha: 1 });

    borderGraphic.clear();
    borderGraphic.rect(0, 0, this.tileSize - 2, this.tileSize - 2);
    borderGraphic.stroke({ color: 0x8a8a8a, width: 1, alpha: 0.7 });
  }

  public update(camera?: PixiCamera) {
    const tiles = useGameStore.getState().tiles;
    const gridSize = useGameStore.getState().gridSize;
    const player = useGameStore.getState().player;
    
    if (!camera) {
      return;
    }

    const bounds = camera.getViewportBounds();
    
    const minTileX = Math.max(0, Math.floor(bounds.minX / this.tileSize) - this.viewportMargin);
    const maxTileX = Math.min(gridSize - 1, Math.ceil(bounds.maxX / this.tileSize) + this.viewportMargin);
    const minTileY = Math.max(0, Math.floor(bounds.minY / this.tileSize) - this.viewportMargin);
    const maxTileY = Math.min(gridSize - 1, Math.ceil(bounds.maxY / this.tileSize) + this.viewportMargin);

    const destroyMinTileX = Math.max(0, Math.floor(bounds.minX / this.tileSize) - this.destroyMargin);
    const destroyMaxTileX = Math.min(gridSize - 1, Math.ceil(bounds.maxX / this.tileSize) + this.destroyMargin);
    const destroyMinTileY = Math.max(0, Math.floor(bounds.minY / this.tileSize) - this.destroyMargin);
    const destroyMaxTileY = Math.min(gridSize - 1, Math.ceil(bounds.maxY / this.tileSize) + this.destroyMargin);

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

  public destroy() {
    this.tileGraphics.forEach(({ tile, border }) => {
      tile.destroy();
      border.destroy();
    });
    this.tileGraphics.clear();
    this.container.destroy();
  }
}
