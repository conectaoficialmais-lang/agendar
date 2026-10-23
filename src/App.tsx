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

const MainShell: React.FC = () => {
  const { activeTab, preferences } = useApp();

  // A cor de destaque escolhida nas Configurações agora dirige toda a interface
  // através da variável CSS --accent (aurora, foco, hovers, realces).
  const accentHex = ACCENTS[preferences.accent]?.hex || ACCENTS.blue.hex;

  return (
    <div
      className="min-h-screen text-white relative font-sans"
      style={{ ['--accent' as string]: accentHex } as React.CSSProperties}
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
        className="min-h-screen px-4 md:px-8 pl-4 md:pl-[244px] pt-4 md:pt-6 pb-24 md:pb-12 max-w-[1720px] mx-auto relative z-10 rise"
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
