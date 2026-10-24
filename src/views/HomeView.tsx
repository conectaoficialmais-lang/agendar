import React, { useState } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Check,
  Video,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ACCENTS } from '../themeUtils';
import { greeting, longDateLabel, todayIso, formatDueLabel } from '../dateUtils';
import { statusLabel } from '../labels';
import { clickable } from '../a11y';

export const HomeView: React.FC = () => {
  const {
    tasks,
    projects,
    events,
    members,
    currentUser,
    toggleTaskComplete,
    openTaskModal,
    openQuickAdd,
    setActiveTab,
    preferences,
    focusDuration,
    focusRemaining,
    isFocusRunning,
    focusTaskId,
    focusedMinutesToday,
    focusSessionsToday,
    startFocus,
    pauseFocus,
    resetFocus,
    setFocusDurationMinutes,
    setFocusTaskId,
    openMemberModal,
    openProjectDetail,
    doneTodayCount,
    doneThisWeekCount,
    openTasksCount,
    overdueCount,
    getProjectStats,
  } = useApp();

  const [rightNowTab, setRightNowTab] = useState<'team' | 'activity'>('team');
  const currentAccent = ACCENTS[preferences.accent] || ACCENTS.blue;

  // Formatar tempo do cronômetro em mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Eventos de hoje (ordenados) e o próximo compromisso real do dia
  const TODAY = todayIso();
  const nowDecimalHour = new Date().getHours() + new Date().getMinutes() / 60;
  const todayEvents = events
    .filter((e) => e.date === TODAY)
    .sort((a, b) => a.startHour - b.startHour);
  // Próximo compromisso ainda não encerrado (um em andamento ainda conta).
  const isUpcoming = (e: (typeof todayEvents)[number]) =>
    e.startHour + e.durationMinutes / 60 > nowDecimalHour;
  const nextMeeting = todayEvents.find(isUpcoming);
  const otherTodayEvents = todayEvents.filter(
    (e) => e.id !== nextMeeting?.id && isUpcoming(e)
  );

  // Tarefas de hoje do usuário logado
  const todayTasks = tasks.filter(
    (t) => t.assigneeId === currentUser.id && t.dueDate === TODAY
  );
  const todayOpenCount = todayTasks.filter((t) => t.status !== 'done').length;

  // Metas diárias (alvos) e reuniões já realizadas hoje
  const DAILY_TASK_GOAL = 8;
  const DAILY_FOCUS_GOAL_H = 2;
  const meetingsDone = todayEvents.filter(
    (e) => e.startHour + e.durationMinutes / 60 <= nowDecimalHour
  ).length;
  const meetingsRatio = todayEvents.length > 0 ? meetingsDone / todayEvents.length : 0;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* ════════════════════════════════════
          HEADER / TOPO
          ════════════════════════════════════ */}
      <div className="space-y-4">
        <div>
          <h1 className="text-[38px] md:text-[42px] font-bold tracking-tight text-white leading-none">
            {greeting()}, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-[#8b8b90] text-sm mt-1.5 font-normal">
            {longDateLabel()} · {todayEvents.length} reuniões e {todayOpenCount} tarefas restantes hoje
          </p>
        </div>

        {/* Linha com 4 Mini Stat Tiles e Botões de Ação */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          {/* 4 Mini Stat Tiles */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
            <div className="px-4 py-2.5 rounded-[14px] panel min-w-[90px] shadow-sm">
              <span className="text-[11px] font-medium text-[#8b8b90] block">Concluídas</span>
              <div className="text-[26px] font-bold text-white mt-0.5 leading-none">
                {doneTodayCount}/{DAILY_TASK_GOAL}
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-[14px] panel min-w-[90px] shadow-sm">
              <span className="text-[11px] font-medium text-[#8b8b90] block">Foco hoje</span>
              <div className="text-[26px] font-bold text-white mt-0.5 leading-none">
                {(focusedMinutesToday / 60).toFixed(1)}h
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-[14px] panel min-w-[90px] shadow-sm">
              <span className="text-[11px] font-medium text-[#8b8b90] block">Em aberto</span>
              <div className="text-[26px] font-bold text-white mt-0.5 leading-none">
                {openTasksCount}
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-[14px] panel min-w-[90px] shadow-sm">
              <span className="text-[11px] font-medium text-[#8b8b90] block">Reuniões</span>
              <div className="text-[26px] font-bold text-white mt-0.5 leading-none">
                {todayEvents.length}
              </div>
            </div>
          </div>

          {/* Botões de Ação na Direita */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('calendar')}
              className="px-4 py-2 rounded-full text-xs font-medium text-[#8b8b90] hover:text-white bg-[#131417] hover:bg-white/[0.08] border border-white/[0.06] transition-all flex items-center gap-2"
            >
              <Clock size={13} className="text-[var(--accent)]" />
              <span>Próximo: {nextMeeting ? nextMeeting.startTime : '—'}</span>
            </button>

            <button
              onClick={() => openQuickAdd('task')}
              className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-white/[0.1] hover:bg-white/[0.16] border border-white/[0.1] shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus size={14} />
              <span>Nova tarefa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Principal de 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Coluna Esquerda (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card dos Anéis de Atividade */}
          <div className="p-5 rounded-[16px] panel shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Hoje</h3>
                <p className="text-xs text-[#8b8b90]">Complete seus anéis de meta diária</p>
              </div>
              <span className="accent-chip text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                {Math.round(((doneTodayCount / DAILY_TASK_GOAL) * 0.4 + Math.min(1, focusedMinutesToday / (DAILY_FOCUS_GOAL_H * 60)) * 0.4 + meetingsRatio * 0.2) * 100)}% geral
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-[12px] panel-inset">
              {/* SVG dos Anéis Concêntricos */}
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  {/* Anel Externo: Tarefas */}
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    stroke="var(--accent)"
                    strokeWidth="8"
                    strokeDasharray="301.59"
                    strokeDashoffset={301.59 * (1 - Math.min(1, doneTodayCount / DAILY_TASK_GOAL))}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-700 ease-out"
                  />

                  {/* Anel Médio: Foco */}
                  <circle
                    cx="60"
                    cy="60"
                    r="36"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="36"
                    stroke="#f97316"
                    strokeWidth="8"
                    strokeDasharray="226.19"
                    strokeDashoffset={226.19 * (1 - Math.min(1, focusedMinutesToday / (DAILY_FOCUS_GOAL_H * 60)))}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-700 ease-out"
                  />

                  {/* Anel Interno: Reuniões */}
                  <circle
                    cx="60"
                    cy="60"
                    r="24"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="24"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeDasharray="150.79"
                    strokeDashoffset={
                      150.79 * (1 - meetingsRatio)
                    }
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <Sparkles size={18} className="text-[#8b8b90] mb-0.5" />
                </div>
              </div>

              {/* Legenda dos Anéis */}
              <div className="flex-1 w-full space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
                    <span className="text-white font-medium">Tarefas</span>
                  </div>
                  <span className="font-bold text-white">{doneTodayCount}/{DAILY_TASK_GOAL} concluídas</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" />
                    <span className="text-white font-medium">Foco</span>
                  </div>
                  <span className="font-bold text-white">
                    {(focusedMinutesToday / 60).toFixed(1)}h / {DAILY_FOCUS_GOAL_H.toFixed(1)}h
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                    <span className="text-white font-medium">Reuniões</span>
                  </div>
                  <span className="font-bold text-white">{meetingsDone}/{todayEvents.length} realizadas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Foco — Cronômetro Pomodoro */}
          <div className="p-5 rounded-[16px] panel shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Foco</h3>
                <p className="text-xs text-[#8b8b90]">Trabalho focado com cronômetro integrado</p>
              </div>

              {/* Seletor de Duração em pílula */}
              <div className="flex items-center p-1 rounded-full panel-inset">
                {[15, 25, 50].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setFocusDurationMinutes(mins)}
                    className={`chip ${Math.round(focusDuration / 60) === mins ? 'chip-active' : ''}`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Display do Timer & Controles */}
            <div className="p-4 rounded-[12px] panel-inset flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-4xl md:text-5xl font-extrabold tracking-tight text-white font-mono leading-none">
                  {formatTime(focusRemaining)}
                </div>
                <span className="text-[11px] font-medium text-[#8b8b90] uppercase tracking-wider mt-2 block">
                  {isFocusRunning ? 'Em Foco · Trabalho Profundo' : 'Pronto para começar'}
                </span>
              </div>

              {/* Focar em */}
              <div className="flex-1 max-w-xs">
                <label className="text-[11px] text-[#8b8b90] block mb-1">Focar na tarefa</label>
                <select
                  value={focusTaskId || ''}
                  onChange={(e) => setFocusTaskId(e.target.value || null)}
                  className="w-full text-xs px-3 py-2 rounded-xl panel text-white focus:outline-none cursor-pointer"
                >
                  <option value="">Nenhuma tarefa — apenas focar</option>
                  {tasks
                    .filter((t) => t.status !== 'done')
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                </select>
              </div>

              {/* Botões Play/Pause/Reset */}
              <div className="flex items-center gap-2 shrink-0">
                {!isFocusRunning ? (
                  <button
                    onClick={() => startFocus()}
                    className="p-3 rounded-full bg-white text-black hover:bg-gray-100 transition-all shadow-md flex items-center justify-center font-bold active:scale-95"
                    title="Iniciar foco"
                  >
                    <Play size={16} className="fill-current ml-0.5" />
                  </button>
                ) : (
                  <button
                    onClick={pauseFocus}
                    className="p-3 rounded-full bg-amber-500 text-black hover:bg-amber-400 transition-all shadow-md flex items-center justify-center font-bold active:scale-95"
                    title="Pausar foco"
                  >
                    <Pause size={16} className="fill-current" />
                  </button>
                )}

                <button
                  onClick={resetFocus}
                  className="p-3 rounded-full bg-white/[0.06] text-[#8b8b90] hover:text-white hover:bg-white/[0.1] border border-white/[0.06] transition-all"
                  title="Reiniciar cronômetro"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Visão Geral dos Projetos */}
          <div className="p-5 rounded-[16px] panel shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Projetos em andamento</h3>
                <p className="text-xs text-[#8b8b90]">Clique em qualquer card para ver especificações completas</p>
              </div>
              <button
                onClick={() => setActiveTab('projects')}
                className="text-xs text-[var(--accent)] hover:opacity-80 font-medium flex items-center gap-1 transition-opacity"
              >
                Ver todos
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-2.5">
              {projects.slice(0, 5).map((proj) => {
                const stats = getProjectStats(proj.id);
                const progress = Math.max(stats.progress, proj.nextMilestone.progress);

                return (
                  <div
                    key={proj.id}
                    {...clickable(() => {
                      openProjectDetail(proj.id);
                      setActiveTab('projects');
                    })}
                    className="p-3.5 rounded-[12px] panel-inset panel-hover transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 shadow-sm font-bold text-xs"
                        style={{ backgroundColor: `${proj.color}20`, color: proj.color, border: `1px solid ${proj.color}35` }}
                      >
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: proj.color }} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white group-hover:text-[var(--accent)] transition-colors truncate">
                          {proj.name}
                        </h4>
                        <p className="text-[11px] text-[#8b8b90] truncate mt-0.5">
                          {statusLabel(proj.status)} · {formatDueLabel(proj.dueDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* Barra de Progresso */}
                      <div className="w-24 sm:w-28 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: proj.color,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-white w-8 text-right font-mono">
                        {progress}%
                      </span>

                      {/* Avatares */}
                      <div className="flex -space-x-1.5 shrink-0">
                        {proj.memberIds.slice(0, 3).map((id) => {
                          const m = members.find((mm) => mm.id === id);
                          if (!m) return null;
                          return (
                            <img
                              key={id}
                              src={m.avatar}
                              alt={m.name}
                              className="w-5 h-5 rounded-full object-cover ring-2 ring-[#0d0e11]"
                            />
                          );
                        })}
                        {proj.memberIds.length > 3 && (
                          <span className="w-5 h-5 rounded-full bg-white/10 ring-2 ring-[#0d0e11] text-[9px] font-bold text-white/80 flex items-center justify-center">
                            +{proj.memberIds.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Coluna Direita (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Minhas Tarefas — Para hoje e atrasadas */}
          <div className="p-5 rounded-[16px] panel shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Minhas tarefas</h3>
                <p className="text-xs text-[#8b8b90]">Para hoje e prioridades</p>
              </div>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs text-[var(--accent)] hover:opacity-80 font-medium flex items-center gap-1 transition-opacity"
              >
                Todas
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-2">
              {todayTasks.slice(0, 6).map((task) => {
                const proj = projects.find((p) => p.id === task.projectId);
                const isDone = task.status === 'done';

                return (
                  <div
                    key={task.id}
                    className="p-3 rounded-[12px] panel-inset panel-hover transition-all flex items-start gap-3 group"
                  >
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      style={isDone ? { background: 'var(--accent)', color: 'var(--accent-ink)' } : undefined}
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center transition-all shrink-0 ${
                        isDone
                          ? ''
                          : 'border border-white/30 group-hover:border-white/60 text-transparent'
                      }`}
                      title={isDone ? 'Concluída' : 'Marcar como concluída'}
                    >
                      <Check size={11} strokeWidth={3} />
                    </button>

                    <div
                      {...clickable(() => openTaskModal(task.id))}
                      className="flex-1 cursor-pointer min-w-0"
                    >
                      <h4
                        className={`text-xs font-semibold truncate ${
                          isDone ? 'line-through text-[#8b8b90]' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </h4>

                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {proj && (
                          <span className="flex items-center gap-1 text-[10px] text-[#8b8b90]">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: proj.color }}
                            />
                            {proj.name}
                          </span>
                        )}
                        <span className="text-[10px] text-[#8b8b90]">{formatDueLabel(task.dueDate)}</span>
                        {task.priority === 'Urgent' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            P Urgente
                          </span>
                        )}
                        {task.priority === 'High' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Alta
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agenda de Reuniões */}
          <div className="p-5 rounded-[16px] panel shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Reuniões de hoje</h3>
                <p className="text-xs text-[#8b8b90]">{todayEvents.length} compromissos agendados</p>
              </div>
              <button
                onClick={() => setActiveTab('calendar')}
                className="text-xs text-[var(--accent)] hover:opacity-80 font-medium flex items-center gap-1 transition-opacity"
              >
                Calendário
                <ChevronRight size={14} />
              </button>
            </div>

            {nextMeeting ? (
              <div className="p-3.5 rounded-[12px] panel-inset space-y-3">
                <div className="flex items-center justify-between">
                  <span className="accent-chip text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    A seguir · {nextMeeting.startTime}
                  </span>
                  <span className="text-[11px] text-[#8b8b90]">{nextMeeting.durationMinutes} min</span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white">{nextMeeting.title}</h4>
                  <p className="text-[11px] text-[#8b8b90] mt-0.5">
                    com {members.filter((m) => nextMeeting.attendeeIds.includes(m.id)).map((m) => m.name).join(', ') || 'Equipe'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex -space-x-1.5">
                    {nextMeeting.attendeeIds.slice(0, 4).map((id) => {
                      const m = members.find((mm) => mm.id === id);
                      if (!m) return null;
                      return (
                        <img
                          key={id}
                          src={m.avatar}
                          alt={m.name}
                          className="w-5 h-5 rounded-full object-cover ring-2 ring-[#0d0e11]"
                        />
                      );
                    })}
                  </div>

                  <a
                    href="#join"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Entrando na chamada de vídeo...');
                    }}
                    className="btn-accent px-3 py-1 text-xs"
                  >
                    <Video size={12} />
                    <span>Entrar</span>
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#8b8b90] py-4 text-center">Nenhuma reunião restante hoje.</p>
            )}

            {otherTodayEvents.length > 0 && (
              <div className="space-y-2 pt-1">
                {otherTodayEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2.5 rounded-[10px] panel-inset flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{evt.title}</span>
                      <span className="text-[11px] text-[#8b8b90]">{evt.startTime}</span>
                    </div>
                    <span className="text-[10px] text-[#8b8b90]">{evt.durationMinutes} min</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
