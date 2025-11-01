import * as PIXI from "pixi.js";
import { useGameStore, type CrewMember } from "@/lib/stores/useGameStore";

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
    crewContainer.name = crew.state;
    
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

  public update() {
    const crewMembers = useGameStore.getState().crewMembers;

    const currentIds = new Set(crewMembers.map(c => c.id));
    
    this.crewGraphics.forEach((graphics, id) => {
      if (!currentIds.has(id)) {
        graphics.destroy();
        this.crewGraphics.delete(id);
      }
    });

    crewMembers.forEach(crew => {
      const existing = this.crewGraphics.get(crew.id);
      
      if (!existing) {
        this.createCrewMember(crew);
      } else {
        const worldX = crew.position.x * this.tileSize + this.tileSize / 2;
        const worldY = crew.position.y * this.tileSize + this.tileSize / 2;
        existing.position.set(worldX, worldY);
        
        if (crew.state !== existing.name) {
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
