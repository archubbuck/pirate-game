import * as PIXI from "pixi.js";
import { useGameStore } from "@/lib/stores/useGameStore";

export class PixiFogOfWar {
  private app: PIXI.Application;
  private gameContainer: PIXI.Container;
  private container: PIXI.Container;
  private maskGraphics: PIXI.Graphics;
  private tileSize: number = 40;
  private visionRadius: number = 6;

  constructor(app: PIXI.Application, gameContainer: PIXI.Container) {
    this.app = app;
    this.gameContainer = gameContainer;
    this.container = new PIXI.Container();
    this.maskGraphics = new PIXI.Graphics();
    
    this.container.addChild(this.maskGraphics);
    app.stage.addChild(this.container);
  }

  public update() {
    const player = useGameStore.getState().player;
    const playerWorldX = player.visualPosition.x * this.tileSize + this.tileSize / 2;
    const playerWorldY = player.visualPosition.y * this.tileSize + this.tileSize / 2;
    
    const worldPoint = new PIXI.Point(playerWorldX, playerWorldY);
    const screenPoint = this.gameContainer.toGlobal(worldPoint);
    
    const zoom = this.gameContainer.scale.x;
    const visionSize = this.visionRadius * 2 * this.tileSize * zoom;
    
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
