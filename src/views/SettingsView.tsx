import React, { useState, useRef } from 'react';
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
  Camera,
  Upload,
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
  const [profileAvatar, setProfileAvatar] = useState(currentUser.avatar);
  const [profileSaved, setProfileSaved] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PRESET_AVATARS = [
    { name: 'Lin (Padrão)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
    { name: 'Alex', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
    { name: 'Sofia', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
    { name: 'Marco', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
    { name: 'Elena', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80' },
    { name: 'Lucas', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80' },
    { name: 'Nia', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80' },
    { name: 'Dev 3D', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Avatares são salvos em base64 no localStorage; limite baixo evita estourar a cota.
    if (file.size > 1.5 * 1024 * 1024) {
      alert('Por favor, escolha uma imagem de até 1,5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setProfileAvatar(result);
        updateUserProfile({ avatar: result });
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 2500);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url: string) => {
    setProfileAvatar(url);
    updateUserProfile({ avatar: url });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleApplyCustomUrl = () => {
    if (!customAvatarUrl.trim()) return;
    setProfileAvatar(customAvatarUrl.trim());
    updateUserProfile({ avatar: customAvatarUrl.trim() });
    setCustomAvatarUrl('');
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: profileName,
      email: profileEmail,
      role: profileRole,
      avatar: profileAvatar,
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
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* ════════════════════════════════════
          HEADER / TOPO
          ════════════════════════════════════ */}
      <div>
        <h1 className="text-[38px] md:text-[42px] font-bold tracking-tight text-white leading-none">
          Configurações
        </h1>
        <p className="text-[#8b8b90] text-sm mt-1.5 font-normal">
          Seu perfil, o visual do Pane e preferências de notificações do sistema
        </p>
      </div>

      {/* Layout de 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Menu Lateral em Cartão */}
        <div className="lg:col-span-4 p-4 rounded-[16px] panel shadow-sm space-y-3 sticky top-6">
          {/* Mini Banner do Usuário */}
          <div className="flex items-center gap-3 p-3 rounded-[12px] panel-inset">
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-[10px] object-cover ring-1 ring-white/10"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-[#131417]" />
            </div>
            <div className="truncate">
              <h3 className="text-xs font-bold text-white truncate">{currentUser.name}</h3>
              <p className="text-[11px] text-[#8b8b90] truncate">{currentUser.email}</p>
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
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white/[0.12] text-white shadow-sm font-semibold'
                      : 'text-[#8b8b90] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={14} className={isActive ? 'text-white' : 'text-[#8b8b90]'} />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[#8b8b90] text-xs">›</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Coluna de Conteúdo à Direita */}
        <div className="lg:col-span-8 space-y-5">
          {/* Seção: Perfil */}
          <div
            id="section-profile"
            className="p-5 rounded-[16px] panel shadow-sm space-y-5"
          >
            <div>
              <h2 className="text-sm font-bold text-white">Perfil</h2>
              <p className="text-xs text-[#8b8b90]">Como a equipe vê você no workspace</p>
            </div>

            {/* Card com Foto de Perfil e Controles */}
            <div className="p-4 rounded-[12px] panel-inset space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    <img
                      src={profileAvatar || currentUser.avatar}
                      alt={currentUser.name}
                      className="w-14 h-14 rounded-[14px] object-cover ring-1 ring-white/10 shadow-md group-hover:brightness-90 transition-all"
                    />
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-[#131417]" />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 flex items-center justify-center rounded-[14px] bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white"
                      title="Enviar nova foto"
                    >
                      <Camera size={18} />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">{currentUser.name}</h3>
                    <p className="text-xs text-[#8b8b90]">{currentUser.role}</p>
                    <p className="text-[11px] text-[#8b8b90]/70">{currentUser.email}</p>
                  </div>
                </div>

                {/* Botão de Upload de Foto */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-white/[0.1] hover:bg-white/[0.16] border border-white/[0.1] transition-all flex items-center gap-1.5"
                  >
                    <Upload size={13} />
                    <span>Carregar foto</span>
                  </button>
                </div>
              </div>

              {/* Seletor de Avatares Predefinidos */}
              <div className="pt-3 border-t border-white/[0.04] space-y-2">
                <label className="block text-[11px] font-semibold text-[#8b8b90] uppercase tracking-wider">
                  Avatares predefinidos
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {PRESET_AVATARS.map((p) => {
                    const isSel = profileAvatar === p.url;
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => handleSelectPreset(p.url)}
                        className={`relative rounded-[10px] overflow-hidden transition-all ${
                          isSel ? 'ring-2 ring-blue-500 scale-105' : 'opacity-70 hover:opacity-100'
                        }`}
                        title={p.name}
                      >
                        <img src={p.url} alt={p.name} className="w-full h-10 object-cover" />
                        {isSel && (
                          <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                            <Check size={12} className="text-white font-bold" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Formulário de Perfil */}
            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-medium text-[#8b8b90] block mb-1">Nome completo</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-[10px] bg-[#0d0e11] border border-white/[0.06] text-xs text-white focus:outline-none focus:border-white/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#8b8b90] block mb-1">E-mail</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-[10px] bg-[#0d0e11] border border-white/[0.06] text-xs text-white focus:outline-none focus:border-white/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#8b8b90] block mb-1">Cargo / Função</label>
                <input
                  type="text"
                  value={profileRole}
                  onChange={(e) => setProfileRole(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-[10px] bg-[#0d0e11] border border-white/[0.06] text-xs text-white focus:outline-none focus:border-white/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                {profileSaved && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                    <Check size={13} />
                    Alterações salvas com sucesso!
                  </span>
                )}
                <div className="ml-auto">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-md active:scale-95"
                  >
                    Salvar perfil
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Seção: Notificações */}
          <div
            id="section-notifications"
            className="p-5 rounded-[16px] panel shadow-sm space-y-4"
          >
            <div>
              <h2 className="text-sm font-bold text-white">Notificações</h2>
              <p className="text-xs text-[#8b8b90]">Pelo que o Pane chama sua atenção</p>
            </div>

            <div className="space-y-2.5">
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
              ].map((item) => {
                const isEnabled =
                  preferences.notifications[item.key as keyof typeof preferences.notifications];

                return (
                  <div
                    key={item.key}
                    className="p-3.5 rounded-[12px] panel-inset flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <p className="text-[11px] text-[#8b8b90] mt-0.5">{item.desc}</p>
                    </div>

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
                      className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${
                        isEnabled ? 'bg-blue-600' : 'bg-white/15'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
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
            className="p-5 rounded-[16px] panel shadow-sm space-y-5"
          >
            <div>
              <h2 className="text-sm font-bold text-white">Aparência</h2>
              <p className="text-xs text-[#8b8b90]">Tema e cor do Pane</p>
            </div>

            {/* Alternador de Tema — só o escuro está ligado por enquanto */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#8b8b90] block">Tema do sistema</label>
              <div className="flex items-center p-1 rounded-full panel-inset max-w-sm">
                {[
                  { id: 'dark' as const, label: 'Escuro', icon: Moon, ready: true },
                  { id: 'light' as const, label: 'Claro', icon: Sun, ready: false },
                  { id: 'auto' as const, label: 'Auto', icon: Laptop, ready: false },
                ].map((th) => {
                  const Icon = th.icon;
                  const isSel = preferences.theme === th.id;
                  return (
                    <button
                      key={th.id}
                      disabled={!th.ready}
                      onClick={() => th.ready && updatePreferences({ theme: th.id })}
                      title={th.ready ? undefined : 'Em breve'}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        isSel
                          ? 'bg-white/[0.12] text-white shadow-sm'
                          : th.ready
                          ? 'text-[#8b8b90] hover:text-white'
                          : 'text-[#8b8b90]/40 cursor-not-allowed'
                      }`}
                    >
                      <Icon size={13} />
                      <span>{th.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-[#8b8b90]/70">Tema claro e automático chegam em breve.</p>
            </div>

            {/* Cor de Destaque — agora dirige toda a interface via --accent */}
            <div className="space-y-2 pt-2 border-t border-white/[0.04]">
              <label className="text-xs font-medium text-[#8b8b90] block">Cor de destaque</label>
              <div className="flex items-center gap-2.5 pt-1">
                {(Object.keys(ACCENTS) as AccentId[]).map((accKey) => {
                  const acc = ACCENTS[accKey];
                  const isSel = preferences.accent === accKey;
                  return (
                    <button
                      key={accKey}
                      onClick={() => updatePreferences({ accent: accKey })}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isSel
                          ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#0d0f17] shadow-lg'
                          : 'opacity-75 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: acc.hex }}
                      title={acc.name}
                    >
                      {isSel && <Check size={14} strokeWidth={3} className="text-white" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-[#8b8b90]/70">
                Tinge a aurora, os realces e o foco em toda a interface.
              </p>
            </div>
          </div>

          {/* Seção: Foco */}
          <div
            id="section-focus"
            className="p-5 rounded-[16px] panel shadow-sm space-y-5"
          >
            <div>
              <h2 className="text-sm font-bold text-white">Foco</h2>
              <p className="text-xs text-[#8b8b90]">Durações padrão do cronômetro de foco</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[#8b8b90] block">Duração da sessão de foco</label>
              <div className="flex items-center p-1 rounded-full panel-inset max-w-xs">
                {[15, 25, 50].map((mins) => {
                  const isSel = preferences.focusSessionMinutes === mins;
                  return (
                    <button
                      key={mins}
                      onClick={() => updatePreferences({ focusSessionMinutes: mins })}
                      className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        isSel ? 'bg-white/[0.12] text-white shadow-sm' : 'text-[#8b8b90] hover:text-white'
                      }`}
                    >
                      {mins} min
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                startFocus(preferences.focusSessionMinutes);
                setActiveTab('home');
              }}
              className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Play size={13} />
              <span>Iniciar foco agora</span>
            </button>
          </div>

          {/* Seção: Dados */}
          <div
            id="section-data"
            className="p-5 rounded-[16px] panel shadow-sm space-y-4"
          >
            <div>
              <h2 className="text-sm font-bold text-white">Dados & Backup</h2>
              <p className="text-xs text-[#8b8b90]">Persistência local no navegador</p>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-[12px] panel-inset flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Exportar tarefas (CSV)</h4>
                  <p className="text-[11px] text-[#8b8b90]">{tasks.length} tarefas cadastradas</p>
                </div>
                <button
                  onClick={exportTasksCSV}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.08] transition-all flex items-center gap-1.5"
                >
                  <Download size={13} />
                  <span>Exportar</span>
                </button>
              </div>

              <div className="p-3.5 rounded-[12px] bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-rose-300">Restaurar dados iniciais</h4>
                  <p className="text-[11px] text-rose-200/60">
                    Restaura as 62 tarefas e 6 projetos padrão
                  </p>
                </div>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 shadow-md transition-all flex items-center gap-1.5"
                >
                  <RotateCcw size={13} />
                  <span>Restaurar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmação de Restauração */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
          <div
            className="w-full max-w-sm rounded-[18px] bg-[#151722]/95 backdrop-blur-2xl border border-white/15 p-6 text-white shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-white">Restaurar workspace?</h3>
            <p className="text-xs text-[#8b8b90] leading-relaxed">
              Isso restaurará todos os dados de demonstração iniciais em português.
            </p>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-full text-xs font-medium text-[#8b8b90] hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white shadow-md transition-all"
              >
                Sim, restaurar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
