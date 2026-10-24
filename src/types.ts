export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low';

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string; // e.g. "2026-10-19"
  dueDisplay: string; // e.g. "Hoje", "19 Out", "Qui"
  assigneeId: string;
  subtasks: Subtask[];
  comments: TaskComment[];
  completedAt?: string;
  createdAt?: string; // quando a tarefa foi criada (para tempo de ciclo / idade)
  daysOpen?: number;
}

export interface MilestoneItem {
  id: string;
  title: string;
  date: string;
  status: 'done' | 'next' | 'pending';
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: 'In progress' | 'In review' | 'Planning' | 'Shipped' | 'Em andamento' | 'Em revisão' | 'Planejamento' | 'Entregue';
  color: string;
  icon: string;
  startDate?: string;
  startDisplay?: string;
  dueDate: string;
  dueDisplay: string;
  daysLeft?: number;
  nextMilestone: {
    title: string;
    dueDate: string;
    dueDisplay: string;
    progress: number; // 0-100
  };
  milestones?: MilestoneItem[];
  starred: boolean;
  leadId: string;
  memberIds: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // "2026-10-19"
  startTime: string; // "11:00"
  endTime: string; // "11:45"
  startHour: number; // decimal hour e.g. 11.0
  durationMinutes: number;
  type: 'Meeting' | 'Review' | 'Team' | 'Focus block' | 'Reunião' | 'Revisão' | 'Equipe' | 'Bloco de foco';
  location: string;
  projectId?: string;
  color?: string;
  attendeeIds: string[];
}

export type TeamDepartment = 'Produto' | 'Design' | 'Engenharia' | 'Marketing' | 'Product' | 'Engineering';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  team: TeamDepartment;
  avatar: string;
  status: 'online' | 'focus' | 'meeting' | 'offline';
  statusText: string;
  city: string;
  timezoneOffset: number;
  timezoneNote: string;
  localTimeStr: string;
  workloadHours: number;
  maxWorkloadHours: number;
  openTasksCount: number;
  isCurrentUser?: boolean;
  email: string;
}

export type WallpaperId =
  | 'ash'
  | 'sand'
  | 'sage'
  | 'aurora'
  | 'smoke'
  | 'tide'
  | 'bloom'
  | 'ember'
  | 'grove'
  | 'dusk';

export type AccentId = 'lime' | 'blue' | 'purple' | 'pink' | 'orange' | 'green' | 'gray';

export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto';
  wallpaper: WallpaperId;
  accent: AccentId;
  glassStyle: 'clear' | 'tinted';
  reduceTransparency: boolean;
  focusSessionMinutes: number;
  breakSessionMinutes: number;
  notifications: {
    mentions: boolean;
    dueDates: boolean;
    meetings: boolean;
    dailyDigest: boolean;
    focusFinished: boolean;
  };
}

export interface AppNotification {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  read: boolean;
  type: 'meeting' | 'task' | 'comment' | 'system';
  linkTab?: string;
}
