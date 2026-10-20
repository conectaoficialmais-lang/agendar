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

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  badge?: number | string;
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    projects,
    openProjectDetail,
  } = useApp();

  const NAV_ITEMS: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: '7' },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'insights', label: 'Insights', icon: BarChart2 },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const tideProject = projects.find((p) => p.slug === 'tide' || p.id === 'proj-tide');
  const orbitProject = projects.find((p) => p.slug === 'orbit' || p.id === 'proj-orbit');

  return (
    <>
      {/* Desktop Fixed Left Sidebar (~220px) */}
      <aside className="fixed left-4 top-4 bottom-4 w-[220px] z-40 hidden md:flex flex-col justify-between p-3.5 rounded-[20px] bg-[#121316] border border-white/[0.06] shadow-2xl backdrop-blur-xl">
        <div className="space-y-4">
          {/* Top: Logo circular com ícone abstrato + texto "Pane" em negrito branco */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-white/[0.04] transition-all text-left w-full group"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              {/* Ícone abstrato de janelas / painéis */}
              <svg
                className="w-4 h-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" strokeOpacity="0.4" />
                <path d="M8 8h8v8H8z" rx="2" />
                <path d="M12 8v8M8 12h8" />
              </svg>
            </div>
            <span className="font-bold text-base text-white tracking-tight">Pane</span>
          </button>

          {/* Menu de navegação */}
          <nav className="space-y-1 w-full">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white/[0.1] text-white font-semibold border border-white/[0.08] shadow-sm'
                      : 'text-[#8b8b90] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={isActive ? 'text-white' : 'text-[#8b8b90]'} />
                    <span>{item.label}</span>
                  </div>

                  {/* Badge circular "7" à direita */}
                  {item.badge !== undefined && (
                    <span className="w-4 h-4 rounded-full bg-white/10 text-white/80 text-[10px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Separador */}
          <div className="pt-2 border-t border-white/[0.06]">
            {/* Seção PINNED */}
            <span className="text-[10px] font-semibold text-[#8b8b90] uppercase tracking-wider px-3 mb-2 block">
              PINNED
            </span>
            <div className="space-y-1">
              {/* Tide mobile app (bullet azul) */}
              <button
                onClick={() => {
                  if (tideProject) openProjectDetail(tideProject.id);
                  setActiveTab('projects');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs text-[#8b8b90] hover:text-white hover:bg-white/[0.04] transition-all text-left truncate group"
              >
                <span className="w-2 h-2 rounded-full bg-[#3b82f6] shrink-0 group-hover:scale-125 transition-transform" />
                <span className="truncate">Tide mobile app</span>
              </button>

              {/* Orbit 2.0 launch (bullet roxo) */}
              <button
                onClick={() => {
                  if (orbitProject) openProjectDetail(orbitProject.id);
                  setActiveTab('projects');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs text-[#8b8b90] hover:text-white hover:bg-white/[0.04] transition-all text-left truncate group"
              >
                <span className="w-2 h-2 rounded-full bg-[#a855f7] shrink-0 group-hover:scale-125 transition-transform" />
                <span className="truncate">Orbit 2.0 launch</span>
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé: Usuário */}
        <div
          onClick={() => setActiveTab('settings')}
          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer pt-3 border-t border-white/[0.06]"
          title={`${currentUser.name} · ${currentUser.role}`}
        >
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-[#121316]" />
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-white truncate leading-tight">{currentUser.name}</p>
            <p className="text-[10px] text-[#8b8b90] truncate leading-tight mt-0.5">{currentUser.role}</p>
          </div>
        </div>
      </aside>

      {/* Mobile Floating Bottom Bar */}
      <nav className="fixed bottom-3 left-4 right-4 z-40 md:hidden flex items-center justify-around py-2.5 px-3 rounded-2xl bg-[#121316]/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`p-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/20'
                  : 'text-[#8b8b90] hover:text-white'
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
