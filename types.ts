
import React from 'react';

export type Category = 'Decor' | 'Crochet' | 'Random';

export interface CraftItem {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: Category;
  modelUrl?: string;
}

export type View = 'catalog' | 'cart' | 'wishlist';
