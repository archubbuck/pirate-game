import * as PIXI from "pixi.js";
import { useGameStore } from "@/lib/stores/useGameStore";

export class PixiLighting {
  private app: PIXI.Application;
  private gameContainer: PIXI.Container;
  private lightingContainer: PIXI.Container;
  private lightSprite: PIXI.Sprite;
  private hexSize: number = 24;
  private hexWidth: number;
  private hexHeight: number;

  constructor(app: PIXI.Application, gameContainer: PIXI.Container) {
    this.app = app;
    this.gameContainer = gameContainer;
    this.lightingContainer = new PIXI.Container();
    
    this.hexWidth = Math.sqrt(3) * this.hexSize;
    this.hexHeight = 2 * this.hexSize;
    
    const lightRadius = 500;
    const texture = this.createRadialGradientTexture(lightRadius);
    
    this.lightSprite = new PIXI.Sprite(texture);
    this.lightSprite.anchor.set(0.5);
    this.lightSprite.blendMode = 'add';
    this.lightSprite.alpha = 0.595;
    this.lightSprite.visible = true;
    
    this.lightingContainer.visible = true;
    this.lightingContainer.addChild(this.lightSprite);
    gameContainer.addChild(this.lightingContainer);
  }

  private createRadialGradientTexture(radius: number): PIXI.Texture {
    const canvas = document.createElement('canvas');
    const size = radius * 2;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    const gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
    gradient.addColorStop(0, 'rgba(255, 235, 170, 0.7)');
    gradient.addColorStop(0.3, 'rgba(255, 220, 140, 0.65)');
    gradient.addColorStop(0.6, 'rgba(255, 200, 110, 0.45)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    return PIXI.Texture.from(canvas);
  }

  private getHexPosition(x: number, y: number): { posX: number; posY: number } {
    const posX = x * this.hexWidth + (y % 2) * (this.hexWidth / 2);
    const posY = y * (this.hexHeight * 0.75);
    return { posX, posY };
  }

  public update() {
    const player = useGameStore.getState().player;
    const { posX, posY } = this.getHexPosition(
      player.visualPosition.x,
      player.visualPosition.y
    );
    
    this.lightSprite.position.set(posX, posY);
  }

  public destroy() {
    this.lightSprite.destroy();
    this.lightingContainer.destroy();
  }
}
