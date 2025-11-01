import * as PIXI from "pixi.js";
import { useGameStore } from "@/lib/stores/useGameStore";

export class PixiFogOfWar {
  private app: PIXI.Application;
  private gameContainer: PIXI.Container;
  private container: PIXI.Container;
  private maskGraphics: PIXI.Graphics;
  private hexSize: number = 24;
  private hexWidth: number;
  private hexHeight: number;
  private visionRadius: number = 10;

  constructor(app: PIXI.Application, gameContainer: PIXI.Container) {
    this.app = app;
    this.gameContainer = gameContainer;
    this.container = new PIXI.Container();
    this.maskGraphics = new PIXI.Graphics();
    
    this.hexWidth = Math.sqrt(3) * this.hexSize;
    this.hexHeight = 2 * this.hexSize;
    
    this.container.addChild(this.maskGraphics);
    app.stage.addChild(this.container);
  }

  private getHexPosition(x: number, y: number): { posX: number; posY: number } {
    const posX = x * this.hexWidth + (y % 2) * (this.hexWidth / 2);
    const posY = y * (this.hexHeight * 0.75);
    return { posX, posY };
  }

  public update() {
    const player = useGameStore.getState().player;
    const { posX: playerWorldX, posY: playerWorldY } = this.getHexPosition(player.visualPosition.x, player.visualPosition.y);
    
    const worldPoint = new PIXI.Point(playerWorldX, playerWorldY);
    const screenPoint = this.gameContainer.toGlobal(worldPoint);
    
    const zoom = this.gameContainer.scale.x;
    const visionSize = this.visionRadius * 2 * this.hexWidth * zoom;
    
    const screenWidth = this.app.screen.width;
    const screenHeight = this.app.screen.height;
    
    this.maskGraphics.clear();
    
    this.maskGraphics.rect(0, 0, screenWidth, screenHeight);
    this.maskGraphics.fill({ color: 0x000000, alpha: 0.85 });
    
    this.maskGraphics.rect(
      screenPoint.x - visionSize / 2,
      screenPoint.y - visionSize / 2,
      visionSize,
      visionSize
    );
    this.maskGraphics.cut();
  }

  public destroy() {
    this.maskGraphics.destroy();
    this.container.destroy();
  }
}
