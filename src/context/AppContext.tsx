import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Task,
  Project,
  CalendarEvent,
  TeamMember,
  UserPreferences,
  AppNotification,
  TaskStatus,
} from '../types';
import {
  DEFAULT_PREFERENCES,
  SEED_CALENDAR_EVENTS,
  SEED_MEMBERS,
  SEED_NOTIFICATIONS,
  SEED_PROJECTS,
  SEED_TASKS,
} from '../seedData';

const STORAGE_KEYS = {
  TASKS: 'pane_tasks_pt_v2',
  PROJECTS: 'pane_projects_pt_v2',
  EVENTS: 'pane_events_pt_v2',
  MEMBERS: 'pane_members_pt_v2',
  PREFERENCES: 'pane_prefs_pt_v2',
  NOTIFICATIONS: 'pane_notifications_pt_v2',
  FOCUS: 'pane_focus_pt_v2',
};

interface AppContextType {
  tasks: Task[];
  projects: Project[];
  events: CalendarEvent[];
  members: TeamMember[];
  preferences: UserPreferences;
  notifications: AppNotification[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: TeamMember;

  // Modals & Panels
  isCommandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;

  isQuickAddOpen: boolean;
  quickAddType: 'task' | 'event' | 'project';
  openQuickAdd: (type?: 'task' | 'event' | 'project') => void;
  closeQuickAdd: () => void;

  selectedTaskId: string | null;
  openTaskModal: (id: string) => void;
  closeTaskModal: () => void;

  selectedProjectId: string | null;
  openProjectDetail: (id: string) => void;
  closeProjectDetail: () => void;

  selectedMemberId: string | null;
  openMemberModal: (id: string) => void;
  closeMemberModal: () => void;

  // Dynamic synchronized statistics
  openTasksCount: number;
  doneTodayCount: number;
  doneThisWeekCount: number;
  dueThisWeekCount: number;
  overdueCount: number;
  overdueTasks: Task[];
  isOverdueAlertDismissed: boolean;
  dismissOverdueAlert: () => void;
  showOverdueAlert: () => void;
  rescheduleTask: (taskId: string, newDueDate?: string, newDueDisplay?: string) => void;
  rescheduleAllOverdue: () => void;
  completeAllOverdue: () => void;
  totalCompletedCount: number;
  onTimeRate: number;
  getProjectStats: (projectId: string) => { total: number; done: number; progress: number };
  getMemberOpenCount: (memberId: string) => number;

  // Task actions
  toggleTaskComplete: (taskId: string) => void;
  moveTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  addTask: (taskData: {
    title: string;
    projectId: string;
    priority: Task['priority'];
    status: TaskStatus;
    dueDate: string;
    dueDisplay: string;
    assigneeId: string;
    description?: string;
  }) => Task;
  updateTask: (taskId: string, patch: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addTaskComment: (taskId: string, content: string) => void;

  // Project actions
  toggleProjectStar: (projectId: string) => void;
  addProject: (project: Omit<Project, 'id'>) => Project;
  updateProject: (projectId: string, patch: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;

  // Calendar actions
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => CalendarEvent;
  deleteCalendarEvent: (eventId: string) => void;

  // Team & Member actions
  updateUserProfile: (patch: Partial<TeamMember>) => void;
  deleteTeamMember: (memberId: string) => void;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => TeamMember;

  // Preferences
  updatePreferences: (patch: Partial<UserPreferences>) => void;
  toggleTheme: () => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Focus Timer
  focusDuration: number;
  focusRemaining: number;
  isFocusRunning: boolean;
  focusTaskId: string | null;
  focusedMinutesToday: number;
  focusSessionsToday: number;
  startFocus: (duration?: number, taskId?: string | null) => void;
  pauseFocus: () => void;
  resetFocus: () => void;
  setFocusDurationMinutes: (minutes: number) => void;
  setFocusTaskId: (id: string | null) => void;

  // Data
  resetDemoData: () => void;
  exportTasksCSV: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#/project/') || hash.startsWith('#/projects/')) {
      const parts = hash.split('/');
      return parts[2] || null;
    }
    return null;
  });

  // Navigation via Hash
  const [activeTab, setActiveTabState] = useState<string>(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#/project/') || hash.startsWith('#/projects/')) {
      return 'projects';
    }
    const cleanTab = hash.replace('#/', '');
    const validTabs = ['home', 'tasks', 'calendar', 'projects', 'insights', 'team', 'settings'];
    return validTabs.includes(cleanTab) ? cleanTab : 'home';
  });

  const setActiveTab = (tab: string) => {
    window.location.hash = `#/${tab}`;
    setActiveTabState(tab);
    if (tab !== 'projects') {
      setSelectedProjectId(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openProjectDetail = (id: string) => {
    setSelectedProjectId(id);
    setActiveTabState('projects');
    window.location.hash = `#/projects/${id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeProjectDetail = () => {
    setSelectedProjectId(null);
    window.location.hash = `#/projects`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/projects/') || hash.startsWith('#/project/')) {
        const id = hash.split('/')[2];
        if (id) {
          setSelectedProjectId(id);
          setActiveTabState('projects');
          return;
        }
      }
      const cleanTab = hash.replace('#/', '');
      const validTabs = ['home', 'tasks', 'calendar', 'projects', 'insights', 'team', 'settings'];
      if (validTabs.includes(cleanTab)) {
        setActiveTabState(cleanTab);
        if (cleanTab !== 'projects') {
          setSelectedProjectId(null);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Persistent States
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      return saved ? JSON.parse(saved) : SEED_TASKS;
    } catch {
      return SEED_TASKS;
    }
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (saved) {
        const parsed: Project[] = JSON.parse(saved);
        if (parsed.some((p) => p.name === 'Aplicativo móvel Tide' || p.name === 'Lançamento Orbit 2.0')) {
          localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(SEED_PROJECTS));
          return SEED_PROJECTS;
        }
        return parsed;
      }
      return SEED_PROJECTS;
    } catch {
      return SEED_PROJECTS;
    }
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return saved ? JSON.parse(saved) : SEED_CALENDAR_EVENTS;
    } catch {
      return SEED_CALENDAR_EVENTS;
    }
  });

  const [members, setMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      return saved ? JSON.parse(saved) : SEED_MEMBERS;
    } catch {
      return SEED_MEMBERS;
    }
  });

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return saved ? { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : SEED_NOTIFICATIONS;
    } catch {
      return SEED_NOTIFICATIONS;
    }
  });

  // Focus Timer State
  const [focusDuration, setFocusDuration] = useState<number>(25 * 60);
  const [focusRemaining, setFocusRemaining] = useState<number>(25 * 60);
  const [isFocusRunning, setIsFocusRunning] = useState<boolean>(false);
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  const [focusedMinutesToday, setFocusedMinutesToday] = useState<number>(66); // 1.1h initial
  const [focusSessionsToday, setFocusSessionsToday] = useState<number>(2);

  // Modals state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'task' | 'event' | 'project'>('task');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Dynamic Metrics & Stats Synchronized with Tasks State
  const openTasks = tasks.filter((t) => t.status !== 'done');
  const openTasksCount = openTasks.length;

  const doneTodayTasks = tasks.filter(
    (t) =>
      t.status === 'done' &&
      ((t.completedAt && t.completedAt.startsWith('2026-10-19')) ||
        t.dueDate === '2026-10-19' ||
        t.dueDisplay === 'Hoje')
  );
  const doneTodayCount = doneTodayTasks.length;

  const doneThisWeekTasks = tasks.filter((t) => t.status === 'done');
  const doneThisWeekCount = doneThisWeekTasks.length;

  const dueThisWeekCount = tasks.filter(
    (t) =>
      t.status !== 'done' &&
      (t.dueDate.startsWith('2026-10-1') ||
        t.dueDate.startsWith('2026-10-2') ||
        ['Hoje', 'Amanhã', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom', 'Today'].includes(t.dueDisplay))
  ).length;

  const CURRENT_DATE_STR = '2026-10-22';
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'done' && t.dueDate && t.dueDate < CURRENT_DATE_STR
  );
  const overdueCount = overdueTasks.length;

  const [isOverdueAlertDismissed, setIsOverdueAlertDismissed] = useState(false);
  const dismissOverdueAlert = () => setIsOverdueAlertDismissed(true);
  const showOverdueAlert = () => setIsOverdueAlertDismissed(false);

  const rescheduleTask = (taskId: string, newDueDate: string = CURRENT_DATE_STR, newDueDisplay: string = 'Hoje') => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, dueDate: newDueDate, dueDisplay: newDueDisplay } : t))
    );
    try {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
  };

  const rescheduleAllOverdue = () => {
    setTasks((prev) =>
      prev.map((t) =>
        t.status !== 'done' && t.dueDate && t.dueDate < CURRENT_DATE_STR
          ? { ...t, dueDate: CURRENT_DATE_STR, dueDisplay: 'Hoje' }
          : t
      )
    );
    try {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  const completeAllOverdue = () => {
    setTasks((prev) =>
      prev.map((t) =>
        t.status !== 'done' && t.dueDate && t.dueDate < CURRENT_DATE_STR
          ? { ...t, status: 'done', completedAt: new Date().toISOString() }
          : t
      )
    );
    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  const doneTasksAll = tasks.filter((t) => t.status === 'done');
  const totalCompletedCount = 109 + doneTasksAll.length;
  const baseLateCount = Math.max(4, overdueCount);
  const onTimeRate = Math.min(
    100,
    Math.max(60, Math.round(((totalCompletedCount - baseLateCount) / Math.max(1, totalCompletedCount)) * 100))
  );

  const getProjectStats = (projectId: string) => {
    const projTasks = tasks.filter((t) => t.projectId === projectId);
    const done = projTasks.filter((t) => t.status === 'done').length;
    const total = projTasks.length || 1;
    const progress = Math.round((done / total) * 100);
    return { total: projTasks.length, done, progress };
  };

  const getMemberOpenCount = (memberId: string) => {
    return tasks.filter((t) => t.assigneeId === memberId && t.status !== 'done').length;
  };

  // Focus countdown timer effect
  useEffect(() => {
    let interval: any = null;
    if (isFocusRunning && focusRemaining > 0) {
      interval = setInterval(() => {
        setFocusRemaining((prev) => {
          if (prev <= 1) {
            setIsFocusRunning(false);
            setFocusedMinutesToday((m) => m + Math.round(focusDuration / 60));
            setFocusSessionsToday((s) => s + 1);
            try {
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            } catch {
              // ignore
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isFocusRunning, focusRemaining, focusDuration]);

  // Global keyboard shortcuts (Cmd+K / Ctrl+K for command palette)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentUser = members.find((m) => m.isCurrentUser) || members[0];

  // Actions
  const toggleTaskComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isDone = t.status === 'done';
          const newStatus: TaskStatus = isDone ? 'todo' : 'done';
          if (!isDone) {
            try {
              confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 },
                colors: ['#3b82f6', '#10b981', '#8b5cf6'],
              });
            } catch {
              // ignore
            }
          }
          return {
            ...t,
            status: newStatus,
            completedAt: !isDone ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const moveTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status: newStatus,
            completedAt: newStatus === 'done' ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const addTask = (taskData: {
    title: string;
    projectId: string;
    priority: Task['priority'];
    status: TaskStatus;
    dueDate: string;
    dueDisplay: string;
    assigneeId: string;
    description?: string;
  }): Task => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title,
      projectId: taskData.projectId,
      priority: taskData.priority,
      status: taskData.status,
      dueDate: taskData.dueDate,
      dueDisplay: taskData.dueDisplay || 'Hoje',
      assigneeId: taskData.assigneeId || currentUser.id,
      description: taskData.description || '',
      subtasks: [],
      comments: [],
      daysOpen: 0,
      completedAt: taskData.status === 'done' ? new Date().toISOString() : undefined,
    };

    setTasks((prev) => [newTask, ...prev]);

    // Push real-time notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Nova tarefa registrada',
        subtitle: taskData.title,
        time: 'Agora',
        read: false,
        type: 'task',
        linkTab: 'tasks',
      },
      ...prev,
    ]);

    return newTask;
  };

  const updateTask = (taskId: string, patch: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...patch } : t)));
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTaskId === taskId) setSelectedTaskId(null);
  };

  const addSubtask = (taskId: string, title: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: [...t.subtasks, { id: `st-${Date.now()}`, title, completed: false }],
          };
        }
        return t;
      })
    );
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: t.subtasks.map((st) =>
              st.id === subtaskId ? { ...st, completed: !st.completed } : st
            ),
          };
        }
        return t;
      })
    );
  };

  const addTaskComment = (taskId: string, content: string) => {
    const newComment = {
      id: `c-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      content,
      createdAt: 'Agora mesmo',
    };
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, comments: [...t.comments, newComment] } : t))
    );
  };

  const toggleProjectStar = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, starred: !p.starred } : p))
    );
  };

  const addProject = (projectData: Omit<Project, 'id'>): Project => {
    const newProj: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
    };
    setProjects((prev) => [newProj, ...prev]);
    return newProj;
  };

  const updateProject = (projectId: string, patch: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, ...patch } : p)));
  };

  const deleteProject = (projectId: string) => {
    const projToDelete = projects.find((p) => p.id === projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    // Cleanly remove associated tasks
    setTasks((prev) => prev.filter((t) => t.projectId !== projectId));
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Projeto excluído',
        subtitle: projToDelete ? `Projeto "${projToDelete.name}" foi removido com sucesso` : 'Projeto removido',
        time: 'Agora',
        read: false,
        type: 'system',
        linkTab: 'projects',
      },
      ...prev,
    ]);
  };

  const addCalendarEvent = (eventData: Omit<CalendarEvent, 'id'>): CalendarEvent => {
    const newEv: CalendarEvent = {
      ...eventData,
      id: `ev-${Date.now()}`,
    };
    setEvents((prev) => [...prev, newEv]);
    return newEv;
  };

  const deleteCalendarEvent = (eventId: string) => {
    const ev = events.find((e) => e.id === eventId);
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Evento removido',
        subtitle: ev ? `"${ev.title}" foi removido da agenda` : 'Evento removido',
        time: 'Agora',
        read: false,
        type: 'system',
        linkTab: 'calendar',
      },
      ...prev,
    ]);
  };

  const updateUserProfile = (patch: Partial<TeamMember>) => {
    setMembers((prev) =>
      prev.map((m) => (m.isCurrentUser ? { ...m, ...patch } : m))
    );
  };

  const deleteTeamMember = (memberId: string) => {
    const mem = members.find((m) => m.id === memberId);
    if (mem?.isCurrentUser) {
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    if (selectedMemberId === memberId) {
      setSelectedMemberId(null);
    }
    setProjects((prev) =>
      prev.map((p) => ({
        ...p,
        memberIds: p.memberIds.filter((id) => id !== memberId),
      }))
    );
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Membro removido',
        subtitle: mem ? `${mem.name} foi removido da equipe` : 'Membro removido',
        time: 'Agora',
        read: false,
        type: 'system',
        linkTab: 'team',
      },
      ...prev,
    ]);
  };

  const addTeamMember = (memberData: Omit<TeamMember, 'id'>): TeamMember => {
    const newMember: TeamMember = {
      ...memberData,
      id: `mem-${Date.now()}`,
    };
    setMembers((prev) => [...prev, newMember]);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Novo membro na equipe',
        subtitle: `${newMember.name} foi adicionado(a) ao workspace`,
        time: 'Agora',
        read: false,
        type: 'system',
        linkTab: 'team',
      },
      ...prev,
    ]);
    return newMember;
  };

  const updatePreferences = (patch: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...patch }));
  };

  const toggleTheme = () => {
    setPreferences((prev) => {
      const nextTheme = prev.theme === 'dark' ? 'light' : prev.theme === 'light' ? 'auto' : 'dark';
      return { ...prev, theme: nextTheme };
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const startFocus = (durationMinutes?: number, taskId?: string | null) => {
    if (durationMinutes) {
      setFocusDuration(durationMinutes * 60);
      setFocusRemaining(durationMinutes * 60);
    }
    if (taskId !== undefined) {
      setFocusTaskId(taskId);
    }
    setIsFocusRunning(true);
  };

  const pauseFocus = () => {
    setIsFocusRunning(false);
  };

  const resetFocus = () => {
    setIsFocusRunning(false);
    setFocusRemaining(focusDuration);
  };

  const setFocusDurationMinutes = (minutes: number) => {
    setFocusDuration(minutes * 60);
    setFocusRemaining(minutes * 60);
    setIsFocusRunning(false);
  };

  const resetDemoData = () => {
    setTasks(SEED_TASKS);
    setProjects(SEED_PROJECTS);
    setEvents(SEED_CALENDAR_EVENTS);
    setMembers(SEED_MEMBERS);
    setPreferences(DEFAULT_PREFERENCES);
    setNotifications(SEED_NOTIFICATIONS);
    setFocusedMinutesToday(66);
    setFocusSessionsToday(2);
    setFocusDuration(25 * 60);
    setFocusRemaining(25 * 60);
    setIsFocusRunning(false);
    setFocusTaskId(null);
    localStorage.clear();
  };

  const exportTasksCSV = () => {
    const headers = ['ID', 'Título', 'Projeto', 'Status', 'Prioridade', 'Data de Entrega', 'Responsável'];
    const rows = tasks.map((t) => {
      const p = projects.find((proj) => proj.id === t.projectId)?.name || t.projectId;
      const m = members.find((mem) => mem.id === t.assigneeId)?.name || t.assigneeId;
      return [
        t.id,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${p}"`,
        t.status,
        t.priority,
        t.dueDate,
        `"${m}"`,
      ].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pane-tarefas-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        projects,
        events,
        members,
        preferences,
        notifications,
        activeTab,
        setActiveTab,
        currentUser,

        isCommandPaletteOpen,
        openCommandPalette: () => setIsCommandPaletteOpen(true),
        closeCommandPalette: () => setIsCommandPaletteOpen(false),

        isQuickAddOpen,
        quickAddType,
        openQuickAdd: (type = 'task') => {
          setQuickAddType(type);
          setIsQuickAddOpen(true);
        },
        closeQuickAdd: () => setIsQuickAddOpen(false),

        selectedTaskId,
        openTaskModal: (id: string) => setSelectedTaskId(id),
        closeTaskModal: () => setSelectedTaskId(null),

        selectedProjectId,
        openProjectDetail,
        closeProjectDetail,

        selectedMemberId,
        openMemberModal: (id: string) => setSelectedMemberId(id),
        closeMemberModal: () => setSelectedMemberId(null),

        // Synchronized metrics
        openTasksCount,
        doneTodayCount,
        doneThisWeekCount,
        dueThisWeekCount,
        overdueCount,
        overdueTasks,
        isOverdueAlertDismissed,
        dismissOverdueAlert,
        showOverdueAlert,
        rescheduleTask,
        rescheduleAllOverdue,
        completeAllOverdue,
        totalCompletedCount,
        onTimeRate,
        getProjectStats,
        getMemberOpenCount,

        toggleTaskComplete,
        moveTaskStatus,
        addTask,
        updateTask,
        deleteTask,
        addSubtask,
        toggleSubtask,
        addTaskComment,

        toggleProjectStar,
        addProject,
        updateProject,
        deleteProject,

        addCalendarEvent,
        deleteCalendarEvent,
        updateUserProfile,
        deleteTeamMember,
        addTeamMember,
        updatePreferences,
        toggleTheme,

        markNotificationRead,
        markAllNotificationsRead,

        focusDuration,
        focusRemaining,
        isFocusRunning,
        focusTaskId,
        focusedMinutesToday,
        focusSessionsToday,
        startFocus,
        pauseFocus,
        resetFocus,
        setFocusDurationMinutes,
        setFocusTaskId,

        resetDemoData,
        exportTasksCSV,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
