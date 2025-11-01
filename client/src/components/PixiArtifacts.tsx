import * as PIXI from "pixi.js";
import { useGameStore, type Artifact } from "@/lib/stores/useGameStore";
import type { PixiCamera } from "./PixiCamera";

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

  private isInViewport(artifact: Artifact, bounds: { minX: number; maxX: number; minY: number; maxY: number }): boolean {
    const worldX = artifact.position.x * this.tileSize;
    const worldY = artifact.position.y * this.tileSize;
    
    return worldX >= bounds.minX && worldX <= bounds.maxX &&
           worldY >= bounds.minY && worldY <= bounds.maxY;
  }

  public update(camera?: PixiCamera) {
    const artifacts = useGameStore.getState().artifacts;
    const bounds = camera?.getViewportBounds();

    const uncollectedArtifacts = artifacts.filter(artifact => !artifact.isCollected);
    
    const visibleArtifacts = bounds
      ? uncollectedArtifacts.filter(artifact => this.isInViewport(artifact, bounds))
      : uncollectedArtifacts;

    const currentIds = new Set(uncollectedArtifacts.map(a => a.id));
    
    this.artifactGraphics.forEach((graphics, id) => {
      if (!currentIds.has(id)) {
        graphics.destroy();
        this.artifactGraphics.delete(id);
      }
    });

    const visibleIds = new Set(visibleArtifacts.map(a => a.id));
    
    this.artifactGraphics.forEach((graphics, id) => {
      graphics.visible = visibleIds.has(id);
    });

    visibleArtifacts.forEach(artifact => {
      const existing = this.artifactGraphics.get(artifact.id);
      if (!existing) {
        this.createArtifact(artifact);
      } else {
        existing.visible = true;
      }
    });
  }

  public destroy() {
    this.artifactGraphics.forEach(graphics => graphics.destroy());
    this.artifactGraphics.clear();
    this.container.destroy();
  }
}
