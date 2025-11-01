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

  private getHexDistance(x1: number, y1: number, x2: number, y2: number): number {
    const q1 = x1 - Math.floor(y1 / 2);
    const r1 = y1;
    const q2 = x2 - Math.floor(y2 / 2);
    const r2 = y2;
    return (Math.abs(q1 - q2) + Math.abs(r1 - r2) + Math.abs((q1 + r1) - (q2 + r2))) / 2;
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

  public update(camera?: PixiCamera) {
    const collectibles = useGameStore.getState().collectibles;
    const player = useGameStore.getState().player;
    const viewRange = 10;

    const visibleCollectibles = collectibles.filter(collectible => {
      const distance = this.getHexDistance(
        collectible.position.x,
        collectible.position.y,
        player.position.x,
        player.position.y
      );
      return distance <= viewRange;
    });

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
