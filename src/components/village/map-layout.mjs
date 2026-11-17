export const DECOR_AREAS = [
  { kind: 'village', x: 0, y: 495, width: 390, height: 240 },
  { kind: 'tubes', x: 575, y: 600, width: 275, height: 305 },
  { kind: 'projectVillage', x: 568.3, y: 186.6, width: 310.2, height: 224.4 },
  { kind: 'vanilla', x: 1200, y: 570, width: 240, height: 160 },
  { kind: 'forest', x: 1050, y: 735, width: 360, height: 185 },
  { kind: 'coffret', x: 1225, y: 335, width: 210, height: 145 },
  { kind: 'greenhouse', x: 855, y: 650, width: 180, height: 205 },
];
export const EXPLORABLE_DECORS = [
  ...DECOR_AREAS.map(area => ({ ...area, label: {
    village: 'Le village des senteurs', tubes: 'Les fioles parfumées',
    projectVillage: 'Le village des fragrances', vanilla: 'La vanille',
    forest: 'La forêt', coffret: 'Le coffret des échantillons', greenhouse: 'La serre des inspirations',
  }[area.kind] || 'Le décor' })),
  { kind: 'laboratory', x: 1164, y: 93, width: 260, height: 231, label: 'L’atelier du parfumeur' },
];
