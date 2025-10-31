import * as PIXI from "pixi.js";
import { useGameStore } from "@/lib/stores/useGameStore";

export class PixiPlayer {
  private container: PIXI.Container;
  private shipContainer: PIXI.Container;
  private tileSize: number = 40;
  private shipGraphics: PIXI.Graphics;

  constructor(parent: PIXI.Container) {
    this.container = new PIXI.Container();
    this.shipContainer = new PIXI.Container();
    parent.addChild(this.container);
    this.container.addChild(this.shipContainer);

    this.shipGraphics = new PIXI.Graphics();
    this.shipContainer.addChild(this.shipGraphics);

    this.createShip();
  }

  private createShip() {
    this.shipGraphics.clear();
    
    this.shipGraphics.moveTo(0, -15);
    this.shipGraphics.lineTo(-10, 10);
    this.shipGraphics.lineTo(0, 5);
    this.shipGraphics.lineTo(10, 10);
    this.shipGraphics.closePath();
    this.shipGraphics.fill({ color: 0x8b4513 });
    this.shipGraphics.stroke({ color: 0xd4a574, width: 2 });
    
    this.shipGraphics.circle(0, 0, 3);
    this.shipGraphics.fill({ color: 0xffa500 });
  }

  public update() {
    const player = useGameStore.getState().player;
    const rotation = useGameStore.getState().playerRotation || 0;
    
    const posX = player.visualPosition.x * this.tileSize + this.tileSize / 2;
    const posY = player.visualPosition.y * this.tileSize + this.tileSize / 2;
    
    this.container.position.set(posX, posY);
    this.shipContainer.rotation = rotation;
  }

  public destroy() {
    this.shipGraphics.destroy();
    this.container.destroy();
  }
}
