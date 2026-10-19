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
      title: 'Offline cache schema & migrations',
      projectId: project.id,
      status: 'done',
      priority: 'Medium',
      dueDate: '2026-10-06',
      dueDisplay: 'Oct 6',
      assigneeId: 'user-kwame',
      subtasks: [],
      comments: [],
    },
    {
      id: 'tide-task-2',
      title: 'Touch targets audit for bottom navigation',
      projectId: project.id,
      status: 'done',
      priority: 'Low',
      dueDate: '2026-10-04',
      dueDisplay: 'Oct 4',
      assigneeId: 'user-elise',
      subtasks: [],
      comments: [],
    },
    {
      id: 'tide-task-3',
      title: 'Onboarding illustration assets',
      projectId: project.id,
      status: 'done',
      priority: 'High',
      dueDate: '2026-09-29',
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
  const projectMembers = members.filter((m) => project.memberIds.includes(m.id));
  // Se for Tide e a lista estiver curta, garantir os 6 membros da foto
  const tideMembers = [
    members.find((m) => m.name.includes('Kwame')) || {
      id: 'user-kwame',
      name: 'Kwame Asante',
      role: 'Lead · In a meeting',
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
      role: 'In focus',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      status: 'focus',
    },
    members.find((m) => m.name.includes('Malik')) || {
      id: 'user-malik',
      name: 'Malik Johnson',
      role: 'Away',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      status: 'offline',
    },
    members.find((m) => m.id === currentUser.id) || {
      id: 'user-lin',
      name: 'Lin Zhao',
      role: 'Online',
      avatar: currentUser.avatar,
      status: 'online',
    },
  ];

  const displayedMembers = isTide ? tideMembers : projectMembers;

  // Marcos
  const defaultMilestones = isTide
    ? [
        {
          id: 'ms-1',
          title: 'Navigation prototype signed off',
          date: 'Sep 29 · Done',
          status: 'done' as const,
        },
        {
          id: 'ms-2',
          title: 'Offline sync in beta',
          date: 'Oct 25',
          status: 'next' as const,
        },
        {
          id: 'ms-3',
          title: 'App Store submission',
          date: 'Nov 15',
          status: 'pending' as const,
        },
        {
          id: 'ms-4',
          title: 'Public launch 3.0',
          date: 'Nov 28',
          status: 'pending' as const,
        },
      ]
    : project.milestones || [
        {
          id: 'ms-gen-1',
          title: 'Escopo inicial e kickoff',
          date: '10 Out · Concluído',
          status: 'done' as const,
        },
        {
          id: 'ms-gen-2',
          title: project.nextMilestone.title,
          date: project.nextMilestone.dueDisplay,
          status: 'next' as const,
        },
        {
          id: 'ms-gen-3',
          title: 'Deploy e entrega final',
          date: project.dueDisplay,
          status: 'pending' as const,
        },
      ];

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

  const Icon = getProjectIcon(project.icon);

  // Member status dot color
  const getStatusDot = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-400';
      case 'focus':
        return 'bg-purple-400';
      case 'meeting':
        return 'bg-amber-400';
      default:
        return 'bg-neutral-500';
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Top Header Row com Botão Voltar e Ações */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          {/* Circular Back Button */}
          <button
            onClick={closeProjectDetail}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all shrink-0 mt-1"
            title="Voltar para todos os projetos"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Project Icon */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0 mt-0.5"
            style={{
              backgroundColor: `${project.color}30`,
              color: project.color,
              boxShadow: `0 0 20px ${project.color}25`,
            }}
          >
            <Icon size={24} />
          </div>

          {/* Title & Description */}
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {project.name}
            </h1>
            <p className="text-white/60 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
              {project.description}
            </p>
          </div>
        </div>

        {/* Pinned / New Event Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
          {/* Pinned Button */}
          <button
            onClick={() => toggleProjectStar(project.id)}
            className="px-4 py-2 rounded-2xl text-xs font-semibold bg-[#161824]/90 hover:bg-white/15 border border-white/10 text-white/90 shadow-md backdrop-blur-xl transition-all flex items-center gap-1.5"
          >
            <Star size={13} className="fill-amber-400 text-amber-400" />
            <span>Pinned</span>
          </button>

          {/* New Event Button */}
          <button
            onClick={() => openQuickAdd('event')}
            className="px-4 py-2 rounded-2xl text-xs font-semibold bg-[#161824]/90 hover:bg-white/15 border border-white/10 text-white/90 shadow-md backdrop-blur-xl transition-all flex items-center gap-1.5"
          >
            <Calendar size={13} className="text-white/70" />
            <span>New event</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="p-4 rounded-3xl bg-[#141622]/70 backdrop-blur-xl border border-white/10 shadow-lg">
          <span className="text-[11px] font-medium text-white/50 block">Progress</span>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            {progressPercent}%
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#141622]/70 backdrop-blur-xl border border-white/10 shadow-lg">
          <span className="text-[11px] font-medium text-white/50 block">Open tasks</span>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            {openCount}
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#141622]/70 backdrop-blur-xl border border-white/10 shadow-lg">
          <span className="text-[11px] font-medium text-white/50 block">Done</span>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            {doneCount}
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#141622]/70 backdrop-blur-xl border border-white/10 shadow-lg">
          <span className="text-[11px] font-medium text-white/50 block">Days left</span>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            {project.daysLeft || 41}
          </div>
        </div>
      </div>

      {/* Two Column Layout exactly matching the screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Overview and Milestones */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card: Overview */}
          <div className="p-6 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl space-y-6">
            <h3 className="text-base font-bold text-white">Overview</h3>

            {/* Lead & Status sub-boxes */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] font-medium text-white/40 block mb-1.5">Lead</span>
                <div
                  onClick={() => openMemberModal(leadMember.id)}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <img
                    src={leadMember.avatar}
                    alt={leadMember.name}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20"
                  />
                  <span className="text-xs font-bold text-blue-400 truncate">{leadMember.name}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] font-medium text-white/40 block mb-1.5">Status</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  <span className="text-xs font-semibold text-white/90">In progress</span>
                </div>
              </div>
            </div>

            {/* Timeline Slider with floating "Today" pill */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-white/70 mb-3">
                <div>
                  <span className="text-[10px] text-white/40 block">Started</span>
                  <span className="font-bold text-white">{project.startDisplay || 'Sep 19'}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-white/40 block">Due</span>
                  <span className="font-bold text-white">{project.dueDisplay || 'Nov 28'}</span>
                </div>
              </div>

              {/* Slider Track with Milestone Dots and floating Today tag */}
              <div className="relative py-4">
                {/* Floating "Today" Pill */}
                <div
                  className="absolute -top-1 z-10 flex flex-col items-center pointer-events-none transform -translate-x-1/2"
                  style={{ left: '46%' }}
                >
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white text-neutral-900 shadow-lg">
                    Today
                  </span>
                  <span className="w-0.5 h-3 bg-white" />
                </div>

                {/* Background track */}
                <div className="w-full h-1.5 rounded-full bg-white/10 relative overflow-visible">
                  {/* Active progress track */}
                  <div
                    className="h-full rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6]"
                    style={{ width: '46%' }}
                  />

                  {/* Dot at start */}
                  <div
                    className="absolute top-1/2 left-0 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-[#141622] transform -translate-y-1/2"
                  />

                  {/* Milestone dot 1 */}
                  <div
                    className="absolute top-1/2 w-2.5 h-2.5 rounded-full bg-blue-400 ring-2 ring-[#141622] transform -translate-y-1/2"
                    style={{ left: '16%' }}
                  />

                  {/* Milestone dot 2 */}
                  <div
                    className="absolute top-1/2 w-2.5 h-2.5 rounded-full bg-blue-400 ring-2 ring-[#141622] transform -translate-y-1/2"
                    style={{ left: '58%' }}
                  />

                  {/* Milestone dot 3 */}
                  <div
                    className="absolute top-1/2 w-2.5 h-2.5 rounded-full bg-white/40 ring-2 ring-[#141622] transform -translate-y-1/2"
                    style={{ left: '72%' }}
                  />

                  {/* Dot at end */}
                  <div
                    className="absolute top-1/2 right-0 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-[#141622] transform -translate-y-1/2"
                  />
                </div>
              </div>
            </div>

            {/* People Section */}
            <div className="pt-2 border-t border-white/5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">People</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white/10 text-white/60">
                  {displayedMembers.length}
                </span>
              </div>

              {/* 2-Column Grid of Members exactly as in the photo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displayedMembers.map((member: any) => {
                  const statusDot = getStatusDot(member.status);
                  const displayRole = member.role || (member.status === 'online' ? 'Online' : 'Team');

                  return (
                    <div
                      key={member.id}
                      onClick={() => openMemberModal(member.id)}
                      className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="relative shrink-0">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-white/15"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${statusDot} ring-1 ring-[#141622]`}
                        />
                      </div>
                      <div className="truncate">
                        <h5 className="text-xs font-bold text-white truncate leading-tight">
                          {member.name}
                        </h5>
                        <p className="text-[11px] text-white/50 truncate leading-tight mt-0.5">
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
          <div className="p-6 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Milestones</h3>
              <p className="text-xs text-white/50 mt-0.5">1 of 4 reached</p>
            </div>

            {/* Vertical Stepper List */}
            <div className="space-y-4 pt-2">
              {defaultMilestones.map((ms, index) => {
                const isDone = ms.status === 'done';
                const isNext = ms.status === 'next';

                return (
                  <div key={ms.id} className="flex items-start gap-3.5 relative group">
                    {/* Stepper icon */}
                    <div className="shrink-0 mt-0.5">
                      {isDone ? (
                        <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      ) : isNext ? (
                        <div className="w-5 h-5 rounded-full border-2 border-blue-400 bg-blue-500/20 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-white/20 bg-white/5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                      <div>
                        <h4
                          className={`text-xs font-bold truncate leading-tight ${
                            isDone ? 'text-white' : isNext ? 'text-white' : 'text-white/60'
                          }`}
                        >
                          {ms.title}
                        </h4>
                        <p className="text-[11px] text-white/40 mt-0.5 leading-tight">
                          {ms.date}
                        </p>
                      </div>

                      {isNext && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                          Next
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
        <div className="lg:col-span-6 space-y-6">
          {/* Card: Burn-up */}
          <div className="p-6 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-bold text-white">Burn-up</h3>
                  <ArrowUpRight size={15} className="text-white/40" />
                </div>
                <p className="text-xs text-white/50 mt-0.5">
                  Tasks done against the total, over the project's life
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-white/70 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-4 h-0.5 bg-blue-400 rounded-full" />
                <span className="text-[11px] font-medium">Done</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-0.5 border-t border-dashed border-white/40" />
                <span className="text-[11px] font-medium text-white/50">Total</span>
              </div>
            </div>

            {/* SVG Burn-up Chart matching screenshot exactly */}
            <div className="pt-2 w-full">
              <div className="relative w-full h-52">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 520 180">
                  <defs>
                    <linearGradient id="tideBurnupGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal dotted grid lines */}
                  {/* 5 tasks (top) */}
                  <line x1="50" y1="25" x2="510" y2="25" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                  <text x="42" y="29" fill="rgba(255,255,255,0.35)" fontSize="9" textAnchor="end" fontFamily="monospace">
                    5 tasks
                  </text>

                  {/* 3 tasks (middle) */}
                  <line x1="50" y1="75" x2="510" y2="75" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                  <text x="42" y="79" fill="rgba(255,255,255,0.35)" fontSize="9" textAnchor="end" fontFamily="monospace">
                    3 tasks
                  </text>

                  {/* 0 tasks (bottom) */}
                  <line x1="50" y1="150" x2="510" y2="150" stroke="rgba(255,255,255,0.1)" />
                  <text x="42" y="154" fill="rgba(255,255,255,0.35)" fontSize="9" textAnchor="end" fontFamily="monospace">
                    0 tasks
                  </text>

                  {/* Dashed line: Total tasks */}
                  {/* Sep 19 (0) -> Sep 21 (0 to 1) -> Sep 24 (1 to 2) -> Sep 26 (2) -> Oct 1 (3) -> Oct 19 (3) */}
                  <path
                    d="M 60 150 L 95 150 L 130 125 L 165 125 L 200 100 L 235 100 L 270 75 L 500 75"
                    fill="none"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />

                  {/* Filled Area for Done */}
                  <path
                    d="M 60 150 L 200 150 L 235 125 L 270 100 L 305 75 L 500 75 L 500 150 Z"
                    fill="url(#tideBurnupGrad)"
                  />

                  {/* Solid Blue line: Done tasks */}
                  <path
                    d="M 60 150 L 200 150 L 235 125 L 270 100 L 305 75 L 500 75"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* X-axis labels */}
                  {[
                    { label: 'Sep 19', x: 60 },
                    { label: 'Sep 21', x: 95 },
                    { label: 'Sep 24', x: 130 },
                    { label: 'Sep 26', x: 165 },
                    { label: 'Sep 29', x: 200 },
                    { label: 'Oct 1', x: 235 },
                    { label: 'Oct 4', x: 270 },
                    { label: 'Oct 6', x: 305 },
                    { label: 'Oct 9', x: 340 },
                    { label: 'Oct 11', x: 375 },
                    { label: 'Oct 14', x: 410 },
                    { label: 'Oct 16', x: 445 },
                    { label: 'Oct 19', x: 480 },
                  ].map((tick) => (
                    <text
                      key={tick.label}
                      x={tick.x}
                      y="168"
                      fill="rgba(255,255,255,0.35)"
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
          <div className="p-6 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white">Tasks</h3>
                <p className="text-xs text-white/50 mt-0.5">
                  {openCount} open · {doneCount} done
                </p>
              </div>

              {/* + Add task button */}
              <button
                onClick={() => openQuickAdd('task')}
                className="px-4 py-2 rounded-2xl text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 shadow-md shadow-blue-500/30 transition-all flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Add task</span>
              </button>
            </div>

            {/* To do Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>To do</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-white/10 text-white/60">
                  {displayedTodoTasks.length}
                </span>
              </div>

              {displayedTodoTasks.length === 0 ? (
                <p className="text-xs text-white/40 py-2 pl-3">Nothing waiting.</p>
              ) : (
                <div className="space-y-2">
                  {displayedTodoTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => openTaskModal(t.id)}
                      className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 flex items-center justify-between gap-3 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskComplete(t.id);
                          }}
                          className="w-4 h-4 rounded-md border border-white/30 flex items-center justify-center shrink-0 hover:border-white"
                        />
                        <span className="text-xs text-white truncate font-medium">{t.title}</span>
                      </div>
                      <span className="text-[10px] text-white/40 shrink-0">{t.dueDisplay}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* In progress Section */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs font-bold text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>In progress</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-white/10 text-white/60">
                  {displayedInProgressTasks.length}
                </span>
              </div>

              {displayedInProgressTasks.length === 0 ? (
                <p className="text-xs text-white/40 py-2 pl-3">Nothing here.</p>
              ) : (
                <div className="space-y-2">
                  {displayedInProgressTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => openTaskModal(t.id)}
                      className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 flex items-center justify-between gap-3 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskComplete(t.id);
                          }}
                          className="w-4 h-4 rounded-md border border-white/30 flex items-center justify-center shrink-0 hover:border-white"
                        />
                        <span className="text-xs text-white truncate font-medium">{t.title}</span>
                      </div>
                      <span className="text-[10px] text-white/40 shrink-0">{t.dueDisplay}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Done Section */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs font-bold text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Done</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-white/10 text-white/60">
                  {displayedDoneTasks.length}
                </span>
              </div>

              <div className="space-y-2">
                {displayedDoneTasks.map((task) => {
                  const assignee = members.find((m) => m.id === task.assigneeId) || {
                    name: 'Team',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                  };

                  return (
                    <div
                      key={task.id}
                      onClick={() => openTaskModal(task.id)}
                      className="p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 flex items-center justify-between gap-3 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskComplete(task.id);
                          }}
                          className="w-5 h-5 rounded-lg bg-blue-500 border border-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/40"
                        >
                          <Check size={12} strokeWidth={3} />
                        </button>

                        <div className="truncate">
                          <h5 className="text-xs font-semibold text-white/90 truncate line-through group-hover:text-white transition-colors">
                            {task.title}
                          </h5>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1 text-[10px] text-white/50">
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: project.color }}
                              />
                              {project.name}
                            </span>
                            <span className="text-[10px] text-white/40">
                              {task.priority === 'High' ? 'Alta' : task.priority === 'Low' ? 'Baixa' : 'Média'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Assignee Avatar */}
                      <img
                        src={assignee.avatar}
                        alt={assignee.name}
                        title={assignee.name}
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-white/15 shrink-0"
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
