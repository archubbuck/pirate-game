import * as PIXI from "pixi.js";
import { useGameStore, type Island } from "@/lib/stores/useGameStore";

export class PixiIslands {
  private container: PIXI.Container;
  private tileSize: number = 40;
  private islandGraphics: Map<string, PIXI.Container> = new Map();

  constructor(parent: PIXI.Container) {
    this.container = new PIXI.Container();
    parent.addChild(this.container);
  }

  private createIsland(island: Island) {
    const islandContainer = new PIXI.Container();
    
    const minX = Math.min(...island.positions.map(p => p.x));
    const minY = Math.min(...island.positions.map(p => p.y));
    const maxX = Math.max(...island.positions.map(p => p.x));
    const maxY = Math.max(...island.positions.map(p => p.y));
    
    const graphics = new PIXI.Graphics();
    
    island.positions.forEach(pos => {
      const localX = (pos.x - minX) * this.tileSize;
      const localY = (pos.y - minY) * this.tileSize;
      
      graphics.rect(localX, localY, this.tileSize - 2, this.tileSize - 2);
    });
    
    graphics.fill({ color: 0x2d5016, alpha: 1 });
    graphics.stroke({ color: 0x4a7a2a, width: 2 });
    
    islandContainer.addChild(graphics);
    
    const worldX = minX * this.tileSize;
    const worldY = minY * this.tileSize;
    islandContainer.position.set(worldX, worldY);
    
    islandContainer.eventMode = 'static';
    islandContainer.cursor = 'pointer';
    islandContainer.on('pointerdown', () => {
      console.log('Island clicked:', island.id, island.resources);
      useGameStore.getState().setSelectedIsland(island);
    });
    
    this.container.addChild(islandContainer);
    this.islandGraphics.set(island.id, islandContainer);
  }

  public update() {
    const islands = useGameStore.getState().islands;

    const currentIds = new Set(islands.map(i => i.id));
    
    this.islandGraphics.forEach((graphics, id) => {
      if (!currentIds.has(id)) {
        graphics.destroy();
        this.islandGraphics.delete(id);
      }
    });

    islands.forEach(island => {
      if (!this.islandGraphics.has(island.id)) {
        this.createIsland(island);
      }
    });
  }

  public destroy() {
    this.islandGraphics.forEach(graphics => graphics.destroy());
    this.islandGraphics.clear();
    this.container.destroy();
  }
}
