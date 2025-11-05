import React, { useState } from 'react';
import { GridViewIcon, SwipeViewIcon, SettingsIcon, PlusIcon } from './Icons';

interface FloatingActionMenuProps {
  isGridMode: boolean;
  onToggleView: () => void;
  onOpenSettings: () => void;
}

const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({ isGridMode, onToggleView, onOpenSettings }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      label: isGridMode ? 'Switch to Swipe View' : 'Switch to Grid View',
      icon: isGridMode ? <SwipeViewIcon /> : <GridViewIcon />,
      action: onToggleView,
    },
    {
      label: 'Open Settings',
      icon: <SettingsIcon />,
      action: onOpenSettings,
    },
  ];

  return (
    <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-40 flex flex-col items-center gap-4">
      {/* Menu items */}
      <div 
        className={`transition-all duration-300 ease-in-out flex flex-col items-center gap-4 ${
          isOpen ? 'opacity-100' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              item.action();
              setIsOpen(false);
            }}
            className="bg-brand-white-ish text-brand-text p-3 rounded-full shadow-lg hover:bg-brand-secondary hover:text-white transition-all duration-200"
            title={item.label}
            aria-label={item.label}
          >
            {item.icon}
          </button>
        ))}
      </div>

      {/* Main toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-brand-accent text-brand-white-ish p-4 rounded-full shadow-lg hover:bg-opacity-90 transition-all duration-300 ease-in-out transform hover:scale-110"
        aria-label="Toggle action menu"
        aria-expanded={isOpen}
      >
        <div className={`transition-transform duration-300 h-6 w-6 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
          <PlusIcon className="h-6 w-6" />
        </div>
      </button>
    </div>
  );
};

export default FloatingActionMenu;