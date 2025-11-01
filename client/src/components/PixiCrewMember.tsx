import * as PIXI from "pixi.js";
import { useGameStore, type CrewMember } from "@/lib/stores/useGameStore";
import type { PixiCamera } from "./PixiCamera";

export class PixiCrewMembers {
  private container: PIXI.Container;
  private hexSize: number = 24;
  private hexWidth: number;
  private hexHeight: number;
  private crewGraphics: Map<string, PIXI.Container> = new Map();

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
    
    const { posX, posY } = this.getHexPosition(crew.position.x, crew.position.y);
    crewContainer.position.set(posX, posY);
    
    this.container.addChild(crewContainer);
    this.crewGraphics.set(crew.id, crewContainer);
  }

  public update(camera?: PixiCamera) {
    const crewMembers = useGameStore.getState().crewMembers;
    const player = useGameStore.getState().player;
    const viewRange = 10;

    const deployedCrew = crewMembers.filter(crew => crew.state !== "idle");
    
    const visibleCrew = deployedCrew.filter(crew => {
      const distance = this.getHexDistance(
        crew.position.x,
        crew.position.y,
        player.position.x,
        player.position.y
      );
      return distance <= viewRange;
    });

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
        const { posX, posY } = this.getHexPosition(crew.position.x, crew.position.y);
        existing.position.set(posX, posY);
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
