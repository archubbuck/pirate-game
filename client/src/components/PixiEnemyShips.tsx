import * as PIXI from "pixi.js";
import { useGameStore, type EnemyShip } from "@/lib/stores/useGameStore";

export class PixiEnemyShips {
  private container: PIXI.Container;
  private tileSize: number = 40;
  private shipGraphics: Map<string, PIXI.Container> = new Map();

  constructor(parent: PIXI.Container) {
    this.container = new PIXI.Container();
    parent.addChild(this.container);
  }

  private createShip(ship: EnemyShip) {
    const shipContainer = new PIXI.Container();
    
    const graphics = new PIXI.Graphics();
    
    graphics.moveTo(10, 0);
    graphics.lineTo(-8, -6);
    graphics.lineTo(-5, 0);
    graphics.lineTo(-8, 6);
    graphics.closePath();
    graphics.fill({ color: 0xaa3333, alpha: 1 });
    graphics.stroke({ color: 0xff4444, width: 2 });
    
    const healthBarBg = new PIXI.Graphics();
    healthBarBg.rect(-10, 12, 20, 3);
    healthBarBg.fill({ color: 0x333333 });
    
    const healthBarFg = new PIXI.Graphics();
    healthBarFg.rect(-10, 12, 20 * (ship.health / ship.maxHealth), 3);
    healthBarFg.fill({ color: 0x44aa44 });
    
    shipContainer.addChild(graphics);
    shipContainer.addChild(healthBarBg);
    shipContainer.addChild(healthBarFg);
    
    shipContainer.eventMode = 'static';
    shipContainer.cursor = 'crosshair';
    shipContainer.on('pointerdown', () => {
      console.log('Enemy ship clicked:', ship.id);
      useGameStore.getState().startCombat(ship.id);
    });
    
    const worldX = ship.visualPosition.x * this.tileSize;
    const worldY = ship.visualPosition.y * this.tileSize;
    shipContainer.position.set(worldX, worldY);
    shipContainer.rotation = ship.rotation;
    
    this.container.addChild(shipContainer);
    this.shipGraphics.set(ship.id, shipContainer);
  }

  public update() {
    const enemyShips = useGameStore.getState().enemyShips;

    const currentIds = new Set(enemyShips.map(s => s.id));
    
    this.shipGraphics.forEach((graphics, id) => {
      if (!currentIds.has(id)) {
        graphics.destroy();
        this.shipGraphics.delete(id);
      }
    });

    enemyShips.forEach(ship => {
      const existing = this.shipGraphics.get(ship.id);
      
      if (!existing) {
        this.createShip(ship);
      } else {
        const worldX = ship.visualPosition.x * this.tileSize;
        const worldY = ship.visualPosition.y * this.tileSize;
        existing.position.set(worldX, worldY);
        existing.rotation = ship.rotation;
        
        const healthBarFg = existing.children[2] as PIXI.Graphics;
        if (healthBarFg) {
          healthBarFg.clear();
          healthBarFg.rect(-10, 12, 20 * (ship.health / ship.maxHealth), 3);
          healthBarFg.fill({ color: 0x44aa44 });
        }
      }
    });
  }

  public destroy() {
    this.shipGraphics.forEach(graphics => graphics.destroy());
    this.shipGraphics.clear();
    this.container.destroy();
  }
}
