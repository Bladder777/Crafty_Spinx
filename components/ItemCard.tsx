import React from 'react';
import { CraftItem } from '../types';
import { WishlistHeartIcon } from './Icons';

interface ItemCardProps {
  item: CraftItem;
  onAddToCart: () => void;
  isInCart: boolean;
  onImageClick: (item: CraftItem) => void;
  isInWishlist: boolean;
  onToggleWishlist: () => void;
  loadingImageIds: Set<number>;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onAddToCart, isInCart, onImageClick, isInWishlist, onToggleWishlist, loadingImageIds }) => {
  const isLoading = loadingImageIds.has(item.id);
  
  return (
    <div className="bg-brand-white-ish rounded-xl shadow-lg overflow-hidden flex flex-col group transition-transform duration-300 hover:scale-105">
      <div 
        className="relative overflow-hidden"
      >
        <button
            onClick={(e) => {
                e.stopPropagation(); 
                onToggleWishlist();
            }}
            className="absolute top-2 left-2 z-10 p-1.5 bg-brand-white-ish/70 rounded-full text-brand-accent hover:scale-110 transition-transform"
            aria-label="Toggle Wishlist"
        >
            <WishlistHeartIcon filled={isInWishlist} className="w-5 h-5" />
        </button>
        <div 
          className={`${item.modelUrl ? 'cursor-pointer' : ''}`}
          onClick={() => onImageClick(item)}
        >
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="w-full h-40 md:h-48 object-cover transition-all duration-300 group-hover:scale-110"
          />
           {isLoading && (
            <div className="absolute inset-0 bg-brand-background/70 animate-pulse" />
          )}
          <div className="absolute top-2 right-2 bg-brand-accent text-brand-white-ish font-bold text-sm px-2 py-1 rounded-full">
            R {item.price.toFixed(2)}
          </div>
          {item.modelUrl && (
            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded">
              3D
            </div>
          )}
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