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
  private powerUpEffects: PIXI.Graphics;
  private time: number = 0;

  constructor(parent: PIXI.Container) {
    this.container = new PIXI.Container();
    this.shipContainer = new PIXI.Container();
    parent.addChild(this.container);

    this.hexWidth = Math.sqrt(3) * this.hexSize;
    this.hexHeight = 2 * this.hexSize;

    this.powerUpEffects = new PIXI.Graphics();
    this.container.addChild(this.powerUpEffects);
    
    this.container.addChild(this.shipContainer);
    
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

  private drawPowerUpEffects() {
    const activePowerUps = useGameStore.getState().activePowerUps;
    this.powerUpEffects.clear();

    const hasSpeed = activePowerUps.some(p => p.type === "speed");
    const hasVision = activePowerUps.some(p => p.type === "vision");
    const hasMagnet = activePowerUps.some(p => p.type === "magnet");

    if (hasSpeed) {
      const pulseSpeed = Math.sin(this.time * 0.005) * 0.3 + 0.7;
      const alpha = pulseSpeed * 0.6;
      this.powerUpEffects.lineStyle(0);
      this.powerUpEffects.beginFill(0xffff00, alpha);
      this.powerUpEffects.drawCircle(0, 0, 18 + pulseSpeed * 4);
      this.powerUpEffects.endFill();
      
      this.powerUpEffects.beginFill(0xffa500, alpha * 0.5);
      this.powerUpEffects.drawCircle(0, 0, 14 + pulseSpeed * 3);
      this.powerUpEffects.endFill();
    }

    if (hasVision) {
      const pulseVision = Math.sin(this.time * 0.003) * 0.4 + 0.6;
      const alpha = pulseVision * 0.5;
      this.powerUpEffects.lineStyle(2, 0x00ffff, alpha);
      this.powerUpEffects.drawCircle(0, 0, 20 + pulseVision * 6);
      
      this.powerUpEffects.lineStyle(1, 0x00ffff, alpha * 0.6);
      this.powerUpEffects.drawCircle(0, 0, 26 + pulseVision * 8);
    }

    if (hasMagnet) {
      const pulseMagnet = Math.sin(this.time * 0.004) * 0.5 + 0.5;
      const alpha = pulseMagnet * 0.7;
      
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + this.time * 0.001;
        const radius = 16 + pulseMagnet * 4;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        this.powerUpEffects.lineStyle(0);
        this.powerUpEffects.beginFill(0xff00ff, alpha);
        this.powerUpEffects.drawCircle(x, y, 2);
        this.powerUpEffects.endFill();
      }
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
    this.drawPowerUpEffects();
    this.time += 16;
  }

  public destroy() {
    this.powerUpEffects.destroy();
    this.shipGraphics.destroy();
    this.container.destroy();
  }
}
