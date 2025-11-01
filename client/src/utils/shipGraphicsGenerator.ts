import * as PIXI from 'pixi.js';

export function drawShip(graphics: PIXI.Graphics, level: number, color: string = 'player'): void {
  graphics.clear();
  
  const isEnemy = color === 'enemy';
  const hullColor = isEnemy ? 0x8B0000 : 0x8B4513;
  const hullDark = isEnemy ? 0x5A0000 : 0x654321;
  const sailColor = isEnemy ? 0x2F2F2F : 0xF5E6D3;
  const mast = 0x654321;
  
  if (level >= 90) {
    drawShipLevel5(graphics, hullColor, hullDark, sailColor, mast);
  } else if (level >= 70) {
    drawShipLevel5(graphics, hullColor, hullDark, sailColor, mast);
  } else if (level >= 50) {
    drawShipLevel4(graphics, hullColor, hullDark, sailColor, mast);
  } else if (level >= 30) {
    drawShipLevel3(graphics, hullColor, hullDark, sailColor, mast);
  } else if (level >= 10) {
    drawShipLevel2(graphics, hullColor, hullDark, sailColor, mast);
  } else {
    drawShipLevel1(graphics, hullColor, hullDark, sailColor, mast);
  }
  
  drawShadow(graphics);
}

function drawShadow(graphics: PIXI.Graphics): void {
  graphics.ellipse(0, 16, 16, 3);
  graphics.fill({ color: 0x000000, alpha: 0.2 });
}

function drawShipLevel1(graphics: PIXI.Graphics, hull: number, hullDark: number, sail: number, mast: number): void {
  graphics.moveTo(0, -20);
  graphics.lineTo(15, 10);
  graphics.lineTo(15, 15);
  graphics.lineTo(-15, 15);
  graphics.lineTo(-15, 10);
  graphics.closePath();
  graphics.fill({ color: hull });
  graphics.stroke({ color: hullDark, width: 1.5 });
  
  graphics.rect(-1, -20, 2, 30);
  graphics.fill({ color: mast });
  
  graphics.moveTo(1, -15);
  graphics.lineTo(1, 5);
  graphics.lineTo(12, 0);
  graphics.closePath();
  graphics.fill({ color: sail });
  graphics.stroke({ color: hullDark, width: 0.5 });
}

function drawShipLevel2(graphics: PIXI.Graphics, hull: number, hullDark: number, sail: number, mast: number): void {
  graphics.moveTo(0, -22);
  graphics.lineTo(18, 12);
  graphics.lineTo(18, 17);
  graphics.lineTo(-18, 17);
  graphics.lineTo(-18, 12);
  graphics.closePath();
  graphics.fill({ color: hull });
  graphics.stroke({ color: hullDark, width: 1.5 });
  
  graphics.rect(-1.5, -22, 3, 34);
  graphics.fill({ color: mast });
  
  graphics.moveTo(1.5, -17);
  graphics.lineTo(1.5, 8);
  graphics.lineTo(15, 2);
  graphics.closePath();
  graphics.fill({ color: sail });
  graphics.stroke({ color: hullDark, width: 0.5 });
  
  graphics.moveTo(-1.5, -12);
  graphics.lineTo(-1.5, 5);
  graphics.lineTo(-14, 0);
  graphics.closePath();
  graphics.fill({ color: sail, alpha: 0.9 });
  graphics.stroke({ color: hullDark, width: 0.5 });
}

function drawShipLevel3(graphics: PIXI.Graphics, hull: number, hullDark: number, sail: number, mast: number): void {
  graphics.moveTo(0, -24);
  graphics.lineTo(20, 14);
  graphics.lineTo(20, 19);
  graphics.lineTo(-20, 19);
  graphics.lineTo(-20, 14);
  graphics.closePath();
  graphics.fill({ color: hull });
  graphics.stroke({ color: hullDark, width: 1.5 });
  
  graphics.rect(-18, 14, 36, 2);
  graphics.fill({ color: hullDark });
  
  graphics.rect(-1.5, -24, 3, 38);
  graphics.fill({ color: mast });
  
  graphics.moveTo(1.5, -19);
  graphics.lineTo(1.5, 10);
  graphics.lineTo(18, 4);
  graphics.closePath();
  graphics.fill({ color: sail });
  graphics.stroke({ color: hullDark, width: 0.5 });
  
  graphics.moveTo(-1.5, -14);
  graphics.lineTo(-1.5, 7);
  graphics.lineTo(-17, 2);
  graphics.closePath();
  graphics.fill({ color: sail, alpha: 0.9 });
  graphics.stroke({ color: hullDark, width: 0.5 });
}

function drawShipLevel4(graphics: PIXI.Graphics, hull: number, hullDark: number, sail: number, mast: number): void {
  graphics.moveTo(0, -26);
  graphics.lineTo(22, 16);
  graphics.lineTo(22, 21);
  graphics.lineTo(-22, 21);
  graphics.lineTo(-22, 16);
  graphics.closePath();
  graphics.fill({ color: hull });
  graphics.stroke({ color: hullDark, width: 1.5 });
  
  graphics.rect(-20, 16, 40, 2);
  graphics.fill({ color: hullDark });
  graphics.rect(-20, 18, 40, 3);
  graphics.fill({ color: hull });
  
  graphics.rect(-1.5, -26, 3, 42);
  graphics.fill({ color: mast });
  graphics.rect(9, -20, 2, 36);
  graphics.fill({ color: mast });
  
  graphics.moveTo(1.5, -21);
  graphics.lineTo(1.5, 12);
  graphics.lineTo(20, 6);
  graphics.closePath();
  graphics.fill({ color: sail });
  graphics.stroke({ color: hullDark, width: 0.5 });
  
  graphics.moveTo(-1.5, -16);
  graphics.lineTo(-1.5, 9);
  graphics.lineTo(-18, 4);
  graphics.closePath();
  graphics.fill({ color: sail, alpha: 0.9 });
  graphics.stroke({ color: hullDark, width: 0.5 });
  
  graphics.moveTo(10, -15);
  graphics.lineTo(10, 10);
  graphics.lineTo(22, 4);
  graphics.closePath();
  graphics.fill({ color: sail, alpha: 0.85 });
  graphics.stroke({ color: hullDark, width: 0.5 });
}

function drawShipLevel5(graphics: PIXI.Graphics, hull: number, hullDark: number, sail: number, mast: number): void {
  graphics.moveTo(0, -28);
  graphics.lineTo(24, 18);
  graphics.lineTo(24, 23);
  graphics.lineTo(-24, 23);
  graphics.lineTo(-24, 18);
  graphics.closePath();
  graphics.fill({ color: hull });
  graphics.stroke({ color: hullDark, width: 1.5 });
  
  graphics.rect(-22, 18, 44, 2);
  graphics.fill({ color: hullDark });
  graphics.rect(-22, 20, 44, 3);
  graphics.fill({ color: hull });
  
  graphics.rect(-1.5, -28, 3, 46);
  graphics.fill({ color: mast });
  graphics.rect(-12, -22, 2, 40);
  graphics.fill({ color: mast });
  graphics.rect(10, -22, 2, 40);
  graphics.fill({ color: mast });
  
  graphics.moveTo(1.5, -23);
  graphics.lineTo(1.5, 14);
  graphics.lineTo(22, 8);
  graphics.closePath();
  graphics.fill({ color: sail });
  graphics.stroke({ color: hullDark, width: 0.5 });
  
  graphics.moveTo(-1.5, -18);
  graphics.lineTo(-1.5, 11);
  graphics.lineTo(-20, 6);
  graphics.closePath();
  graphics.fill({ color: sail, alpha: 0.9 });
  graphics.stroke({ color: hullDark, width: 0.5 });
  
  graphics.moveTo(-11, -17);
  graphics.lineTo(-11, 12);
  graphics.lineTo(-23, 6);
  graphics.closePath();
  graphics.fill({ color: sail, alpha: 0.85 });
  graphics.stroke({ color: hullDark, width: 0.5 });
  
  graphics.moveTo(11, -17);
  graphics.lineTo(11, 12);
  graphics.lineTo(24, 6);
  graphics.closePath();
  graphics.fill({ color: sail, alpha: 0.8 });
  graphics.stroke({ color: hullDark, width: 0.5 });
}
