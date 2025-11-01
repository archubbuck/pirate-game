import * as PIXI from "pixi.js";
import { useGameStore } from "@/lib/stores/useGameStore";

export class PixiTerrain {
  private container: PIXI.Container;
  private tileContainer: PIXI.Container;
  private tileSize: number = 40;
  private tileGraphics: Map<string, { tile: PIXI.Graphics; border: PIXI.Graphics }> = new Map();
  private lastExploredState: Map<string, boolean> = new Map();
  private tileColors: Map<string, number> = new Map();

  constructor(parent: PIXI.Container) {
    this.container = new PIXI.Container();
    this.tileContainer = new PIXI.Container();
    this.container.addChild(this.tileContainer);
    parent.addChild(this.container);
    
    this.initializeTileColors();
    this.createTiles();
  }
  
  private initializeTileColors() {
    const waterShades = [0x0a3d52, 0x0b4058, 0x09384d, 0x0c4560, 0x0d4a68, 0x083449, 0x0e4d6b];
    const gridSize = useGameStore.getState().gridSize;
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const key = `${x}-${y}`;
        const color = waterShades[Math.floor(Math.random() * waterShades.length)];
        this.tileColors.set(key, color);
      }
    }
  }

  private createTiles() {
    const tiles = useGameStore.getState().tiles;
    const gridSize = useGameStore.getState().gridSize;

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const tile = tiles[y][x];
        const key = `${x}-${y}`;

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
    
    if (Math.random() > 0.85) {
      const waveX = Math.random() * (this.tileSize - 2);
      const waveY = Math.random() * (this.tileSize - 2);
      tileGraphic.circle(waveX, waveY, 1);
      tileGraphic.fill({ color: 0x1a5f7a, alpha: 0.5 });
    }

    borderGraphic.clear();
    borderGraphic.rect(0, 0, this.tileSize - 2, this.tileSize - 2);
    borderGraphic.stroke({ color: 0x8a8a8a, width: 1, alpha: 0.7 });
  }

  public update() {
    const tiles = useGameStore.getState().tiles;
    const gridSize = useGameStore.getState().gridSize;

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const tile = tiles[y][x];
        const key = `${x}-${y}`;
        const wasExplored = this.lastExploredState.get(key);

        if (tile.isExplored !== wasExplored) {
          this.renderTile(x, y, tile);
          this.lastExploredState.set(key, tile.isExplored);
        }
      }
    }
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
