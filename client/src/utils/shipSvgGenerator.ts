export function generateShipSVG(level: number): string {
  const shipDesigns: Record<number, () => string> = {
    1: () => `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(50, 50)">
          <!-- Hull -->
          <path d="M 0,-20 L 15,10 L 15,15 L -15,15 L -15,10 Z" fill="#8B4513" stroke="#654321" stroke-width="1.5"/>
          <!-- Mast -->
          <rect x="-1" y="-20" width="2" height="30" fill="#654321"/>
          <!-- Sail -->
          <path d="M 1,-15 L 1,5 L 12,0 Z" fill="#F5E6D3" stroke="#8B4513" stroke-width="0.5"/>
          <!-- Shadow -->
          <ellipse cx="0" cy="16" rx="16" ry="3" fill="#000000" opacity="0.2"/>
        </g>
      </svg>
    `,
    2: () => `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(50, 50)">
          <!-- Hull -->
          <path d="M 0,-22 L 18,12 L 18,17 L -18,17 L -18,12 Z" fill="#8B4513" stroke="#654321" stroke-width="1.5"/>
          <path d="M 0,-22 L 18,12 L 15,12 L 0,-19 L -15,12 L -18,12 Z" fill="#A0522D"/>
          <!-- Mast -->
          <rect x="-1.5" y="-22" width="3" height="34" fill="#654321"/>
          <!-- Sails -->
          <path d="M 1.5,-17 L 1.5,8 L 15,2 Z" fill="#F5E6D3" stroke="#8B4513" stroke-width="0.5"/>
          <path d="M -1.5,-12 L -1.5,5 L -14,0 Z" fill="#FFFACD" stroke="#8B4513" stroke-width="0.5"/>
          <!-- Shadow -->
          <ellipse cx="0" cy="18" rx="19" ry="3.5" fill="#000000" opacity="0.2"/>
        </g>
      </svg>
    `,
    3: () => `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(50, 50)">
          <!-- Hull -->
          <path d="M 0,-24 L 20,14 L 20,19 L -20,19 L -20,14 Z" fill="#8B4513" stroke="#654321" stroke-width="1.5"/>
          <path d="M 0,-24 L 20,14 L 17,14 L 0,-21 L -17,14 L -20,14 Z" fill="#A0522D"/>
          <!-- Deck details -->
          <rect x="-18" y="14" width="36" height="2" fill="#654321"/>
          <!-- Mast -->
          <rect x="-1.5" y="-24" width="3" height="38" fill="#654321"/>
          <!-- Sails -->
          <path d="M 1.5,-19 L 1.5,10 L 18,4 Z" fill="#F5E6D3" stroke="#8B4513" stroke-width="0.5"/>
          <path d="M -1.5,-14 L -1.5,7 L -17,2 Z" fill="#FFFACD" stroke="#8B4513" stroke-width="0.5"/>
          <!-- Shadow -->
          <ellipse cx="0" cy="20" rx="21" ry="4" fill="#000000" opacity="0.2"/>
        </g>
      </svg>
    `,
    4: () => `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(50, 50)">
          <!-- Hull -->
          <path d="M 0,-26 L 22,16 L 22,21 L -22,21 L -22,16 Z" fill="#8B4513" stroke="#654321" stroke-width="1.5"/>
          <path d="M 0,-26 L 22,16 L 19,16 L 0,-23 L -19,16 L -22,16 Z" fill="#A0522D"/>
          <!-- Deck -->
          <rect x="-20" y="16" width="40" height="2" fill="#654321"/>
          <rect x="-20" y="18" width="40" height="3" fill="#8B4513"/>
          <!-- Masts -->
          <rect x="-1.5" y="-26" width="3" height="42" fill="#654321"/>
          <rect x="9" y="-20" width="2" height="36" fill="#654321"/>
          <!-- Sails -->
          <path d="M 1.5,-21 L 1.5,12 L 20,6 Z" fill="#F5E6D3" stroke="#8B4513" stroke-width="0.5"/>
          <path d="M -1.5,-16 L -1.5,9 L -18,4 Z" fill="#FFFACD" stroke="#8B4513" stroke-width="0.5"/>
          <path d="M 10,-15 L 10,10 L 22,4 Z" fill="#F5DEB3" stroke="#8B4513" stroke-width="0.5"/>
          <!-- Shadow -->
          <ellipse cx="0" cy="22" rx="23" ry="4.5" fill="#000000" opacity="0.2"/>
        </g>
      </svg>
    `,
    5: () => `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(50, 50)">
          <!-- Hull -->
          <path d="M 0,-28 L 24,18 L 24,23 L -24,23 L -24,18 Z" fill="#8B4513" stroke="#654321" stroke-width="1.5"/>
          <path d="M 0,-28 L 24,18 L 21,18 L 0,-25 L -21,18 L -24,18 Z" fill="#A0522D"/>
          <!-- Deck -->
          <rect x="-22" y="18" width="44" height="2" fill="#654321"/>
          <rect x="-22" y="20" width="44" height="3" fill="#8B4513"/>
          <!-- Masts -->
          <rect x="-1.5" y="-28" width="3" height="46" fill="#654321"/>
          <rect x="-12" y="-22" width="2" height="40" fill="#654321"/>
          <rect x="10" y="-22" width="2" height="40" fill="#654321"/>
          <!-- Sails -->
          <path d="M 1.5,-23 L 1.5,14 L 22,8 Z" fill="#F5E6D3" stroke="#8B4513" stroke-width="0.5"/>
          <path d="M -1.5,-18 L -1.5,11 L -20,6 Z" fill="#FFFACD" stroke="#8B4513" stroke-width="0.5"/>
          <path d="M -11,-17 L -11,12 L -23,6 Z" fill="#F5DEB3" stroke="#8B4513" stroke-width="0.5"/>
          <path d="M 11,-17 L 11,12 L 24,6 Z" fill="#FFE4B5" stroke="#8B4513" stroke-width="0.5"/>
          <!-- Shadow -->
          <ellipse cx="0" cy="24" rx="25" ry="5" fill="#000000" opacity="0.2"/>
        </g>
      </svg>
    `,
  };

  const getDesignForLevel = (lvl: number): () => string => {
    if (lvl >= 90) return shipDesigns[5];
    if (lvl >= 70) return shipDesigns[5];
    if (lvl >= 50) return shipDesigns[4];
    if (lvl >= 30) return shipDesigns[3];
    if (lvl >= 10) return shipDesigns[2];
    return shipDesigns[1];
  };

  const design = getDesignForLevel(level);
  return design();
}

export function createShipTexture(level: number): string {
  const svg = generateShipSVG(level);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  return URL.createObjectURL(blob);
}
