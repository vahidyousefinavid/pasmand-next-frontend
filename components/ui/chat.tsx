import React, { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Chat({ isOpen, onClose }: ChatProps) {
  const [message, setMessage] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    console.log('Sending message:', message);
    setMessage('');
  };

  if (!isOpen) return null;

  return (
    <div
      ref={chatRef}
      className="fixed bottom-4 left-2 right-2 sm:left-4 sm:right-auto sm:w-[26rem] max-w-full h-[85vh] sm:h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
    >
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 flex justify-between items-center">
        <button
          onClick={onClose}
          className="text-white hover:text-orange-100 transition-colors"
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <div className="text-white text-right text-sm sm:text-base">
          <h3 className="font-bold">پشتیبانی آنلاین</h3>
          <p className="text-xs sm:text-sm text-orange-100">در خدمت شما هستیم</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto bg-gray-50 space-y-4">
        <div className="bg-white text-gray-800 p-3 sm:p-4 rounded-2xl shadow-sm max-w-[85%] sm:max-w-[75%] mr-auto ml-4 sm:ml-12 border border-gray-100 text-sm sm:text-base">
          سلام! چطور می‌توانم کمکتان کنم؟
        </div>
        <div className="bg-white text-gray-800 p-3 sm:p-4 rounded-2xl shadow-sm max-w-[85%] sm:max-w-[75%] mr-auto ml-4 sm:ml-12 border border-gray-100 text-sm sm:text-base">
          بزودی فعال خواهد شد !!!
        </div>
        {/* در اینجا می‌تونی پیام‌های کاربر و پشتیبانی را نمایش بدی */}
      </div>

      {/* Chat Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 sm:p-4 bg-white border-t border-gray-100"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="submit"
            className="bg-orange-500 text-white p-2 sm:p-3 rounded-xl hover:bg-orange-600 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="پیام خود را بنویسید..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:border-orange-500 text-right text-sm sm:text-base"
          />
        </div>
      </form>
    </div>
  );
}
