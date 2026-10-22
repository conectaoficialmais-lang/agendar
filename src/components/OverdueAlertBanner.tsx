import React, { useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Check,
  Calendar,
  Clock,
  ArrowRight,
  X,
  Sparkles,
  Flame,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OverdueAlertBanner: React.FC = () => {
  const {
    overdueTasks,
    overdueCount,
    isOverdueAlertDismissed,
    dismissOverdueAlert,
    rescheduleTask,
    rescheduleAllOverdue,
    completeAllOverdue,
    toggleTaskComplete,
    openTaskModal,
    projects,
    members,
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(false);

  // If no overdue tasks or user dismissed the banner, don't show the main banner
  if (overdueCount === 0 || isOverdueAlertDismissed) {
    return null;
  }

  // Calculate days overdue based on 2026-10-22
  const getDaysOverdue = (dueDate: string) => {
    try {
      const due = new Date(dueDate).getTime();
      const today = new Date('2026-10-22').getTime();
      const diffDays = Math.max(1, Math.round((today - due) / (1000 * 60 * 60 * 24)));
      return diffDays;
    } catch {
      return 1;
    }
  };

  return (
    <div className="mb-6 animate-in slide-in-from-top-2 duration-300">
      <div className="relative overflow-hidden rounded-[20px] bg-[#181920]/95 border border-rose-500/35 shadow-[0_12px_36px_rgba(244,63,94,0.15)] backdrop-blur-2xl">
        {/* Glow ambient highlight */}
        <div className="absolute -left-10 -top-10 w-44 h-44 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />
        <div className="absolute right-0 top-0 w-60 h-24 bg-rose-500/5 blur-2xl pointer-events-none" />

        {/* Top Banner Bar */}
        <div className="p-4 sm:p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Pulsing warning icon badge */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-[12px] bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.35)]">
                <AlertTriangle size={20} className="animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] flex items-center justify-center shadow-md">
                {overdueCount}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Alerta de Tarefas Atrasadas</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider">
                    {overdueCount} {overdueCount === 1 ? 'Vencida' : 'Vencidas'}
                  </span>
                </h3>
              </div>
              <p className="text-xs text-rose-200/80 mt-0.5 leading-tight truncate">
                Há {overdueCount} {overdueCount === 1 ? 'tarefa com prazo expirado' : 'tarefas com prazo expirado'} pendentes que necessitam de atenção imediata.
              </p>
            </div>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto flex-wrap">
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>{isExpanded ? 'Ocultar lista' : 'Ver tarefas'}</span>
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            <button
              onClick={rescheduleAllOverdue}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 transition-all flex items-center gap-1.5 shadow-sm hover:text-white"
              title="Adia a data de entrega de todas as tarefas atrasadas para Hoje"
            >
              <Calendar size={13} />
              <span>Reagendar para Hoje</span>
            </button>

            <button
              onClick={completeAllOverdue}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5 active:scale-95"
              title="Marca todas as tarefas atrasadas como concluídas"
            >
              <Check size={13} strokeWidth={2.5} />
              <span>Concluir todas</span>
            </button>

            <button
              onClick={dismissOverdueAlert}
              className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              title="Dispensar alerta temporariamente"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Expanded Drawer with List of Overdue Tasks */}
        {isExpanded && (
          <div className="p-4 pt-1 border-t border-rose-500/20 bg-[#121319]/90 relative z-10 space-y-2.5 animate-in slide-in-from-top-1 duration-200">
            <div className="flex items-center justify-between text-xs text-rose-300/80 px-1 pt-1">
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Tarefas pendentes fora do prazo ({overdueTasks.length})
              </span>
              <span className="text-[11px] text-white/50">Data de referência: 22 de Outubro de 2026</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {overdueTasks.map((task) => {
                const project = projects.find((p) => p.id === task.projectId);
                const assignee = members.find((m) => m.id === task.assigneeId);
                const daysOverdue = getDaysOverdue(task.dueDate);

                return (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-[14px] bg-[#181920] border border-rose-500/25 hover:border-rose-400/50 shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top: Project badge & Days Overdue chip */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {project ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 border border-white/5">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: project.color }}
                            />
                            <span className="text-white/80 truncate max-w-[120px]">
                              {project.name}
                            </span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-white/50">Projeto</span>
                        )}

                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                          <Clock size={10} />
                          <span>{daysOverdue} {daysOverdue === 1 ? 'dia de atraso' : 'dias de atraso'}</span>
                        </span>
                      </div>

                      {/* Task title */}
                      <h4
                        onClick={() => openTaskModal(task.id)}
                        className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors cursor-pointer line-clamp-2 leading-snug"
                        title="Abrir detalhes da tarefa"
                      >
                        {task.title}
                      </h4>

                      {/* Assignee & Due Date info */}
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-white/50">
                        {assignee && (
                          <div className="flex items-center gap-1.5">
                            <img
                              src={assignee.avatar}
                              alt={assignee.name}
                              className="w-4 h-4 rounded-full object-cover ring-1 ring-white/10"
                            />
                            <span className="truncate max-w-[90px]">{assignee.name}</span>
                          </div>
                        )}
                        <span>·</span>
                        <span className="text-rose-400/90 font-medium">Prazo: {task.dueDisplay || task.dueDate}</span>
                      </div>
                    </div>

                    {/* Quick Task Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-white/[0.06]">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-all flex items-center gap-1"
                        title="Concluir tarefa agora"
                      >
                        <Check size={11} strokeWidth={3} />
                        <span>Concluir</span>
                      </button>

                      <button
                        onClick={() => rescheduleTask(task.id, '2026-10-22', 'Hoje')}
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 transition-all flex items-center gap-1"
                        title="Reagendar prazo para Hoje"
                      >
                        <Calendar size={11} />
                        <span>Para hoje</span>
                      </button>

                      <button
                        onClick={() => openTaskModal(task.id)}
                        className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                        title="Ver detalhes"
                      >
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
