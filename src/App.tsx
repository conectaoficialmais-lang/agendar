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

import { WALLPAPERS, ACCENTS } from './themeUtils';

const MainShell: React.FC = () => {
  const { activeTab, preferences } = useApp();

  const currentWallpaper =
    WALLPAPERS.find((w) => w.id === preferences.wallpaper) || WALLPAPERS[0];
  const isLight = preferences.theme === 'light';

  return (
    <div
      className="min-h-screen text-white relative font-sans selection:bg-blue-500/30 selection:text-white"
      style={{
        background: '#0d0e12',
        backgroundColor: '#0d0e12',
      }}
    >
      {/* Pane subtle ambient depth */}
      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-700 opacity-60"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255, 255, 255, 0.03) 0%, transparent 60%),
            radial-gradient(circle at 10% 20%, rgba(168, 85, 247, 0.02) 0%, transparent 40%),
            radial-gradient(circle at 90% 60%, rgba(59, 130, 246, 0.02) 0%, transparent 40%)
          `,
        }}
      />

      {/* Global Left Rail (Sidebar) */}
      <Sidebar />

      {/* Global Floating Top Bar */}
      <TopBar />

      {/* Main Content Area */}
      <main className="min-h-screen px-4 md:px-8 pl-4 md:pl-[244px] pt-4 md:pt-6 pb-24 md:pb-12 max-w-[1720px] mx-auto relative z-10">
        {/* Overdue Task Alert Banner */}
        <OverdueAlertBanner />

        {activeTab === 'home' && <HomeView />}
        {activeTab === 'tasks' && <TasksView />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'projects' && <ProjectsView />}
        {activeTab === 'insights' && <InsightsView />}
        {activeTab === 'team' && <TeamView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Global Modals */}
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
