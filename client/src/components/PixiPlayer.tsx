import * as PIXI from "pixi.js";
import { useGameStore } from "@/lib/stores/useGameStore";
import { useSkillsStore } from "@/lib/stores/useSkillsStore";
import { drawShip } from "@/utils/shipGraphicsGenerator";

export class PixiPlayer {
  private container: PIXI.Container;
  private shipContainer: PIXI.Container;
  private hexSize: number = 24;
  private hexWidth: number;
  private hexHeight: number;
  private shipGraphics: PIXI.Graphics;
  private currentSailingLevel: number = 1;

  constructor(parent: PIXI.Container) {
    this.container = new PIXI.Container();
    this.shipContainer = new PIXI.Container();
    parent.addChild(this.container);
    this.container.addChild(this.shipContainer);

    this.hexWidth = Math.sqrt(3) * this.hexSize;
    this.hexHeight = 2 * this.hexSize;

    this.shipGraphics = new PIXI.Graphics();
    this.shipContainer.addChild(this.shipGraphics);
    
    this.createShip();
  }

  private createShip() {
    const sailingLevel = useSkillsStore.getState().skills.sailing.level;
    drawShip(this.shipGraphics, sailingLevel, 'player');
    this.currentSailingLevel = sailingLevel;
  }

  private updateShipGraphics() {
    const sailingLevel = useSkillsStore.getState().skills.sailing.level;
    
    if (sailingLevel !== this.currentSailingLevel) {
      drawShip(this.shipGraphics, sailingLevel, 'player');
      this.currentSailingLevel = sailingLevel;
      console.log(`Ship upgraded to level ${sailingLevel} variant!`);
    }
  }

  private getHexPosition(x: number, y: number): { posX: number; posY: number } {
    const posX = x * this.hexWidth + (y % 2) * (this.hexWidth / 2);
    const posY = y * (this.hexHeight * 0.75);
    return { posX, posY };
  }

  public update() {
    const player = useGameStore.getState().player;
    const rotation = useGameStore.getState().playerRotation || 0;
    
    const { posX, posY } = this.getHexPosition(player.visualPosition.x, player.visualPosition.y);
    
    this.container.position.set(posX, posY);
    this.shipContainer.rotation = rotation;
    
    this.updateShipGraphics();
  }

  public destroy() {
    this.shipGraphics.destroy();
    this.container.destroy();
  }
}
