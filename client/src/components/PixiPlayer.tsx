import * as PIXI from "pixi.js";
import { useGameStore } from "@/lib/stores/useGameStore";
import { useSkillsStore } from "@/lib/stores/useSkillsStore";

function getShipTextureForLevel(sailingLevel: number): string {
  if (sailingLevel >= 90) return "/textures/ships/ship12.png";
  if (sailingLevel >= 80) return "/textures/ships/ship11.png";
  if (sailingLevel >= 70) return "/textures/ships/ship10.png";
  if (sailingLevel >= 60) return "/textures/ships/ship9.png";
  if (sailingLevel >= 50) return "/textures/ships/ship8.png";
  if (sailingLevel >= 40) return "/textures/ships/ship7.png";
  if (sailingLevel >= 30) return "/textures/ships/ship6.png";
  if (sailingLevel >= 20) return "/textures/ships/ship5.png";
  if (sailingLevel >= 15) return "/textures/ships/ship4.png";
  if (sailingLevel >= 10) return "/textures/ships/ship3.png";
  if (sailingLevel >= 5) return "/textures/ships/ship2.png";
  return "/textures/ships/ship1.png";
}

export class PixiPlayer {
  private container: PIXI.Container;
  private shipContainer: PIXI.Container;
  private hexSize: number = 24;
  private hexWidth: number;
  private hexHeight: number;
  private shipSprite: PIXI.Sprite | null = null;
  private textures: Map<string, PIXI.Texture> = new Map();
  private currentSailingLevel: number = 1;
  private isLoadingTextures: boolean = false;

  constructor(parent: PIXI.Container) {
    this.container = new PIXI.Container();
    this.shipContainer = new PIXI.Container();
    parent.addChild(this.container);
    this.container.addChild(this.shipContainer);

    this.hexWidth = Math.sqrt(3) * this.hexSize;
    this.hexHeight = 2 * this.hexSize;

    this.loadTextures();
  }

  private async loadTextures() {
    this.isLoadingTextures = true;
    
    const shipPaths = [
      "/textures/ships/ship1.png",
      "/textures/ships/ship2.png",
      "/textures/ships/ship3.png",
      "/textures/ships/ship4.png",
      "/textures/ships/ship5.png",
      "/textures/ships/ship6.png",
      "/textures/ships/ship7.png",
      "/textures/ships/ship8.png",
      "/textures/ships/ship9.png",
      "/textures/ships/ship10.png",
      "/textures/ships/ship11.png",
      "/textures/ships/ship12.png",
    ];

    try {
      for (const path of shipPaths) {
        const texture = await PIXI.Assets.load(path);
        this.textures.set(path, texture);
      }
      
      this.isLoadingTextures = false;
      this.createShip();
    } catch (error) {
      console.error("Failed to load ship textures:", error);
      this.isLoadingTextures = false;
    }
  }

  private createShip() {
    const sailingLevel = useSkillsStore.getState().skills.sailing.level;
    const texturePath = getShipTextureForLevel(sailingLevel);
    const texture = this.textures.get(texturePath);

    if (!texture) {
      console.warn(`Texture not found for path: ${texturePath}`);
      return;
    }

    if (this.shipSprite) {
      this.shipSprite.destroy();
    }

    this.shipSprite = new PIXI.Sprite(texture);
    this.shipSprite.anchor.set(0.5, 0.5);
    
    const scale = 0.08;
    this.shipSprite.scale.set(scale);
    
    this.shipContainer.addChild(this.shipSprite);
    this.currentSailingLevel = sailingLevel;
  }

  private updateShipTexture() {
    const sailingLevel = useSkillsStore.getState().skills.sailing.level;
    
    if (sailingLevel !== this.currentSailingLevel) {
      const texturePath = getShipTextureForLevel(sailingLevel);
      const texture = this.textures.get(texturePath);
      
      if (texture && this.shipSprite) {
        this.shipSprite.texture = texture;
        this.currentSailingLevel = sailingLevel;
        console.log(`Ship upgraded to level ${sailingLevel} variant!`);
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
    
    if (!this.isLoadingTextures && this.shipSprite) {
      this.updateShipTexture();
    }
  }

  public destroy() {
    if (this.shipSprite) {
      this.shipSprite.destroy();
    }
    this.container.destroy();
    
    this.textures.forEach(texture => texture.destroy());
    this.textures.clear();
  }
}
