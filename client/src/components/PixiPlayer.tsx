import * as PIXI from "pixi.js";
import { useGameStore } from "@/lib/stores/useGameStore";
import { useSkillsStore } from "@/lib/stores/useSkillsStore";

function getShipTextureForLevel(sailingLevel: number): string {
  if (sailingLevel >= 60) return "/textures/ships/ship5.png";
  if (sailingLevel >= 40) return "/textures/ships/ship4.png";
  if (sailingLevel >= 20) return "/textures/ships/ship3.png";
  if (sailingLevel >= 10) return "/textures/ships/ship2.png";
  return "/textures/ships/ship1.png";
}

export class PixiPlayer {
  private container: PIXI.Container;
  private shipContainer: PIXI.Container;
  private tileSize: number = 40;
  private shipSprite: PIXI.Sprite | null = null;
  private textures: Map<string, PIXI.Texture> = new Map();
  private currentSailingLevel: number = 1;
  private isLoadingTextures: boolean = false;

  constructor(parent: PIXI.Container) {
    this.container = new PIXI.Container();
    this.shipContainer = new PIXI.Container();
    parent.addChild(this.container);
    this.container.addChild(this.shipContainer);

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
    
    const scale = 0.15;
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

  public update() {
    const player = useGameStore.getState().player;
    const rotation = useGameStore.getState().playerRotation || 0;
    
    const posX = player.visualPosition.x * this.tileSize + this.tileSize / 2;
    const posY = player.visualPosition.y * this.tileSize + this.tileSize / 2;
    
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
