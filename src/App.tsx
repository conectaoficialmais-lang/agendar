import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { CommandPalette } from './components/CommandPalette';
import { QuickAddModal } from './components/QuickAddModal';
import { TaskModal } from './components/TaskModal';
import { MemberModal } from './components/MemberModal';
import { OverdueAlertBanner } from './components/OverdueAlertBanner';

import { HomeView } from './views/HomeView';
import { TasksView } from './views/TasksView';
import { CalendarView } from './views/CalendarView';
import { ProjectsView } from './views/ProjectsView';
import { InsightsView } from './views/InsightsView';
import { TeamView } from './views/TeamView';
import { SettingsView } from './views/SettingsView';

import { ACCENTS } from './themeUtils';

/**
 * Escolhe a "tinta" legível sobre uma superfície preenchida com a cor de destaque.
 * Cores claras (lima) pedem texto quase preto; cores escuras (azul/roxo) pedem branco.
 * Baseado na luminância relativa (WCAG).
 */
function inkFor(hex: string): string {
  const h = hex.replace('#', '');
  const toLin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const r = toLin(parseInt(h.slice(0, 2), 16));
  const g = toLin(parseInt(h.slice(2, 4), 16));
  const b = toLin(parseInt(h.slice(4, 6), 16));
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 0.55 ? '#07140a' : '#ffffff';
}

const MainShell: React.FC = () => {
  const { activeTab, preferences } = useApp();

  // A cor de destaque escolhida nas Configurações agora dirige toda a interface
  // através da variável CSS --accent (aurora, foco, hovers, realces). --accent-ink
  // é a cor de texto legível sobre botões/chips preenchidos com o destaque.
  const accentHex = ACCENTS[preferences.accent]?.hex || ACCENTS.lime.hex;
  const accentInk = inkFor(accentHex);

  return (
    <div
      className="min-h-screen text-white relative font-sans"
      style={
        {
          ['--accent' as string]: accentHex,
          ['--accent-ink' as string]: accentInk,
        } as React.CSSProperties
      }
    >
      {/* Camada de atmosfera (aurora + grão) */}
      <div className="app-aurora" />

      {/* Trilho lateral */}
      <Sidebar />

      {/* Barra superior flutuante */}
      <TopBar />

      {/* Conteúdo principal */}
      <main
        key={activeTab}
        className="min-h-screen px-4 md:px-8 pl-4 md:pl-[108px] pt-4 md:pt-6 pb-24 md:pb-12 max-w-[1720px] mx-auto relative z-10 rise"
      >
        <OverdueAlertBanner />

        {activeTab === 'home' && <HomeView />}
        {activeTab === 'tasks' && <TasksView />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'projects' && <ProjectsView />}
        {activeTab === 'insights' && <InsightsView />}
        {activeTab === 'team' && <TeamView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Modais globais */}
      <CommandPalette />
      <QuickAddModal />
      <TaskModal />
      <MemberModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainShell />
    </AppProvider>
  );
}
