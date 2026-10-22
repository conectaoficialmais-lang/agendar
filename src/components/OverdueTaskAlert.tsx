import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Check,
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OverdueTaskAlert: React.FC = () => {
  const {
    overdueTasks,
    overdueCount,
    getTaskDaysOverdue,
    toggleTaskComplete,
    postponeTask,
    openTaskModal,
    projects,
    members,
    isOverdueAlertDismissed,
    setIsOverdueAlertDismissed,
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(true);

  if (overdueCount === 0) return null;

  return (
    <div className="mb-6 animate-in slide-in-from-top-3 fade-in duration-300">
      <div
        className="relative overflow-hidden rounded-[20px] border border-rose-500/40 shadow-[0_12px_40px_-10px_rgba(244,63,94,0.35)] backdrop-blur-xl"
        style={{
          background:
            'linear-gradient(135deg, rgba(88, 28, 58, 0.55) 0%, rgba(18, 22, 42, 0.95) 45%, rgba(12, 20, 44, 0.98) 100%)',
        }}
      >
        {/* Subtle glowing ambient pulse */}
        <div className="absolute -top-16 -left-16 w-44 h-44 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-44 h-44 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />

        {/* Top Header Bar */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-rose-500/20">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse">
              <AlertTriangle size={19} className="stroke-[2.5]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Alerta de Prazos Vencidos</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-500 text-white shadow-md">
                    {overdueCount} {overdueCount === 1 ? 'tarefa atrasada' : 'tarefas atrasadas'}
                  </span>
                </h3>
              </div>
              <p className="text-xs text-rose-200/80 mt-0.5">
                {overdueCount === 1
                  ? 'Esta tarefa passou da data limite sem ser concluída. Regularize agora ou adie o prazo.'
                  : 'Estas tarefas passaram da data limite sem serem concluídas. Regularize agora ou adie os prazos.'}
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-rose-200/90 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1.5"
            >
              <span>{isExpanded ? 'Recolher' : `Ver ${overdueCount} tarefas`}</span>
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Expanded Overdue Tasks List */}
        {isExpanded && (
          <div className="relative z-10 p-4 space-y-2.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
              {overdueTasks.map((task) => {
                const proj = projects.find((p) => p.id === task.projectId);
                const assignee = members.find((m) => m.id === task.assigneeId);
                const daysOverdue = getTaskDaysOverdue(task);

                return (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-[14px] bg-[#0c1224]/80 hover:bg-[#101730] border border-rose-500/25 hover:border-rose-400/40 transition-all flex flex-col justify-between gap-3 group shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {/* Project Tag */}
                          {proj && (
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 border border-white/10">
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: proj.color }}
                              />
                              <span className="text-white/80 truncate max-w-[110px]">
                                {proj.name}
                              </span>
                            </span>
                          )}

                          {/* Overdue Badge */}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/35 flex items-center gap-1">
                            <Clock size={10} />
                            <span>Venceu há {daysOverdue}d ({task.dueDate})</span>
                          </span>

                          {task.priority === 'Urgent' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/30 text-rose-200">
                              Urgente
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4
                          onClick={() => openTaskModal(task.id)}
                          className="text-xs font-bold text-white group-hover:text-rose-200 transition-colors cursor-pointer truncate leading-snug"
                        >
                          {task.title}
                        </h4>
                      </div>

                      {assignee && (
                        <img
                          src={assignee.avatar}
                          alt={assignee.name}
                          title={`Responsável: ${assignee.name}`}
                          className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20 shrink-0"
                        />
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
                      <span className="text-[11px] text-rose-300/70 font-medium">
                        Prazo: {task.dueDisplay || task.dueDate}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* Concluir Tarefa Button */}
                        <button
                          onClick={() => toggleTaskComplete(task.id)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 hover:bg-emerald-400 text-white transition-all shadow-sm flex items-center gap-1 active:scale-95"
                          title="Marcar como concluída agora"
                        >
                          <Check size={11} strokeWidth={3} />
                          <span>Concluir</span>
                        </button>

                        {/* Adiar 3 Dias Button */}
                        <button
                          onClick={() => postponeTask(task.id, 3)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/30 transition-all flex items-center gap-1"
                          title="Adiar prazo por 3 dias"
                        >
                          <Calendar size={11} />
                          <span>+3d</span>
                        </button>

                        {/* Ver Tarefa Button */}
                        <button
                          onClick={() => openTaskModal(task.id)}
                          className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                          title="Abrir detalhes da tarefa"
                        >
                          <ArrowRight size={13} />
                        </button>
                      </div>
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
