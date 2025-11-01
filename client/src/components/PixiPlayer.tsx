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
    
    this.shipGraphics.moveTo(0, -18);
    this.shipGraphics.lineTo(-12, 12);
    this.shipGraphics.lineTo(0, 8);
    this.shipGraphics.lineTo(12, 12);
    this.shipGraphics.closePath();
    this.shipGraphics.fill({ color: 0x654321 });
    this.shipGraphics.stroke({ color: 0x4a3517, width: 2 });
    
    this.shipGraphics.rect(-8, -8, 16, 10);
    this.shipGraphics.fill({ color: 0x8b5a3c });
    this.shipGraphics.stroke({ color: 0x654321, width: 1 });
    
    this.shipGraphics.rect(-2, -18, 4, 12);
    this.shipGraphics.fill({ color: 0xa0826d });
    
    this.shipGraphics.moveTo(2, -16);
    this.shipGraphics.lineTo(10, -12);
    this.shipGraphics.lineTo(10, -8);
    this.shipGraphics.lineTo(2, -10);
    this.shipGraphics.closePath();
    this.shipGraphics.fill({ color: 0xe6d5c3 });
    this.shipGraphics.stroke({ color: 0xb89968, width: 1 });
    
    this.shipGraphics.circle(0, 0, 3);
    this.shipGraphics.fill({ color: 0xffcc00 });
    this.shipGraphics.stroke({ color: 0xd4a000, width: 1 });
    
    this.shipGraphics.moveTo(-3, 10);
    this.shipGraphics.lineTo(3, 10);
    this.shipGraphics.lineTo(0, 13);
    this.shipGraphics.closePath();
    this.shipGraphics.fill({ color: 0x4169e1 });
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
