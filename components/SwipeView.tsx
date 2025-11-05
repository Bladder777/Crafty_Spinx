import React, { useState, useEffect } from 'react';
import { CraftItem } from '../types';
import { HeartIcon, XIcon } from './Icons';

interface SwipeViewProps {
  items: CraftItem[];
  onAddToCart: (item: CraftItem) => void;
  cartItemIds: Set<number>;
}

type AnimationState = 'in' | 'out-left' | 'out-right' | 'idle';

const SwipeView: React.FC<SwipeViewProps> = ({ items, onAddToCart, cartItemIds }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animation, setAnimation] = useState<AnimationState>('in');
  
  const currentItem = items[currentIndex];

  const advanceToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1));
    setAnimation('in');
  };

  useEffect(() => {
    setAnimation('in');
    if (currentIndex >= items.length) {
      setCurrentIndex(0); // Loop back to the start
    }
  }, [currentIndex, items.length]);


  const handleAction = (action: 'skip' | 'like') => {
    if (animation !== 'in') return;

    if (action === 'like') {
      onAddToCart(currentItem);
      setAnimation('out-right');
    } else {
      setAnimation('out-left');
    }
  };

  const handleAnimationEnd = () => {
    if (animation === 'out-left' || animation === 'out-right') {
      advanceToNext();
    }
  };

  if (!currentItem) {
     return (
        <div className="text-center p-8 mt-10 bg-brand-white-ish rounded-2xl shadow-lg max-w-lg mx-auto">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-3xl font-display text-brand-accent mb-2">All Done!</h2>
            <p className="text-brand-text">You've seen all the amazing crafts. Want to see them again?</p>
            <button 
              onClick={() => setCurrentIndex(0)} 
              className="mt-4 bg-brand-accent text-brand-white-ish font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-200"
            >
              Start Over
            </button>
        </div>
     )
  }
  
  const animationClasses = {
      'in': 'animate-[slide-in_0.4s_ease-out_forwards]',
      'out-left': 'animate-[slide-out-left_0.4s_ease-in_forwards]',
      'out-right': 'animate-[slide-out-right_0.4s_ease-in_forwards]',
      'idle': 'opacity-0',
  };

  return (
    <div className="flex flex-col items-center justify-center h-full pt-4 pb-12">
       <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slide-out-left {
          from { opacity: 1; transform: translateX(0) rotate(0); }
          to { opacity: 0; transform: translateX(-150%) rotate(-15deg); }
        }
        @keyframes slide-out-right {
          from { opacity: 1; transform: translateX(0) rotate(0); }
          to { opacity: 0; transform: translateX(150%) rotate(15deg); }
        }
       `}</style>

        <div 
          className={`w-full max-w-sm ${animationClasses[animation]}`}
          onAnimationEnd={handleAnimationEnd}
        >
            <div className="bg-brand-white-ish rounded-2xl shadow-xl overflow-hidden flex flex-col group">
                <div className="relative">
                    <img src={currentItem.imageUrl} alt={currentItem.name} className="w-full h-72 object-cover" />
                    <div className="absolute top-2 right-2 bg-brand-accent text-brand-white-ish font-bold text-sm px-2 py-1 rounded-full">
                        R {currentItem.price.toFixed(2)}
                    </div>
                </div>
                <div className="p-4 flex flex-col flex-grow text-center">
                    <h3 className="text-2xl font-bold font-display text-brand-text">{currentItem.name}</h3>
                    <p className="text-sm text-gray-600 mt-2 flex-grow h-20 overflow-y-auto">{currentItem.description}</p>
                </div>
            </div>
        </div>

      <div className="flex items-center justify-center space-x-8 mt-8">
        <button onClick={() => handleAction('skip')} className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center text-red-500 hover:scale-110 transition-transform">
          <XIcon className="w-10 h-10" />
        </button>
        <button 
          onClick={() => handleAction('like')} 
          disabled={cartItemIds.has(currentItem.id)}
          className="w-24 h-24 rounded-full bg-brand-accent shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <HeartIcon className="w-12 h-12" />
        </button>
      </div>
    </div>
  );
};

export default SwipeView;