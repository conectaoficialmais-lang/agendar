import React, { useState } from 'react';
import { X, CheckSquare, Calendar, Folder, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Priority, TaskStatus } from '../types';
import { todayIso, addDays, formatDueLabel, timeRangeToHourAndDuration } from '../dateUtils';
import { useEscape } from '../a11y';

export const QuickAddModal: React.FC = () => {
  const {
    isQuickAddOpen,
    closeQuickAdd,
    quickAddType,
    quickAddProjectId,
    projects,
    members,
    addTask,
    addCalendarEvent,
    addProject,
    currentUser,
    openTaskModal,
  } = useApp();

  useEscape(closeQuickAdd);

  const [activeTab, setActiveTab] = useState<'task' | 'event' | 'project'>(quickAddType);

  // Sync initial tab when modal opens
  React.useEffect(() => {
    if (isQuickAddOpen) {
      setActiveTab(quickAddType);
      // Se abriu a partir de um projeto (ex.: "Nova tarefa" dentro do projeto),
      // já deixa esse projeto selecionado para a tarefa cair no lugar certo.
      if (quickAddProjectId) {
        setTaskProject(quickAddProjectId);
      }
    }
  }, [isQuickAddOpen, quickAddType, quickAddProjectId]);

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskProject, setTaskProject] = useState(projects[0]?.id || 'proj-tide');
  const [taskPriority, setTaskPriority] = useState<Priority>('Medium');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('todo');
  const [taskDueDate, setTaskDueDate] = useState(todayIso());
  const [taskAssignee, setTaskAssignee] = useState(currentUser.id);

  // Event form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(todayIso());
  const [eventStartTime, setEventStartTime] = useState('11:00');
  const [eventEndTime, setEventEndTime] = useState('11:45');
  const [eventType, setEventType] = useState<'Reunião' | 'Revisão' | 'Equipe' | 'Bloco de foco'>('Reunião');
  const [eventLocation, setEventLocation] = useState('Chamada de vídeo');

  // Project form state
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectColor, setProjectColor] = useState('#3b82f6');
  const [projectDueDate, setProjectDueDate] = useState(addDays(todayIso(), 30));

  if (!isQuickAddOpen) return null;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const created = addTask({
      title: taskTitle.trim(),
      projectId: taskProject,
      priority: taskPriority,
      status: taskStatus,
      dueDate: taskDueDate,
      dueDisplay: formatDueLabel(taskDueDate),
      assigneeId: taskAssignee,
    });

    setTaskTitle('');
    closeQuickAdd();
    openTaskModal(created.id);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    // Deriva startHour e duração dos horários digitados (antes eram fixos em 11:00/45min).
    const parsed = timeRangeToHourAndDuration(eventStartTime, eventEndTime);
    if (!parsed) {
      alert('O horário de término deve ser depois do início.');
      return;
    }

    addCalendarEvent({
      title: eventTitle.trim(),
      date: eventDate,
      startTime: eventStartTime,
      endTime: eventEndTime,
      startHour: parsed.startHour,
      durationMinutes: parsed.durationMinutes,
      type: eventType,
      location: eventLocation,
      attendeeIds: [currentUser.id],
    });

    setEventTitle('');
    closeQuickAdd();
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    addProject({
      name: projectName.trim(),
      slug: projectName.toLowerCase().replace(/\s+/g, '-'),
      description: projectDesc.trim() || 'Novo espaço de trabalho do projeto.',
      // Quando aberto a partir de um projeto ("Novo subprojeto"), vira filho dele.
      parentId: quickAddProjectId || undefined,
      status: 'Em andamento',
      color: projectColor,
      icon: 'folder',
      dueDate: projectDueDate,
      dueDisplay: `Entrega ${formatDueLabel(projectDueDate)}`,
      nextMilestone: {
        title: 'Marco Inicial',
        dueDate: projectDueDate,
        dueDisplay: 'Em breve',
        progress: 0,
      },
      starred: false,
      leadId: currentUser.id,
      memberIds: [currentUser.id],
    });

    setProjectName('');
    setProjectDesc('');
    closeQuickAdd();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-[#151722]/95 backdrop-blur-2xl border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.6)] text-white overflow-hidden p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Tabs */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => setActiveTab('task')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'task' ? 'bg-white/20 text-white shadow-sm' : 'text-white/60 hover:text-white'
              }`}
            >
              <CheckSquare size={13} />
              Nova Tarefa
            </button>
            <button
              onClick={() => setActiveTab('event')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'event' ? 'bg-white/20 text-white shadow-sm' : 'text-white/60 hover:text-white'
              }`}
            >
              <Calendar size={13} />
              Novo Evento
            </button>
            <button
              onClick={() => setActiveTab('project')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'project' ? 'bg-white/20 text-white shadow-sm' : 'text-white/60 hover:text-white'
              }`}
            >
              <Folder size={13} />
              Novo Projeto
            </button>
          </div>

          <button
            onClick={closeQuickAdd}
            className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-4">
          {activeTab === 'task' && (
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5">Título da tarefa</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Ex.: Desenhar ilustração hero do lançamento"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[var(--accent)]"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">Projeto</label>
                  <select
                    value={taskProject}
                    onChange={(e) => setTaskProject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1e212f] border border-white/10 text-white text-xs focus:outline-none"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">Prioridade</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1e212f] border border-white/10 text-white text-xs focus:outline-none"
                  >
                    <option value="Urgent">Urgente</option>
                    <option value="High">Alta</option>
                    <option value="Medium">Média</option>
                    <option value="Low">Baixa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">Data de entrega</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1e212f] border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">Responsável</label>
                  <select
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1e212f] border border-white/10 text-white text-xs focus:outline-none"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.isCurrentUser ? '(Você)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeQuickAdd}
                  className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-accent px-5 py-2 text-xs"
                >
                  <Plus size={14} />
                  Criar Tarefa
                </button>
              </div>
            </form>
          )}

          {activeTab === 'event' && (
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5">Título do evento</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Ex.: Crítica de design & alinhamento de tokens"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">Data</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1e212f] border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">Tipo de Evento</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1e212f] border border-white/10 text-white text-xs focus:outline-none"
                  >
                    <option value="Reunião">Reunião</option>
                    <option value="Revisão">Revisão</option>
                    <option value="Equipe">Equipe</option>
                    <option value="Bloco de foco">Bloco de foco</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">Horário de início</label>
                  <input
                    type="text"
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    placeholder="11:00"
                    className="w-full px-3 py-2 rounded-xl bg-[#1e212f] border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">Local / Link</label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="Chamada de vídeo / Sala de reunião"
                    className="w-full px-3 py-2 rounded-xl bg-[#1e212f] border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeQuickAdd}
                  className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-accent px-5 py-2 text-xs"
                >
                  <Plus size={14} />
                  Adicionar Evento
                </button>
              </div>
            </form>
          )}

          {activeTab === 'project' && (
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5">Nome do projeto</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Ex.: Linguagem de design Atlas"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1.5">Descrição</label>
                <textarea
                  rows={2}
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="Objetivos e escopo desta iniciativa..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">Cor do tema</label>
                  <div className="flex items-center gap-2 pt-1">
                    {['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#06b6d4'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setProjectColor(c)}
                        className={`w-6 h-6 rounded-full transition-transform ${
                          projectColor === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-neutral-900' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">Previsão de entrega</label>
                  <input
                    type="date"
                    value={projectDueDate}
                    onChange={(e) => setProjectDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1e212f] border border-white/10 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeQuickAdd}
                  className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-accent px-5 py-2 text-xs"
                >
                  <Plus size={14} />
                  Criar Projeto
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="fixed inset-0 -z-10" onClick={closeQuickAdd} />
    </div>
  );
};
