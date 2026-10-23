import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  CheckSquare,
  Folder,
  Calendar,
  Users,
  Sun,
  Play,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    closeCommandPalette,
    tasks,
    projects,
    members,
    setActiveTab,
    openTaskModal,
    openMemberModal,
    toggleTheme,
    startFocus,
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        closeCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, closeCommandPalette]);

  if (!isCommandPaletteOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const matchedTasks = tasks
    .filter((t) => t.title.toLowerCase().includes(trimmed))
    .slice(0, 5);

  const matchedProjects = projects
    .filter((p) => p.name.toLowerCase().includes(trimmed))
    .slice(0, 4);

  const matchedMembers = members
    .filter(
      (m) =>
        m.name.toLowerCase().includes(trimmed) ||
        m.role.toLowerCase().includes(trimmed) ||
        m.team.toLowerCase().includes(trimmed)
    )
    .slice(0, 4);

  const navActions = [
    { label: 'Ir para Início (Painel geral)', tab: 'home', icon: Sparkles },
    { label: 'Ir para Tarefas (Quadro & Lista)', tab: 'tasks', icon: CheckSquare },
    { label: 'Ir para Calendário & Agenda', tab: 'calendar', icon: Calendar },
    { label: 'Ir para Projetos', tab: 'projects', icon: Folder },
    { label: 'Ir para Métricas & Insights', tab: 'insights', icon: Sparkles },
    { label: 'Ir para Diretório da Equipe', tab: 'team', icon: Users },
    { label: 'Ir para Configurações', tab: 'settings', icon: Sparkles },
  ].filter((a) => a.label.toLowerCase().includes(trimmed));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl rounded-2xl bg-[#151722]/95 backdrop-blur-2xl border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.6)] text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
          <Search size={18} className="text-white/40" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite um comando ou busque tarefas, projetos, pessoas..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40 text-sm"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono text-white/40 bg-white/5 rounded border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {/* Quick Actions */}
          {(!trimmed || 'tema'.includes(trimmed) || 'foco'.includes(trimmed) || 'theme'.includes(trimmed) || 'focus'.includes(trimmed)) && (
            <div>
              <p className="px-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">
                Ações Rápidas
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    startFocus(25);
                    setActiveTab('home');
                    closeCommandPalette();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs hover:bg-white/10 text-white/90 text-left transition-colors"
                >
                  <Play size={15} className="text-blue-400" />
                  <span>Iniciar sessão de foco de 25 minutos</span>
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          {navActions.length > 0 && (
            <div>
              <p className="px-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">
                Navegação
              </p>
              <div className="space-y-1">
                {navActions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.tab}
                      onClick={() => {
                        setActiveTab(act.tab);
                        closeCommandPalette();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs hover:bg-white/10 text-white/80 text-left transition-colors"
                    >
                      <Icon size={14} className="text-white/40" />
                      <span>{act.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tasks */}
          {matchedTasks.length > 0 && (
            <div>
              <p className="px-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">
                Tarefas
              </p>
              <div className="space-y-1">
                {matchedTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => {
                      openTaskModal(task.id);
                      closeCommandPalette();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-white/10 text-white/90 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <CheckSquare size={14} className="text-white/40 shrink-0" />
                      <span className="truncate">{task.title}</span>
                    </div>
                    <span className="text-[10px] text-white/40 shrink-0">
                      {task.status === 'todo'
                        ? 'A fazer'
                        : task.status === 'in_progress'
                        ? 'Em andamento'
                        : task.status === 'in_review'
                        ? 'Em revisão'
                        : 'Concluída'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {matchedProjects.length > 0 && (
            <div>
              <p className="px-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">
                Projetos
              </p>
              <div className="space-y-1">
                {matchedProjects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      setActiveTab('projects');
                      closeCommandPalette();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-white/10 text-white/90 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: proj.color }}
                      />
                      <span>{proj.name}</span>
                    </div>
                    <span className="text-[10px] text-white/40">{proj.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* People */}
          {matchedMembers.length > 0 && (
            <div>
              <p className="px-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1">
                Equipe
              </p>
              <div className="space-y-1">
                {matchedMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => {
                      openMemberModal(member.id);
                      closeCommandPalette();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-white/10 text-white/90 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span>{member.name}</span>
                    </div>
                    <span className="text-[10px] text-white/40">{member.role}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-black/20 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
          <span>Navegue com o mouse ou teclado</span>
          <span>Pane Command Palette</span>
        </div>
      </div>

      {/* Backdrop click */}
      <div className="fixed inset-0 -z-10" onClick={closeCommandPalette} />
    </div>
  );
};
