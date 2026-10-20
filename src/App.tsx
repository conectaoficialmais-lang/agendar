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
      className="min-h-screen text-white relative font-sans selection:bg-white/20 selection:text-white"
      style={{
        background: '#0a0a0b',
        backgroundColor: '#0a0a0b',
      }}
    >
      {/* Dynamic Ambient Blur Glow Layer */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 mix-blend-screen transition-opacity duration-700"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 0%, rgba(120, 119, 198, 0.08) 0%, transparent 70%)`,
        }}
      />

      {/* Global Left Rail (Sidebar) */}
      <Sidebar />

      {/* Global Floating Top Bar */}
      <TopBar />

      {/* Main Content Area */}
      <main className="min-h-screen px-4 md:px-8 pl-4 md:pl-[244px] pt-4 md:pt-6 pb-24 md:pb-12 max-w-[1720px] mx-auto relative z-10">
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
