export type Category = 'Decor' | 'Crochet' | 'Random';

export interface CraftItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: Category;
}

export type View = 'catalog' | 'cart';
