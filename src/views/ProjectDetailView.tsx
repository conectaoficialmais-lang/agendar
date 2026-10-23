import React, { useState } from 'react';
import {
  ChevronLeft,
  Star,
  Calendar,
  Smartphone,
  Rocket,
  LayoutGrid,
  Sprout,
  Flame,
  Compass,
  Folder,
  Plus,
  Check,
  ArrowUpRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Project, Task } from '../types';
import { fromAnchor, formatDueLabel, diffDays, todayIso } from '../dateUtils';
import { statusLabel } from '../labels';

interface ProjectDetailViewProps {
  projectId: string;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ projectId }) => {
  const {
    projects,
    tasks,
    members,
    currentUser,
    closeProjectDetail,
    toggleProjectStar,
    toggleTaskComplete,
    openTaskModal,
    openMemberModal,
    openQuickAdd,
    addTask,
  } = useApp();

  const project = projects.find((p) => p.id === projectId) || projects[0];

  const isTide = project.slug === 'tide' || project.id === 'proj-tide';

  // Tarefas deste projeto
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const todoTasks = projectTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = projectTasks.filter((t) => t.status === 'in_progress' || t.status === 'in_review');
  const doneTasks = projectTasks.filter((t) => t.status === 'done');

  // Valores padrão para Tide caso ainda não haja tarefas criadas
  const defaultTideDoneTasks: Task[] = [
    {
      id: 'tide-task-1',
      title: 'Schema de cache offline e migrações',
      projectId: project.id,
      status: 'done',
      priority: 'Medium',
      dueDate: fromAnchor('2026-10-06'),
      dueDisplay: 'Oct 6',
      assigneeId: 'user-kwame',
      subtasks: [],
      comments: [],
    },
    {
      id: 'tide-task-2',
      title: 'Auditoria de alvos de toque da navegação inferior',
      projectId: project.id,
      status: 'done',
      priority: 'Low',
      dueDate: fromAnchor('2026-10-04'),
      dueDisplay: 'Oct 4',
      assigneeId: 'user-elise',
      subtasks: [],
      comments: [],
    },
    {
      id: 'tide-task-3',
      title: 'Ilustrações do onboarding',
      projectId: project.id,
      status: 'done',
      priority: 'High',
      dueDate: fromAnchor('2026-09-29'),
      dueDisplay: 'Sep 29',
      assigneeId: 'user-lin',
      subtasks: [],
      comments: [],
    },
  ];

  const displayedDoneTasks = isTide && doneTasks.length === 0 ? defaultTideDoneTasks : doneTasks;
  const displayedTodoTasks = isTide && todoTasks.length === 0 ? [] : todoTasks;
  const displayedInProgressTasks = isTide && inProgressTasks.length === 0 ? [] : inProgressTasks;

  const openCount = displayedTodoTasks.length + displayedInProgressTasks.length;
  const doneCount = displayedDoneTasks.length;
  const totalCount = openCount + doneCount;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : (isTide ? 100 : 50);

  // Lead do projeto
  const leadMember = members.find((m) => m.id === project.leadId) ||
    members.find((m) => m.name.includes('Kwame')) ||
    members[0];

  // Membros do projeto
  const tideMembers = [
    members.find((m) => m.name.includes('Kwame')) || {
      id: 'user-kwame',
      name: 'Kwame Asante',
      role: 'Líder · Em reunião',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      status: 'meeting',
    },
    members.find((m) => m.name.includes('Elise')) || {
      id: 'user-elise',
      name: 'Elise Marchand',
      role: 'Online',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      status: 'online',
    },
    members.find((m) => m.name.includes('Haruto')) || {
      id: 'user-haruto',
      name: 'Haruto Sato',
      role: 'Online',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      status: 'online',
    },
    members.find((m) => m.name.includes('Omar')) || {
      id: 'user-omar',
      name: 'Omar Saleh',
      role: 'Em foco',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      status: 'focus',
    },
    members.find((m) => m.name.includes('Malik')) || {
      id: 'user-malik',
      name: 'Malik Johnson',
      role: 'Ausente',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: 'offline',
    },
    members.find((m) => m.name.includes('Nia')) || {
      id: 'user-nia',
      name: 'Nia Adebayo',
      role: 'Online',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      status: 'online',
    },
  ];

  const displayedMembers = isTide
    ? tideMembers
    : project.memberIds.map((id) => members.find((m) => m.id === id)).filter(Boolean);

  // Milestones padrão
  const defaultMilestones = [
    {
      id: 'ms-1',
      title: 'Congelamento do design e tokens',
      date: '8 out',
      status: 'done',
    },
    {
      id: 'ms-2',
      title: 'Sincronização offline em beta',
      date: '26 out',
      status: 'next',
    },
    {
      id: 'ms-3',
      title: 'RC1 no TestFlight',
      date: '12 nov',
      status: 'upcoming',
    },
    {
      id: 'ms-4',
      title: 'Envio para a loja',
      date: '28 nov',
      status: 'upcoming',
    },
  ];

  const getProjectIcon = () => {
    switch (project.icon) {
      case 'smartphone':
        return Smartphone;
      case 'rocket':
        return Rocket;
      case 'grid':
        return LayoutGrid;
      case 'leaf':
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

  const Icon = getProjectIcon();

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-400';
      case 'meeting':
        return 'bg-amber-400';
      case 'focus':
        return 'bg-purple-400';
      default:
        return 'bg-neutral-500';
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* ════════════════════════════════════
          HEADER / TOPO
          ════════════════════════════════════ */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Back button */}
            <button
              onClick={closeProjectDetail}
              className="p-2.5 rounded-full bg-[#131417] hover:bg-white/[0.08] text-[#8b8b90] hover:text-white border border-white/[0.06] transition-all shrink-0 mt-0.5"
              title="Voltar para a lista de projetos"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Project Icon */}
            <div
              className="w-11 h-11 rounded-[12px] flex items-center justify-center shadow-md shrink-0 mt-0.5"
              style={{
                backgroundColor: `${project.color}25`,
                color: project.color,
                border: `1px solid ${project.color}40`,
              }}
            >
              <Icon size={20} />
            </div>

            {/* Title & Description */}
            <div>
              <h1 className="text-[34px] md:text-[38px] font-bold tracking-tight text-white leading-none">
                {project.name}
              </h1>
              <p className="text-[#8b8b90] text-sm mt-1.5 font-normal max-w-2xl leading-relaxed">
                {project.description}
              </p>
            </div>
          </div>

          {/* Pinned / New Event Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            <button
              onClick={() => toggleProjectStar(project.id)}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-[#131417] hover:bg-white/[0.08] border border-white/[0.06] text-white shadow-sm transition-all flex items-center gap-1.5"
            >
              <Star
                size={13}
                className={project.starred ? 'fill-amber-400 text-amber-400' : 'text-[#8b8b90]'}
              />
              <span>{project.starred ? 'Fixado' : 'Fixar'}</span>
            </button>

            <button
              onClick={() => openQuickAdd('event')}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-[#131417] hover:bg-white/[0.08] border border-white/[0.06] text-white shadow-sm transition-all flex items-center gap-1.5"
            >
              <Calendar size={13} className="text-[#8b8b90]" />
              <span>Novo evento</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Tiles */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none pt-1">
          <div className="px-4 py-2.5 rounded-[14px] panel min-w-[90px] shadow-sm">
            <span className="text-[11px] font-medium text-[#8b8b90] block">Progresso</span>
            <div className="text-[26px] font-bold text-white mt-0.5 leading-none">
              {progressPercent}%
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-[14px] panel min-w-[90px] shadow-sm">
            <span className="text-[11px] font-medium text-[#8b8b90] block">Tarefas abertas</span>
            <div className="text-[26px] font-bold text-white mt-0.5 leading-none">
              {openCount}
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-[14px] panel min-w-[90px] shadow-sm">
            <span className="text-[11px] font-medium text-[#8b8b90] block">Concluídas</span>
            <div className="text-[26px] font-bold text-white mt-0.5 leading-none">
              {doneCount}
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-[14px] panel min-w-[90px] shadow-sm">
            <span className="text-[11px] font-medium text-[#8b8b90] block">Dias restantes</span>
            <div className="text-[26px] font-bold text-white mt-0.5 leading-none">
              {Math.max(0, diffDays(todayIso(), project.dueDate))}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Overview and Milestones */}
        <div className="lg:col-span-6 space-y-5">
          {/* Card: Overview */}
          <div className="p-5 rounded-[16px] panel shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-white">Visão geral</h3>

            {/* Lead & Status sub-boxes */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-[12px] panel-inset">
                <span className="text-[10px] font-medium text-[#8b8b90] block mb-1">Líder</span>
                <div
                  onClick={() => openMemberModal(leadMember.id)}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <img
                    src={leadMember.avatar}
                    alt={leadMember.name}
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-white/10"
                  />
                  <span className="text-xs font-bold text-blue-400 truncate">{leadMember.name}</span>
                </div>
              </div>

              <div className="p-3 rounded-[12px] panel-inset">
                <span className="text-[10px] font-medium text-[#8b8b90] block mb-1">Status</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  <span className="text-xs font-semibold text-white">{statusLabel(project.status)}</span>
                </div>
              </div>
            </div>

            {/* Timeline Slider with floating "Today" pill */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-[#8b8b90] mb-2.5">
                <div>
                  <span className="text-[10px] text-[#8b8b90]/70 block">Início</span>
                  <span className="font-bold text-white">{project.startDate ? formatDueLabel(project.startDate) : '—'}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#8b8b90]/70 block">Prazo</span>
                  <span className="font-bold text-white">{formatDueLabel(project.dueDate)}</span>
                </div>
              </div>

              {/* Slider Track with Milestone Dots and floating Today tag */}
              <div className="relative py-4">
                {/* Floating "Today" Pill */}
                <div
                  className="absolute -top-1 z-10 flex flex-col items-center pointer-events-none transform -translate-x-1/2"
                  style={{ left: '46%' }}
                >
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white text-neutral-900 shadow-md">
                    Hoje
                  </span>
                  <span className="w-0.5 h-3 bg-white" />
                </div>

                {/* Background track */}
                <div className="w-full h-1.5 rounded-full bg-white/10 relative overflow-visible">
                  <div
                    className="h-full rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6]"
                    style={{ width: '46%' }}
                  />

                  {/* Dot at start */}
                  <div
                    className="absolute top-1/2 left-0 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-[#131417] transform -translate-y-1/2"
                  />

                  {/* Milestone dot 1 */}
                  <div
                    className="absolute top-1/2 w-2 h-2 rounded-full bg-blue-400 ring-2 ring-[#131417] transform -translate-y-1/2"
                    style={{ left: '16%' }}
                  />

                  {/* Milestone dot 2 */}
                  <div
                    className="absolute top-1/2 w-2 h-2 rounded-full bg-blue-400 ring-2 ring-[#131417] transform -translate-y-1/2"
                    style={{ left: '58%' }}
                  />

                  {/* Milestone dot 3 */}
                  <div
                    className="absolute top-1/2 w-2 h-2 rounded-full bg-white/30 ring-2 ring-[#131417] transform -translate-y-1/2"
                    style={{ left: '72%' }}
                  />

                  {/* Dot at end */}
                  <div
                    className="absolute top-1/2 right-0 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-[#131417] transform -translate-y-1/2"
                  />
                </div>
              </div>
            </div>

            {/* People Section */}
            <div className="pt-2 border-t border-white/[0.04] space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Pessoas</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white/[0.08] text-[#8b8b90]">
                  {displayedMembers.length}
                </span>
              </div>

              {/* 2-Column Grid of Members */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {displayedMembers.map((member: any) => {
                  const statusDot = getStatusDot(member.status);
                  const displayRole = member.role || (member.status === 'online' ? 'Online' : 'Equipe');

                  return (
                    <div
                      key={member.id}
                      onClick={() => openMemberModal(member.id)}
                      className="flex items-center gap-2.5 p-2 rounded-[10px] hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      <div className="relative shrink-0">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${statusDot} ring-1 ring-[#131417]`}
                        />
                      </div>
                      <div className="truncate">
                        <h5 className="text-xs font-bold text-white truncate leading-tight">
                          {member.name}
                        </h5>
                        <p className="text-[11px] text-[#8b8b90] truncate leading-tight mt-0.5">
                          {displayRole}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card: Milestones */}
          <div className="p-5 rounded-[16px] panel shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Marcos</h3>
              <p className="text-xs text-[#8b8b90] mt-0.5">1 de 4 atingidos</p>
            </div>

            {/* Vertical Stepper List */}
            <div className="space-y-3 pt-1">
              {defaultMilestones.map((ms) => {
                const isDone = ms.status === 'done';
                const isNext = ms.status === 'next';

                return (
                  <div key={ms.id} className="flex items-start gap-3 relative group">
                    <div className="shrink-0 mt-0.5">
                      {isDone ? (
                        <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-sm">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      ) : isNext ? (
                        <div className="w-4 h-4 rounded-full border-2 border-blue-400 bg-blue-500/20 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-white/20 bg-white/5" />
                      )}
                    </div>

                    <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                      <div>
                        <h4
                          className={`text-xs font-bold truncate leading-tight ${
                            isDone ? 'text-white' : isNext ? 'text-white' : 'text-[#8b8b90]'
                          }`}
                        >
                          {ms.title}
                        </h4>
                        <p className="text-[11px] text-[#8b8b90]/70 mt-0.5 leading-tight">
                          {ms.date}
                        </p>
                      </div>

                      {isNext && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                          Próximo
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Burn-up Chart and Tasks */}
        <div className="lg:col-span-6 space-y-5">
          {/* Card: Burn-up */}
          <div className="p-5 rounded-[16px] panel shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white">Progresso acumulado</h3>
                  <ArrowUpRight size={14} className="text-[#8b8b90]" />
                </div>
                <p className="text-xs text-[#8b8b90] mt-0.5">
                  Tarefas concluídas em relação ao total, ao longo do projeto
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-[#8b8b90] pt-1">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-0.5 bg-blue-400 rounded-full" />
                <span className="text-[11px] font-medium text-white">Concluídas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-0.5 border-t border-dashed border-white/40" />
                <span className="text-[11px] font-medium text-[#8b8b90]">Total</span>
              </div>
            </div>

            {/* SVG Burn-up Chart */}
            <div className="pt-2 w-full p-3 rounded-[12px] panel-inset">
              <div className="relative w-full h-44">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 520 180">
                  <defs>
                    <linearGradient id="tideBurnupGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  <line x1="50" y1="25" x2="510" y2="25" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                  <text x="42" y="29" fill="rgba(255,255,255,0.3)" fontSize="9" textAnchor="end" fontFamily="monospace">
                    5 tarefas
                  </text>

                  <line x1="50" y1="75" x2="510" y2="75" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                  <text x="42" y="79" fill="rgba(255,255,255,0.3)" fontSize="9" textAnchor="end" fontFamily="monospace">
                    3 tarefas
                  </text>

                  <line x1="50" y1="150" x2="510" y2="150" stroke="rgba(255,255,255,0.08)" />
                  <text x="42" y="154" fill="rgba(255,255,255,0.3)" fontSize="9" textAnchor="end" fontFamily="monospace">
                    0 tarefas
                  </text>

                  <path
                    d="M 60 150 L 95 150 L 130 125 L 165 125 L 200 100 L 235 100 L 270 75 L 500 75"
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />

                  <path
                    d="M 60 150 L 200 150 L 235 125 L 270 100 L 305 75 L 500 75 L 500 150 Z"
                    fill="url(#tideBurnupGrad)"
                  />

                  <path
                    d="M 60 150 L 200 150 L 235 125 L 270 100 L 305 75 L 500 75"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {[
                    { label: '19 set', x: 60 },
                    { label: '21 set', x: 95 },
                    { label: '24 set', x: 130 },
                    { label: '26 set', x: 165 },
                    { label: '29 set', x: 200 },
                    { label: '1 out', x: 235 },
                    { label: '4 out', x: 270 },
                    { label: '6 out', x: 305 },
                    { label: '9 out', x: 340 },
                    { label: '11 out', x: 375 },
                    { label: '14 out', x: 410 },
                    { label: '16 out', x: 445 },
                    { label: '19 out', x: 480 },
                  ].map((tick) => (
                    <text
                      key={tick.label}
                      x={tick.x}
                      y="168"
                      fill="rgba(255,255,255,0.3)"
                      fontSize="8.5"
                      textAnchor="middle"
                    >
                      {tick.label}
                    </text>
                  ))}
                </svg>
              </div>
            </div>
          </div>

          {/* Card: Tasks */}
          <div className="p-5 rounded-[16px] panel shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
              <div>
                <h3 className="text-sm font-bold text-white">Tarefas</h3>
                <p className="text-xs text-[#8b8b90] mt-0.5">
                  {openCount} abertas · {doneCount} concluídas
                </p>
              </div>

              <button
                onClick={() => openQuickAdd('task')}
                className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Nova tarefa</span>
              </button>
            </div>

            {/* To do Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#8b8b90]">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>A fazer</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-white/[0.08] text-[#8b8b90]">
                  {displayedTodoTasks.length}
                </span>
              </div>

              {displayedTodoTasks.length === 0 ? (
                <p className="text-xs text-[#8b8b90]/60 py-1.5 pl-3">Nada pendente.</p>
              ) : (
                <div className="space-y-2">
                  {displayedTodoTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => openTaskModal(t.id)}
                      className="p-3 rounded-[10px] bg-[#0d0e11] hover:bg-[#121316] border border-white/[0.04] flex items-center justify-between gap-3 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskComplete(t.id);
                          }}
                          className="w-4 h-4 rounded border border-white/30 flex items-center justify-center shrink-0 hover:border-white"
                        />
                        <span className="text-xs text-white truncate font-medium">{t.title}</span>
                      </div>
                      <span className="text-[10px] text-[#8b8b90] shrink-0">{formatDueLabel(t.dueDate)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* In progress Section */}
            <div className="space-y-2 pt-2 border-t border-white/[0.04]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#8b8b90]">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>Em andamento</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-white/[0.08] text-[#8b8b90]">
                  {displayedInProgressTasks.length}
                </span>
              </div>

              {displayedInProgressTasks.length === 0 ? (
                <p className="text-xs text-[#8b8b90]/60 py-1.5 pl-3">Nada por aqui.</p>
              ) : (
                <div className="space-y-2">
                  {displayedInProgressTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => openTaskModal(t.id)}
                      className="p-3 rounded-[10px] bg-[#0d0e11] hover:bg-[#121316] border border-white/[0.04] flex items-center justify-between gap-3 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskComplete(t.id);
                          }}
                          className="w-4 h-4 rounded border border-white/30 flex items-center justify-center shrink-0 hover:border-white"
                        />
                        <span className="text-xs text-white truncate font-medium">{t.title}</span>
                      </div>
                      <span className="text-[10px] text-[#8b8b90] shrink-0">{formatDueLabel(t.dueDate)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Done Section */}
            <div className="space-y-2 pt-2 border-t border-white/[0.04]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#8b8b90]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Concluídas</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-white/[0.08] text-[#8b8b90]">
                  {displayedDoneTasks.length}
                </span>
              </div>

              <div className="space-y-2">
                {displayedDoneTasks.map((task) => {
                  const assignee = members.find((m) => m.id === task.assigneeId) || {
                    name: 'Equipe',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                  };

                  return (
                    <div
                      key={task.id}
                      onClick={() => openTaskModal(task.id)}
                      className="p-3 rounded-[10px] bg-[#0d0e11] hover:bg-[#121316] border border-white/[0.04] flex items-center justify-between gap-3 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskComplete(task.id);
                          }}
                          className="w-4 h-4 rounded bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm"
                        >
                          <Check size={11} strokeWidth={3} />
                        </button>

                        <div className="truncate">
                          <h5 className="text-xs font-medium text-[#8b8b90] truncate line-through group-hover:text-white transition-colors">
                            {task.title}
                          </h5>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1 text-[10px] text-[#8b8b90]/70">
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: project.color }}
                              />
                              {project.name}
                            </span>
                            <span className="text-[10px] text-[#8b8b90]/70">
                              {task.priority === 'High' ? 'Alta' : task.priority === 'Low' ? 'Baixa' : 'Média'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <img
                        src={assignee.avatar}
                        alt={assignee.name}
                        title={assignee.name}
                        className="w-5 h-5 rounded-full object-cover ring-1 ring-white/10 shrink-0"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
