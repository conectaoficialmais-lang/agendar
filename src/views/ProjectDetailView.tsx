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
import { Project } from '../types';
import { formatDueLabel, diffDays, todayIso, addDays, shortDate } from '../dateUtils';
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
    openProjectDetail,
    toggleProjectStar,
    toggleTaskComplete,
    openTaskModal,
    openMemberModal,
    openQuickAdd,
  } = useApp();

  const project = projects.find((p) => p.id === projectId) || projects[0];

  // Tarefas REAIS deste projeto (nada de dados de exemplo injetados)
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const todoTasks = projectTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = projectTasks.filter((t) => t.status === 'in_progress' || t.status === 'in_review');
  const doneTasks = projectTasks.filter((t) => t.status === 'done');

  const openCount = todoTasks.length + inProgressTasks.length;
  const doneCount = doneTasks.length;
  const totalCount = projectTasks.length;
  // Progresso REAL: 0% num projeto sem tarefas (antes começava fixo em 50%).
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Líder do projeto
  const leadMember =
    members.find((m) => m.id === project.leadId) ||
    members.find((m) => m.id === currentUser.id) ||
    members[0];

  // Membros REAIS: líder + memberIds, sem duplicar, só os que existem.
  const memberIds = Array.from(
    new Set([project.leadId, ...(project.memberIds || [])].filter(Boolean))
  );
  const displayedMembers = memberIds
    .map((id) => members.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  // Marcos REAIS — vazio quando o projeto ainda não tem marcos (nada inventado).
  const milestones = project.milestones || [];
  const milestonesDone = milestones.filter((m) => m.status === 'done').length;

  // Hierarquia: subprojetos deste projeto + o projeto-pai (breadcrumb/navegação).
  const subprojects = projects.filter((p) => p.parentId === project.id);
  const parentProject = project.parentId
    ? projects.find((p) => p.id === project.parentId)
    : null;
  // Progresso de um projeto (para os cartões de subprojeto), a partir das tarefas.
  const projectProgress = (pid: string) => {
    const ts = tasks.filter((t) => t.projectId === pid);
    if (ts.length === 0) return 0;
    return Math.round((ts.filter((t) => t.status === 'done').length / ts.length) * 100);
  };

  // Linha do tempo REAL: início → prazo, com "Hoje" pela fração de tempo decorrida.
  const isoRe = /^\d{4}-\d{2}-\d{2}/;
  // Início = data informada do projeto; senão a 1ª atividade de tarefa; senão hoje
  // (projeto novo e vazio começa hoje). Nunca uma data inventada.
  const taskDateCandidates = projectTasks
    .flatMap((t) => [t.createdAt?.slice(0, 10), t.completedAt?.slice(0, 10)])
    .filter((d): d is string => !!d && isoRe.test(d));
  const earliestTaskDate = taskDateCandidates.length
    ? taskDateCandidates.reduce((m, d) => (diffDays(d, m) > 0 ? d : m))
    : null;
  const startIso = project.startDate || earliestTaskDate || todayIso();
  const dueIso = project.dueDate;
  const timelineSpan = Math.max(1, diffDays(startIso, dueIso));
  const elapsed = Math.min(Math.max(0, diffDays(startIso, todayIso())), timelineSpan);
  const todayPct = Math.round((elapsed / timelineSpan) * 100);
  const milestonePct = (dateStr: string): number | null => {
    if (!dateStr || !isoRe.test(dateStr)) return null;
    const off = Math.min(Math.max(0, diffDays(startIso, dateStr)), timelineSpan);
    return Math.round((off / timelineSpan) * 100);
  };

  // Progresso acumulado REAL (burn-up) a partir das datas de conclusão das tarefas.
  const doneDates = doneTasks
    .map((t) => (t.completedAt || '').slice(0, 10))
    .filter((d) => isoRe.test(d))
    .sort();

  const buildBurnup = () => {
    if (totalCount === 0) return null;
    const endIso = todayIso();
    // Eixo começa na data mais antiga entre o início e a 1ª conclusão.
    let startAxis = [startIso, ...doneDates].reduce(
      (m, d) => (diffDays(d, m) > 0 ? d : m),
      endIso
    );
    if (diffDays(startAxis, endIso) < 0) startAxis = endIso;
    let totalDays = diffDays(startAxis, endIso);
    if (totalDays < 1) {
      startAxis = addDays(endIso, -1);
      totalDays = 1;
    }
    const steps = Math.min(totalDays, 12);
    const pts: { iso: string; done: number }[] = [];
    for (let i = 0; i <= steps; i++) {
      const off = Math.round((totalDays * i) / steps);
      const iso = addDays(startAxis, off);
      const done = doneDates.filter((dd) => diffDays(dd, iso) >= 0).length;
      pts.push({ iso, done });
    }
    return { pts, yMax: Math.max(totalCount, 1) };
  };
  const burnup = buildBurnup();

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
              {parentProject && (
                <button
                  onClick={() => openProjectDetail(parentProject.id)}
                  className="flex items-center gap-1 text-xs font-semibold text-[var(--muted)] hover:text-[var(--accent)] transition-colors mb-1"
                >
                  <ChevronLeft size={12} />
                  <span className="truncate max-w-[220px]">{parentProject.name}</span>
                  <span className="text-[#8b8b90]/50">/ subprojeto</span>
                </button>
              )}
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
                  <span className="text-xs font-bold text-[var(--accent)] truncate">{leadMember.name}</span>
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
                  <span className="font-bold text-white">{formatDueLabel(startIso)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#8b8b90]/70 block">Prazo</span>
                  <span className="font-bold text-white">{formatDueLabel(project.dueDate)}</span>
                </div>
              </div>

              {/* Slider Track with Milestone Dots and floating Today tag */}
              <div className="relative py-4">
                {/* "Hoje" posicionado pela fração real de tempo decorrida */}
                <div
                  className="absolute -top-1 z-10 flex flex-col items-center pointer-events-none transform -translate-x-1/2"
                  style={{ left: `${todayPct}%` }}
                >
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white text-neutral-900 shadow-md">
                    Hoje
                  </span>
                  <span className="w-0.5 h-3 bg-white" />
                </div>

                {/* Background track */}
                <div className="w-full h-1.5 rounded-full bg-white/10 relative overflow-visible">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${todayPct}%`, background: 'var(--accent)', boxShadow: '0 0 12px var(--accent)' }}
                  />

                  {/* Início */}
                  <div
                    className="absolute top-1/2 left-0 w-2.5 h-2.5 rounded-full ring-2 ring-[#131417] transform -translate-y-1/2"
                    style={{ background: 'var(--accent)' }}
                  />

                  {/* Marcos reais com data — posicionados pela própria data */}
                  {milestones.map((ms) => {
                    const pct = milestonePct(ms.date);
                    if (pct === null) return null;
                    const reached = ms.status === 'done';
                    return (
                      <div
                        key={ms.id}
                        title={ms.title}
                        className="absolute top-1/2 w-2 h-2 rounded-full ring-2 ring-[#131417] transform -translate-y-1/2 -translate-x-1/2"
                        style={{
                          left: `${pct}%`,
                          background: reached
                            ? 'var(--accent)'
                            : 'color-mix(in srgb, var(--accent) 80%, white)',
                        }}
                      />
                    );
                  })}

                  {/* Prazo */}
                  <div
                    className="absolute top-1/2 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-[#131417] transform -translate-y-1/2"
                    style={{ background: 'color-mix(in srgb, var(--accent) 40%, white)' }}
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
              <p className="text-xs text-[#8b8b90] mt-0.5">
                {milestones.length === 0
                  ? 'Nenhum marco definido'
                  : `${milestonesDone} de ${milestones.length} atingidos`}
              </p>
            </div>

            {/* Lista vertical de marcos reais (ou estado vazio honesto) */}
            {milestones.length === 0 ? (
              <p className="text-xs text-[#8b8b90]/60 py-1.5">
                Este projeto ainda não tem marcos. Eles aparecem aqui conforme forem criados.
              </p>
            ) : (
            <div className="space-y-3 pt-1">
              {milestones.map((ms) => {
                const isDone = ms.status === 'done';
                const isNext = ms.status === 'next';

                return (
                  <div key={ms.id} className="flex items-start gap-3 relative group">
                    <div className="shrink-0 mt-0.5">
                      {isDone ? (
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shadow-sm" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>
                          <Check size={10} strokeWidth={3} />
                        </div>
                      ) : isNext ? (
                        <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ border: '2px solid color-mix(in srgb, var(--accent) 80%, white)', background: 'color-mix(in srgb, var(--accent) 20%, transparent)' }}>
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'color-mix(in srgb, var(--accent) 80%, white)' }} />
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
                          {isoRe.test(ms.date) ? formatDueLabel(ms.date) : ms.date}
                        </p>
                      </div>

                      {isNext && (
                        <span className="accent-chip px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">
                          Próximo
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>

          {/* Card: Subprojetos */}
          <div className="p-5 rounded-[16px] panel shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">Subprojetos</h3>
                <p className="text-xs text-[#8b8b90] mt-0.5">
                  {subprojects.length === 0
                    ? 'Divida este projeto em frentes menores'
                    : `${subprojects.length} ${subprojects.length === 1 ? 'subprojeto' : 'subprojetos'}`}
                </p>
              </div>
              <button
                onClick={() => openQuickAdd('project', project.id)}
                className="btn-accent px-3.5 py-1.5 text-xs shrink-0"
              >
                <Plus size={13} />
                <span>Novo subprojeto</span>
              </button>
            </div>

            {subprojects.length === 0 ? (
              <p className="text-xs text-[#8b8b90]/60 py-1.5">
                Nenhum subprojeto ainda. Crie frentes menores dentro deste projeto.
              </p>
            ) : (
              <div className="space-y-2">
                {subprojects.map((sp) => {
                  const pct = projectProgress(sp.id);
                  return (
                    <div
                      key={sp.id}
                      onClick={() => openProjectDetail(sp.id)}
                      className="p-3 rounded-[12px] panel-inset panel-hover cursor-pointer flex items-center gap-3 group"
                    >
                      <div
                        className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 text-xs font-bold"
                        style={{ backgroundColor: `${sp.color}20`, color: sp.color, border: `1px solid ${sp.color}35` }}
                      >
                        {sp.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-[var(--accent)] transition-colors">
                          {sp.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
                          </div>
                          <span className="text-[10px] font-semibold text-[#8b8b90] shrink-0">{pct}%</span>
                        </div>
                      </div>
                      <ArrowUpRight size={14} className="text-[#8b8b90] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}
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
                <span className="w-3.5 h-0.5 rounded-full" style={{ background: 'var(--accent)' }} />
                <span className="text-[11px] font-medium text-white">Concluídas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-0.5 border-t border-dashed border-white/40" />
                <span className="text-[11px] font-medium text-[#8b8b90]">Total</span>
              </div>
            </div>

            {/* Burn-up REAL — concluídas acumuladas x total, a partir das datas */}
            {burnup ? (
              <div className="pt-2 w-full p-3 rounded-[12px] panel-inset">
                <div className="relative w-full h-44">
                  {(() => {
                    const { pts, yMax } = burnup;
                    const n = pts.length;
                    const xAt = (i: number) => (n <= 1 ? 280 : 50 + (460 * i) / (n - 1));
                    const yAt = (v: number) => 150 - (125 * v) / yMax;
                    const line = pts
                      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(p.done).toFixed(1)}`)
                      .join(' ');
                    const area = `${line} L ${xAt(n - 1).toFixed(1)} 150 L ${xAt(0).toFixed(1)} 150 Z`;
                    const mid = Math.round(yMax / 2);
                    const yTicks = Array.from(new Set([0, mid, yMax])).sort((a, b) => a - b);
                    const labelEvery = Math.max(1, Math.ceil(n / 7));
                    return (
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 520 180">
                        <defs>
                          <linearGradient id="burnupGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {yTicks.map((v) => (
                          <g key={v}>
                            <line x1="50" y1={yAt(v)} x2="510" y2={yAt(v)} stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />
                            <text x="42" y={yAt(v) + 3} fill="rgba(255,255,255,0.3)" fontSize="9" textAnchor="end" fontFamily="monospace">
                              {v} {v === 1 ? 'tarefa' : 'tarefas'}
                            </text>
                          </g>
                        ))}

                        {/* Total (constante) — linha tracejada no topo */}
                        <line x1="50" y1={yAt(yMax)} x2="510" y2={yAt(yMax)} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="4 3" />

                        {/* Concluídas acumuladas */}
                        <path d={area} fill="url(#burnupGrad)" />
                        <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx={xAt(n - 1)} cy={yAt(pts[n - 1].done)} r="3.5" fill="var(--accent)" />

                        {pts.map((p, i) =>
                          i % labelEvery === 0 || i === n - 1 ? (
                            <text key={p.iso} x={xAt(i)} y="168" fill="rgba(255,255,255,0.3)" fontSize="8.5" textAnchor="middle">
                              {shortDate(p.iso)}
                            </text>
                          ) : null
                        )}
                      </svg>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="pt-2 w-full p-6 rounded-[12px] panel-inset text-center">
                <p className="text-xs text-[#8b8b90]/70 leading-relaxed">
                  Sem dados ainda. Crie e conclua tarefas para acompanhar o progresso acumulado ao longo do projeto.
                </p>
              </div>
            )}
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
                onClick={() => openQuickAdd('task', project.id)}
                className="btn-accent px-4 py-2 text-xs"
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
                  {todoTasks.length}
                </span>
              </div>

              {todoTasks.length === 0 ? (
                <p className="text-xs text-[#8b8b90]/60 py-1.5 pl-3">Nada pendente.</p>
              ) : (
                <div className="space-y-2">
                  {todoTasks.map((t) => (
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
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                <span>Em andamento</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-white/[0.08] text-[#8b8b90]">
                  {inProgressTasks.length}
                </span>
              </div>

              {inProgressTasks.length === 0 ? (
                <p className="text-xs text-[#8b8b90]/60 py-1.5 pl-3">Nada por aqui.</p>
              ) : (
                <div className="space-y-2">
                  {inProgressTasks.map((t) => (
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
                  {doneTasks.length}
                </span>
              </div>

              <div className="space-y-2">
                {doneTasks.length === 0 ? (
                  <p className="text-xs text-[#8b8b90]/60 py-1.5 pl-3">Nenhuma tarefa concluída ainda.</p>
                ) : null}
                {doneTasks.map((task) => {
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
                          style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
                          className="w-4 h-4 rounded flex items-center justify-center shrink-0 shadow-sm"
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
