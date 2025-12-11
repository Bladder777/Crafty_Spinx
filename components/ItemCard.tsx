
import React, { useState } from 'react';
import { CraftItem } from '../types';
import { WishlistHeartIcon, PencilIcon, TrashIcon, RotateIcon } from './Icons';
import { PLACEHOLDER_IMAGE } from '../constants';

interface ItemCardProps {
  item: CraftItem;
  onAddToCart: () => void;
  isInCart: boolean;
  isInWishlist: boolean;
  onToggleWishlist: () => void;
  onEdit: (item: CraftItem) => void;
  onDeleteItem: (itemId: number) => void;
  isAdminMode: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onAddToCart, isInCart, isInWishlist, onToggleWishlist, onEdit, onDeleteItem, isAdminMode }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [animationClass, setAnimationClass] = useState('');

  // Enhanced filtering at component level for extra safety
  const safeImages = (item.images || []).map(img => {
      const lowerImg = (img || '').toLowerCase();
      if (lowerImg.includes('imgbb') || lowerImg.includes('ibb.co')) {
          return PLACEHOLDER_IMAGE;
      }
      return img;
  });

  const images = safeImages.length > 0 ? safeImages : [PLACEHOLDER_IMAGE];
  const hasMultipleImages = images.length > 1;

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasMultipleImages) return;

    // Trigger flip out
    setAnimationClass('animate-flip-out');
  };

  const handleAnimationEnd = () => {
    if (animationClass === 'animate-flip-out') {
      // Swap image and trigger flip in
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
      setAnimationClass('animate-flip-in');
    } else if (animationClass === 'animate-flip-in') {
      // Reset
      setAnimationClass('');
    }
  };
  
  return (
    <div className="bg-brand-white-ish rounded-xl shadow-lg overflow-hidden flex flex-col h-full group transition-transform duration-300 hover:scale-[1.02]">
      <div className="relative w-full pt-[100%] bg-white perspective-1000"> {/* Aspect Ratio Box 1:1 */}
        <div className="absolute top-0 left-0 w-full h-full">
             <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation(); 
                        onToggleWishlist();
                    }}
                    className="p-1.5 bg-brand-white-ish/90 rounded-full text-brand-accent shadow-md hover:scale-110 transition-transform"
                    aria-label="Toggle Wishlist"
                >
                    <WishlistHeartIcon filled={isInWishlist} className="w-5 h-5" />
                </button>
                {isAdminMode && (
                <>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(item);
                        }}
                        className="p-1.5 bg-brand-white-ish/90 rounded-full text-brand-text shadow-md hover:text-brand-accent hover:scale-110 transition-transform"
                        aria-label="Edit Item"
                    >
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteItem(item.id);
                        }}
                        className="p-1.5 bg-brand-white-ish/90 rounded-full text-red-500 shadow-md hover:bg-red-500 hover:text-white hover:scale-110 transition-all"
                        aria-label="Delete Item"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </>
                )}
            </div>
            
            <img 
                src={images[currentImageIndex]} 
                alt={item.name} 
                className={`w-full h-full object-contain ${animationClass}`}
                onAnimationEnd={handleAnimationEnd}
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== PLACEHOLDER_IMAGE) {
                        target.src = PLACEHOLDER_IMAGE;
                    }
                }}
            />

            {/* Floating Rotate Button */}
            {hasMultipleImages && (
                <button
                    onClick={handleRotate}
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-brand-white-ish/80 hover:bg-brand-white-ish text-brand-secondary p-2 rounded-full shadow-md backdrop-blur-sm transition-transform hover:scale-110 hover:rotate-180 z-20"
                    aria-label="Next Image"
                    title="Next Picture"
                >
                    <RotateIcon className="w-5 h-5" />
                </button>
            )}
            
            <div className="absolute top-2 right-2 bg-brand-accent text-brand-white-ish font-bold text-sm px-2 py-1 rounded-full shadow-sm">
                R {item.price.toFixed(2)}
            </div>
        </div>
      </div>

      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-lg font-bold font-display text-brand-text leading-tight mb-1">{item.name}</h3>
        {/* Truncate description to 3 lines to prevent card unevenness */}
        <p className="text-xs text-gray-600 line-clamp-3 mb-3">{item.description}</p>
        
        <div className="mt-auto space-y-2">
            <button
            onClick={onAddToCart}
            disabled={isInCart}
            className="w-full bg-brand-secondary text-brand-white-ish font-bold py-2 px-3 rounded-lg hover:bg-opacity-80 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm shadow-sm"
            >
            {isInCart ? 'In Cart' : 'Add to Cart'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
