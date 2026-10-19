import React, { useState } from 'react';
import {
  Plus,
  Star,
  Calendar,
  Smartphone,
  Rocket,
  LayoutGrid,
  Sprout,
  Flame,
  Compass,
  Folder,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ACCENTS } from '../themeUtils';
import { Project } from '../types';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    members,
    tasks,
    toggleProjectStar,
    openQuickAdd,
    preferences,
    getProjectStats,
    deleteProject,
  } = useApp();
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Ativos' | 'Planejamento' | 'Entregues'>('Todos');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const currentAccent = ACCENTS[preferences.accent] || ACCENTS.blue;

  const filteredProjects = projects.filter((p) => {
    if (statusFilter === 'Todos') return true;
    if (statusFilter === 'Ativos') {
      return (
        p.status === 'Em andamento' ||
        p.status === 'Em revisão' ||
        p.status === 'In progress' ||
        p.status === 'In review'
      );
    }
    if (statusFilter === 'Planejamento') {
      return p.status === 'Planejamento' || p.status === 'Planning';
    }
    if (statusFilter === 'Entregues') {
      return p.status === 'Entregue' || p.status === 'Shipped';
    }
    return true;
  });

  const activeCount = projects.filter(
    (p) =>
      p.status === 'Em andamento' ||
      p.status === 'Em revisão' ||
      p.status === 'In progress' ||
      p.status === 'In review'
  ).length;

  const shippedCount = projects.filter(
    (p) => p.status === 'Entregue' || p.status === 'Shipped'
  ).length;

  const getProjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'smartphone':
        return Smartphone;
      case 'rocket':
        return Rocket;
      case 'layout-grid':
        return LayoutGrid;
      case 'sprout':
        return Sprout;
      case 'flame':
        return Flame;
      case 'compass':
        return Compass;
      default:
        return Folder;
    }
  };

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'Em andamento':
      case 'In progress':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'Em revisão':
      case 'In review':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Planejamento':
      case 'Planning':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Entregue':
      case 'Shipped':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      default:
        return 'bg-white/10 text-white/70 border-white/10';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Projetos
          </h1>
          <p className="text-white/60 text-sm mt-1">
            {activeCount} em andamento · {shippedCount} entregue
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Pílulas de Filtro de Status */}
          <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            {(['Todos', 'Ativos', 'Planejamento', 'Entregues'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  statusFilter === tab
                    ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/15'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Botão Novo Projeto */}
          <button
            onClick={() => openQuickAdd('project')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-semibold text-white bg-gradient-to-r ${currentAccent.gradient} shadow-lg ${currentAccent.activeNavGlow} hover:brightness-110 active:scale-95 transition-all flex items-center gap-2`}
          >
            <Plus size={15} />
            <span>Novo projeto</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="p-4 rounded-3xl bg-[#141622]/60 backdrop-blur-xl border border-white/10 shadow-lg glass-card-hover">
          <span className="text-xs text-white/50 block font-medium">Ativos</span>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">{activeCount}</div>
        </div>

        <div className="p-4 rounded-3xl bg-[#141622]/60 backdrop-blur-xl border border-white/10 shadow-lg glass-card-hover">
          <span className="text-xs text-white/50 block font-medium">Entregues</span>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">{shippedCount}</div>
        </div>

        <div className="p-4 rounded-3xl bg-[#141622]/60 backdrop-blur-xl border border-white/10 shadow-lg glass-card-hover">
          <span className="text-xs text-white/50 block font-medium">No prazo</span>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            {projects.length > 0 ? Math.round(((activeCount + shippedCount) / projects.length) * 100) : 100}%
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#141622]/60 backdrop-blur-xl border border-white/10 shadow-lg glass-card-hover">
          <span className="text-xs text-white/50 block font-medium">Entrega este mês</span>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            {projects.filter((p) => p.dueDate.startsWith('2026-10') || p.dueDisplay.includes('Out') || p.dueDisplay.includes('Oct')).length}
          </div>
        </div>
      </div>

      {/* Grid de 2 Colunas de Cartões de Projeto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((proj) => {
          const Icon = getProjectIcon(proj.icon);
          const stats = getProjectStats(proj.id);
          const progress = stats.total > 0 ? stats.progress : proj.nextMilestone.progress;

          const strokeRadius = 20;
          const circumference = 2 * Math.PI * strokeRadius;
          const strokeDashoffset = circumference - (progress / 100) * circumference;

          return (
            <div
              key={proj.id}
              className="p-6 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl glass-card-hover space-y-5 flex flex-col justify-between"
            >
              <div>
                {/* Linha Superior: Ícone, Título & Status, Ações (Estrela + Excluir) */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
                      style={{
                        backgroundColor: `${proj.color}25`,
                        color: proj.color,
                        boxShadow: `0 0 20px ${proj.color}20`,
                      }}
                    >
                      <Icon size={22} />
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white leading-tight">{proj.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: proj.color }}
                        />
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadgeClass(
                            proj.status
                          )}`}
                        >
                          {proj.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleProjectStar(proj.id)}
                      className="p-2 rounded-xl text-white/40 hover:text-amber-400 hover:bg-white/5 transition-colors"
                      title={proj.starred ? 'Desmarcar favorito' : 'Favoritar projeto'}
                    >
                      <Star
                        size={17}
                        className={proj.starred ? 'fill-amber-400 text-amber-400' : ''}
                      />
                    </button>
                    <button
                      onClick={() => setProjectToDelete(proj)}
                      className="p-2 rounded-xl text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Excluir projeto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Descrição */}
                <p className="text-xs text-white/60 leading-relaxed mt-4 line-clamp-2">
                  {proj.description}
                </p>

                {/* Bloco de Próximo Marco com Anel de Progresso Circular */}
                <div className="mt-5 p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-4">
                  {/* Anel SVG Circular */}
                  <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 52 52">
                      <circle
                        cx="26"
                        cy="26"
                        r={strokeRadius}
                        stroke="rgba(255, 255, 255, 0.1)"
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="26"
                        cy="26"
                        r={strokeRadius}
                        stroke={proj.color}
                        strokeWidth="4"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="none"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-bold text-white">
                      {progress}%
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block">
                      Próximo marco
                    </span>
                    <h4 className="text-xs font-bold text-white truncate mt-0.5">
                      {proj.nextMilestone.title}
                    </h4>
                    <span className="text-[11px] text-white/50 block mt-0.5">
                      {proj.nextMilestone.dueDisplay}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rodapé do Cartão: Equipe, Contador de Tarefas, Data */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {proj.memberIds.slice(0, 3).map((mId) => {
                      const m = members.find((mem) => mem.id === mId);
                      if (!m) return null;
                      return (
                        <img
                          key={m.id}
                          src={m.avatar}
                          alt={m.name}
                          className="w-6 h-6 rounded-full object-cover ring-2 ring-[#141622]"
                        />
                      );
                    })}
                    {proj.memberIds.length > 3 && (
                      <span className="w-6 h-6 rounded-full bg-white/10 ring-2 ring-[#141622] text-[10px] font-bold text-white/80 flex items-center justify-center">
                        +{proj.memberIds.length - 3}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-white/50">
                    {stats.done}/{stats.total || 11} tarefas
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-white/50 text-[11px]">
                  <Calendar size={13} className="text-white/40" />
                  <span>{proj.dueDisplay}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Confirmação de Exclusão do Projeto */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="w-full max-w-md rounded-3xl bg-[#151722]/95 backdrop-blur-2xl border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.7)] text-white p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Excluir projeto</h3>
              <p className="text-xs text-white/60 mt-1.5 leading-relaxed">
                Tem certeza de que deseja excluir o projeto <strong className="text-white">"{projectToDelete.name}"</strong>?
              </p>
              <p className="text-xs text-rose-300/80 mt-2 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                Atenção: Todas as tarefas e dados vinculados a este projeto serão removidos permanentemente.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProject(projectToDelete.id);
                  setProjectToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                Excluir Projeto
              </button>
            </div>
          </div>
          <div className="fixed inset-0 -z-10" onClick={() => setProjectToDelete(null)} />
        </div>
      )}
    </div>
  );
};
