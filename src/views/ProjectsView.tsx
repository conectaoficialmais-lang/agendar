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
  Folder,
  Compass,
  X,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { ProjectDetailView } from './ProjectDetailView';
import { Project } from '../types';
import { todayIso, addDays, formatDueLabel } from '../dateUtils';
import { statusLabel } from '../labels';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    tasks,
    members,
    currentUser,
    toggleProjectStar,
    deleteProject,
    addProject,
    selectedProjectId,
    openProjectDetail,
    getProjectStats,
  } = useApp();

  const [filter, setFilter] = useState<'All' | 'Active' | 'Planning' | 'Shipped'>('All');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Project Form State
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#3b82f6');
  const [newProjectIcon, setNewProjectIcon] = useState<'rocket' | 'smartphone' | 'grid' | 'sprout' | 'flame' | 'chart' | 'folder'>('smartphone');
  const [newProjectStatus, setNewProjectStatus] = useState<'In progress' | 'In review' | 'Planning' | 'Shipped'>('In progress');
  const [newProjectDueDate, setNewProjectDueDate] = useState(addDays(todayIso(), 30));
  const [newProjectMilestoneTitle, setNewProjectMilestoneTitle] = useState('');
  const [newProjectMilestoneDue, setNewProjectMilestoneDue] = useState('');
  const [newProjectSelectedMembers, setNewProjectSelectedMembers] = useState<string[]>([currentUser.id]);

  // Se houver um projeto selecionado, renderizar a visão detalhada do projeto
  if (selectedProjectId) {
    return <ProjectDetailView projectId={selectedProjectId} />;
  }

  // Real Metrics Calculation from dynamic projects and tasks
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) =>
    ['In progress', 'In review', 'Em andamento', 'Em revisão'].includes(p.status)
  );
  const activeCount = activeProjects.length;

  const shippedProjects = projects.filter((p) =>
    ['Shipped', 'Entregue'].includes(p.status)
  );
  const shippedCount = shippedProjects.length;

  // On track: percentage of active projects with progress >= 30% or not delayed
  const onTrackActiveCount = activeProjects.filter((p) => {
    const stats = getProjectStats(p.id);
    const prog = stats.total > 0 ? stats.progress : (p.nextMilestone?.progress ?? 0);
    return prog >= 30 || p.status === 'In progress';
  }).length;
  const onTrackPercent = activeCount > 0 ? Math.round((onTrackActiveCount / activeCount) * 100) : 100;

  // Projetos com entrega no mês atual
  const currentMonthPrefix = todayIso().slice(0, 7);
  const dueThisMonthCount = projects.filter(
    (p) => p.dueDate && p.dueDate.startsWith(currentMonthPrefix) && !['Shipped', 'Entregue'].includes(p.status)
  ).length;

  // Filtragem dos cards
  const displayedProjects = projects.filter((proj) => {
    const norm = proj.status.toLowerCase();
    if (filter === 'All') return true;
    if (filter === 'Active') return norm.includes('progress') || norm.includes('review') || norm.includes('andamento') || norm.includes('revisão');
    if (filter === 'Planning') return norm.includes('planning') || norm.includes('planejamento');
    if (filter === 'Shipped') return norm.includes('shipped') || norm.includes('entregue');
    return true;
  });

  const COLOR_OPTIONS = [
    { label: 'Blue', color: '#3b82f6', gradient: 'from-[#3b82f6] to-[#2563eb]', glow: 'rgba(59, 130, 246, 0.22)' },
    { label: 'Purple', color: '#a855f7', gradient: 'from-[#a855f7] to-[#7c3aed]', glow: 'rgba(168, 85, 247, 0.22)' },
    { label: 'Cyan', color: '#06b6d4', gradient: 'from-[#06b6d4] to-[#0891b2]', glow: 'rgba(6, 182, 212, 0.22)' },
    { label: 'Green', color: '#10b981', gradient: 'from-[#10b981] to-[#059669]', glow: 'rgba(16, 185, 129, 0.22)' },
    { label: 'Orange', color: '#f97316', gradient: 'from-[#f97316] to-[#ea580c]', glow: 'rgba(249, 115, 22, 0.22)' },
    { label: 'Pink', color: '#ec4899', gradient: 'from-[#ec4899] to-[#db2777]', glow: 'rgba(236, 72, 153, 0.22)' },
  ];

  const renderProjectIcon = (iconStr: string) => {
    switch (iconStr) {
      case 'rocket':
        return <Rocket size={20} strokeWidth={2.3} className="text-white" />;
      case 'smartphone':
        return <Smartphone size={20} strokeWidth={2.3} className="text-white" />;
      case 'grid':
      case 'layout-grid':
        return <LayoutGrid size={20} strokeWidth={2.3} className="text-white" />;
      case 'sprout':
      case 'leaf':
        return <Sprout size={20} strokeWidth={2.3} className="text-white" />;
      case 'flame':
        return <Flame size={20} strokeWidth={2.3} className="text-white" />;
      case 'chart':
      case 'compass':
        return <BarChart2 size={20} strokeWidth={2.3} className="text-white" />;
      default:
        return <Folder size={20} strokeWidth={2.3} className="text-white" />;
    }
  };

  const renderStatusBadge = (statusStr: string) => {
    const s = statusStr.toLowerCase();
    if (s.includes('shipped') || s.includes('entregue')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
          <Check size={11} strokeWidth={3} className="text-cyan-400" />
          <span>Entregue</span>
        </span>
      );
    }

    if (s.includes('review') || s.includes('revisão')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Em revisão</span>
        </span>
      );
    }

    if (s.includes('planning') || s.includes('planejamento')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          <span>Planejamento</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span>Em andamento</span>
      </span>
    );
  };

  const handleCreateNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const created = addProject({
      name: newProjectName.trim(),
      slug: newProjectName.toLowerCase().replace(/\s+/g, '-'),
      description: newProjectDesc.trim() || 'Novo projeto criado no workspace.',
      status: newProjectStatus,
      color: newProjectColor,
      icon: newProjectIcon,
      dueDate: newProjectDueDate,
      dueDisplay: formatDueLabel(newProjectDueDate),
      nextMilestone: {
        title: newProjectMilestoneTitle.trim() || 'Primeira entrega',
        dueDate: newProjectDueDate,
        dueDisplay: newProjectMilestoneDue.trim() || 'Em breve',
        progress: newProjectStatus === 'Shipped' ? 100 : 0,
      },
      starred: false,
      leadId: currentUser.id,
      memberIds: newProjectSelectedMembers.length > 0 ? newProjectSelectedMembers : [currentUser.id],
    });

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: [newProjectColor, '#3b82f6', '#38bdf8', '#ffffff'],
      });
    } catch {}

    setNewProjectName('');
    setNewProjectDesc('');
    setIsCreateModalOpen(false);
  };

  const toggleMemberSelection = (memberId: string) => {
    setNewProjectSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* ════════════════════════════════════
          HEADER / TOPO EXATO DA IMAGEM PANE
          ════════════════════════════════════ */}
      <div className="space-y-4">
        {/* Título grande + Subtítulo */}
        <div>
          <h1 className="text-[38px] md:text-[42px] font-bold tracking-tight text-white leading-none">
            Projetos
          </h1>
          <p className="text-[#8b8b90] text-sm mt-1.5 font-normal">
            {activeCount} em andamento · {shippedCount} {shippedCount === 1 ? 'entregue' : 'entregues'}
          </p>
        </div>

        {/* Linha de métricas reais + Filtros e Novo Projeto */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          {/* 4 mini-cards de métricas reais (stat tiles) */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
            <div className="px-5 py-3 rounded-[16px] bg-[#181920] border border-white/[0.06] min-w-[105px] shadow-sm">
              <span className="text-[11px] font-medium text-[#8b8b90] block">Ativos</span>
              <div className="text-[26px] font-bold text-white mt-0.5 leading-none">{activeCount}</div>
            </div>

            <div className="px-5 py-3 rounded-[16px] bg-[#181920] border border-white/[0.06] min-w-[105px] shadow-sm">
              <span className="text-[11px] font-medium text-[#8b8b90] block">Entregues</span>
              <div className="text-[26px] font-bold text-white mt-0.5 leading-none">{shippedCount}</div>
            </div>

            <div className="px-5 py-3 rounded-[16px] bg-[#181920] border border-white/[0.06] min-w-[105px] shadow-sm">
              <span className="text-[11px] font-medium text-[#8b8b90] block">No prazo</span>
              <div className="text-[26px] font-bold text-white mt-0.5 leading-none">{onTrackPercent}%</div>
            </div>

            <div className="px-5 py-3 rounded-[16px] bg-[#181920] border border-white/[0.06] min-w-[105px] shadow-sm">
              <span className="text-[11px] font-medium text-[#8b8b90] block">Este mês</span>
              <div className="text-[26px] font-bold text-white mt-0.5 leading-none">{dueThisMonthCount}</div>
            </div>
          </div>

          {/* À direita: grupo de filtros em pílula + botão "+ New project" */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {/* Grupo de filtros em pílula */}
            <div className="flex items-center p-1 rounded-full bg-[#181920] border border-white/[0.06]">
              {(['All', 'Active', 'Planning', 'Shipped'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    filter === tab
                      ? 'bg-[#2a2c38] text-white shadow-sm'
                      : 'text-[#8b8b90] hover:text-white'
                  }`}
                >
                  {({ All: 'Todos', Active: 'Ativos', Planning: 'Planejamento', Shipped: 'Entregues' } as const)[tab]}
                </button>
              ))}
            </div>

            {/* Botão "+ New project" (pílula clara/branca destacada) */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4.5 py-2 rounded-full text-xs font-semibold text-[#0d0e12] bg-[#e2e4ea] hover:bg-white shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus size={15} strokeWidth={2.8} />
              <span>Novo projeto</span>
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          GRID DE CARDS DE PROJETO DINÂMICOS
          ════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        {displayedProjects.map((proj) => {
          // Estatísticas reais de tarefas
          const stats = getProjectStats(proj.id);
          const totalTasks = stats.total;
          const doneTasks = stats.done;
          const progressPercent = totalTasks > 0 ? stats.progress : (proj.nextMilestone?.progress ?? 0);

          // Anel circular SVG
          const radius = 17;
          const circumference = 2 * Math.PI * radius;
          const strokeOffset = circumference - (progressPercent / 100) * circumference;

          // Membros reais
          const projMembers = members.filter((m) => proj.memberIds?.includes(m.id));
          const avatars = projMembers.length > 0
            ? projMembers.map((m) => m.avatar)
            : [currentUser.avatar];
          const displayAvatars = avatars.slice(0, 3);
          const extraAvatars = Math.max(0, avatars.length - 3);

          const projectColor = proj.color || '#3b82f6';
          const glowColor = `${projectColor}25`;

          return (
            <div
              key={proj.id}
              onClick={() => openProjectDetail(proj.id)}
              className="p-5 rounded-[20px] bg-[#181920] border border-white/[0.08] hover:border-white/[0.16] shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden"
              style={{
                background: `radial-gradient(circle at 14% 14%, ${glowColor} 0%, rgba(24, 25, 32, 0) 65%), #181920`,
              }}
            >
              <div>
                {/* Topo: Ícone colorido + Nome (bold) + Ações (Estrela / Lixeira) */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Ícone quadrado arredondado colorido com gradiente */}
                    <div
                      className="w-11 h-11 rounded-[14px] flex items-center justify-center text-white shadow-md shrink-0 group-hover:scale-105 transition-transform"
                      style={{
                        background: `linear-gradient(135deg, ${projectColor}, ${projectColor}cc)`,
                        boxShadow: `0 4px 16px ${projectColor}33`,
                      }}
                    >
                      {renderProjectIcon(proj.icon)}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-[14px] font-bold text-white group-hover:text-blue-300 transition-colors leading-tight truncate">
                        {proj.name}
                      </h3>
                      {/* Badge de status */}
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
                      title={proj.starred ? 'Remover favorito' : 'Favoritar projeto'}
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
                      className="p-1.5 rounded-lg text-white/0 group-hover:text-white/30 hover:!text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Excluir projeto"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Parágrafo descritivo em cinza metálico */}
                <p className="text-xs text-[#8b8b90] leading-relaxed mt-3.5 mb-4 line-clamp-2">
                  {proj.description}
                </p>

                {/* Bloco "Next milestone" com Anel de Progresso */}
                <div className="p-3 rounded-[14px] bg-[#20222a] border border-white/[0.04] flex items-center gap-3.5 mb-4">
                  {/* Anel de progresso circular (donut) com % no centro */}
                  <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44">
                      {/* Círculo de fundo */}
                      <circle
                        cx="22"
                        cy="22"
                        r={radius}
                        stroke="rgba(255, 255, 255, 0.08)"
                        strokeWidth="3.5"
                        fill="none"
                      />
                      {/* Arco colorido */}
                      <circle
                        cx="22"
                        cy="22"
                        r={radius}
                        stroke={projectColor}
                        strokeWidth="3.5"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeOffset}
                        strokeLinecap="round"
                        fill="none"
                        className="transition-all duration-700 ease-out"
                        style={{ filter: `drop-shadow(0 0 4px ${projectColor})` }}
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-white font-mono">
                      {progressPercent}%
                    </span>
                  </div>

                  {/* Informações do Milestone */}
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-medium text-[#8b8b90] block leading-tight">
                      {proj.status === 'Shipped' || proj.status === 'Entregue' ? 'Entregue' : 'Próximo marco'}
                    </span>
                    <h4 className="text-xs font-bold text-white truncate leading-tight mt-0.5">
                      {proj.nextMilestone?.title || 'Marco de lançamento'}
                    </h4>
                    <span className="text-[11px] text-[#8b8b90] block leading-tight mt-0.5">
                      {formatDueLabel(proj.nextMilestone?.dueDate || proj.dueDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rodapé: Avatares, Contagem de tarefas real e Prazo */}
              <div className="flex items-center justify-between text-xs text-[#8b8b90] pt-1 border-t border-white/[0.04]">
                {/* Pilha de avatares */}
                <div className="flex -space-x-1.5 shrink-0">
                  {displayAvatars.map((avatarUrl, idx) => (
                    <img
                      key={idx}
                      src={avatarUrl}
                      alt="Team member"
                      className="w-5 h-5 rounded-full object-cover ring-2 ring-[#181920]"
                    />
                  ))}
                  {extraAvatars > 0 && (
                    <span className="w-5 h-5 rounded-full bg-white/[0.10] ring-2 ring-[#181920] text-[9px] font-bold text-[#8b8b90] flex items-center justify-center border border-white/10">
                      +{extraAvatars}
                    </span>
                  )}
                </div>

                {/* "X/Y tasks" dinâmico */}
                <span className="text-[11px] text-[#8b8b90] font-medium">
                  {totalTasks > 0 ? `${doneTasks}/${totalTasks} tarefas` : '0/0 tarefas'}
                </span>

                {/* Calendário e Prazo */}
                <div className="flex items-center gap-1.5 text-[#8b8b90] text-[11px] shrink-0 font-medium">
                  <Calendar size={12} className="text-[#8b8b90]" />
                  <span>{formatDueLabel(proj.dueDate)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ════════════════════════════════════
          MODAL DE NOVO PROJETO (100% FUNCIONAL)
          ════════════════════════════════════ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg rounded-[24px] bg-[#181920] border border-white/[0.12] shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-white p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/[0.08] border border-white/10 flex items-center justify-center text-white shadow-md">
                  <Folder size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Criar Novo Projeto</h3>
                  <p className="text-xs text-[#8b8b90]">Adicione um projeto com metas, equipe e prazo</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateNewProject} className="space-y-4">
              {/* Nome do Projeto */}
              <div>
                <label className="text-xs font-semibold text-[#8b8b90] block mb-1.5">
                  Nome do Projeto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Orbit 3.0, Redesign Mobile..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#121318] border border-white/[0.10] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="text-xs font-semibold text-[#8b8b90] block mb-1.5">
                  Descrição
                </label>
                <textarea
                  rows={2}
                  placeholder="Breve resumo dos objetivos e escopo do projeto..."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-[12px] bg-[#121318] border border-white/[0.10] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 resize-none"
                />
              </div>

              {/* Status e Cor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#8b8b90] block mb-1.5">
                    Status Inicial
                  </label>
                  <select
                    value={newProjectStatus}
                    onChange={(e) => setNewProjectStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-[12px] bg-[#121318] border border-white/[0.10] text-xs text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="In progress">Em andamento</option>
                    <option value="Planning">Planejamento</option>
                    <option value="In review">Em revisão</option>
                    <option value="Shipped">Entregue</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#8b8b90] block mb-1.5">
                    Cor de Destaque
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.color}
                        type="button"
                        onClick={() => setNewProjectColor(c.color)}
                        className={`w-6 h-6 rounded-full transition-all ${
                          newProjectColor === c.color ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.color }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Ícone */}
              <div>
                <label className="text-xs font-semibold text-[#8b8b90] block mb-1.5">
                  Ícone do Projeto
                </label>
                <div className="flex items-center gap-2">
                  {(['rocket', 'smartphone', 'grid', 'sprout', 'flame', 'chart', 'folder'] as const).map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setNewProjectIcon(ic)}
                      className={`p-2 rounded-xl border transition-all ${
                        newProjectIcon === ic
                          ? 'bg-white/[0.15] border-white/30 text-white shadow-sm'
                          : 'bg-[#121318] border-white/10 text-white/50 hover:text-white'
                      }`}
                      title={ic}
                    >
                      {renderProjectIcon(ic)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Milestone e Data de Entrega */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#8b8b90] block mb-1.5">
                    Próximo marco
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Lançamento Beta"
                    value={newProjectMilestoneTitle}
                    onChange={(e) => setNewProjectMilestoneTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-[12px] bg-[#121318] border border-white/[0.10] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#8b8b90] block mb-1.5">
                    Data limite
                  </label>
                  <input
                    type="date"
                    value={newProjectDueDate}
                    onChange={(e) => {
                      setNewProjectDueDate(e.target.value);
                      setNewProjectMilestoneDue(e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-[12px] bg-[#121318] border border-white/[0.10] text-xs text-white focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              {/* Membros da Equipe */}
              <div>
                <label className="text-xs font-semibold text-[#8b8b90] block mb-1.5">
                  Atribuir Membros da Equipe
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {members.map((m) => {
                    const isSelected = newProjectSelectedMembers.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleMemberSelection(m.id)}
                        className={`px-2.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all ${
                          isSelected
                            ? 'bg-white/[0.15] border border-white/30 text-white shadow-sm'
                            : 'bg-[#121318] border border-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        <img src={m.avatar} alt={m.name} className="w-4 h-4 rounded-full object-cover" />
                        <span>{m.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botões do Rodapé */}
              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#8b8b90] hover:text-white transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-bold text-[#0d0e12] bg-[#e2e4ea] hover:bg-white shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Plus size={14} strokeWidth={2.8} />
                  <span>Criar Projeto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════
          MODAL DE CONFIRMAÇÃO DE EXCLUSÃO (100% FUNCIONAL)
          ════════════════════════════════════ */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="w-full max-w-md rounded-[20px] bg-[#181920] border border-rose-500/30 shadow-[0_20px_50px_rgba(244,63,94,0.25)] text-white p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.3)]">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Excluir Projeto</h3>
              <p className="text-xs text-[#8b8b90] mt-1.5 leading-relaxed">
                Tem certeza que deseja excluir permanentemente o projeto <strong className="text-white">"{projectToDelete.name}"</strong>?
              </p>
              <p className="text-xs text-rose-300/90 mt-2 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                Aviso: Todas as tarefas e métricas associadas a este projeto serão removidas e as estatísticas do sistema serão sincronizadas imediatamente.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-[#8b8b90] hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProject(projectToDelete.id);
                  setProjectToDelete(null);
                }}
                className="px-4.5 py-2 rounded-full text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-colors active:scale-95"
              >
                Sim, excluir projeto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
