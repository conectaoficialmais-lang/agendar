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

  // Índice do item ativo para o indicador deslizante (−1 quando estamos numa
  // tela fora do menu principal, ex.: detalhe de projeto — aí o indicador some).
  const activeIndex = NAV_ITEMS.findIndex((i) => i.id === activeTab);
  const NAV_STRIDE = 44; // altura do item (h-11) + gap (space-y-1 = 4px) → 48; usamos transform por índice
  const NAV_GAP = 4;

  return (
    <>
      {/* Desktop: rail que expande no hover (ícone → ícone+texto) */}
      <aside className="sidebar-rail group fixed left-4 top-4 bottom-4 w-[76px] hover:w-[244px] focus-within:w-[244px] z-40 hidden md:flex flex-col justify-between p-3 rounded-[24px] bg-white/[0.05] border border-white/[0.1] shadow-[0_12px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_24px_70px_rgba(0,0,0,0.72)] backdrop-blur-2xl overflow-hidden transition-[width,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
        {/* min-w fixa o layout "expandido"; o overflow-hidden do aside recorta quando recolhido */}
        <div className="space-y-4 min-w-[220px]">
          {/* Topo: logo (ícone fixo) + marca "Pane" que revela ao expandir */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 h-10 px-2 rounded-xl hover:bg-white/[0.04] transition-all text-left w-full group/logo"
          >
            <div className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-[var(--accent-ink)] shadow-sm group-hover/logo:scale-105 transition-transform" style={{ background: 'var(--accent)' }}>
              <svg
                className="w-4 h-4"
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
            <span className="sidebar-label font-display font-bold text-[18px] text-white">Pane</span>
          </button>

          {/* Menu de navegação com indicador ativo deslizante */}
          <nav className="relative space-y-1 w-full">
            {/* Indicador deslizante — uma única pílula lima que anima entre os itens */}
            {activeIndex >= 0 && (
              <div
                className="absolute left-0 right-0 top-0 h-11 rounded-xl pointer-events-none transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  transform: `translateY(${activeIndex * (NAV_STRIDE + NAV_GAP)}px)`,
                  background: 'color-mix(in srgb, var(--accent) 16%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--accent) 35%, transparent)',
                  boxShadow: 'inset 3px 0 0 0 var(--accent)',
                }}
              />
            )}

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={(e) => {
                    setActiveTab(item.id);
                    // Clique de mouse (e.detail > 0) tira o foco para o rail recolher;
                    // ativação por teclado (Enter/Espaço, e.detail === 0) mantém o foco
                    // e, portanto, o rail expandido para quem navega sem mouse.
                    if (e.detail > 0) (e.currentTarget as HTMLButtonElement).blur();
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  title={item.label}
                  className={`relative z-10 w-full h-11 flex items-center justify-between px-3 rounded-xl text-xs transition-colors group/navitem ${
                    isActive
                      ? 'font-semibold'
                      : 'text-[var(--muted)] hover:text-white font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      size={18}
                      className={`shrink-0 transition-transform duration-200 group-hover/navitem:scale-110 ${
                        isActive ? 'text-[var(--accent)]' : 'text-[var(--muted)] group-hover/navitem:text-white'
                      }`}
                    />
                    <span className={`sidebar-label truncate ${isActive ? 'text-[var(--accent)]' : ''}`}>
                      {item.label}
                    </span>
                  </div>

                  {/* Badge com a contagem — revela ao expandir */}
                  {item.badge !== undefined && (
                    <span
                      style={
                        isActive
                          ? { background: 'var(--accent)', color: 'var(--accent-ink)' }
                          : undefined
                      }
                      className={`sidebar-label w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                        isActive ? '' : 'bg-white/[0.06] text-[var(--muted)]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Seção Fixados — some quando recolhido (só faz sentido com rótulo) */}
          {starredProjects.length > 0 && (
            <div className="sidebar-label pt-2 border-t border-white/[0.06]">
              <span className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider px-3 mb-2 block">
                FIXADOS
              </span>
              <div className="space-y-1">
                {starredProjects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => openProjectDetail(proj.id)}
                    className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs text-[var(--muted)] hover:text-white hover:bg-white/[0.04] transition-all text-left truncate group/pin"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0 group-hover/pin:scale-125 transition-transform"
                      style={{ backgroundColor: proj.color }}
                    />
                    <span className="truncate">{proj.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé: usuário — avatar fixo, nome/cargo revelam ao expandir */}
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className="w-full text-left flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition-colors border-t border-white/[0.06]"
          title={`${currentUser.name} · ${currentUser.role}`}
        >
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0a0f0b]" />
          </div>
          <div className="sidebar-label truncate">
            <p className="text-xs font-semibold text-white truncate leading-tight">{currentUser.name}</p>
            <p className="text-[10px] text-[var(--muted)] truncate leading-tight mt-0.5">{currentUser.role}</p>
          </div>
        </button>
      </aside>

      {/* Mobile Floating Bottom Bar */}
      <nav className="fixed bottom-3 left-4 right-4 z-40 md:hidden flex items-stretch justify-around gap-1 py-2 px-2 rounded-2xl bg-white/[0.06] backdrop-blur-2xl border border-white/[0.1] shadow-2xl">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              style={
                isActive
                  ? { background: 'var(--accent)', color: 'var(--accent-ink)' }
                  : undefined
              }
              className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all ${
                isActive ? 'font-semibold shadow-[0_8px_20px_-8px_var(--accent)]' : 'text-[var(--muted)] hover:text-white'
              }`}
            >
              <Icon size={17} className="shrink-0" />
              <span className="text-[9px] font-medium leading-none truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
