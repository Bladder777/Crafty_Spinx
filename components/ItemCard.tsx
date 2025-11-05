import React from 'react';
import { CraftItem } from '../types';

interface ItemCardProps {
  item: CraftItem;
  onAddToCart: () => void;
  isInCart: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onAddToCart, isInCart }) => {
  return (
    <div className="bg-brand-white-ish rounded-xl shadow-lg overflow-hidden flex flex-col group transition-transform duration-300 hover:scale-105">
      <div className="relative">
        <img src={item.imageUrl} alt={item.name} className="w-full h-40 md:h-48 object-cover" />
        <div className="absolute top-2 right-2 bg-brand-accent text-brand-white-ish font-bold text-sm px-2 py-1 rounded-full">
          R {item.price.toFixed(2)}
        </div>
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-lg font-bold font-display text-brand-text">{item.name}</h3>
        <p className="text-xs text-gray-600 mt-1 flex-grow">{item.description}</p>
        <button
          onClick={onAddToCart}
          disabled={isInCart}
          className="mt-3 w-full bg-brand-secondary text-brand-white-ish font-bold py-2 px-3 rounded-lg hover:bg-opacity-80 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
        >
          {isInCart ? 'In Cart' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ItemCard;
