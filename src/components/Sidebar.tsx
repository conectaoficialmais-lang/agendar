import React from 'react';
import {
  Home,
  CheckSquare,
  Calendar,
  Folder,
  BarChart2,
  Users,
  Settings,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ACCENTS } from '../themeUtils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
  { id: 'calendar', label: 'Calendário', icon: Calendar },
  { id: 'projects', label: 'Projetos', icon: Folder },
  { id: 'insights', label: 'Métricas', icon: BarChart2 },
  { id: 'team', label: 'Equipe', icon: Users },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, preferences } = useApp();
  const currentAccent = ACCENTS[preferences.accent] || ACCENTS.blue;

  return (
    <>
      {/* Desktop Fixed Left Rail */}
      <aside className="fixed left-4 top-4 bottom-4 w-16 z-40 hidden md:flex flex-col items-center justify-between py-4 rounded-3xl bg-[#14161f]/75 dark:bg-[#12141c]/80 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        {/* Top: App Logo */}
        <button
          onClick={() => setActiveTab('home')}
          className="relative group p-2.5 rounded-2xl transition-all duration-300 transform active:scale-95"
          title="Pane Início"
        >
          <div
            className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${currentAccent.gradient} flex items-center justify-center shadow-lg ${currentAccent.activeNavGlow} text-white`}
          >
            {/* Minimalist Pane Window Icon */}
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <line x1="12" y1="3" x2="12" y2="21" />
              <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
          </div>
          {/* Tooltip */}
          <div className="absolute left-16 ml-2 px-2.5 py-1 bg-neutral-900/95 text-white text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity backdrop-blur-md border border-white/10 shadow-xl whitespace-nowrap z-50">
            Pane Início
          </div>
        </button>

        {/* Center: Navigation Icons */}
        <nav className="flex flex-col items-center gap-3 w-full px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div key={item.id} className="relative group w-full flex justify-center">
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`relative p-3 rounded-2xl transition-all duration-200 flex items-center justify-center ${
                    isActive
                      ? 'bg-white/15 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] ring-1 ring-white/15'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                  aria-label={item.label}
                >
                  <Icon size={20} />
                </button>

                {/* Tooltip */}
                <div className="absolute left-16 ml-2 px-2.5 py-1 bg-neutral-900/95 text-white text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity backdrop-blur-md border border-white/10 shadow-xl whitespace-nowrap z-50">
                  {item.label}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom: Current User Avatar */}
        <button
          onClick={() => setActiveTab('settings')}
          className="relative group p-1 rounded-full transition-transform active:scale-95"
          title={`${currentUser.name} (${currentUser.role})`}
        >
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20 hover:ring-white/50 transition-all"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-neutral-900" />
          </div>

          <div className="absolute left-16 ml-2 bottom-0 px-2.5 py-1.5 bg-neutral-900/95 text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity backdrop-blur-md border border-white/10 shadow-xl whitespace-nowrap z-50">
            <p className="font-semibold">{currentUser.name}</p>
            <p className="text-white/60 text-[10px]">{currentUser.role}</p>
          </div>
        </button>
      </aside>

      {/* Mobile Floating Bottom Bar */}
      <nav className="fixed bottom-3 left-4 right-4 z-40 md:hidden flex items-center justify-around py-2.5 px-3 rounded-2xl bg-[#14161f]/85 backdrop-blur-2xl border border-white/10 shadow-2xl">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`p-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/20'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Icon size={18} />
            </button>
          );
        })}
      </nav>
    </>
  );
};
