
import React, { useState } from 'react';
import { CraftItem } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onSetTheme: (theme: string) => void;
  isAdminMode: boolean;
  onAdminLogin: (password: string) => void;
  onAdminLogout: () => void;
  items: CraftItem[];
  onImportItems: (jsonString: string) => void;
  onResetToDefaults: () => void;
  requestConfirmation: (message: string, onConfirm: () => void) => void;
}

const themes = [
    { id: 'pastel', name: 'Pastel Dreams', colors: ['#FFC0CB', '#A0E7E5', '#F38181'] },
    { id: 'forest', name: 'Forest Whisper', colors: ['#A3D29C', '#77A06F', '#C78C53'] },
    { id: 'ocean', name: 'Ocean Breeze', colors: ['#87CEEB', '#4682B4', '#FFA500'] },
    { id: 'dark', name: 'Midnight Fuzzy', colors: ['#121212', '#1E1E1E', '#FF8FAB'] },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentTheme, onSetTheme, isAdminMode, onAdminLogin, onAdminLogout }) => {
  const [password, setPassword] = useState('');
  const [isAboutOpen, setAboutOpen] = useState(true); // Open by default so they see the version

  if (!isOpen) return null;

  const handleUnlockClick = () => {
    onAdminLogin(password);
    setPassword('');
  };


  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-brand-white-ish rounded-2xl shadow-xl p-6 w-full max-w-sm m-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-display text-brand-text">Settings</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        
        <div className="space-y-3">
            <h3 className="font-bold text-brand-text">Color Theme</h3>
            {themes.map(theme => (
                <button
                    key={theme.id}
                    onClick={() => onSetTheme(theme.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${currentTheme === theme.id ? 'border-brand-accent' : 'border-transparent hover:bg-brand-background'}`}
                >
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-brand-text">{theme.name}</span>
                        <div className="flex space-x-1">
                            {theme.colors.map(color => (
                                <div key={color} className="w-5 h-5 rounded-full border border-gray-300/20" style={{ backgroundColor: color }}></div>
                            ))}
                        </div>
                    </div>
                </button>
            ))}
        </div>

        <div className="mt-6 pt-4 border-t border-brand-primary/50">
            <button
                onClick={() => setAboutOpen(!isAboutOpen)}
                className="w-full flex justify-between items-center text-left p-2 rounded-lg hover:bg-brand-background transition-colors"
                aria-expanded={isAboutOpen}
            >
                <h3 className="font-bold text-brand-text">About Crafty Spinx</h3>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isAboutOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isAboutOpen ? 'max-h-screen' : 'max-h-0'}`}>
                <div className="p-3 text-sm text-brand-text space-y-4 text-left">
                    <p><strong>App Version:</strong> <span className="bg-brand-accent text-white px-2 py-0.5 rounded-full text-xs">v2.1 (Patch Applied)</span></p>
                    <p><strong>Cloud Status:</strong> <span className="text-green-600 font-bold">Connected</span></p>
                    <p className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 p-2 rounded">Note: If you see "Offline Mode", refresh the page to wake up the database.</p>
                </div>
            </div>
        </div>


        <div className="mt-6 pt-4 border-t border-brand-primary/50">
            <h3 className="font-bold text-brand-text mb-2">Admin Access</h3>
            {isAdminMode ? (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-center text-sm text-green-800 mb-3 font-bold">You are logged in as Admin.</p>
                    <button
                        onClick={onAdminLogout}
                        className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleUnlockClick()}
                        placeholder="Enter admin password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-accent focus:border-brand-accent text-gray-800"
                    />
                    <button
                        onClick={handleUnlockClick}
                        className="w-full bg-brand-secondary text-brand-white-ish font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all"
                    >
                        Unlock Admin Mode
                    </button>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;
