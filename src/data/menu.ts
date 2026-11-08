import type { CupKind } from '../lib/sprites';

export interface MenuItem {
  name: string;
  description: string;
  price: string; // formatted "RM 7"
  serve: 'Hot' | 'Iced' | 'Hot / Iced' | 'Snack';
  icon: CupKind;
  liquid?: string; // drink colour inside the sprite
}

// Edit the menu here. Prices are placeholders from the design until confirmed.
export const menu: MenuItem[] = [
  { name: 'Kopi Chillbah', description: 'House blend, thick and smooth. Black or with milk.', price: 'RM 7', serve: 'Hot', icon: 'hot', liquid: '#715542' },
  { name: 'Iced Latte', description: 'Double shot over ice with fresh milk.', price: 'RM 10', serve: 'Iced', icon: 'iced', liquid: '#a8742a' },
  { name: 'Sabah Tea Latte', description: 'Local Sabah tea, frothed milk, light sugar.', price: 'RM 9', serve: 'Hot / Iced', icon: 'tall' },
  { name: 'Hilux Mocha', description: 'Chocolate, espresso, cream on top.', price: 'RM 12', serve: 'Iced', icon: 'cream', liquid: '#5a3a26' },
  { name: 'Gula Apong Oat', description: 'Oat milk latte with palm sugar syrup.', price: 'RM 12', serve: 'Iced', icon: 'iced', liquid: '#c98a4a' },
  { name: 'Tailgate Croffle', description: 'Crispy croffle, cream and a berry. Best with kopi.', price: 'RM 9', serve: 'Snack', icon: 'croffle' },
];
