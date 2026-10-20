import React, { useState } from 'react';
import {
  UserPlus,
  Briefcase,
  CheckSquare,
  MessageCircle,
  Sun,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TeamDepartment } from '../types';

export const TeamView: React.FC = () => {
  const { members, openMemberModal, preferences, getMemberOpenCount, addTeamMember } = useApp();
  const [selectedDept, setSelectedDept] = useState<'Todos' | 'Produto' | 'Design' | 'Engenharia' | 'Marketing'>('Todos');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  const filteredMembers = members.filter((m) => {
    if (selectedDept === 'Todos') return true;
    if (selectedDept === 'Produto') return m.team === 'Produto' || m.team === 'Product';
    if (selectedDept === 'Design') return m.team === 'Design';
    if (selectedDept === 'Engenharia') return m.team === 'Engenharia' || m.team === 'Engineering';
    if (selectedDept === 'Marketing') return m.team === 'Marketing';
    return true;
  });

  const onlineCount = members.filter((m) => m.status === 'online').length;
  const inFocusCount = members.filter((m) => m.status === 'focus').length;
  const deptCount = new Set(members.map((m) => m.team)).size;
  const avgLoad = members.length > 0
    ? Math.round(
        members.reduce((acc, m) => acc + (m.workloadHours / (m.maxWorkloadHours || 40)) * 100, 0) /
          members.length
      )
    : 0;

  const statusColors = {
    online: 'bg-emerald-400',
    focus: 'bg-purple-400',
    meeting: 'bg-amber-400',
    offline: 'bg-neutral-500',
  };

  const teamBadgeColors: Record<string, string> = {
    Produto: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Product: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Design: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    Engenharia: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    Engineering: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    Marketing: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    const namePart = inviteEmail.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    addTeamMember({
      name: formattedName,
      role: 'Colaborador',
      team: selectedDept !== 'Todos' ? (selectedDept as any) : 'Engenharia',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      status: 'online',
      statusText: 'Disponível no workspace',
      city: 'São Paulo',
      timezoneOffset: -3,
      timezoneNote: 'BRT',
      localTimeStr: '11:00',
      workloadHours: 12,
      maxWorkloadHours: 40,
      openTasksCount: 0,
      email: inviteEmail.trim(),
    });
    setInviteSent(true);
    setTimeout(() => {
      setInviteSent(false);
      setInviteModalOpen(false);
      setInviteEmail('');
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* ════════════════════════════════════
          HEADER / TOPO
          ════════════════════════════════════ */}
      <div className="space-y-4">
        <div>
          <h1 className="text-[38px] md:text-[42px] font-bold tracking-tight text-white leading-none">
            Equipe
          </h1>
          <p className="text-[#8b8b90] text-sm mt-1.5 font-normal">
            {members.length} {members.length === 1 ? 'pessoa' : 'pessoas'} · {deptCount} departamentos sincronizados
          </p>
        </div>

        {/* Linha com 4 Mini Stat Tiles e Controles */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          {/* 4 Mini Stat Tiles */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
            <div className="px-4 py-2.5 rounded-[14px] bg-[#131417] border border-white/[0.06] min-w-[90px] shadow-sm">
              <span className="text-[11px] font-medium text-[#8b8b90] block">Membros</span>
              <div className="text-[26px] font-bold text-white mt-0.5 leading-none">
                {members.length}
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-[14px] bg-[#131417] border border-white/[0.06] min-w-[90px] shadow-sm">
              <span className="text-[11px] font-medium text-[#8b8b90] block">Online</span>
              <div className="text-[26px] font-bold text-white mt-0.5 leading-none">
                {onlineCount}
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-[14px] bg-[#131417] border border-white/[0.06] min-w-[90px] shadow-sm">
              <span className="text-[11px] font-medium text-[#8b8b90] block">Em foco</span>
              <div className="text-[26px] font-bold text-white mt-0.5 leading-none">
                {inFocusCount}
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-[14px] bg-[#131417] border border-white/[0.06] min-w-[90px] shadow-sm">
              <span className="text-[11px] font-medium text-[#8b8b90] block">Carga média</span>
              <div className="text-[26px] font-bold text-white mt-0.5 leading-none">
                {avgLoad}%
              </div>
            </div>
          </div>

          {/* Filtros em Pílula + Botão Convidar */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="flex items-center p-1 rounded-full bg-[#131417] border border-white/[0.06]">
              {(['Todos', 'Produto', 'Design', 'Engenharia', 'Marketing'] as const).map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedDept === dept
                      ? 'bg-white/[0.12] text-white shadow-sm'
                      : 'text-[#8b8b90] hover:text-white'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            <button
              onClick={() => setInviteModalOpen(true)}
              className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-white/[0.1] hover:bg-white/[0.16] border border-white/[0.1] shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <UserPlus size={14} />
              <span>Convidar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid de 2 Colunas de Membros da Equipe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredMembers.map((member) => {
          const openCount = getMemberOpenCount(member.id);

          return (
            <div
              key={member.id}
              className="p-5 rounded-[16px] bg-[#131417] border border-white/[0.06] shadow-sm hover:border-white/[0.12] transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                {/* Linha Superior: Avatar + Nome + Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-11 h-11 rounded-[12px] object-cover ring-1 ring-white/10"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
                          statusColors[member.status]
                        } ring-2 ring-[#131417]`}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{member.name}</h3>
                        {member.isCurrentUser && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Você
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#8b8b90] mt-0.5">{member.role}</p>
                    </div>
                  </div>

                  {/* Badge do Departamento */}
                  <span
                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                      teamBadgeColors[member.team] || 'bg-white/[0.06] text-[#8b8b90] border-white/[0.08]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {member.team}
                  </span>
                </div>

                {/* Subcard de Status e Horário Local */}
                <div className="p-3 rounded-[12px] bg-[#0d0e11] border border-white/[0.04] mt-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[#8b8b90]">
                      <span className={`w-2 h-2 rounded-full ${statusColors[member.status]}`} />
                      <span className="truncate">{member.statusText.split('·')[0]}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[#8b8b90] font-medium">
                      <Sun size={12} className="text-amber-400 shrink-0" />
                      <span>{member.localTimeStr}</span>
                    </div>
                  </div>

                  {/* Barra de Carga de Trabalho */}
                  <div className="pt-2 border-t border-white/[0.04] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8b8b90]">Carga de trabalho</span>
                      <span className="font-bold text-white font-mono">
                        {member.workloadHours}h / {member.maxWorkloadHours}h
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          member.workloadHours / member.maxWorkloadHours > 0.85
                            ? 'bg-rose-500'
                            : member.workloadHours / member.maxWorkloadHours > 0.6
                            ? 'bg-amber-400'
                            : 'bg-blue-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((member.workloadHours / member.maxWorkloadHours) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Rodapé: Ações */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[11px] text-[#8b8b90] font-medium">
                  {openCount} tarefas em aberto
                </span>

                <button
                  onClick={() => openMemberModal(member.id)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.06] transition-all"
                >
                  Ver perfil
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Convidar */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="w-full max-w-md rounded-[18px] bg-[#131417] border border-white/[0.08] shadow-2xl text-white p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus size={18} className="text-blue-400" />
                <span>Convidar novo membro</span>
              </h3>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="text-[#8b8b90] hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#8b8b90] block mb-1.5">
                  E-mail institucional
                </label>
                <input
                  type="email"
                  required
                  placeholder="exemplo@pane.workspace.io"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#0d0e11] border border-white/[0.06] text-xs text-white placeholder-[#8b8b90] focus:outline-none focus:border-white/20"
                />
              </div>

              {inviteSent && (
                <div className="p-3 rounded-[12px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                  Convite enviado e membro adicionado com sucesso!
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-medium text-[#8b8b90] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-md"
                >
                  Enviar convite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
