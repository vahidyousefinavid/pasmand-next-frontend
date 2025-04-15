import React from 'react';
import { Loader2, MessageCircle } from 'lucide-react';

interface ChatButtonProps {
    onClick: () => void;
    isLoading: boolean;
}

export function ChatButton({ onClick, isLoading }: ChatButtonProps) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-[95px] sm:bottom-4 left-4 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-all duration-300 hover:scale-110 z-[10000]"
        >
            {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
                <MessageCircle className="h-6 w-6" />
            )}
        </button>
    );
}