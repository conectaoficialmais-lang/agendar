import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  MapPin,
  Trash2,
  Check,
  CheckSquare,
  Clock,
  Sparkles,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ACCENTS } from '../themeUtils';

export const CalendarView: React.FC = () => {
  const {
    events,
    tasks,
    members,
    projects,
    openQuickAdd,
    preferences,
    toggleTaskComplete,
    deleteTask,
    deleteCalendarEvent,
    openTaskModal,
  } = useApp();

  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedDay, setSelectedDay] = useState<number>(19); // 19 de Outubro é hoje
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'events' | 'tasks'>('all');

  const currentAccent = ACCENTS[preferences.accent] || ACCENTS.blue;

  const typeBadges: Record<string, string> = {
    Reunião: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    Revisão: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    Equipe: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
    'Bloco de foco': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    Meeting: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    Review: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    Team: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
    'Focus block': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  };

  // Helper para obter eventos de um dia específico de Outubro 2026
  const getDayEvents = (day: number) => {
    const dateStr = `2026-10-${day.toString().padStart(2, '0')}`;
    return events.filter((e) => e.date === dateStr);
  };

  // Helper para obter tarefas com prazo para um dia específico
  const getDayTasks = (day: number) => {
    const dateStr = `2026-10-${day.toString().padStart(2, '0')}`;
    return tasks.filter((t) => {
      if (t.dueDate === dateStr) return true;
      if (day === 19 && (t.dueDisplay === 'Hoje' || t.dueDisplay === 'Today')) return true;
      return false;
    });
  };

  interface CalendarCell {
    day: number;
    month: 'prev' | 'curr' | 'next';
    isToday?: boolean;
  }

  // Grade de 35 células para o mês de Outubro 2026 (Segunda a Domingo)
  // Outubro de 2026 começa numa Quinta-feira (dia 1). Logo:
  // Seg 28 Set, Ter 29 Set, Qua 30 Set são do mês anterior.
  const calendarCells: CalendarCell[] = [
    { day: 28, month: 'prev', isToday: false },
    { day: 29, month: 'prev', isToday: false },
    { day: 30, month: 'prev', isToday: false },
    ...Array.from({ length: 31 }, (_, i) => ({
      day: i + 1,
      month: 'curr' as const,
      isToday: i + 1 === 19,
    })),
    { day: 1, month: 'next', isToday: false },
  ];

  const selectedDateEvents = getDayEvents(selectedDay);
  const selectedDateTasks = getDayTasks(selectedDay);

  const weekDays = [
    { name: 'Seg', day: 19, isToday: true },
    { name: 'Ter', day: 20 },
    { name: 'Qua', day: 21 },
    { name: 'Qui', day: 22 },
    { name: 'Sex', day: 23 },
    { name: 'Sáb', day: 24 },
    { name: 'Dom', day: 25 },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span>Outubro de 2026</span>
          </h1>
          <p className="text-white/60 text-sm mt-1">
            {events.length} compromissos e {tasks.filter((t) => t.status !== 'done').length} tarefas abertas sincronizados
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Navegação de Data */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-white">
            <button
              onClick={() => setSelectedDay((d) => Math.max(1, d - 1))}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="Dia anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setSelectedDay(19)}
              className="px-3 py-1 rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors"
            >
              Hoje
            </button>
            <button
              onClick={() => setSelectedDay((d) => Math.min(31, d + 1))}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="Próximo dia"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Alternador Mês / Semana */}
          <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'month'
                  ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/15'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'week'
                  ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/15'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Semana
            </button>
          </div>

          {/* Botão Adicionar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => openQuickAdd('event')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-semibold text-white bg-gradient-to-r ${currentAccent.gradient} shadow-lg ${currentAccent.activeNavGlow} hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5`}
            >
              <Plus size={14} />
              <span>Novo evento</span>
            </button>
            <button
              onClick={() => openQuickAdd('task')}
              className="px-3 py-2 rounded-2xl text-xs font-semibold text-white/80 bg-white/10 hover:bg-white/15 border border-white/10 transition-all flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Nova tarefa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grade Principal: Grade à Esquerda + Painel de Agenda à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Grade do Calendário (Mês / Semana) */}
        <div className="lg:col-span-7 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl p-5 overflow-hidden">
          {viewMode === 'month' ? (
            <div>
              {/* Cabeçalho dos dias Seg - Dom */}
              <div className="grid grid-cols-7 gap-2 text-center pb-3 border-b border-white/5 text-[11px] font-bold text-white/50 uppercase tracking-wider">
                <span>Seg</span>
                <span>Ter</span>
                <span>Qua</span>
                <span>Qui</span>
                <span>Sex</span>
                <span>Sáb</span>
                <span>Dom</span>
              </div>

              {/* Células de dias */}
              <div className="grid grid-cols-7 gap-2 pt-3">
                {calendarCells.map((cell, idx) => {
                  const isCurrentMonth = cell.month === 'curr';
                  const isToday = cell.isToday;
                  const isSelected = selectedDay === cell.day && isCurrentMonth;
                  const dayEvents = isCurrentMonth ? getDayEvents(cell.day) : [];
                  const dayTasks = isCurrentMonth ? getDayTasks(cell.day) : [];
                  const totalItems = dayEvents.length + dayTasks.length;

                  return (
                    <div
                      key={idx}
                      onClick={() => isCurrentMonth && setSelectedDay(cell.day)}
                      className={`min-h-[80px] p-2 rounded-2xl transition-all cursor-pointer flex flex-col justify-between group ${
                        isToday
                          ? 'bg-blue-600/20 border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] ring-1 ring-blue-400/40'
                          : isSelected
                          ? 'bg-white/15 border border-white/30 shadow-md ring-1 ring-white/15'
                          : isCurrentMonth
                          ? 'bg-white/[0.02] hover:bg-white/[0.06] border border-white/5'
                          : 'opacity-25 bg-transparent border border-transparent pointer-events-none'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isToday
                              ? 'text-blue-300 font-extrabold'
                              : isSelected
                              ? 'text-white font-extrabold'
                              : isCurrentMonth
                              ? 'text-white/80'
                              : 'text-white/30'
                          }`}
                        >
                          {cell.day}
                        </span>

                        {totalItems > 0 && (
                          <span className="text-[9px] font-semibold text-white/60 px-1 rounded bg-white/10">
                            {totalItems}
                          </span>
                        )}
                      </div>

                      {/* Chips de Eventos e Tarefas Dinâmicos */}
                      <div className="space-y-1 mt-1 max-h-12 overflow-hidden">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <div
                            key={ev.id}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-blue-500/15 border border-blue-500/20 truncate"
                            title={`${ev.startTime} - ${ev.title}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-blue-400" />
                            <span className="text-white/90 truncate text-[8.5px] leading-tight font-medium">
                              {ev.title}
                            </span>
                          </div>
                        ))}
                        {dayTasks.slice(0, 1).map((t) => (
                          <div
                            key={t.id}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] ${
                              t.status === 'done'
                                ? 'bg-emerald-500/10 text-emerald-300/80 line-through'
                                : 'bg-purple-500/15 text-purple-200 border border-purple-500/20'
                            } truncate`}
                            title={`Tarefa: ${t.title}`}
                          >
                            <CheckSquare size={9} className="shrink-0" />
                            <span className="truncate text-[8.5px] leading-tight font-medium">
                              {t.title}
                            </span>
                          </div>
                        ))}
                        {totalItems > 3 && (
                          <span className="text-[8px] text-white/40 block text-right font-medium">
                            +{totalItems - 3} mais
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Visão em Semana */
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2 text-center pb-2 border-b border-white/5 text-[11px] font-bold text-white/60">
                {weekDays.map((item) => (
                  <div
                    key={item.name}
                    onClick={() => setSelectedDay(item.day)}
                    className={`p-2 rounded-xl cursor-pointer transition-all ${
                      selectedDay === item.day
                        ? 'bg-blue-500/25 text-white ring-1 ring-blue-400/50'
                        : item.isToday
                        ? 'bg-white/10 text-blue-300'
                        : 'hover:bg-white/5 text-white/70'
                    }`}
                  >
                    <div>{item.name}</div>
                    <div className="text-sm font-extrabold">{item.day}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 min-h-[380px]">
                {weekDays.map((w) => {
                  const dayEvs = getDayEvents(w.day);
                  const dayTsks = getDayTasks(w.day);

                  return (
                    <div
                      key={w.day}
                      onClick={() => setSelectedDay(w.day)}
                      className={`p-1.5 rounded-2xl transition-all cursor-pointer flex flex-col gap-1.5 ${
                        selectedDay === w.day
                          ? 'bg-blue-500/10 border border-blue-500/30'
                          : w.isToday
                          ? 'bg-white/[0.04] border border-white/15'
                          : 'bg-white/[0.015] border border-white/5 hover:bg-white/[0.04]'
                      }`}
                    >
                      {dayEvs.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-1.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-[9.5px] text-white relative group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-blue-200">{ev.startTime}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCalendarEvent(ev.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-white/50 hover:text-rose-400 transition-opacity"
                              title="Excluir evento"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                          <p className="truncate font-medium mt-0.5 leading-tight">{ev.title}</p>
                        </div>
                      ))}

                      {dayTsks.map((t) => (
                        <div
                          key={t.id}
                          className={`p-1.5 rounded-xl text-[9.5px] relative group ${
                            t.status === 'done'
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300/80 line-through'
                              : 'bg-purple-500/20 border border-purple-500/30 text-purple-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold">Tarefa</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTask(t.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-white/50 hover:text-rose-400 transition-opacity"
                              title="Excluir tarefa"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                          <p className="truncate font-medium mt-0.5 leading-tight">{t.title}</p>
                        </div>
                      ))}

                      {dayEvs.length === 0 && dayTsks.length === 0 && (
                        <span className="text-[10px] text-white/20 text-center py-6 block">Livre</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Painel Direito: Agenda do Dia Selecionado */}
        <div className="lg:col-span-5 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{selectedDay} de Outubro</span>
                {selectedDay === 19 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Hoje
                  </span>
                )}
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                {selectedDateEvents.length} eventos · {selectedDateTasks.length} tarefas
              </p>
            </div>

            {/* Alternador de Filtro da Agenda */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
              <button
                onClick={() => setScheduleFilter('all')}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  scheduleFilter === 'all' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                Tudo
              </button>
              <button
                onClick={() => setScheduleFilter('events')}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  scheduleFilter === 'events' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                Eventos ({selectedDateEvents.length})
              </button>
              <button
                onClick={() => setScheduleFilter('tasks')}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  scheduleFilter === 'tasks' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                Tarefas ({selectedDateTasks.length})
              </button>
            </div>
          </div>

          {/* Lista com Eventos e Tarefas Sincronizados com Ações de Excluir */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {/* Seção de Eventos */}
            {(scheduleFilter === 'all' || scheduleFilter === 'events') && (
              <div className="space-y-3">
                {selectedDateEvents.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-wider">
                      Eventos ({selectedDateEvents.length})
                    </span>
                  </div>
                )}

                {selectedDateEvents.map((ev) => {
                  const isAroundNow = selectedDay === 19 && ev.startHour === 11.0;

                  return (
                    <div key={ev.id} className="space-y-2">
                      {isAroundNow && (
                        <div className="relative flex items-center gap-2 my-1 py-1 z-10">
                          <span className="text-[11px] font-bold text-rose-400 shrink-0 font-mono">
                            10:27
                          </span>
                          <div className="relative flex-1 flex items-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e] shrink-0" />
                            <div className="h-[2px] w-full bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                          </div>
                        </div>
                      )}

                      <div
                        className={`p-4 rounded-2xl border transition-all group ${
                          isAroundNow
                            ? 'bg-blue-500/10 border-blue-500/30 shadow-md ring-1 ring-blue-500/20'
                            : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{ev.startTime}</span>
                              <span className="text-[10px] text-white/40">
                                {ev.durationMinutes >= 60
                                  ? `${ev.durationMinutes / 60}h`
                                  : `${ev.durationMinutes} min`}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-white/95 mt-1 truncate">{ev.title}</h4>

                            <div className="flex items-center gap-3 mt-1.5 text-xs text-white/50">
                              <span className="flex items-center gap-1 text-[11px]">
                                {ev.location.toLowerCase().includes('vídeo') ||
                                ev.location.toLowerCase().includes('video') ? (
                                  <Video size={12} className="text-blue-400" />
                                ) : (
                                  <MapPin size={12} className="text-amber-400" />
                                )}
                                {ev.location}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Badge do Tipo de Evento */}
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                typeBadges[ev.type] || 'bg-white/10 text-white/70 border-white/10'
                              }`}
                            >
                              {ev.type}
                            </span>

                            {/* Botão EXCLUIR EVENTO */}
                            <button
                              onClick={() => deleteCalendarEvent(ev.id)}
                              className="p-1.5 rounded-xl text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Excluir este evento do calendário"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Avatares dos Participantes e Ação */}
                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5">
                          <div className="flex -space-x-2">
                            {ev.attendeeIds.map((attId) => {
                              const att = members.find((m) => m.id === attId);
                              if (!att) return null;
                              return (
                                <img
                                  key={att.id}
                                  src={att.avatar}
                                  alt={att.name}
                                  title={att.name}
                                  className="w-5 h-5 rounded-full object-cover ring-2 ring-[#141622]"
                                />
                              );
                            })}
                            {ev.attendeeIds.length > 3 && (
                              <span className="w-5 h-5 rounded-full bg-white/10 ring-2 ring-[#141622] text-[9px] font-bold text-white/70 flex items-center justify-center">
                                +1
                              </span>
                            )}
                          </div>

                          {ev.location.toLowerCase().includes('vídeo') || ev.location.toLowerCase().includes('video') ? (
                            <button
                              onClick={() => alert(`Conectando à chamada "${ev.title}"...`)}
                              className="px-3 py-1 rounded-xl text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-sm flex items-center gap-1 transition-all"
                            >
                              <Video size={12} />
                              Entrar na chamada
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Seção de Tarefas para o dia */}
            {(scheduleFilter === 'all' || scheduleFilter === 'tasks') && (
              <div className="space-y-3 pt-2">
                {selectedDateTasks.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-wider">
                      Tarefas com prazo para o dia ({selectedDateTasks.length})
                    </span>
                  </div>
                )}

                {selectedDateTasks.map((task) => {
                  const proj = projects.find((p) => p.id === task.projectId);
                  const isDone = task.status === 'done';

                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 group ${
                        isDone
                          ? 'bg-white/[0.02] border-white/5 opacity-60'
                          : 'bg-white/[0.04] hover:bg-white/[0.07] border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox de Conclusão com Sincronização */}
                        <button
                          type="button"
                          onClick={() => toggleTaskComplete(task.id)}
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                            isDone
                              ? 'bg-blue-500 border-blue-500 text-white shadow-sm shadow-blue-500/40'
                              : 'border-white/30 hover:border-white/60 bg-white/5'
                          }`}
                          title={isDone ? 'Marcar como pendente' : 'Marcar como concluída'}
                        >
                          {isDone && <Check size={12} strokeWidth={3} />}
                        </button>

                        <div className="truncate">
                          <h4
                            onClick={() => openTaskModal(task.id)}
                            className={`text-xs font-semibold cursor-pointer truncate hover:text-blue-300 transition-colors ${
                              isDone ? 'line-through text-white/40' : 'text-white'
                            }`}
                          >
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            {proj && (
                              <span className="flex items-center gap-1 text-[10px] text-white/50">
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: proj.color }}
                                />
                                {proj.name}
                              </span>
                            )}
                            <span className="text-[10px] text-white/40">
                              {task.priority === 'Urgent' ? 'P Urgente' : task.priority === 'High' ? 'Alta' : 'Normal'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Botão EXCLUIR TAREFA DO CALENDÁRIO */}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 rounded-xl text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                        title="Excluir tarefa do calendário"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Estado Vazio */}
            {selectedDateEvents.length === 0 && selectedDateTasks.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/5">
                <CalendarIcon size={28} className="mx-auto text-white/20 mb-2" />
                <p className="text-xs text-white/50 font-medium">
                  Nenhum compromisso ou tarefa para {selectedDay} de Outubro.
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    onClick={() => openQuickAdd('event')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-all"
                  >
                    + Agendar evento
                  </button>
                  <button
                    onClick={() => openQuickAdd('task')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-all"
                  >
                    + Criar tarefa
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
