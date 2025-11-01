import * as PIXI from "pixi.js";
import { useGameStore, type CrewMember } from "@/lib/stores/useGameStore";
import type { PixiCamera } from "./PixiCamera";

export class PixiCrewMembers {
  private container: PIXI.Container;
  private tileSize: number = 40;
  private crewGraphics: Map<string, PIXI.Container> = new Map();

  constructor(parent: PIXI.Container) {
    this.container = new PIXI.Container();
    parent.addChild(this.container);
  }

  private createCrewMember(crew: CrewMember) {
    const crewContainer = new PIXI.Container();
    crewContainer.label = crew.state;
    
    const graphics = new PIXI.Graphics();
    
    graphics.ellipse(0, 0, 8, 6);
    graphics.fill({ color: 0x8b4513 });
    graphics.stroke({ color: 0x654321, width: 1.5 });
    
    graphics.rect(-6, -3, 12, 6);
    graphics.fill({ color: 0xa0826d });
    graphics.stroke({ color: 0x8b4513, width: 1 });
    
    graphics.rect(-3, -6, 6, 4);
    graphics.fill({ color: 0x654321 });
    
    graphics.circle(-2, -3, 2);
    graphics.fill({ color: 0xffcc00 });
    
    graphics.circle(2, -3, 2);
    graphics.fill({ color: 0xffcc00 });
    
    crewContainer.addChild(graphics);
    
    if (crew.state === "awaitingPickup") {
      const pickupHalo = new PIXI.Graphics();
      pickupHalo.circle(0, 0, 12);
      pickupHalo.stroke({ color: 0x00ff00, width: 2, alpha: 0.8 });
      crewContainer.addChild(pickupHalo);
    }
    
    if (crew.state === "collecting") {
      const busyIndicator = new PIXI.Graphics();
      busyIndicator.circle(0, -10, 3);
      busyIndicator.fill({ color: 0xffa500 });
      crewContainer.addChild(busyIndicator);
    }
    
    if (crew.state === "drifting") {
      const driftWarning = new PIXI.Graphics();
      driftWarning.moveTo(0, -12);
      driftWarning.lineTo(-4, -16);
      driftWarning.lineTo(4, -16);
      driftWarning.closePath();
      driftWarning.fill({ color: 0xff0000 });
      crewContainer.addChild(driftWarning);
    }
    
    crewContainer.eventMode = 'static';
    crewContainer.cursor = 'pointer';
    crewContainer.on('pointerdown', () => {
      if (crew.state === "awaitingPickup") {
        console.log('Crew member clicked for pickup:', crew.id);
        useGameStore.getState().retrieveCrewMember?.(crew.id);
      }
    });
    
    const worldX = crew.position.x * this.tileSize + this.tileSize / 2;
    const worldY = crew.position.y * this.tileSize + this.tileSize / 2;
    crewContainer.position.set(worldX, worldY);
    
    this.container.addChild(crewContainer);
    this.crewGraphics.set(crew.id, crewContainer);
  }

  private isInViewport(crew: CrewMember, bounds: { minX: number; maxX: number; minY: number; maxY: number }): boolean {
    const worldX = crew.position.x * this.tileSize;
    const worldY = crew.position.y * this.tileSize;
    
    return worldX >= bounds.minX && worldX <= bounds.maxX &&
           worldY >= bounds.minY && worldY <= bounds.maxY;
  }

  public update(camera?: PixiCamera) {
    const crewMembers = useGameStore.getState().crewMembers;
    const bounds = camera?.getViewportBounds();

    const deployedCrew = crewMembers.filter(crew => crew.state !== "idle");
    
    const visibleCrew = bounds
      ? deployedCrew.filter(crew => this.isInViewport(crew, bounds))
      : deployedCrew;

    const currentIds = new Set(deployedCrew.map(c => c.id));
    
    this.crewGraphics.forEach((graphics, id) => {
      if (!currentIds.has(id)) {
        graphics.destroy();
        this.crewGraphics.delete(id);
      }
    });

    const visibleIds = new Set(visibleCrew.map(c => c.id));
    
    this.crewGraphics.forEach((graphics, id) => {
      graphics.visible = visibleIds.has(id);
    });

    visibleCrew.forEach(crew => {
      const existing = this.crewGraphics.get(crew.id);
      
      if (!existing) {
        this.createCrewMember(crew);
      } else {
        const worldX = crew.position.x * this.tileSize + this.tileSize / 2;
        const worldY = crew.position.y * this.tileSize + this.tileSize / 2;
        existing.position.set(worldX, worldY);
        existing.visible = true;
        
        if (crew.state !== existing.label) {
          existing.destroy();
          this.crewGraphics.delete(crew.id);
          this.createCrewMember(crew);
        }
      }
    });
  }

  public destroy() {
    this.crewGraphics.forEach(graphics => graphics.destroy());
    this.crewGraphics.clear();
    this.container.destroy();
  }
}
