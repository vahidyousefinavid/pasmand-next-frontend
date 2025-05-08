import { ReactNode } from 'react';

interface SimpleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const SimpleDrawer = ({ isOpen, onClose, children }: SimpleDrawerProps) => {
  return (
    <div
      dir="rtl"
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[2rem] shadow-2xl transition-all duration-300 ${
        isOpen ? 'translate-y-0 visible opacity-100' : 'translate-y-full invisible opacity-0'
      }`}
    >
      <div className="relative w-full max-w-2xl mx-auto p-6">
        <button
          onClick={onClose}
          className="absolute top-6 left-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          ❌
        </button>
        {children}
      </div>
    </div>
  );
};
