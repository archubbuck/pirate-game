import * as PIXI from "pixi.js";
import { useGameStore, type Collectible } from "@/lib/stores/useGameStore";

export class PixiCollectibles {
  private container: PIXI.Container;
  private tileSize: number = 40;
  private collectibleGraphics: Map<string, PIXI.Container> = new Map();

  constructor(parent: PIXI.Container) {
    this.container = new PIXI.Container();
    parent.addChild(this.container);
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

    const posX = collectible.position.x * this.tileSize + this.tileSize / 2;
    const posY = collectible.position.y * this.tileSize + this.tileSize / 2;
    collectibleContainer.position.set(posX, posY);

    this.container.addChild(collectibleContainer);
    this.collectibleGraphics.set(collectible.id, collectibleContainer);
  }

  public update() {
    const collectibles = useGameStore.getState().collectibles;
    const tiles = useGameStore.getState().tiles;

    const visibleCollectibles = collectibles.filter(collectible => {
      const tile = tiles[collectible.position.y]?.[collectible.position.x];
      return tile && tile.isExplored;
    });

    const currentIds = new Set(visibleCollectibles.map(c => c.id));
    
    this.collectibleGraphics.forEach((graphics, id) => {
      if (!currentIds.has(id)) {
        graphics.destroy();
        this.collectibleGraphics.delete(id);
      }
    });

    visibleCollectibles.forEach(collectible => {
      if (!this.collectibleGraphics.has(collectible.id)) {
        this.createCollectible(collectible);
      }
    });
  }

  public destroy() {
    this.collectibleGraphics.forEach(graphics => graphics.destroy());
    this.collectibleGraphics.clear();
    this.container.destroy();
  }
}
