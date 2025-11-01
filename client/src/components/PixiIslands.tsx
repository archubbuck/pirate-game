import * as PIXI from "pixi.js";
import { useGameStore, type Island } from "@/lib/stores/useGameStore";
import type { PixiCamera } from "./PixiCamera";

interface IslandBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  worldMinX: number;
  worldMaxX: number;
  worldMinY: number;
  worldMaxY: number;
}

export class PixiIslands {
  private container: PIXI.Container;
  private hexSize: number = 24;
  private hexWidth: number;
  private hexHeight: number;
  private islandGraphics: Map<string, PIXI.Container> = new Map();
  private islandBounds: Map<string, IslandBounds> = new Map();

  constructor(parent: PIXI.Container) {
    this.container = new PIXI.Container();
    parent.addChild(this.container);
    
    this.hexWidth = Math.sqrt(3) * this.hexSize;
    this.hexHeight = 2 * this.hexSize;
  }

  private getHexPosition(x: number, y: number): { posX: number; posY: number } {
    const posX = x * this.hexWidth + (y % 2) * (this.hexWidth / 2);
    const posY = y * (this.hexHeight * 0.75);
    return { posX, posY };
  }

  private createIsland(island: Island) {
    const islandContainer = new PIXI.Container();
    
    const minX = Math.min(...island.positions.map(p => p.x));
    const minY = Math.min(...island.positions.map(p => p.y));
    const maxX = Math.max(...island.positions.map(p => p.x));
    const maxY = Math.max(...island.positions.map(p => p.y));
    
    const { posX: worldMinX, posY: worldMinY } = this.getHexPosition(minX, minY);
    const { posX: worldMaxX, posY: worldMaxY } = this.getHexPosition(maxX + 1, maxY + 1);
    
    this.islandBounds.set(island.id, {
      minX,
      minY,
      maxX,
      maxY,
      worldMinX,
      worldMaxX,
      worldMinY,
      worldMaxY,
    });
    
    const grassShades = [0x2d5016, 0x3a6120, 0x2a4e14, 0x35581c, 0x2f5318];
    
    island.positions.forEach(pos => {
      const { posX: localPosX, posY: localPosY } = this.getHexPosition(pos.x - minX, pos.y - minY);
      
      const tileGraphics = new PIXI.Graphics();
      
      const grassColor = grassShades[Math.floor(Math.random() * grassShades.length)];
      tileGraphics.rect(localPosX, localPosY, this.hexWidth - 2, this.hexHeight - 2);
      tileGraphics.fill({ color: grassColor });
      
      tileGraphics.rect(localPosX, localPosY, this.hexWidth - 2, this.hexHeight - 2);
      tileGraphics.stroke({ color: 0x4a7a2a, width: 1.5 });
      
      if (Math.random() > 0.7) {
        const treeX = localPosX + 10 + Math.random() * 15;
        const treeY = localPosY + 10 + Math.random() * 15;
        
        tileGraphics.rect(treeX - 2, treeY - 8, 4, 8);
        tileGraphics.fill({ color: 0x5d4037 });
        
        tileGraphics.circle(treeX, treeY - 8, 6);
        tileGraphics.fill({ color: 0x1b5e20 });
      } else if (Math.random() > 0.6) {
        const rockX = localPosX + 8 + Math.random() * 20;
        const rockY = localPosY + 8 + Math.random() * 20;
        
        tileGraphics.circle(rockX, rockY, 3 + Math.random() * 3);
        tileGraphics.fill({ color: 0x616161 });
        tileGraphics.stroke({ color: 0x424242, width: 1 });
      }
      
      islandContainer.addChild(tileGraphics);
    });
    
    const { posX: worldX, posY: worldY } = this.getHexPosition(minX, minY);
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

  private isInViewport(islandId: string, bounds: { minX: number; maxX: number; minY: number; maxY: number }): boolean {
    const cachedBounds = this.islandBounds.get(islandId);
    if (!cachedBounds) return false;
    
    return !(cachedBounds.worldMaxX < bounds.minX || cachedBounds.worldMinX > bounds.maxX || 
             cachedBounds.worldMaxY < bounds.minY || cachedBounds.worldMinY > bounds.maxY);
  }

  public update(camera?: PixiCamera) {
    const islands = useGameStore.getState().islands;
    const bounds = camera?.getViewportBounds();

    const visibleIslands = bounds 
      ? islands.filter(island => this.isInViewport(island.id, bounds))
      : islands;

    const allIslandIds = new Set(islands.map(i => i.id));
    const visibleIds = new Set(visibleIslands.map(i => i.id));
    
    this.islandGraphics.forEach((graphics, id) => {
      if (!allIslandIds.has(id)) {
        graphics.destroy();
        this.islandGraphics.delete(id);
        this.islandBounds.delete(id);
      } else if (!visibleIds.has(id)) {
        graphics.visible = false;
      }
    });

    visibleIslands.forEach(island => {
      const existing = this.islandGraphics.get(island.id);
      if (!existing) {
        this.createIsland(island);
      } else {
        existing.visible = true;
      }
    });
  }

  public destroy() {
    this.islandGraphics.forEach(graphics => graphics.destroy());
    this.islandGraphics.clear();
    this.islandBounds.clear();
    this.container.destroy();
  }
}
