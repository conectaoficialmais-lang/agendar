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

  // Eventos de hoje dinâmicos
  const todayEvents = events.filter((e) => e.date === '2026-10-19');
  const nextMeeting = todayEvents[0];
  const otherTodayEvents = todayEvents.slice(1);

  // Tarefas para hoje do usuário logado
  const todayTasks = tasks.filter(
    (t) =>
      t.assigneeId === currentUser.id &&
      (t.dueDisplay === 'Hoje' || t.dueDate === '2026-10-19' || t.dueDisplay === 'Today')
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Cabeçalho de Saudação */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Bom dia, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Segunda-feira, 19 de outubro · {todayEvents.length} reuniões e {openTasksCount} tarefas restantes hoje
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openQuickAdd('task')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-semibold text-white bg-gradient-to-r ${currentAccent.gradient} shadow-lg ${currentAccent.activeNavGlow} hover:brightness-110 active:scale-95 transition-all flex items-center gap-2`}
          >
            <Plus size={15} />
            <span>Nova tarefa</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-white/90 bg-white/10 hover:bg-white/15 border border-white/10 backdrop-blur-xl transition-all flex items-center gap-2"
          >
            <Clock size={15} className="text-blue-400" />
            <span>Próximo: 11:00</span>
          </button>
        </div>
      </div>

      {/* Mini Stat Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <div className="p-4 rounded-3xl bg-[#141622]/60 backdrop-blur-xl border border-white/10 shadow-lg glass-card-hover">
          <span className="text-xs text-white/50 block font-medium">Concluídas hoje</span>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            {doneTodayCount}/8
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#141622]/60 backdrop-blur-xl border border-white/10 shadow-lg glass-card-hover">
          <span className="text-xs text-white/50 block font-medium">Foco hoje</span>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            {(focusedMinutesToday / 60).toFixed(1)}h
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#141622]/60 backdrop-blur-xl border border-white/10 shadow-lg glass-card-hover">
          <span className="text-xs text-white/50 block font-medium">Atrasadas</span>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">{overdueCount}</div>
        </div>
      </div>

      {/* Grid de 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card dos Anéis de Atividade */}
          <div className="p-6 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Hoje</h3>
                <p className="text-xs text-white/50">Complete seus anéis de meta</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                {Math.round(((doneTodayCount / 8) * 0.4 + Math.min(1, focusedMinutesToday / 120) * 0.4 + 0.25 * 0.2) * 100)}% geral
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
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
                    stroke="#3b82f6"
                    strokeWidth="8"
                    strokeDasharray="301.59"
                    strokeDashoffset={301.59 * (1 - Math.min(1, doneTodayCount / 8))}
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
                    strokeDashoffset={226.19 * (1 - Math.min(1, focusedMinutesToday / 120))}
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
                      150.79 *
                      (1 -
                        (todayEvents.length > 0
                          ? Math.min(1, 1 / todayEvents.length)
                          : 0))
                    }
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <Sparkles size={18} className="text-white/60 mb-0.5" />
                </div>
              </div>

              {/* Legenda dos Anéis */}
              <div className="flex-1 w-full space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                    <span className="text-white/80 font-medium">Tarefas</span>
                  </div>
                  <span className="font-bold text-white">{doneTodayCount}/8 concluídas</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" />
                    <span className="text-white/80 font-medium">Foco</span>
                  </div>
                  <span className="font-bold text-white">
                    {(focusedMinutesToday / 60).toFixed(1)}h / 2.0h
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                    <span className="text-white/80 font-medium">Reuniões</span>
                  </div>
                  <span className="font-bold text-white">1/{todayEvents.length || 1} realizadas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Foco — Cronômetro Pomodoro */}
          <div className="p-6 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Foco</h3>
                <p className="text-xs text-white/50">A ilha mantém o tempo</p>
              </div>

              {/* Seletor de Duração */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10">
                {[15, 25, 50].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setFocusDurationMinutes(mins)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                      Math.round(focusDuration / 60) === mins
                        ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/20'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Display do Timer & Controles */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
              <div>
                <div className="text-4xl md:text-5xl font-extrabold tracking-tight text-white font-mono">
                  {formatTime(focusRemaining)}
                </div>
                <span className="text-xs font-medium text-white/40 uppercase tracking-widest mt-1 block">
                  {isFocusRunning ? 'Em Foco · Trabalho Profundo' : 'Pronto'}
                </span>
              </div>

              {/* Focar em */}
              <div className="flex-1 max-w-xs">
                <label className="text-[11px] text-white/40 block mb-1">Focar em</label>
                <select
                  value={focusTaskId || ''}
                  onChange={(e) => setFocusTaskId(e.target.value || null)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/90 focus:outline-none focus:border-white/20"
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

              {/* Botões Iniciar / Pausar */}
              <div className="flex items-center gap-2">
                {isFocusRunning ? (
                  <button
                    onClick={pauseFocus}
                    className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-white bg-amber-500/80 hover:bg-amber-500 shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Pause size={14} fill="currentColor" />
                    Pausar
                  </button>
                ) : (
                  <button
                    onClick={() => startFocus()}
                    className={`px-6 py-2.5 rounded-2xl text-xs font-semibold text-white bg-gradient-to-r ${currentAccent.gradient} shadow-lg ${currentAccent.activeNavGlow} hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5`}
                  >
                    <Play size={14} fill="currentColor" />
                    Iniciar foco
                  </button>
                )}

                <button
                  onClick={resetFocus}
                  className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-colors"
                  title="Reiniciar tempo"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Barra de Focado Hoje */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-white/60">Focado hoje</span>
                <span className="font-bold text-white">
                  {(focusedMinutesToday / 60).toFixed(1)}h · {focusSessionsToday} sessões
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (focusedMinutesToday / 120) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Próximo Compromisso (Up next) */}
          <div className="p-6 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Próximo compromisso</h3>
              <button
                onClick={() => setActiveTab('calendar')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
              >
                Calendário
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Card Destacado da Próxima Reunião */}
            {nextMeeting ? (
              <div className="p-4 rounded-2xl bg-blue-600/15 border border-blue-500/30 text-white shadow-lg relative overflow-hidden">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-200 mb-1.5">
                      em breve
                    </span>
                    <h4 className="text-base font-bold text-white">{nextMeeting.title}</h4>
                    <p className="text-xs text-blue-200/80 mt-0.5">
                      {nextMeeting.startTime} – {nextMeeting.endTime} · {nextMeeting.location}
                    </p>

                    {/* Participantes */}
                    <div className="flex items-center gap-1.5 mt-3">
                      <div className="flex -space-x-2">
                        {nextMeeting.attendeeIds.slice(0, 4).map((attId) => {
                          const att = members.find((m) => m.id === attId);
                          if (!att) return null;
                          return (
                            <img
                              key={att.id}
                              src={att.avatar}
                              alt={att.name}
                              className="w-6 h-6 rounded-full object-cover ring-2 ring-[#141622]"
                              title={att.name}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('calendar')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 shadow-md shadow-blue-500/30 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Video size={14} />
                    Entrar
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-xs text-white/50">
                Nenhuma reunião agendada para hoje.
              </div>
            )}

            {/* Demais itens da agenda do dia */}
            <div className="space-y-2 pt-2">
              {otherTodayEvents.length > 0 ? (
                otherTodayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => setActiveTab('calendar')}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-1 h-4 rounded-full bg-blue-400" />
                      <span className="text-white/90 font-medium">{ev.title}</span>
                    </div>
                    <span className="text-white/50 text-[11px]">{ev.startTime}</span>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-white/30 text-center py-1">
                  Não há outros eventos na agenda de hoje
                </p>
              )}
            </div>
          </div>

          {/* Visão Geral dos Projetos */}
          <div className="p-6 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Projetos</h3>
              <button
                onClick={() => setActiveTab('projects')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
              >
                Ver todos
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {projects.slice(0, 5).map((proj) => {
                const stats = getProjectStats(proj.id);

                return (
                  <div
                    key={proj.id}
                    onClick={() => {
                      openProjectDetail(proj.id);
                      setActiveTab('projects');
                    }}
                    className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md"
                        style={{ backgroundColor: `${proj.color}25`, color: proj.color }}
                      >
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: proj.color }} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{proj.name}</h4>
                        <p className="text-[11px] text-white/50">
                          {proj.status} · {proj.dueDisplay}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Barra de Progresso Dinâmica */}
                      <div className="w-24 sm:w-32 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(stats.progress, proj.nextMilestone.progress)}%`,
                            backgroundColor: proj.color,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-white w-8 text-right">
                        {Math.max(stats.progress, proj.nextMilestone.progress)}%
                      </span>

                      {/* Avatares */}
                      <div className="flex -space-x-1.5 shrink-0">
                        {members.slice(0, 2).map((m) => (
                          <img
                            key={m.id}
                            src={m.avatar}
                            alt={m.name}
                            className="w-5 h-5 rounded-full object-cover ring-1 ring-[#141622]"
                          />
                        ))}
                        <span className="w-5 h-5 rounded-full bg-white/10 ring-1 ring-[#141622] text-[9px] font-bold text-white/70 flex items-center justify-center">
                          +2
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Coluna Direita (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Minhas Tarefas — Para hoje e atrasadas */}
          <div className="p-6 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Minhas tarefas</h3>
                <p className="text-xs text-white/50">Para hoje e atrasadas</p>
              </div>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
              >
                Todas as tarefas
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
                    className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all flex items-start gap-3 group"
                  >
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center transition-all shrink-0 ${
                        isDone
                          ? 'bg-blue-500 text-white'
                          : 'border border-white/30 group-hover:border-white/60 text-transparent'
                      }`}
                      title={isDone ? 'Concluída' : 'Marcar como concluída'}
                    >
                      <Check size={12} strokeWidth={3} />
                    </button>

                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => openTaskModal(task.id)}
                    >
                      <h4
                        className={`text-xs font-semibold ${
                          isDone ? 'line-through text-white/40' : 'text-white/90'
                        }`}
                      >
                        {task.title}
                      </h4>

                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {proj && (
                          <span className="flex items-center gap-1 text-[10px] text-white/50">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: proj.color }}
                            />
                            {proj.name}
                          </span>
                        )}
                        <span className="text-[10px] text-white/40">{task.dueDisplay}</span>
                        {task.priority === 'Urgent' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            P Urgente
                          </span>
                        )}
                        {task.priority === 'High' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
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

          {/* Esta semana — Tarefas que a equipe concluiu */}
          <div className="p-6 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Esta semana</h3>
                <p className="text-xs text-white/50">Tarefas que a equipe concluiu</p>
              </div>
              <ArrowUpRight size={16} className="text-white/40" />
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">{doneThisWeekCount}</span>
                <span className="text-xs text-white/60 font-medium">concluídas até agora</span>
                <span className="text-xs font-bold text-emerald-400 ml-auto">+0% vs semana passada</span>
              </div>
            </div>

            {/* Mini Gráfico de Barras Seg–Dom */}
            <div className="pt-2">
              <div className="grid grid-cols-7 gap-2 items-end h-32 px-1">
                {[
                  { day: 'Seg', count: Math.max(2, doneTodayCount), isToday: true },
                  { day: 'Ter', count: 0, isToday: false },
                  { day: 'Qua', count: 0, isToday: false },
                  { day: 'Qui', count: 0, isToday: false },
                  { day: 'Sex', count: 0, isToday: false },
                  { day: 'Sáb', count: 0, isToday: false },
                  { day: 'Dom', count: 0, isToday: false },
                ].map((item) => (
                  <div key={item.day} className="flex flex-col items-center gap-2 h-full justify-end">
                    <div
                      className={`w-full rounded-2xl transition-all duration-500 ${
                        item.isToday
                          ? 'bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                          : 'bg-white/10'
                      }`}
                      style={{
                        height: item.count > 0 ? `${Math.min(100, (item.count / 6) * 100)}%` : '12%',
                        minHeight: '12px',
                      }}
                    />
                    <span
                      className={`text-[10px] font-medium ${
                        item.isToday ? 'text-white font-bold' : 'text-white/40'
                      }`}
                    >
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Agora mesmo: Equipe / Atividade */}
          <div className="p-6 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Agora mesmo</h3>

              {/* Alternador Equipe / Atividade */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
                <button
                  onClick={() => setRightNowTab('team')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    rightNowTab === 'team'
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  Equipe
                </button>
                <button
                  onClick={() => setRightNowTab('activity')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    rightNowTab === 'activity'
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  Atividade
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            {rightNowTab === 'team' ? (
              <div className="space-y-3">
                {members.slice(1, 6).map((m) => {
                  const statusDots = {
                    online: 'bg-emerald-400',
                    focus: 'bg-purple-400',
                    meeting: 'bg-amber-400',
                    offline: 'bg-neutral-500',
                  };

                  return (
                    <div
                      key={m.id}
                      onClick={() => openMemberModal(m.id)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <img
                            src={m.avatar}
                            alt={m.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10"
                          />
                          <span
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${
                              statusDots[m.status]
                            } ring-1 ring-[#141622]`}
                          />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">{m.name}</h4>
                          <p className="text-[11px] text-white/40">{m.statusText}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white/90">Kwame Asante</span>
                    <span className="text-[10px] text-white/40">15m atrás</span>
                  </div>
                  <p className="text-white/60 text-[11px]">
                    Concluiu a tarefa <span className="text-blue-300 font-medium">Construir fila inicial offline do Tide</span>
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white/90">Nia Okoro</span>
                    <span className="text-[10px] text-white/40">45m atrás</span>
                  </div>
                  <p className="text-white/60 text-[11px]">
                    Atualizou as especificações no <span className="text-pink-300 font-medium">Sistema de design Facet</span>
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white/90">Lin Zhao</span>
                    <span className="text-[10px] text-white/40">1h atrás</span>
                  </div>
                  <p className="text-white/60 text-[11px]">
                    Acumulou 2 sessões de foco (1.1h no total)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
