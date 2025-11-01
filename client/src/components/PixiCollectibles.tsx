import * as PIXI from "pixi.js";
import { useGameStore, type Collectible } from "@/lib/stores/useGameStore";
import type { PixiCamera } from "./PixiCamera";

export class PixiCollectibles {
  private container: PIXI.Container;
  private hexSize: number = 24;
  private hexWidth: number;
  private hexHeight: number;
  private collectibleGraphics: Map<string, PIXI.Container> = new Map();

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

  private createCollectible(collectible: Collectible) {
    const collectibleContainer = new PIXI.Container();
    
    const colorMap: Record<string, number> = {
      timber: 0x8b4513,
      alloy: 0xc0c0c0,
      circuit: 0x00ff00,
      biofiber: 0x90ee90,
    };

    const graphics = new PIXI.Graphics();
    graphics.circle(0, 0, 12);
    graphics.fill({ color: colorMap[collectible.type] || 0xffffff });
    graphics.stroke({ color: 0xffffff, width: 2 });

    collectibleContainer.addChild(graphics);

    const { posX, posY } = this.getHexPosition(collectible.position.x, collectible.position.y);
    collectibleContainer.position.set(posX, posY);

    this.container.addChild(collectibleContainer);
    this.collectibleGraphics.set(collectible.id, collectibleContainer);
  }

  private isInViewport(collectible: Collectible, bounds: { minX: number; maxX: number; minY: number; maxY: number }): boolean {
    const { posX: worldX, posY: worldY } = this.getHexPosition(collectible.position.x, collectible.position.y);
    
    return worldX >= bounds.minX && worldX <= bounds.maxX &&
           worldY >= bounds.minY && worldY <= bounds.maxY;
  }

  public update(camera?: PixiCamera) {
    const collectibles = useGameStore.getState().collectibles;
    const bounds = camera?.getViewportBounds();

    const visibleCollectibles = bounds
      ? collectibles.filter(collectible => this.isInViewport(collectible, bounds))
      : collectibles;

    const currentIds = new Set(collectibles.map(c => c.id));
    
    this.collectibleGraphics.forEach((graphics, id) => {
      if (!currentIds.has(id)) {
        graphics.destroy();
        this.collectibleGraphics.delete(id);
      }
    });

    const visibleIds = new Set(visibleCollectibles.map(c => c.id));
    
    this.collectibleGraphics.forEach((graphics, id) => {
      graphics.visible = visibleIds.has(id);
    });

    visibleCollectibles.forEach(collectible => {
      const existing = this.collectibleGraphics.get(collectible.id);
      if (!existing) {
        this.createCollectible(collectible);
      } else {
        existing.visible = true;
      }
    });
  }

  public destroy() {
    this.collectibleGraphics.forEach(graphics => graphics.destroy());
    this.collectibleGraphics.clear();
    this.container.destroy();
  }
}
