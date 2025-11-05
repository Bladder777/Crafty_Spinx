import React from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onSetTheme: (theme: string) => void;
}

const themes = [
    { id: 'pastel', name: 'Pastel Dreams', colors: ['#FFC0CB', '#A0E7E5', '#F38181'] },
    { id: 'forest', name: 'Forest Whisper', colors: ['#A3D29C', '#77A06F', '#C78C53'] },
    { id: 'ocean', name: 'Ocean Breeze', colors: ['#87CEEB', '#4682B4', '#FFA500'] },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentTheme, onSetTheme }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-brand-white-ish rounded-2xl shadow-xl p-6 w-full max-w-sm m-4"
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
                                <div key={color} className="w-5 h-5 rounded-full" style={{ backgroundColor: color }}></div>
                            ))}
                        </div>
                    </div>
                </button>
            ))}
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;
