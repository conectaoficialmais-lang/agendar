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
  BarChart2,
  Check,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProjectDetailView } from './ProjectDetailView';

interface ProjectCardSpec {
  id: string;
  name: string;
  slug: string;
  iconType: 'rocket' | 'smartphone' | 'grid' | 'sprout' | 'flame' | 'chart';
  iconColor: string;
  iconGradient: string;
  glowColor: string;
  starred: boolean;
  status: 'In progress' | 'In review' | 'Planning' | 'Shipped';
  statusColor: string;
  description: string;
  milestonePercent: number;
  milestoneTitle: string;
  milestoneDue: string;
  milestoneLabel?: string;
  avatars: string[];
  extraAvatars?: number;
  tasksText: string;
  dueDisplay: string;
}

const CANONICAL_PROJECTS: ProjectCardSpec[] = [
  // Linha 1
  {
    id: 'proj-orbit',
    name: 'Orbit 2.0 launch',
    slug: 'orbit',
    iconType: 'rocket',
    iconColor: '#a855f7',
    iconGradient: 'from-[#a855f7] to-[#7c3aed]',
    glowColor: 'rgba(168, 85, 247, 0.16)',
    starred: true,
    status: 'In progress',
    statusColor: '#3b82f6',
    description: 'Everything the public sees on launch day: site, film, press kit and the waitlist email.',
    milestonePercent: 45,
    milestoneTitle: 'Launch film final cut',
    milestoneDue: 'Oct 24 · in 4 days',
    avatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    ],
    extraAvatars: 1,
    tasksText: '5/11 tasks',
    dueDisplay: 'Nov 1',
  },
  {
    id: 'proj-tide',
    name: 'Tide mobile app',
    slug: 'tide',
    iconType: 'smartphone',
    iconColor: '#3b82f6',
    iconGradient: 'from-[#3b82f6] to-[#2563eb]',
    glowColor: 'rgba(59, 130, 246, 0.16)',
    starred: true,
    status: 'In progress',
    statusColor: '#3b82f6',
    description: 'The 3.0 rebuild of the Tide app: new home, offline sync and a calmer onboarding.',
    milestonePercent: 47,
    milestoneTitle: 'Offline sync in beta',
    milestoneDue: 'Oct 26 · in 6 days',
    avatars: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    ],
    extraAvatars: 2,
    tasksText: '8/17 tasks',
    dueDisplay: 'Nov 29',
  },
  {
    id: 'proj-facet',
    name: 'Facet design system',
    slug: 'facet',
    iconType: 'grid',
    iconColor: '#ec4899',
    iconGradient: 'from-[#ec4899] to-[#db2777]',
    glowColor: 'rgba(236, 72, 153, 0.16)',
    starred: false,
    status: 'In progress',
    statusColor: '#3b82f6',
    description: 'One set of tokens, components and docs for every Pane surface, light and dark.',
    milestonePercent: 50,
    milestoneTitle: 'Docs site live',
    milestoneDue: 'Nov 7 · in 18 days',
    avatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    ],
    tasksText: '7/14 tasks',
    dueDisplay: 'Dec 19',
  },
  {
    id: 'proj-sprout',
    name: 'Sprout onboarding',
    slug: 'sprout',
    iconType: 'sprout',
    iconColor: '#22c55e',
    iconGradient: 'from-[#22c55e] to-[#16a34a]',
    glowColor: 'rgba(34, 197, 94, 0.16)',
    starred: false,
    status: 'In review',
    statusColor: '#f97316',
    description: 'A first-week path that gets new teams to their first finished project.',
    milestonePercent: 50,
    milestoneTitle: 'Read-out to leadership',
    milestoneDue: 'Oct 25 · in 5 days',
    avatars: [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    ],
    tasksText: '4/8 tasks',
    dueDisplay: 'Oct 25',
  },

  // Linha 2
  {
    id: 'proj-q4brand',
    name: 'Q4 brand campaign',
    slug: 'q4brand',
    iconType: 'flame',
    iconColor: '#f97316',
    iconGradient: 'from-[#f97316] to-[#ea580c]',
    glowColor: 'rgba(249, 115, 22, 0.16)',
    starred: false,
    status: 'Planning',
    statusColor: '#a855f7',
    description: 'Out-of-home and social for the winter season, built around “work you can see through”.',
    milestonePercent: 0,
    milestoneTitle: 'Creative brief',
    milestoneDue: 'Oct 30 · in 10 days',
    avatars: [
      'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
    ],
    tasksText: '0/6 tasks',
    dueDisplay: 'Dec 27',
  },
  {
    id: 'proj-northstar',
    name: 'Northstar analytics',
    slug: 'northstar',
    iconType: 'chart',
    iconColor: '#06b6d4',
    iconGradient: 'from-[#06b6d4] to-[#0891b2]',
    glowColor: 'rgba(6, 182, 212, 0.16)',
    starred: false,
    status: 'Shipped',
    statusColor: '#10b981',
    description: 'One trusted metric per team and a weekly digest everyone actually opens.',
    milestonePercent: 100,
    milestoneTitle: 'Every milestone met',
    milestoneDue: 'Oct 8',
    milestoneLabel: 'Shipped',
    avatars: [
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    ],
    tasksText: '6/6 tasks',
    dueDisplay: 'Oct 8',
  },
];

export const ProjectsView: React.FC = () => {
  const {
    openQuickAdd,
    toggleProjectStar,
    deleteProject,
    selectedProjectId,
    openProjectDetail,
    projects: contextProjects,
  } = useApp();

  const [filter, setFilter] = useState<'All' | 'Active' | 'Planning' | 'Shipped'>('All');
  const [projectToDelete, setProjectToDelete] = useState<ProjectCardSpec | null>(null);

  // Se houver um projeto selecionado, renderizar a visão detalhada do projeto
  if (selectedProjectId) {
    return <ProjectDetailView projectId={selectedProjectId} />;
  }

  // Filtragem dos cards
  const displayedProjects = CANONICAL_PROJECTS.filter((proj) => {
    // Sincronizar estrela com o estado global se existir no contexto
    const ctxProj = contextProjects.find((p) => p.slug === proj.slug || p.id === proj.id);
    const isStarred = ctxProj ? ctxProj.starred : proj.starred;
    proj.starred = isStarred;

    if (filter === 'All') return true;
    if (filter === 'Active') return proj.status === 'In progress' || proj.status === 'In review';
    if (filter === 'Planning') return proj.status === 'Planning';
    if (filter === 'Shipped') return proj.status === 'Shipped';
    return true;
  });

  const renderProjectIcon = (type: ProjectCardSpec['iconType']) => {
    switch (type) {
      case 'rocket':
        return <Rocket size={19} strokeWidth={2.2} className="text-white" />;
      case 'smartphone':
        return <Smartphone size={19} strokeWidth={2.2} className="text-white" />;
      case 'grid':
        return <LayoutGrid size={19} strokeWidth={2.2} className="text-white" />;
      case 'sprout':
        return <Sprout size={19} strokeWidth={2.2} className="text-white" />;
      case 'flame':
        return <Flame size={19} strokeWidth={2.2} className="text-white" />;
      case 'chart':
        return <BarChart2 size={19} strokeWidth={2.2} className="text-white" />;
    }
  };

  const renderStatusBadge = (status: ProjectCardSpec['status']) => {
    if (status === 'Shipped') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#10b981]/10 text-[#34d399] border border-[#10b981]/20">
          <Check size={11} strokeWidth={3} className="text-[#34d399]" />
          <span>Shipped</span>
        </span>
      );
    }

    if (status === 'In review') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#f97316]/10 text-[#fb923c] border border-[#f97316]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f97316]" />
          <span>In review</span>
        </span>
      );
    }

    if (status === 'Planning') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#a855f7]/10 text-[#c084fc] border border-[#a855f7]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" />
          <span>Planning</span>
        </span>
      );
    }

    // In progress (bullet azul)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#3b82f6]/10 text-[#60a5fa] border border-[#3b82f6]/20">
        <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
        <span>In progress</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* ════════════════════════════════════
          HEADER / TOPO DA ÁREA PRINCIPAL
          ════════════════════════════════════ */}
      <div className="space-y-4">
        {/* Título grande (~42px bold branco) + Subtítulo em cinza */}
        <div>
          <h1 className="text-[38px] md:text-[42px] font-bold tracking-tight text-white leading-none">
            Projects
          </h1>
          <p className="text-[#8b8b90] text-sm mt-1.5 font-normal">
            5 in flight · 1 shipped
          </p>
        </div>

        {/* Linha de métricas (esquerda) + Filtros e Novo Projeto (direita) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          {/* 4 mini-cards de métricas (stat tiles) */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
            <div className="px-4 py-2.5 rounded-[14px] bg-[#131417] border border-white/[0.06] min-w-[90px] shadow-sm">
              <span className="text-[11px] font-medium text-[#8b8b90] block">Active</span>
              <div className="text-[26px] font-bold text-white mt-0.5 leading-none">4</div>
            </div>

            <div className="px-4 py-2.5 rounded-[14px] bg-[#131417] border border-white/[0.06] min-w-[90px] shadow-sm">
              <span className="text-[11px] font-medium text-[#8b8b90] block">Shipped</span>
              <div className="text-[26px] font-bold text-white mt-0.5 leading-none">1</div>
            </div>

            <div className="px-4 py-2.5 rounded-[14px] bg-[#131417] border border-white/[0.06] min-w-[90px] shadow-sm">
              <span className="text-[11px] font-medium text-[#8b8b90] block">On track</span>
              <div className="text-[26px] font-bold text-white mt-0.5 leading-none">50%</div>
            </div>

            <div className="px-4 py-2.5 rounded-[14px] bg-[#131417] border border-white/[0.06] min-w-[90px] shadow-sm">
              <span className="text-[11px] font-medium text-[#8b8b90] block">Due this month</span>
              <div className="text-[26px] font-bold text-white mt-0.5 leading-none">1</div>
            </div>
          </div>

          {/* À direita: grupo de filtros em pílula + botão "+ New project" */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Grupo de filtros em pílula */}
            <div className="flex items-center p-1 rounded-full bg-[#131417] border border-white/[0.06]">
              {(['All', 'Active', 'Planning', 'Shipped'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    filter === tab
                      ? 'bg-white/[0.12] text-white shadow-sm font-semibold'
                      : 'text-[#8b8b90] hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Botão "+ New project" (pílula clara/branca destacada) */}
            <button
              onClick={() => openQuickAdd('project')}
              className="px-4 py-2 rounded-full text-xs font-semibold text-black bg-white hover:bg-gray-100 shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus size={14} className="stroke-[2.5]" />
              <span>New project</span>
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          GRID DE CARDS DE PROJETO (2 linhas)
          ════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayedProjects.map((proj) => {
          // Raio e circunferência do anel circular SVG
          const radius = 17;
          const circumference = 2 * Math.PI * radius; // ~106.81
          const strokeOffset = circumference - (proj.milestonePercent / 100) * circumference;

          return (
            <div
              key={proj.id}
              onClick={() => openProjectDetail(proj.id)}
              className="p-5 rounded-[16px] shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:border-white/[0.12] hover:-translate-y-0.5"
              style={{
                background: `radial-gradient(circle at 10% 10%, ${proj.glowColor} 0%, rgba(19, 20, 24, 0) 55%), #131316`,
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div>
                {/* Topo: Ícone colorido com gradiente + Nome (bold) + Estrela */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Ícone quadrado arredondado colorido */}
                    <div
                      className={`w-11 h-11 rounded-[12px] bg-gradient-to-br ${proj.iconGradient} flex items-center justify-center text-white shadow-md shrink-0 group-hover:scale-105 transition-transform`}
                    >
                      {renderProjectIcon(proj.iconType)}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-[14px] font-bold text-white group-hover:text-blue-300 transition-colors leading-tight truncate">
                        {proj.name}
                      </h3>
                      {/* Badge de status pequeno logo abaixo do nome */}
                      <div className="mt-1">
                        {renderStatusBadge(proj.status)}
                      </div>
                    </div>
                  </div>

                  {/* Estrela (dourada se favorito / vazia se não) + Excluir */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleProjectStar(proj.id);
                      }}
                      className="p-1 rounded text-white/30 hover:text-amber-400 transition-colors"
                      title={proj.starred ? 'Unstar project' : 'Star project'}
                    >
                      <Star
                        size={15}
                        className={proj.starred ? 'fill-[#eab308] text-[#eab308]' : 'text-white/20 hover:text-white/40'}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectToDelete(proj);
                      }}
                      className="p-1 rounded text-white/0 group-hover:text-white/20 hover:!text-rose-400 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Parágrafo descritivo em cinza (2 linhas) */}
                <p className="text-xs text-[#8b8b90] leading-relaxed mt-3.5 mb-4 line-clamp-2">
                  {proj.description}
                </p>

                {/* Bloco "Next milestone" */}
                <div
                  className="p-3 rounded-[12px] flex items-center gap-3.5 mb-4"
                  style={{
                    background: '#0d0e11',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                >
                  {/* Anel de progresso circular (donut) com % no centro */}
                  <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44">
                      {/* Círculo de fundo cinza-escuro */}
                      <circle
                        cx="22"
                        cy="22"
                        r={radius}
                        stroke="rgba(255, 255, 255, 0.08)"
                        strokeWidth="3.5"
                        fill="none"
                      />
                      {/* Arco colorido na cor do projeto */}
                      <circle
                        cx="22"
                        cy="22"
                        r={radius}
                        stroke={proj.iconColor}
                        strokeWidth="3.5"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeOffset}
                        strokeLinecap="round"
                        fill="none"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-white font-mono">
                      {proj.milestonePercent}%
                    </span>
                  </div>

                  {/* Informações do Milestone */}
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-medium text-[#8b8b90] block leading-tight">
                      {proj.milestoneLabel || 'Next milestone'}
                    </span>
                    <h4 className="text-xs font-bold text-white truncate leading-tight mt-0.5">
                      {proj.milestoneTitle}
                    </h4>
                    <span className="text-[11px] text-[#8b8b90] block leading-tight mt-0.5">
                      {proj.milestoneDue}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rodapé: Pilha de avatares sobrepostos + contador "+N", "X/Y tasks" ao centro, e calendário + data */}
              <div className="flex items-center justify-between text-xs text-[#8b8b90] pt-1">
                {/* Pilha de avatares (3) + "+N" */}
                <div className="flex -space-x-1.5 shrink-0">
                  {proj.avatars.map((avatarUrl, idx) => (
                    <img
                      key={idx}
                      src={avatarUrl}
                      alt="Team member"
                      className="w-5 h-5 rounded-full object-cover ring-2 ring-[#131316]"
                    />
                  ))}
                  {proj.extraAvatars && proj.extraAvatars > 0 && (
                    <span className="w-5 h-5 rounded-full bg-white/10 ring-2 ring-[#131316] text-[9px] font-bold text-white/80 flex items-center justify-center">
                      +{proj.extraAvatars}
                    </span>
                  )}
                </div>

                {/* "X/Y tasks" ao centro */}
                <span className="text-[11px] text-[#8b8b90] font-medium">
                  {proj.tasksText}
                </span>

                {/* Ícone de calendário + data à direita */}
                <div className="flex items-center gap-1.5 text-[#8b8b90] text-[11px] shrink-0 font-medium">
                  <Calendar size={12} className="text-[#8b8b90]" />
                  <span>{proj.dueDisplay}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de confirmação de exclusão */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="w-full max-w-md rounded-[18px] bg-[#131418] border border-white/[0.08] shadow-2xl text-white p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Delete project</h3>
              <p className="text-xs text-[#8b8b90] mt-1.5 leading-relaxed">
                Are you sure you want to delete <strong className="text-white">"{projectToDelete.name}"</strong>?
              </p>
              <p className="text-xs text-rose-300/80 mt-2 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                Warning: All tasks and milestones associated with this project will be removed.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8b8b90] hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProject(projectToDelete.id);
                  setProjectToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/30 transition-colors"
              >
                Delete project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
