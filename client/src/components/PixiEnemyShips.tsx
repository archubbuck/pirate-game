import * as PIXI from "pixi.js";
import { useGameStore, type EnemyShip } from "@/lib/stores/useGameStore";
import type { PixiCamera } from "./PixiCamera";

export class PixiEnemyShips {
  private container: PIXI.Container;
  private hexSize: number = 24;
  private hexWidth: number;
  private hexHeight: number;
  private shipGraphics: Map<string, PIXI.Container> = new Map();
  private lastHealthValues: Map<string, number> = new Map();

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
    
    const { posX: worldX, posY: worldY } = this.getHexPosition(ship.visualPosition.x, ship.visualPosition.y);
    shipContainer.position.set(worldX, worldY);
    shipContainer.rotation = ship.rotation;
    
    this.container.addChild(shipContainer);
    this.shipGraphics.set(ship.id, shipContainer);
    this.lastHealthValues.set(ship.id, ship.health);
  }

  private isInViewport(ship: EnemyShip, bounds: { minX: number; maxX: number; minY: number; maxY: number }): boolean {
    const { posX: worldX, posY: worldY } = this.getHexPosition(ship.visualPosition.x, ship.visualPosition.y);
    
    return worldX >= bounds.minX && worldX <= bounds.maxX &&
           worldY >= bounds.minY && worldY <= bounds.maxY;
  }

  public update(camera?: PixiCamera) {
    const enemyShips = useGameStore.getState().enemyShips;
    const player = useGameStore.getState().player;
    const viewRange = useGameStore.getState().visionRadius || 5;
    
    const visibleShips = enemyShips.filter(ship => {
      const distance = this.getHexDistance(
        ship.position.x, 
        ship.position.y, 
        player.position.x, 
        player.position.y
      );
      return distance <= viewRange;
    });

    const currentIds = new Set(enemyShips.map(s => s.id));
    
    this.shipGraphics.forEach((graphics, id) => {
      if (!currentIds.has(id)) {
        graphics.destroy();
        this.shipGraphics.delete(id);
        this.lastHealthValues.delete(id);
      }
    });

    const visibleIds = new Set(visibleShips.map(s => s.id));
    
    this.shipGraphics.forEach((graphics, id) => {
      graphics.visible = visibleIds.has(id);
    });

    visibleShips.forEach(ship => {
      const existing = this.shipGraphics.get(ship.id);
      
      if (!existing) {
        this.createShip(ship);
      } else {
        const { posX: worldX, posY: worldY } = this.getHexPosition(ship.visualPosition.x, ship.visualPosition.y);
        existing.position.set(worldX, worldY);
        existing.rotation = ship.rotation;
        existing.visible = true;
        
        const lastHealth = this.lastHealthValues.get(ship.id);
        if (lastHealth !== ship.health) {
          const healthBarFg = existing.children[2] as PIXI.Graphics;
          if (healthBarFg) {
            healthBarFg.clear();
            const healthPercent = ship.health / ship.maxHealth;
            const healthColor = healthPercent > 0.5 ? 0x44aa44 : healthPercent > 0.25 ? 0xffaa00 : 0xdd3333;
            healthBarFg.rect(-12, 14, 24 * healthPercent, 4);
            healthBarFg.fill({ color: healthColor });
          }
          this.lastHealthValues.set(ship.id, ship.health);
        }
      }
    });
  }

  public destroy() {
    this.shipGraphics.forEach(graphics => graphics.destroy());
    this.shipGraphics.clear();
    this.lastHealthValues.clear();
    this.container.destroy();
  }
}
