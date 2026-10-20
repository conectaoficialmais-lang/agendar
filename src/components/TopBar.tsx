import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Sun, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NotificationsPopover } from './NotificationsPopover';

export const TopBar: React.FC = () => {
  const { preferences, toggleTheme, openCommandPalette, openQuickAdd, notifications } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="fixed top-4 right-4 md:right-8 z-40">
      {/* Floating Glass Pill */}
      <div className="flex items-center gap-1.5 p-1.5 pl-2.5 rounded-full bg-[#131417]/90 backdrop-blur-xl border border-white/[0.06] shadow-xl">
        {/* Barra de busca arredondada com lupa, Search e ⌘K */}
        <button
          onClick={openCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#8b8b90] hover:text-white transition-all text-xs"
          title="Search (⌘K)"
        >
          <Search size={14} className="text-[#8b8b90]" />
          <span className="text-[#8b8b90] text-xs">Search</span>
          <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-white/[0.08] rounded text-[#8b8b90]">
            ⌘K
          </kbd>
        </button>

        {/* Ícone "+" */}
        <button
          onClick={() => openQuickAdd('task')}
          className="p-1.5 rounded-full text-[#8b8b90] hover:text-white hover:bg-white/[0.06] transition-colors"
          title="Add new"
        >
          <Plus size={16} />
          <span className="sr-only">Add</span>
        </button>

        {/* Ícone de Sol (tema) */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-full text-[#8b8b90] hover:text-white hover:bg-white/[0.06] transition-colors"
          title={`Theme: ${preferences.theme}`}
        >
          <Sun size={16} />
          <span className="sr-only">Toggle Theme</span>
        </button>

        {/* Ícone de Sino com ponto de notificação vermelho */}
        <button
          onClick={() => setShowNotifications((prev) => !prev)}
          className="p-1.5 rounded-full text-[#8b8b90] hover:text-white hover:bg-white/[0.06] transition-colors relative"
          title="Notifications"
        >
          <Bell size={16} />
          {/* Ponto vermelho sempre visível como na especificação */}
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ef4444] ring-2 ring-[#131417]" />
          <span className="sr-only">Notifications</span>
        </button>
      </div>

      {/* Notifications Drawer Popover */}
      <NotificationsPopover
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
};
