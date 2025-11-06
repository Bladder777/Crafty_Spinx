import React, { useState, useEffect } from 'react';
import { CraftItem, View } from './types';
import { CRAFT_ITEMS } from './constants';
import CatalogView from './components/CatalogView';
import CartView from './components/OrderView';
import Navbar from './components/Navbar';
import SettingsModal from './components/SettingsModal';
import SwipeView from './components/SwipeView';
import FloatingActionMenu from './components/FloatingActionMenu';
import ThreeDViewModal from './components/ThreeDViewModal';
import WishlistView from './components/WishlistView';
import { generateProductImage } from './services/geminiService';

const App: React.FC = () => {
  const [items, setItems] = useState<CraftItem[]>(CRAFT_ITEMS);
  const [cartItems, setCartItems] = useState<CraftItem[]>([]);
  const [wishlist, setWishlist] = useState<Set<number>>(() => {
    try {
      const savedWishlist = window.localStorage.getItem('wishlistItems');
      return savedWishlist ? new Set(JSON.parse(savedWishlist)) : new Set();
    } catch (error) {
      console.error("Could not load wishlist from localStorage", error);
      return new Set();
    }
  });
  
  const [currentView, setCurrentView] = useState<View>('catalog');
  const [catalogMode, setCatalogMode] = useState<'swipe' | 'grid'>('swipe');
  const [theme, setTheme] = useState('pastel');
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [itemFor3DView, setItemFor3DView] = useState<CraftItem | null>(null);
  const [loadingImageIds, setLoadingImageIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const loadItemImages = async () => {
      const processItem = async (item: CraftItem) => {
        const cacheKey = `crafty-spinx-image-${item.id}`;
        try {
          const cachedImage = window.localStorage.getItem(cacheKey);
          if (cachedImage) {
            setItems(prevItems => prevItems.map(i => i.id === item.id ? { ...i, imageUrl: cachedImage } : i));
            return;
          }

          setLoadingImageIds(prev => new Set(prev).add(item.id));
          // Stagger API calls slightly
          await new Promise(res => setTimeout(res, Math.random() * 500));
          const newImageUrl = await generateProductImage(item.name, item.description);

          if (newImageUrl) {
            window.localStorage.setItem(cacheKey, newImageUrl);
            setItems(prevItems => prevItems.map(i => i.id === item.id ? { ...i, imageUrl: newImageUrl } : i));
          }
        } catch (error) {
          console.error(`Failed to load or generate image for "${item.name}":`, error);
        } finally {
            setLoadingImageIds(prev => {
                const next = new Set(prev);
                next.delete(item.id);
                return next;
            });
        }
      };
      
      // Process all items concurrently without blocking the UI
      CRAFT_ITEMS.forEach(item => processItem(item));
    };

    loadItemImages();
  }, []); // Empty dependency array means this runs only once on mount

  useEffect(() => {
    try {
        window.localStorage.setItem('wishlistItems', JSON.stringify(Array.from(wishlist)));
    } catch (error) {
        console.error("Could not save wishlist to localStorage", error);
    }
  }, [wishlist]);


  const handleAddToCart = (item: CraftItem) => {
    if (!cartItems.some(i => i.id === item.id)) {
      setCartItems(prevItems => [...prevItems, item]);
    }
  };
  
  const handleRemoveFromCart = (itemId: number) => {
      setCartItems(prevItems => prevItems.filter(i => i.id !== itemId));
  };
  
  const handleToggleWishlist = (itemId: number) => {
    setWishlist(prevWishlist => {
        const newWishlist = new Set(prevWishlist);
        if (newWishlist.has(itemId)) {
            newWishlist.delete(itemId);
        } else {
            newWishlist.add(itemId);
        }
        return newWishlist;
    });
  };

  const handleSendInquiry = () => {
    setCartItems([]);
    setCurrentView('catalog');
  };
  
  const handleSetTheme = (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.className = `theme-${newTheme}`;
  }

  const handleImageClick = (item: CraftItem) => {
    if (item.modelUrl) {
      setItemFor3DView(item);
    }
  };

  const wishlistItems = items.filter(item => wishlist.has(item.id));
  const cartItemIds = new Set(cartItems.map(i => i.id));

  return (
    <div className={`theme-${theme} min-h-screen bg-brand-background font-body text-brand-text flex flex-col`}>
      <header className="p-4 flex justify-center items-center shadow-md bg-brand-white-ish/70 backdrop-blur-sm sticky top-0 z-20">
        <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-display text-brand-accent">Crafty Spinx</h1>
            <p className="text-sm text-gray-500">Handmade with love</p>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto p-4 md:p-6 relative">
        {currentView === 'catalog' && (
          catalogMode === 'swipe' ? (
            <SwipeView 
              items={items} 
              onAddToCart={handleAddToCart}
              cartItemIds={cartItemIds}
              onImageClick={handleImageClick}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
              loadingImageIds={loadingImageIds}
            />
          ) : (
            <CatalogView 
              items={items} 
              onAddToCart={handleAddToCart} 
              cartItemIds={cartItemIds}
              onImageClick={handleImageClick}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
              loadingImageIds={loadingImageIds}
            />
          )
        )}
        {currentView === 'cart' && (
            <CartView 
                cartItems={cartItems} 
                onSendInquiry={handleSendInquiry}
                onRemoveItem={handleRemoveFromCart}
            />
        )}
        {currentView === 'wishlist' && (
            <WishlistView
                wishlistItems={wishlistItems}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={handleAddToCart}
                cartItemIds={cartItemIds}
                onImageClick={handleImageClick}
                loadingImageIds={loadingImageIds}
            />
        )}
      </main>
      
      {currentView === 'catalog' && (
        <FloatingActionMenu 
            isGridMode={catalogMode === 'grid'}
            onToggleView={() => setCatalogMode(mode => mode === 'grid' ? 'swipe' : 'grid')}
            onOpenSettings={() => setSettingsOpen(true)}
        />
      )}

      <Navbar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        itemCount={cartItems.length}
        wishlistCount={wishlist.size}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentTheme={theme}
        onSetTheme={handleSetTheme}
      />

      <ThreeDViewModal 
        item={itemFor3DView}
        onClose={() => setItemFor3DView(null)}
      />
    </div>
  );
};

export default App;