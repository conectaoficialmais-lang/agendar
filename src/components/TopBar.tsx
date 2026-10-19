import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Sun, Moon, Bell } from 'lucide-react';
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
      <div className="flex items-center gap-1 p-1.5 rounded-full bg-[#161823]/80 dark:bg-[#12141c]/80 backdrop-blur-2xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        {/* Search */}
        <button
          onClick={openCommandPalette}
          className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors relative group"
          title="Buscar (Cmd+K)"
        >
          <Search size={16} />
          <span className="sr-only">Buscar</span>
        </button>

        {/* Quick Add */}
        <button
          onClick={() => openQuickAdd('task')}
          className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors relative group"
          title="Adicionar rápido"
        >
          <Plus size={16} />
          <span className="sr-only">Adicionar</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors relative group"
          title={`Tema: ${preferences.theme === 'light' ? 'Claro' : preferences.theme === 'dark' ? 'Escuro' : 'Automático'} (clique para alternar)`}
        >
          {preferences.theme === 'light' ? (
            <Sun size={16} className="text-amber-400" />
          ) : (
            <Moon size={16} className="text-blue-300" />
          )}
          <span className="sr-only">Alternar Tema</span>
        </button>

        {/* Notifications */}
        <button
          onClick={() => setShowNotifications((prev) => !prev)}
          className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors relative group"
          title="Notificações"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#161823]" />
          )}
          <span className="sr-only">Notificações</span>
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
