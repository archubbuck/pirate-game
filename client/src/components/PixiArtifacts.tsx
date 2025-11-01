import * as PIXI from "pixi.js";
import { useGameStore, type Artifact } from "@/lib/stores/useGameStore";
import type { PixiCamera } from "./PixiCamera";

export class PixiArtifacts {
  private container: PIXI.Container;
  private hexSize: number = 24;
  private hexWidth: number;
  private hexHeight: number;
  private artifactGraphics: Map<string, PIXI.Container> = new Map();

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

    const { posX, posY } = this.getHexPosition(artifact.position.x, artifact.position.y);
    artifactContainer.position.set(posX, posY);

    this.container.addChild(artifactContainer);
    this.artifactGraphics.set(artifact.id, artifactContainer);
  }

  public update(camera?: PixiCamera) {
    const artifacts = useGameStore.getState().artifacts;
    const player = useGameStore.getState().player;
    const viewRange = 10;

    const uncollectedArtifacts = artifacts.filter(artifact => !artifact.isCollected);
    
    const visibleArtifacts = uncollectedArtifacts.filter(artifact => {
      const distance = this.getHexDistance(
        artifact.position.x,
        artifact.position.y,
        player.position.x,
        player.position.y
      );
      return distance <= viewRange;
    });

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
