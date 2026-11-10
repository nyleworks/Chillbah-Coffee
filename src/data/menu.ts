import type { CupKind, FoodKind } from '../lib/sprites';

export interface MenuItem {
  name: string;
  price: string; // formatted "RM 12"
  icon: CupKind | FoodKind; // pixel sprite (src/lib/sprites.ts)
  liquid?: string; // drink colour inside a cup, or the topping/patty colour of a snack
  note?: string; // small line under the name ("per stick", "200 g each")
  hot?: boolean; // shows the HOT badge (best sellers)
}

export interface MenuPage { title: string; items: MenuItem[] }

// Edit the menu here (from Chillbah's menu board, 2026-11-10). All drinks are served iced.
// Drinks and snacks come in pages (the menu section shows one page at a time, 4 across).
export const drinks: MenuPage[] = [
  {
    title: 'Coffee',
    items: [
      { name: 'Coffee Latte', price: 'RM 11', icon: 'iced', liquid: '#b98a5e', hot: true },
      { name: 'Hazelnut Latte', price: 'RM 12', icon: 'iced', liquid: '#a8743f', hot: true },
      { name: 'Caramel Latte', price: 'RM 12', icon: 'iced', liquid: '#c98a4a', hot: true },
      { name: 'Vanilla Latte', price: 'RM 12', icon: 'iced', liquid: '#d9b98a' },
      { name: 'Butterscotch Latte', price: 'RM 12', icon: 'iced', liquid: '#d19a4a', hot: true },
      { name: 'Salted Caramel Latte', price: 'RM 12', icon: 'iced', liquid: '#b8783a', hot: true },
      { name: 'Iced Mocha', price: 'RM 14', icon: 'cream', liquid: '#5a3a26', hot: true },
      { name: 'Iced Cappuccino', price: 'RM 14', icon: 'iced', liquid: '#a8825e' },
      { name: 'Caramel Macchiato', price: 'RM 16', icon: 'cream', liquid: '#a8742a', hot: true },
      { name: 'Spanish Latte', price: 'RM 16', icon: 'iced', liquid: '#c49a6c', hot: true },
      { name: 'Iced Americano', price: 'RM 12', icon: 'iced', liquid: '#3b2416' },
      { name: 'Americano Orange C', price: 'RM 14', icon: 'iced', liquid: '#d9702a', hot: true },
    ],
  },
  {
    title: 'Non-coffee',
    items: [
      // chocolate, tea, ade, matcha
      { name: 'Iced Chocolate', price: 'RM 12', icon: 'iced', liquid: '#5a3a26' },
      { name: 'Iced Choco Strawberry', price: 'RM 14', icon: 'iced', liquid: '#7a3b3b' },
      { name: 'Thai Mix Tea', price: 'RM 8', icon: 'iced', liquid: '#e08a3c', hot: true },
      { name: 'Thai Green Tea', price: 'RM 8', icon: 'iced', liquid: '#a8c95a', hot: true },
      { name: 'Passionfruit Ade', price: 'RM 8', icon: 'iced', liquid: '#f2c14e', hot: true },
      { name: 'Strawberry Ade', price: 'RM 8', icon: 'iced', liquid: '#e0566b', hot: true },
      { name: 'Honey Lemon Ade', price: 'RM 8', icon: 'iced', liquid: '#f1d77a', hot: true },
      { name: 'Mango Ade', price: 'RM 8', icon: 'iced', liquid: '#f2a93b', hot: true },
      { name: 'Matcha Latte', price: 'RM 14', icon: 'tall' },
      { name: 'Matcha Strawberry', price: 'RM 16', icon: 'tall' },
      { name: 'Matcha Mango', price: 'RM 16', icon: 'tall' },
      { name: 'Matcha Blueberry', price: 'RM 16', icon: 'tall' },
    ],
  },
];

// Snacks, from Chillbah's grill menu board (2026-11-10).
export const snacks: MenuPage[] = [
  {
    title: 'Burgers',
    items: [
      { name: 'Ayam Burger', price: 'RM 10', icon: 'burger', liquid: '#c98a4a' },
      { name: 'Beef Burger', price: 'RM 10', icon: 'burger', liquid: '#5a3a26' },
      { name: 'Kerbau Burger', price: 'RM 10', icon: 'burger', liquid: '#4a2a1e' },
      { name: 'Burger + Fries', price: 'RM 18', icon: 'fries', note: 'Any grill burger' },
      { name: 'Bagel Ayam Burger', price: 'RM 13', icon: 'bagel', liquid: '#c98a4a' },
      { name: 'Bagel Beef Burger', price: 'RM 17', icon: 'bagel', liquid: '#5a3a26' },
      { name: 'Bagel Kerbau Burger', price: 'RM 19', icon: 'bagel', liquid: '#4a2a1e' },
      { name: 'Burger + Fries + Drink', price: 'RM 21', icon: 'fries', note: 'Any grill burger' },
      { name: 'Add Fries', price: '+RM 2', icon: 'fries', note: 'With a bagel burger' },
      { name: 'Add Drink', price: '+RM 2', icon: 'iced', liquid: '#3b2416', note: 'With a bagel burger' },
    ],
  },
  {
    title: 'Grill & bites',
    items: [
      { name: 'Classic Hotdog Bun', price: 'RM 7', icon: 'hotdog' },
      { name: 'Chilli Cheese Hotdog Bun', price: 'RM 9', icon: 'hotdog', liquid: '#6fae3a' },
      { name: 'Loaded Hotdog Bun', price: 'RM 11', icon: 'hotdog', liquid: '#d9452f' },
      { name: 'Lamb Grill', price: 'RM 25', icon: 'lamb', note: '200 g each' },
      { name: 'Roti John Ayam', price: 'RM 8.90', icon: 'rotijohn', liquid: '#e8c060' },
      { name: 'Roti John Beef', price: 'RM 9.90', icon: 'rotijohn', liquid: '#8a4a2a' },
      { name: 'Roti John Loaded', price: 'RM 13.90', icon: 'rotijohn', liquid: '#c0503a' },
      { name: 'Bakso Sate', price: 'RM 3', icon: 'sate', note: 'Per stick' },
      { name: 'Cheese Sausage', price: 'RM 5', icon: 'sausage' },
    ],
  },
];
