
import React, { useState, useRef } from 'react';
import { CraftItem, Category } from '../types';
import { XIcon, PlusIcon, TrashIcon } from './Icons';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newItemData: Omit<CraftItem, 'id'>) => void;
}

const CATEGORIES: Category[] = ['Crochet', 'Decor', 'Random'];

// Charming names for auto-generation
const ADJECTIVES = ['Cuddly', 'Snuggly', 'Fluffy', 'Cozy', 'Soft', 'Gentle', 'Happy', 'Sleepy', 'Brave', 'Little', 'Big', 'Fuzzy', 'Woolly', 'Patchy', 'Sweet'];
const NOUNS = ['Bear', 'Teddy', 'Cub', 'Paws', 'Buddy', 'Pal', 'Friend', 'Bunny', 'Lamb', 'Pup', 'Owl', 'Froggy'];
const PROPER_NAMES = ['Barnaby', 'Oliver', 'Pip', 'Daisy', 'Rosie', 'Teddy', 'Arthur', 'Theodore', 'Paddington', 'Winnie', 'Coco', 'Luna', 'Beary', 'Ziggy', 'Momo', 'Bubu', 'Toto', 'Kiki'];

const generateRandomName = (category: Category) => {
    if (category === 'Decor') {
         const decorNouns = ['Blanket', 'Rug', 'Throw', 'Coaster', 'Hanging', 'Basket', 'Pillow'];
         const decorAdjs = ['Cozy', 'Warm', 'Soft', 'Bright', 'Colorful', 'Pastel', 'Vintage', 'Woven'];
         return `${decorAdjs[Math.floor(Math.random() * decorAdjs.length)]} ${decorNouns[Math.floor(Math.random() * decorNouns.length)]}`;
    }
    
    // Logic for Bears/Crochet
    const r = Math.random();
    if (r < 0.4) {
        // Just a Cute Name: "Ziggy"
        return PROPER_NAMES[Math.floor(Math.random() * PROPER_NAMES.length)];
    } else if (r < 0.7) {
        // Adjective + Noun: "Fluffy Bear"
        return `${ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]} ${NOUNS[Math.floor(Math.random() * NOUNS.length)]}`;
    } else {
        // Proper Name + the + Noun: "Barnaby the Bear"
        return `${PROPER_NAMES[Math.floor(Math.random() * PROPER_NAMES.length)]} the ${NOUNS[Math.floor(Math.random() * NOUNS.length)]}`;
    }
};

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Crochet');
  const [images, setImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Image Compression Utility
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        setIsProcessing(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; // Resize to reasonable max width for database text storage
                const scaleSize = MAX_WIDTH / img.width;
                // Only resize if image is bigger than max width
                canvas.width = (scaleSize < 1) ? MAX_WIDTH : img.width;
                canvas.height = (scaleSize < 1) ? img.height * scaleSize : img.height;
                
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Compress quality to 0.7
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                resolve(compressedDataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (images.length >= 3) {
          alert("Maximum 3 images allowed.");
          return;
      }

      try {
          const compressedImage = await compressImage(file);
          setImages(prev => [...prev, compressedImage]);
      } catch (e) {
          console.error("Compression failed", e);
          alert("Failed to process image. Please try another one.");
      } finally {
          setIsProcessing(false);
      }
    }
  };
  
  const removeImage = (index: number) => {
      setImages(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
      setName('');
      setPrice(0);
      setDescription('');
      setCategory('Crochet');
      setImages([]);
  };

  const handleSave = () => {
    if (!description || images.length === 0) {
        alert('Please provide at least a description and one image.');
        return;
    }
    
    // Auto-generate name if left blank
    const finalName = name.trim() || generateRandomName(category);
    
    const newItemData: Omit<CraftItem, 'id'> = {
      name: finalName,
      price: Number(price) || 0,
      description,
      images,
      category,
    };
    onSave(newItemData);
    resetForm();
  };
  
  const handleClose = () => {
      resetForm();
      onClose();
  }
  
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
          handleClose();
      }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in p-4"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-brand-white-ish rounded-2xl shadow-xl p-6 w-full max-w-md m-auto flex flex-col relative max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button 
            onClick={handleClose} 
            className="absolute top-4 right-4 bg-brand-white-ish rounded-full p-1 shadow-lg text-brand-text hover:text-brand-accent transition-colors z-20"
            aria-label="Close"
        >
            <XIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-display text-brand-accent mb-4 text-center sticky top-0 bg-brand-white-ish z-10 pb-2">Add New Item</h2>
        
        {/* Image Preview Section */}
        <div className="space-y-2 mb-4">
             <label className="block text-sm font-bold text-gray-700">Item Images (Max 3)*</label>
             
             <div className="grid grid-cols-3 gap-2">
                 {/* Display selected images */}
                 {images.map((img, idx) => (
                     <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                         <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                         <button 
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                         >
                             <TrashIcon className="w-3 h-3" />
                         </button>
                     </div>
                 ))}
                 
                 {/* Add Button Placeholder */}
                 {images.length < 3 && (
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                        className="aspect-square rounded-lg border-2 border-dashed border-brand-primary flex flex-col items-center justify-center text-brand-primary hover:bg-brand-background transition-colors disabled:opacity-50"
                     >
                         {isProcessing ? (
                             <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                         ) : (
                             <>
                                <PlusIcon className="w-6 h-6 mb-1" />
                                <span className="text-xs font-bold">Add</span>
                             </>
                         )}
                     </button>
                 )}
             </div>
             
             {images.length === 0 && (
                 <p className="text-xs text-red-400 mt-1">At least one image is required.</p>
             )}

            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
        </div>

        {/* Fields */}
        <div className="space-y-4">
             <div>
                <label htmlFor="itemCategory" className="block text-sm font-bold text-gray-700 mb-1">Category*</label>
                <select
                    id="itemCategory"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-accent focus:border-brand-accent"
                >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="itemName" className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                <input 
                    type="text" 
                    id="itemName" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-accent focus:border-brand-accent"
                    placeholder="Leave empty for a random surprise name!"
                />
            </div>
            <div>
                <label htmlFor="itemPrice" className="block text-sm font-bold text-gray-700 mb-1">Price (R)</label>
                <input 
                    type="number" 
                    id="itemPrice"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-accent focus:border-brand-accent"
                />
            </div>
            <div>
                <label htmlFor="itemDescription" className="block text-sm font-bold text-gray-700 mb-1">Description*</label>
                <textarea 
                    id="itemDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-accent focus:border-brand-accent resize-none"
                    required
                />
            </div>
        </div>

        <button
            onClick={handleSave}
            disabled={isProcessing}
            className="w-full bg-brand-accent text-brand-white-ish font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-200 mt-6 shadow-md disabled:bg-gray-400"
        >
            Add Item & Close
        </button>
      </div>
    </div>
  );
};

export default AddItemModal;
