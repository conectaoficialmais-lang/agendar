import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { CommandPalette } from './components/CommandPalette';
import { QuickAddModal } from './components/QuickAddModal';
import { TaskModal } from './components/TaskModal';
import { MemberModal } from './components/MemberModal';

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

  const backgroundStyle = isLight
    ? currentWallpaper.lightBackground
    : currentWallpaper.darkBackground;

  return (
    <div
      className={`min-h-screen text-white relative transition-colors duration-500 ${
        isLight ? 'light-mode' : 'dark'
      }`}
      style={{
        background: backgroundStyle,
        backgroundColor: isLight ? '#f8fafc' : '#0e1017',
      }}
    >
      {/* Dynamic Ambient Blur Glow Layer */}
      <div
        className="fixed inset-0 pointer-events-none opacity-60 mix-blend-screen transition-opacity duration-700"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${
            ACCENTS[preferences.accent]?.glow || 'rgba(59, 130, 246, 0.25)'
          } 0%, transparent 70%)`,
        }}
      />

      {/* Global Left Rail (Sidebar) */}
      <Sidebar />

      {/* Global Floating Top Bar */}
      <TopBar />

      {/* Main Content Area */}
      <main className="min-h-screen px-4 md:px-8 pl-4 md:pl-28 pt-20 md:pt-16 pb-24 md:pb-12 max-w-7xl mx-auto relative z-10">
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
