import React, { useState } from 'react';
import {
  User,
  Bell,
  Palette,
  Clock,
  Database,
  Check,
  Download,
  RotateCcw,
  Sparkles,
  Play,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WALLPAPERS, ACCENTS } from '../themeUtils';
import { AccentId } from '../types';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    updateUserProfile,
    preferences,
    updatePreferences,
    exportTasksCSV,
    resetDemoData,
    tasks,
    startFocus,
    setActiveTab,
  } = useApp();

  const [activeSection, setActiveSection] = useState<'profile' | 'notifications' | 'appearance' | 'focus' | 'data'>('profile');
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [profileRole, setProfileRole] = useState(currentUser.role);
  const [profileSaved, setProfileSaved] = useState(false);

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const currentAccent = ACCENTS[preferences.accent] || ACCENTS.blue;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: profileName,
      email: profileEmail,
      role: profileRole,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const menuItems = [
    { id: 'profile' as const, label: 'Perfil', icon: User, color: 'bg-blue-500' },
    { id: 'notifications' as const, label: 'Notificações', icon: Bell, color: 'bg-pink-500' },
    { id: 'appearance' as const, label: 'Aparência', icon: Palette, color: 'bg-purple-500' },
    { id: 'focus' as const, label: 'Foco', icon: Clock, color: 'bg-amber-500' },
    { id: 'data' as const, label: 'Dados', icon: Database, color: 'bg-emerald-500' },
  ];

  const scrollToSection = (id: typeof activeSection) => {
    setActiveSection(id);
    const element = document.getElementById(`section-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Configurações</h1>
        <p className="text-white/60 text-sm mt-1">
          Seu perfil, o visual do Pane e preferências de notificações
        </p>
      </div>

      {/* Layout de 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Menu Lateral em Cartão de Vidro */}
        <div className="lg:col-span-4 p-5 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl space-y-4 sticky top-6">
          {/* Mini Banner do Usuário */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/15"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-1 ring-[#141622]" />
            </div>
            <div className="truncate">
              <h3 className="text-xs font-bold text-white truncate">{currentUser.name}</h3>
              <p className="text-[11px] text-white/50 truncate">{currentUser.email}</p>
            </div>
          </div>

          {/* Links de Navegação */}
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/15'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-lg ${item.color} flex items-center justify-center text-white shadow-sm`}
                    >
                      <Icon size={13} />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <span className="text-white/30 text-xs">›</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Coluna de Conteúdo à Direita */}
        <div className="lg:col-span-8 space-y-6">
          {/* Seção: Perfil */}
          <div
            id="section-profile"
            className="p-6 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl space-y-5"
          >
            <div>
              <h2 className="text-base font-bold text-white">Perfil</h2>
              <p className="text-xs text-white/50">Como a equipe vê você no workspace</p>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/20"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-[#141622]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{currentUser.name}</h3>
                <p className="text-xs text-white/60">{currentUser.role}</p>
                <p className="text-[11px] text-white/40">{currentUser.email}</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5">Nome completo</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5">E-mail corporativo</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5">Cargo / Função</label>
                <input
                  type="text"
                  value={profileRole}
                  onChange={(e) => setProfileRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                {profileSaved ? (
                  <span className="text-xs text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                    <Sparkles size={13} /> Perfil atualizado com sucesso!
                  </span>
                ) : (
                  <span />
                )}

                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r ${currentAccent.gradient} shadow-lg transition-all`}
                >
                  Salvar perfil
                </button>
              </div>
            </form>
          </div>

          {/* Seção: Notificações */}
          <div
            id="section-notifications"
            className="p-6 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl space-y-5"
          >
            <div>
              <h2 className="text-base font-bold text-white">Notificações</h2>
              <p className="text-xs text-white/50">Pelo que o Pane chama sua atenção</p>
            </div>

            <div className="space-y-3">
              {[
                {
                  key: 'mentions',
                  title: 'Menções',
                  desc: 'Quando alguém mencionar seu nome em um comentário ou tarefa',
                },
                {
                  key: 'dueDates',
                  title: 'Prazos de entrega',
                  desc: 'Pela manhã quando uma tarefa sua vencer hoje',
                },
                {
                  key: 'meetings',
                  title: 'Reuniões e eventos',
                  desc: '10 minutos antes de um compromisso da agenda',
                },
                {
                  key: 'dailyDigest',
                  title: 'Resumo diário',
                  desc: 'Às 08:30 com as principais metas e compromissos do seu dia',
                },
                {
                  key: 'focusFinished',
                  title: 'Sessão de foco concluída',
                  desc: 'Comemoração e som de notificação ao finalizar um bloco de trabalho',
                },
              ].map((item) => {
                const isEnabled =
                  preferences.notifications[item.key as keyof typeof preferences.notifications];

                return (
                  <div
                    key={item.key}
                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <p className="text-[11px] text-white/50 mt-0.5">{item.desc}</p>
                    </div>

                    {/* Interruptor Toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        updatePreferences({
                          notifications: {
                            ...preferences.notifications,
                            [item.key]: !isEnabled,
                          },
                        })
                      }
                      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                        isEnabled ? 'bg-blue-500' : 'bg-white/20'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seção: Aparência */}
          <div
            id="section-appearance"
            className="p-6 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl space-y-6"
          >
            <div>
              <h2 className="text-base font-bold text-white">Aparência</h2>
              <p className="text-xs text-white/50">O app inteiro se re-tinge através do vidro</p>
            </div>

            {/* Alternador de Tema */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/70 block">Tema</label>
              <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-white/5 border border-white/10">
                {[
                  { id: 'dark' as const, label: 'Escuro', icon: Moon },
                  { id: 'light' as const, label: 'Claro', icon: Sun },
                  { id: 'auto' as const, label: 'Automático', icon: Laptop },
                ].map((th) => {
                  const Icon = th.icon;
                  const isSel = preferences.theme === th.id;
                  return (
                    <button
                      key={th.id}
                      onClick={() => updatePreferences({ theme: th.id })}
                      className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isSel
                          ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/15'
                          : 'text-white/50 hover:text-white'
                      }`}
                    >
                      <Icon size={14} />
                      {th.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-white/40">O modo automático segue a preferência do seu sistema</p>
            </div>

            {/* Seletor de Papéis de Parede */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <label className="text-xs font-bold text-white/70 block">Papel de parede</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {WALLPAPERS.map((wp) => {
                  const isSel = preferences.wallpaper === wp.id;
                  return (
                    <button
                      key={wp.id}
                      onClick={() => updatePreferences({ wallpaper: wp.id })}
                      className={`p-2.5 rounded-2xl border transition-all text-left flex flex-col gap-2 ${
                        isSel
                          ? 'border-blue-400 bg-white/10 ring-2 ring-blue-500/40 shadow-lg'
                          : 'border-white/10 hover:border-white/25 bg-white/[0.02]'
                      }`}
                    >
                      <div
                        className="w-full h-12 rounded-xl shadow-inner border border-white/10"
                        style={{ background: wp.previewGradient }}
                      />
                      <span className="text-xs font-semibold text-white/90">{wp.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seletor de Cor de Destaque */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <label className="text-xs font-bold text-white/70 block">Cor de destaque (Accent)</label>
              <div className="flex items-center gap-3 pt-1">
                {(Object.keys(ACCENTS) as AccentId[]).map((accKey) => {
                  const acc = ACCENTS[accKey];
                  const isSel = preferences.accent === accKey;
                  return (
                    <button
                      key={accKey}
                      onClick={() => updatePreferences({ accent: accKey })}
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                        isSel
                          ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-neutral-900 shadow-lg'
                          : 'opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: acc.hex }}
                      title={acc.name}
                    >
                      {isSel && <Check size={16} strokeWidth={3} className="text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Estilo do Vidro & Transparência */}
            <div className="pt-2 border-t border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Estilo do vidro</h4>
                  <p className="text-[11px] text-white/50">Translúcido revela mais nuances do papel de parede</p>
                </div>

                <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10">
                  <button
                    onClick={() => updatePreferences({ glassStyle: 'clear' })}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      preferences.glassStyle === 'clear'
                        ? 'bg-white/20 text-white'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    Translúcido
                  </button>
                  <button
                    onClick={() => updatePreferences({ glassStyle: 'tinted' })}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      preferences.glassStyle === 'tinted'
                        ? 'bg-white/20 text-white'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    Tingido
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <h4 className="text-xs font-bold text-white">Reduzir transparência</h4>
                  <p className="text-[11px] text-white/50">Superfícies sólidas, sem efeito fosco</p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    updatePreferences({
                      reduceTransparency: !preferences.reduceTransparency,
                    })
                  }
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    preferences.reduceTransparency ? 'bg-blue-500' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      preferences.reduceTransparency ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Seção: Foco */}
          <div
            id="section-focus"
            className="p-6 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl space-y-5"
          >
            <div>
              <h2 className="text-base font-bold text-white">Foco</h2>
              <p className="text-xs text-white/50">O temporizador que a ilha mantém</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Stepper de Sessão */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white">Sessão de foco</span>
                  <p className="text-[11px] text-white/50">Duração padrão</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updatePreferences({
                        focusSessionMinutes: Math.max(5, preferences.focusSessionMinutes - 5),
                      })
                    }
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-white w-14 text-center">
                    {preferences.focusSessionMinutes} min
                  </span>
                  <button
                    onClick={() =>
                      updatePreferences({
                        focusSessionMinutes: Math.min(90, preferences.focusSessionMinutes + 5),
                      })
                    }
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Stepper de Intervalo */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white">Intervalo</span>
                  <p className="text-[11px] text-white/50">Tempo de descanso</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updatePreferences({
                        breakSessionMinutes: Math.max(1, preferences.breakSessionMinutes - 1),
                      })
                    }
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-white w-14 text-center">
                    {preferences.breakSessionMinutes} min
                  </span>
                  <button
                    onClick={() =>
                      updatePreferences({
                        breakSessionMinutes: Math.min(30, preferences.breakSessionMinutes + 1),
                      })
                    }
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-white/60">Pronto para o trabalho profundo?</span>
              <button
                onClick={() => {
                  startFocus(preferences.focusSessionMinutes);
                  setActiveTab('home');
                }}
                className={`px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r ${currentAccent.gradient} shadow-lg flex items-center gap-1.5 transition-all`}
              >
                <Play size={13} fill="currentColor" />
                Iniciar uma sessão agora
              </button>
            </div>
          </div>

          {/* Seção: Dados */}
          <div
            id="section-data"
            className="p-6 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl space-y-5"
          >
            <div>
              <h2 className="text-base font-bold text-white">Dados</h2>
              <p className="text-xs text-white/50">Tudo permanece salvo localmente neste navegador</p>
            </div>

            <div className="space-y-3">
              {/* Exportar Tarefas como CSV */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Exportar tarefas como CSV</h4>
                  <p className="text-[11px] text-white/50">{tasks.length} tarefas, uma linha por registro</p>
                </div>
                <button
                  onClick={exportTasksCSV}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-all flex items-center gap-1.5"
                >
                  <Download size={13} />
                  Exportar CSV
                </button>
              </div>

              {/* Restaurar Dados de Demonstração */}
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-rose-300">Restaurar dados de demonstração</h4>
                  <p className="text-[11px] text-rose-200/60">
                    Restaura o workspace inicial (62 tarefas, 6 projetos, 16 eventos)
                  </p>
                </div>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30 transition-all flex items-center gap-1.5"
                >
                  <RotateCcw size={13} />
                  Restaurar dados
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diálogo de Confirmação de Restauração */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="w-full max-w-sm rounded-3xl bg-[#151722]/95 backdrop-blur-2xl border border-rose-500/30 p-6 text-white shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-white">Restaurar workspace?</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Isso substituirá as alterações do seu localStorage pelos dados de demonstração iniciais em português.
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-2 rounded-xl text-xs text-white/60 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg transition-all"
              >
                Sim, restaurar dados
              </button>
            </div>
          </div>
          <div className="fixed inset-0 -z-10" onClick={() => setShowResetConfirm(false)} />
        </div>
      )}
    </div>
  );
};
