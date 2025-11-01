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
    
    const grassShades = [0x2d5016, 0x3a6120, 0x2a4e14, 0x35581c, 0x2f5318];
    
    island.positions.forEach(pos => {
      const localX = (pos.x - minX) * this.tileSize;
      const localY = (pos.y - minY) * this.tileSize;
      
      const tileGraphics = new PIXI.Graphics();
      
      const grassColor = grassShades[Math.floor(Math.random() * grassShades.length)];
      tileGraphics.rect(localX, localY, this.tileSize - 2, this.tileSize - 2);
      tileGraphics.fill({ color: grassColor });
      
      tileGraphics.rect(localX, localY, this.tileSize - 2, this.tileSize - 2);
      tileGraphics.stroke({ color: 0x4a7a2a, width: 1.5 });
      
      if (Math.random() > 0.7) {
        const treeX = localX + 10 + Math.random() * 15;
        const treeY = localY + 10 + Math.random() * 15;
        
        tileGraphics.rect(treeX - 2, treeY - 8, 4, 8);
        tileGraphics.fill({ color: 0x5d4037 });
        
        tileGraphics.circle(treeX, treeY - 8, 6);
        tileGraphics.fill({ color: 0x1b5e20 });
      } else if (Math.random() > 0.6) {
        const rockX = localX + 8 + Math.random() * 20;
        const rockY = localY + 8 + Math.random() * 20;
        
        tileGraphics.circle(rockX, rockY, 3 + Math.random() * 3);
        tileGraphics.fill({ color: 0x616161 });
        tileGraphics.stroke({ color: 0x424242, width: 1 });
      }
      
      islandContainer.addChild(tileGraphics);
    });
    
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
