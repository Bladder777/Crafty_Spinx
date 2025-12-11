
import React, { useState, useEffect } from 'react';
import { CraftItem, View } from './types';
import { CRAFT_ITEMS, PLACEHOLDER_IMAGE } from './constants';
import CatalogView from './components/CatalogView';
import CartView from './components/OrderView';
import Navbar from './components/Navbar';
import SettingsModal from './components/SettingsModal';
import SwipeView from './components/SwipeView';
import FloatingActionMenu from './components/FloatingActionMenu';
import WishlistView from './components/WishlistView';
import EditItemModal from './components/EditItemModal';
import AddItemModal from './components/AddItemModal';
import ConfirmationModal from './components/ConfirmationModal';
import { supabase } from './services/supabaseClient';

const LOGO_URL = "/logo.png"; 
const SLOGAN = "Huggables - Handmade with love";

const App: React.FC = () => {
  const [items, setItems] = useState<CraftItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const [catalogMode, setCatalogMode] = useState<'swipe' | 'grid'>('grid'); 
  const [theme, setTheme] = useState('pastel');
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CraftItem | null>(null);
  const [isAddItemModalOpen, setAddItemModalOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [confirmation, setConfirmation] = useState<{ message: string; onConfirm: () => void; } | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // Helper to safely parse images from the legacy imageUrl column
  const parseImages = (imageUrl: string | null): string[] => {
      if (!imageUrl) return [];
      try {
          // Try to parse as JSON (for new multi-image data stored in text column)
          const parsed = JSON.parse(imageUrl);
          if (Array.isArray(parsed)) return parsed;
          return [imageUrl];
      } catch (e) {
          // Fallback: it's a simple string URL
          return [imageUrl];
      }
  };

  // --- Supabase Data Fetching ---
  const fetchItems = async () => {
    setIsLoading(true);
    setConnectionError(null);
    setIsOffline(false);
    
    let retryCount = 0;
    // INCREASED: Allow more attempts for slow cold starts (approx 20-30 seconds total)
    const maxRetries = 8; 

    while (retryCount <= maxRetries) {
        try {
          // Compatibility Mode: Fetch 'imageUrl' instead of 'images' to avoid SQL error 42703
          const { data, error } = await supabase
            .from('craft_items')
            .select(`
              id,
              name,
              description,
              price,
              imageUrl,
              category,
              "modelUrl"
            `)
            .order('id', { ascending: false });

          if (error) throw error;

          if (data && data.length > 0) {
            // Map the database structure (imageUrl) to app structure (images[])
            const mappedItems: CraftItem[] = data.map((item: any) => {
                let itemImages = parseImages(item.imageUrl);
                
                // DATA REPAIR: Check for ANY ImgBB link or empty images and replace with placeholder
                itemImages = itemImages.map(img => {
                  if (typeof img !== 'string') return PLACEHOLDER_IMAGE;
                  
                  const lowerImg = img.toLowerCase();
                  if (lowerImg.includes('ibb.co') || lowerImg.includes('imgbb') || lowerImg.includes('pyramid')) {
                     return PLACEHOLDER_IMAGE;
                  }
                  return img;
                });
                
                if (itemImages.length === 0) itemImages = [PLACEHOLDER_IMAGE];

                return {
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    images: itemImages,
                    category: item.category,
                    modelUrl: item.modelUrl
                };
            });
            setItems(mappedItems);
          } else {
            setItems([]); 
          }
          
          // Success - Exit loop and stop loading
          setIsLoading(false);
          return;

        } catch (error: any) {
          const errorCode = error?.code;
          const errorMessage = error?.message || '';

          // Enhanced Retry Logic
          // 57014: Statement Timeout (Cold Start)
          // Failed to fetch: Network/Connection dropped or blocked
          // 500: Internal Server Error (Sometimes happens during wake-up)
          const isNetworkError = errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError");
          const isTransientError = errorCode === "57014" || errorCode === "500" || isNetworkError;

          if (isTransientError && retryCount < maxRetries) {
              const delay = 3500;
              console.warn(`Connection issue (${errorCode || errorMessage}). Retrying in ${delay/1000}s... Attempt ${retryCount + 1}/${maxRetries}`);
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, delay));
              continue; // Restart loop
          }

          console.error('Error fetching items from Supabase:', JSON.stringify(error, null, 2));
          
          // Final Error Handling
          if (errorCode === "42P01") {
             setConnectionError("Table missing. Please check Settings > About to see the SQL needed.");
             setIsOffline(true);
             setItems(CRAFT_ITEMS);
          } else {
             // Fallback Strategy: Light Fetch (Text Only)
             // If the error is likely due to payload size (timeout), try fetching without images
             if (errorCode === "57014" || isNetworkError) {
                 console.warn("Attempting Light Fetch (Text Only)...");
                 try {
                     const { data: lightData, error: lightError } = await supabase
                        .from('craft_items')
                        .select(`id, name, description, price, category, "modelUrl"`) // No imageUrl
                        .order('id', { ascending: false });
                     
                     if (!lightError && lightData) {
                         const fallbackItems: CraftItem[] = lightData.map((item: any) => ({
                            id: item.id,
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            images: [PLACEHOLDER_IMAGE], // Force placeholder
                            category: item.category,
                            modelUrl: item.modelUrl
                        }));
                        setItems(fallbackItems);
                        setIsOffline(false); // We are online, just degraded
                        // Show a temporary alert to explain why images are missing
                        setTimeout(() => alert("⚠️ Loaded catalog in text-only mode.\n\nYour database connection is slow or the images are too large. We've loaded the details so you can still manage items."), 500);
                        setIsLoading(false);
                        return; // Exit successfully
                     }
                 } catch (fallbackError) {
                     console.error("Light fetch failed too", fallbackError);
                 }
             }

             // Complete failure
             setIsOffline(true);
             setItems(CRAFT_ITEMS);
          }
          
          setIsLoading(false);
          return; // Exit function
        }
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // --- Local Persistence for User Preferences (Wishlist/Cart) ---
  useEffect(() => {
    try {
        window.localStorage.setItem('wishlistItems', JSON.stringify(Array.from(wishlist)));
    } catch (error) {
        console.error("Could not save wishlist to localStorage", error);
    }
  }, [wishlist]);

  const handleAdminLogin = (password: string) => {
    if (password === '23568') {
      setIsAdminMode(true);
      alert("Admin mode enabled.");
      setSettingsOpen(false);
    } else {
      alert("Incorrect password.");
    }
  };

  const handleAdminLogout = () => {
    setIsAdminMode(false);
    alert("Admin mode disabled.");
    setSettingsOpen(false);
  };

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
  
  const handleSaveItem = async (updatedItem: CraftItem) => {
    // Optimistic UI update
    setItems(prevItems =>
        prevItems.map(i => (i.id === updatedItem.id ? updatedItem : i))
    );
    setEditingItem(null);

    if (isOffline) {
        alert("⚠️ You are OFFLINE. Changes are NOT saved to the database. Please reconnect.");
        return;
    }

    try {
        // DB Update: Save array as JSON string in imageUrl column
        const { error } = await supabase
            .from('craft_items')
            .update({
                name: updatedItem.name,
                description: updatedItem.description,
                price: updatedItem.price,
                imageUrl: JSON.stringify(updatedItem.images), 
                category: updatedItem.category
            })
            .eq('id', updatedItem.id);

        if (error) throw error;
        alert("Item updated successfully!");
    } catch (error) {
        console.error("Error updating item:", error);
        setIsOffline(true);
        alert("Connection lost during save. Change is local only.");
    }
  };
  
  const handleDeleteItem = (itemId: number) => {
    requestConfirmation(
        'Are you sure you want to permanently delete this item?',
        async () => {
            // Optimistic UI Update
            setItems(prev => prev.filter(i => i.id !== itemId));
            setCartItems(prev => prev.filter(i => i.id !== itemId));
            setWishlist(prev => {
                const newWishlist = new Set(prev);
                newWishlist.delete(itemId);
                return newWishlist;
            });

            if (isOffline) {
                alert("Offline Mode: Item deleted locally.");
                return;
            }

            try {
                // DB Delete
                const { error } = await supabase
                    .from('craft_items')
                    .delete()
                    .eq('id', itemId);
                
                if (error) throw error;
            } catch (error) {
                console.error("Error deleting item:", error);
                setIsOffline(true);
                alert("Connection lost. Item deleted locally.");
            }
        }
    );
  };

  const handleAddItem = async (newItemData: Omit<CraftItem, 'id'>) => {
    // Optimistic / Local function
    const addLocally = () => {
        const newItem: CraftItem = {
            id: Date.now(), // Temporary ID
            ...newItemData
        };
        setItems(prev => [newItem, ...prev]);
        setAddItemModalOpen(false);
    };

    if (isOffline) {
        addLocally();
        alert("⚠️ You are OFFLINE. Item NOT saved to database. Please reconnect.");
        return;
    }

    try {
        // DB Insert: Save array as JSON string in imageUrl column
        const { data, error } = await supabase
            .from('craft_items')
            .insert([{
                name: newItemData.name,
                description: newItemData.description,
                price: newItemData.price,
                imageUrl: JSON.stringify(newItemData.images),
                category: newItemData.category
            }])
            .select();

        if (error) throw error;

        if (data) {
            // Transform response to CraftItem
            const newItem: CraftItem = {
                id: data[0].id,
                name: data[0].name,
                description: data[0].description,
                price: data[0].price,
                images: newItemData.images, 
                category: data[0].category,
                modelUrl: data[0].modelUrl
            };
            setItems(prev => [newItem, ...prev]);
        }
        
        setAddItemModalOpen(false);
        alert("New item added successfully!");
    } catch (error) {
        console.error("Error adding item:", error);
        addLocally();
        setIsOffline(true);
        alert("Connection error. Item added locally.");
    }
  };

  const handleResetToDefaults = () => {
     alert("Feature disabled in Cloud Mode to prevent data loss.");
  };

  const requestConfirmation = (message: string, onConfirm: () => void) => {
    setConfirmation({
        message,
        onConfirm: () => {
            onConfirm();
            setConfirmation(null);
        }
    });
  };

  const wishlistItems = items.filter(item => wishlist.has(item.id));
  const cartItemIds = new Set(cartItems.map(i => i.id));

  // If there is a critical connection error (like Missing Table), show it clearly
  if (connectionError) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
              <div className="bg-white p-8 rounded-xl shadow-xl max-w-lg text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h1 className="text-2xl font-bold text-red-600 mb-2">Setup Required</h1>
                  <p className="text-gray-700 mb-4">{connectionError}</p>
              </div>
          </div>
      )
  }

  return (
    <div className={`theme-${theme} min-h-screen bg-brand-background font-body text-brand-text flex flex-col`}>
      <header className="p-4 flex flex-col md:flex-row justify-center items-center shadow-md bg-brand-white-ish/80 backdrop-blur-sm sticky top-0 z-30 border-b border-brand-primary/20 gap-3 md:gap-6">
         <div className="h-16 md:h-20 w-auto flex-shrink-0 flex items-center justify-center overflow-hidden">
            <img 
              src={LOGO_URL} 
              alt="Crafty Spinx Logo" 
              className="h-full w-auto object-contain"
              onError={(e) => {
                e.currentTarget.onerror = null; 
                e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/3081/3081840.png"; 
              }} 
            />
        </div>
        <div className="text-center md:text-left">
             <h1 className="text-3xl md:text-4xl font-display text-brand-accent select-none drop-shadow-sm leading-tight hidden md:block">Crafty Spinx</h1>
             <p className="text-sm md:text-base font-semibold text-pink-600 italic mt-1">{SLOGAN}</p>
        </div>
      </header>
      
      {/* OFFLINE BANNER */}
      {isOffline && (
        <div className="bg-red-500 text-white px-4 py-3 text-center shadow-md animate-fade-in flex flex-col md:flex-row items-center justify-center gap-2">
            <span className="font-bold">⚠️ You are currently working in OFFLINE MODE.</span>
            <span className="text-sm opacity-90">Changes will NOT be saved to the database.</span>
            <button 
                onClick={fetchItems} 
                className="ml-2 bg-white text-red-500 px-3 py-1 rounded-full text-sm font-bold hover:bg-gray-100 transition-colors"
            >
                Retry Connection
            </button>
        </div>
      )}

      <main className="flex-grow container mx-auto p-4 md:p-6 relative max-w-6xl">
        {isLoading ? (
             <div className="flex justify-center items-center h-64 flex-col gap-4">
                <div className="w-12 h-12 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-brand-text text-sm animate-pulse">Waking up the bears...</p>
             </div>
        ) : (
            <>
                {currentView === 'catalog' && (
                catalogMode === 'swipe' ? (
                    <SwipeView 
                    items={items} 
                    onAddToCart={handleAddToCart}
                    cartItemIds={cartItemIds}
                    wishlist={wishlist}
                    onToggleWishlist={handleToggleWishlist}
                    onEditItem={setEditingItem}
                    onDeleteItem={handleDeleteItem}
                    isAdminMode={isAdminMode}
                    />
                ) : (
                    <CatalogView 
                    items={items} 
                    onAddToCart={handleAddToCart} 
                    cartItemIds={cartItemIds}
                    wishlist={wishlist}
                    onToggleWishlist={handleToggleWishlist}
                    onEditItem={setEditingItem}
                    onDeleteItem={handleDeleteItem}
                    isAdminMode={isAdminMode}
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
                        onEditItem={setEditingItem}
                        onDeleteItem={handleDeleteItem}
                        isAdminMode={isAdminMode}
                    />
                )}
            </>
        )}
      </main>
      
      {currentView === 'catalog' && (
        <FloatingActionMenu 
            isGridMode={catalogMode === 'grid'}
            onToggleView={() => setCatalogMode(mode => mode === 'grid' ? 'swipe' : 'grid')}
            onOpenSettings={() => setSettingsOpen(true)}
            onAddItem={() => setAddItemModalOpen(true)}
            isAdminMode={isAdminMode}
        />
      )}

      {/* Admin Status Indicator */}
      {isAdminMode && !isOffline && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold shadow-lg animate-fade-in z-30 border text-center whitespace-nowrap flex items-center gap-2 bg-green-100 text-green-800 border-green-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Admin Mode: Live Database
        </div>
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
        isAdminMode={isAdminMode}
        onAdminLogin={handleAdminLogin}
        onAdminLogout={handleAdminLogout}
        items={items}
        onImportItems={() => {}} 
        onResetToDefaults={handleResetToDefaults}
        requestConfirmation={requestConfirmation}
      />
      
      <EditItemModal 
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveItem}
      />
      
      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setAddItemModalOpen(false)}
        onSave={handleAddItem}
      />

      <ConfirmationModal
        isOpen={!!confirmation}
        title="Please Confirm"
        message={confirmation?.message || ''}
        onConfirm={confirmation?.onConfirm}
        onCancel={() => setConfirmation(null)}
      />
    </div>
  );
};

export default App;
