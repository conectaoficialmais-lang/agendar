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
import { ACCENTS } from '../themeUtils';

export const TeamView: React.FC = () => {
  const { members, openMemberModal, preferences, getMemberOpenCount } = useApp();
  const [selectedDept, setSelectedDept] = useState<'Todos' | 'Produto' | 'Design' | 'Engenharia' | 'Marketing'>('Todos');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  const currentAccent = ACCENTS[preferences.accent] || ACCENTS.blue;

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

  const statusColors = {
    online: 'bg-emerald-400',
    focus: 'bg-purple-400',
    meeting: 'bg-amber-400',
    offline: 'bg-neutral-500',
  };

  const teamBadgeColors: Record<string, string> = {
    Produto: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    Product: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    Design: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
    Engenharia: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    Engineering: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    Marketing: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteSent(true);
    setTimeout(() => {
      setInviteSent(false);
      setInviteModalOpen(false);
      setInviteEmail('');
    }, 1800);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Equipe</h1>
          <p className="text-white/60 text-sm mt-1">12 pessoas · 4 departamentos</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Pílulas de Filtro de Departamento */}
          <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            {(['Todos', 'Produto', 'Design', 'Engenharia', 'Marketing'] as const).map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedDept === dept
                    ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/15'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Botão Convidar */}
          <button
            onClick={() => setInviteModalOpen(true)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-semibold text-white bg-gradient-to-r ${currentAccent.gradient} shadow-lg ${currentAccent.activeNavGlow} hover:brightness-110 active:scale-95 transition-all flex items-center gap-2`}
          >
            <UserPlus size={15} />
            <span>Convidar</span>
          </button>
        </div>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <div className="p-4 rounded-3xl bg-[#141622]/60 backdrop-blur-xl border border-white/10 shadow-lg glass-card-hover">
          <span className="text-xs text-white/50 block font-medium">Online agora</span>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">9/12</div>
        </div>

        <div className="p-4 rounded-3xl bg-[#141622]/60 backdrop-blur-xl border border-white/10 shadow-lg glass-card-hover">
          <span className="text-xs text-white/50 block font-medium">Em foco</span>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">2</div>
        </div>

        <div className="p-4 rounded-3xl bg-[#141622]/60 backdrop-blur-xl border border-white/10 shadow-lg glass-card-hover">
          <span className="text-xs text-white/50 block font-medium">Carga média</span>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">32%</div>
        </div>
      </div>

      {/* Grid de 2 Colunas de Membros da Equipe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredMembers.map((member) => {
          const openCount = getMemberOpenCount(member.id);

          return (
            <div
              key={member.id}
              className="p-6 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl glass-card-hover space-y-4 flex flex-col justify-between"
            >
              <div>
                {/* Linha Superior: Avatar + Nome + Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/15"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ${
                          statusColors[member.status]
                        } ring-2 ring-[#141622]`}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{member.name}</h3>
                        {member.isCurrentUser && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            Você
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/60 mt-0.5">{member.role}</p>
                    </div>
                  </div>

                  {/* Badge do Departamento */}
                  <span
                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      teamBadgeColors[member.team] || 'bg-white/10 text-white/70 border-white/10'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {member.team}
                  </span>
                </div>

                {/* Status e Horário Local */}
                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                  <div className="flex items-center gap-2 text-white/70">
                    <span className={`w-2 h-2 rounded-full ${statusColors[member.status]}`} />
                    <span className="truncate">{member.statusText.split('·')[0]}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-white/70 justify-end">
                    <Sun size={13} className="text-amber-400 shrink-0" />
                    <span className="truncate font-medium">{member.localTimeStr}</span>
                  </div>
                </div>

                <div className="text-right text-[10px] text-white/40 mt-0.5">
                  {member.timezoneNote}
                </div>

                {/* Barra de Carga de Trabalho */}
                <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50">Carga de trabalho</span>
                    <span className="font-bold text-white">
                      {member.workloadHours}h / {member.maxWorkloadHours}h
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
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

              {/* Rodapé: Tarefas Abertas Sincronizadas, Botão Perfil, Botão Mensagem */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs font-medium text-white/60 flex items-center gap-1.5">
                  <CheckSquare size={13} className="text-white/40" />
                  {openCount} tarefas abertas
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openMemberModal(member.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-all"
                  >
                    Perfil
                  </button>

                  <button
                    onClick={() => openMemberModal(member.id)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white transition-all"
                    title="Enviar mensagem"
                  >
                    <MessageCircle size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Convidar Membro */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="w-full max-w-md rounded-3xl bg-[#151722]/95 backdrop-blur-2xl border border-white/15 p-6 text-white shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold">Convidar um membro da equipe</h3>
            <p className="text-xs text-white/60">
              O novo colega receberá acesso imediato a todos os projetos e tarefas compartilhadas no Pane.
            </p>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colega@empresa.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-blue-500"
                autoFocus
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs text-white/60 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r ${currentAccent.gradient} shadow-lg transition-all`}
                >
                  Enviar convite
                </button>
              </div>
            </form>

            {inviteSent && (
              <p className="text-xs text-emerald-400 flex items-center gap-1.5 pt-2 animate-in fade-in">
                <Sparkles size={13} /> Convite enviado para {inviteEmail}!
              </p>
            )}
          </div>
          <div className="fixed inset-0 -z-10" onClick={() => setInviteModalOpen(false)} />
        </div>
      )}
    </div>
  );
};
