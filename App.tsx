import React, { useState } from 'react';
import { CraftItem, View } from './types';
import { CRAFT_ITEMS } from './constants';
import CatalogView from './components/CatalogView';
import CartView from './components/OrderView';
import Navbar from './components/Navbar';
import SettingsModal from './components/SettingsModal';
import SwipeView from './components/SwipeView';
import FloatingActionMenu from './components/FloatingActionMenu';

const App: React.FC = () => {
  const [items] = useState<CraftItem[]>(CRAFT_ITEMS);
  const [cartItems, setCartItems] = useState<CraftItem[]>([]);
  const [currentView, setCurrentView] = useState<View>('catalog');
  const [catalogMode, setCatalogMode] = useState<'swipe' | 'grid'>('swipe');
  const [theme, setTheme] = useState('pastel');
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  const handleAddToCart = (item: CraftItem) => {
    if (!cartItems.some(i => i.id === item.id)) {
      setCartItems(prevItems => [...prevItems, item]);
    }
  };
  
  const handleRemoveFromCart = (itemId: number) => {
      setCartItems(prevItems => prevItems.filter(i => i.id !== itemId));
  };

  const handleSendInquiry = () => {
    setCartItems([]);
    setCurrentView('catalog');
  };
  
  const handleSetTheme = (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.className = `theme-${newTheme}`;
  }

  return (
    <div className={`theme-${theme} min-h-screen bg-brand-background font-body text-brand-text flex flex-col`}>
      <header className="p-4 flex justify-center items-center shadow-md bg-brand-white-ish/70 backdrop-blur-sm sticky top-0 z-20">
        <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-display text-brand-accent">Crafty Spinx</h1>
            <p className="text-sm text-gray-500">Handmade with love</p>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto p-4 md:p-6 relative">
        {currentView === 'catalog' ? (
          catalogMode === 'swipe' ? (
            <SwipeView 
              items={items} 
              onAddToCart={handleAddToCart}
              cartItemIds={new Set(cartItems.map(i => i.id))}
            />
          ) : (
            <CatalogView 
              items={items} 
              onAddToCart={handleAddToCart} 
              cartItemIds={new Set(cartItems.map(i => i.id))}
            />
          )
        ) : (
          <CartView 
            cartItems={cartItems} 
            onSendInquiry={handleSendInquiry}
            onRemoveItem={handleRemoveFromCart}
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
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentTheme={theme}
        onSetTheme={handleSetTheme}
      />
    </div>
  );
};

export default App;