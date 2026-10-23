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
    openTasksCount,
  } = useApp();

  const NAV_ITEMS: NavItem[] = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare, badge: openTasksCount || undefined },
    { id: 'calendar', label: 'Agenda', icon: Calendar },
    { id: 'projects', label: 'Projetos', icon: Folder },
    { id: 'insights', label: 'Insights', icon: BarChart2 },
    { id: 'team', label: 'Equipe', icon: Users },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  // Projetos fixados = os marcados com estrela (antes eram dois nomes fixos em inglês).
  const starredProjects = projects.filter((p) => p.starred);

  return (
    <>
      {/* Desktop Fixed Left Sidebar (~220px) */}
      <aside className="fixed left-4 top-4 bottom-4 w-[220px] z-40 hidden md:flex flex-col justify-between p-3.5 rounded-[22px] bg-white/[0.05] border border-white/[0.1] shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        <div className="space-y-4">
          {/* Top: Logo circular/squircle com ícone abstrato e texto Pane */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-white/[0.04] transition-all text-left w-full group"
          >
            <div className="w-8 h-8 rounded-xl bg-white/[0.08] border border-white/10 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              {/* Ícone abstrato Pane idêntico à imagem */}
              <svg
                className="w-4 h-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3a9 9 0 0 1 9 9" />
                <line x1="12" y1="3" x2="12" y2="12" />
              </svg>
            </div>
            <span className="font-display font-bold text-[18px] text-white">Pane</span>
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-white/[0.10] text-white font-semibold shadow-sm'
                      : 'text-[#8b8b90] hover:text-white hover:bg-white/[0.04] font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={isActive ? 'text-white' : 'text-[#8b8b90]'} />
                    <span>{item.label}</span>
                  </div>

                  {/* Badge circular "7" à direita */}
                  {item.badge !== undefined && (
                    <span className="w-5 h-5 rounded-full bg-[#262730] text-[#8b8b90] text-[10px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Seção Fixados — dinâmica a partir dos projetos marcados com estrela */}
          {starredProjects.length > 0 && (
            <div className="pt-2 border-t border-white/[0.06]">
              <span className="text-[10px] font-semibold text-[#8b8b90] uppercase tracking-wider px-3 mb-2 block">
                FIXADOS
              </span>
              <div className="space-y-1">
                {starredProjects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => openProjectDetail(proj.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs text-[#8b8b90] hover:text-white hover:bg-white/[0.04] transition-all text-left truncate group"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                      style={{ backgroundColor: proj.color }}
                    />
                    <span className="truncate">{proj.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
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
      <nav className="fixed bottom-3 left-4 right-4 z-40 md:hidden flex items-center justify-around py-2.5 px-3 rounded-2xl bg-white/[0.06] backdrop-blur-2xl border border-white/[0.1] shadow-2xl">
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
