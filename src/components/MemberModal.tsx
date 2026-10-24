import React, { useState } from 'react';
import { X, Clock, Briefcase, CheckSquare, Send, Sparkles, Trash2, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDueLabel } from '../dateUtils';
import { useEscape } from '../a11y';

export const MemberModal: React.FC = () => {
  const { selectedMemberId, closeMemberModal, members, tasks, openTaskModal, deleteTeamMember } = useApp();
  const [message, setMessage] = useState('');
  const [sentToast, setSentToast] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEscape(closeMemberModal);

  if (!selectedMemberId) return null;

  const member = members.find((m) => m.id === selectedMemberId);
  if (!member) return null;

  const memberTasks = tasks.filter((t) => t.assigneeId === member.id && t.status !== 'done');

  const statusColors = {
    online: 'bg-emerald-400',
    focus: 'bg-purple-400',
    meeting: 'bg-amber-400',
    offline: 'bg-neutral-500',
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessage('');
    setSentToast(true);
    setTimeout(() => setSentToast(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-[#151722]/95 backdrop-blur-2xl border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.6)] text-white overflow-hidden p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/20"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${
                  statusColors[member.status]
                } ring-2 ring-[#151722]`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{member.name}</h2>
                {member.isCurrentUser && (
                  <span className="accent-chip px-2 py-0.5 rounded-full text-[10px] font-semibold">
                    Você
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/10 text-white/70">
                  {member.team}
                </span>
              </div>
              <p className="text-xs text-white/60 mt-0.5">{member.role}</p>
              <p className="text-[11px] text-white/40 mt-1">{member.statusText}</p>
            </div>
          </div>

          <button
            onClick={closeMemberModal}
            className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 py-4 text-xs">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2.5">
            <Clock size={16} className="text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-white/40 block">Horário Local</span>
              <span className="font-semibold">{member.localTimeStr}</span>
              <span className="text-[10px] text-white/40 ml-1.5">({member.timezoneNote})</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2.5">
            <Briefcase size={16} className="text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-white/40 block">Carga de Trabalho</span>
              <span className="font-semibold">
                {member.workloadHours}h / {member.maxWorkloadHours}h
              </span>
              <div className="w-20 h-1.5 rounded-full bg-white/10 mt-1 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (member.workloadHours / member.maxWorkloadHours) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Open Tasks */}
        <div className="py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
              Tarefas Atribuídas ({memberTasks.length})
            </span>
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {memberTasks.length === 0 ? (
              <p className="text-xs text-white/40 py-2">Nenhuma tarefa ativa no momento</p>
            ) : (
              memberTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    closeMemberModal();
                    openTaskModal(t.id);
                  }}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 cursor-pointer text-xs transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <CheckSquare size={13} className="text-white/40 shrink-0" />
                    <span className="truncate">{t.title}</span>
                  </div>
                  <span className="text-[10px] text-white/40 shrink-0">{formatDueLabel(t.dueDate)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Simulator */}
        <div className="pt-3 border-t border-white/10">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Enviar mensagem rápida para ${member.name.split(' ')[0]}...`}
              className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent)]"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="btn-accent px-3.5 py-2 text-xs disabled:opacity-40"
            >
              <Send size={12} />
              Enviar
            </button>
          </form>
          {sentToast && (
            <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 animate-in fade-in">
              <Sparkles size={11} /> Mensagem enviada para {member.name}!
            </p>
          )}
        </div>

        {/* Zona de Ação: Excluir Membro da Equipe */}
        {!member.isCurrentUser && (
          <div className="pt-3 border-t border-white/10">
            {showDeleteConfirm ? (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
                  <AlertTriangle size={15} />
                  <span>Deseja remover {member.name} da equipe?</span>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed">
                  As tarefas atribuídas a este membro permanecerão no workspace, mas o membro não terá mais acesso.
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 rounded-xl text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deleteTeamMember(member.id);
                      closeMemberModal();
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    Confirmar Exclusão
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-2 px-3 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={14} />
                <span>Excluir membro da equipe</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="fixed inset-0 -z-10" onClick={closeMemberModal} />
    </div>
  );
};
