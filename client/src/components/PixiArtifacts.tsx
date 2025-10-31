import * as PIXI from "pixi.js";
import { useGameStore, type Artifact } from "@/lib/stores/useGameStore";

export class PixiArtifacts {
  private container: PIXI.Container;
  private tileSize: number = 40;
  private artifactGraphics: Map<string, PIXI.Container> = new Map();

  constructor(parent: PIXI.Container) {
    this.container = new PIXI.Container();
    parent.addChild(this.container);
  }

  private createArtifact(artifact: Artifact) {
    const artifactContainer = new PIXI.Container();
    
    const rarityColorMap: Record<string, number> = {
      common: 0xcccccc,
      uncommon: 0x4a9eff,
      rare: 0xff00ff,
    };

    const graphics = new PIXI.Graphics();
    graphics.star(0, 0, 6, 15, 8);
    graphics.fill({ color: rarityColorMap[artifact.rarity] || 0xffffff });
    graphics.stroke({ color: 0xffffff, width: 2 });

    artifactContainer.addChild(graphics);

    const posX = artifact.position.x * this.tileSize + this.tileSize / 2;
    const posY = artifact.position.y * this.tileSize + this.tileSize / 2;
    artifactContainer.position.set(posX, posY);

    this.container.addChild(artifactContainer);
    this.artifactGraphics.set(artifact.id, artifactContainer);
  }

  public update() {
    const artifacts = useGameStore.getState().artifacts;
    const tiles = useGameStore.getState().tiles;

    const visibleArtifacts = artifacts.filter(artifact => {
      if (artifact.isCollected) return false;
      const tile = tiles[artifact.position.y]?.[artifact.position.x];
      return tile && (tile.isExplored || artifact.clueRevealed);
    });

    const currentIds = new Set(visibleArtifacts.map(a => a.id));
    
    this.artifactGraphics.forEach((graphics, id) => {
      if (!currentIds.has(id)) {
        graphics.destroy();
        this.artifactGraphics.delete(id);
      }
    });

    visibleArtifacts.forEach(artifact => {
      if (!this.artifactGraphics.has(artifact.id)) {
        this.createArtifact(artifact);
      }
    });
  }

  public destroy() {
    this.artifactGraphics.forEach(graphics => graphics.destroy());
    this.artifactGraphics.clear();
    this.container.destroy();
  }
}
