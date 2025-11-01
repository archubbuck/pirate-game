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
    
    graphics.moveTo(12, 0);
    graphics.lineTo(-10, -8);
    graphics.lineTo(-6, 0);
    graphics.lineTo(-10, 8);
    graphics.closePath();
    graphics.fill({ color: 0x8b0000 });
    graphics.stroke({ color: 0x5a0000, width: 2 });
    
    graphics.rect(-6, -6, 12, 12);
    graphics.fill({ color: 0xa52a2a });
    graphics.stroke({ color: 0x8b0000, width: 1 });
    
    graphics.rect(-1, -14, 2, 8);
    graphics.fill({ color: 0x654321 });
    
    graphics.moveTo(1, -12);
    graphics.lineTo(8, -10);
    graphics.lineTo(8, -6);
    graphics.lineTo(1, -8);
    graphics.closePath();
    graphics.fill({ color: 0x2f2f2f });
    graphics.stroke({ color: 0x1a1a1a, width: 1 });
    
    graphics.circle(0, 0, 2);
    graphics.fill({ color: 0xff0000 });
    
    const healthBarBg = new PIXI.Graphics();
    healthBarBg.rect(-12, 14, 24, 4);
    healthBarBg.fill({ color: 0x222222 });
    healthBarBg.stroke({ color: 0x000000, width: 1 });
    
    const healthBarFg = new PIXI.Graphics();
    const healthPercent = ship.health / ship.maxHealth;
    const healthColor = healthPercent > 0.5 ? 0x44aa44 : healthPercent > 0.25 ? 0xffaa00 : 0xdd3333;
    healthBarFg.rect(-12, 14, 24 * healthPercent, 4);
    healthBarFg.fill({ color: healthColor });
    
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
          const healthPercent = ship.health / ship.maxHealth;
          const healthColor = healthPercent > 0.5 ? 0x44aa44 : healthPercent > 0.25 ? 0xffaa00 : 0xdd3333;
          healthBarFg.rect(-12, 14, 24 * healthPercent, 4);
          healthBarFg.fill({ color: healthColor });
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
