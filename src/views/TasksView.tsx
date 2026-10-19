import React, { useState } from 'react';
import {
  Kanban,
  List,
  Plus,
  Search,
  Calendar as CalendarIcon,
  MessageSquare,
  Check,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Priority, TaskStatus } from '../types';
import { ACCENTS } from '../themeUtils';

export const TasksView: React.FC = () => {
  const {
    tasks,
    projects,
    members,
    currentUser,
    moveTaskStatus,
    toggleTaskComplete,
    openTaskModal,
    openQuickAdd,
    preferences,
    openTasksCount,
    dueThisWeekCount,
    overdueCount,
    doneThisWeekCount,
  } = useApp();

  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [mineOnly, setMineOnly] = useState<boolean>(false);
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [listSortBy, setListSortBy] = useState<'due' | 'priority'>('due');

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    done: false,
  });

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const currentAccent = ACCENTS[preferences.accent] || ACCENTS.blue;

  // Filtrar tarefas
  const filteredTasks = tasks.filter((task) => {
    if (selectedProjectId !== 'all' && task.projectId !== selectedProjectId) return false;
    if (mineOnly && task.assigneeId !== currentUser.id) return false;
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const project = projects.find((p) => p.id === task.projectId);
      const assignee = members.find((m) => m.id === task.assigneeId);
      const titleMatch = task.title.toLowerCase().includes(q);
      const projectMatch = project?.name.toLowerCase().includes(q);
      const assigneeMatch = assignee?.name.toLowerCase().includes(q);
      if (!titleMatch && !projectMatch && !assigneeMatch) return false;
    }
    return true;
  });

  // Definições das colunas
  const columns: { id: TaskStatus; label: string; dotColor: string }[] = [
    { id: 'todo', label: 'A fazer', dotColor: 'bg-slate-400' },
    { id: 'in_progress', label: 'Em andamento', dotColor: 'bg-blue-400' },
    { id: 'in_review', label: 'Em revisão', dotColor: 'bg-purple-400' },
    { id: 'done', label: 'Concluídas', dotColor: 'bg-emerald-400' },
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      moveTaskStatus(taskId, status);
    }
    setDraggedTaskId(null);
  };

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const priorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'Urgent':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            P Urgente
          </span>
        );
      case 'High':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Alta
          </span>
        );
      case 'Medium':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Média
          </span>
        );
      case 'Low':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/10 text-white/50">
            Baixa
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Tarefas</h1>
          <p className="text-white/60 text-sm mt-1">
            {openTasksCount} em aberto em {projects.length} projetos
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Alternador de Visão */}
          <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'board'
                  ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/15'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Kanban size={14} />
              Quadro
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/15'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <List size={14} />
              Lista
            </button>
          </div>

          {/* Botão Nova Tarefa */}
          <button
            onClick={() => openQuickAdd('task')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-semibold text-white bg-gradient-to-r ${currentAccent.gradient} shadow-lg ${currentAccent.activeNavGlow} hover:brightness-110 active:scale-95 transition-all flex items-center gap-2`}
          >
            <Plus size={15} />
            <span>Nova tarefa</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards Sincronizados */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="p-4 rounded-3xl bg-[#141622]/60 backdrop-blur-xl border border-white/10 shadow-lg glass-card-hover">
          <span className="text-xs text-white/50 block font-medium">Em aberto</span>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            {openTasksCount}
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#141622]/60 backdrop-blur-xl border border-white/10 shadow-lg glass-card-hover">
          <span className="text-xs text-white/50 block font-medium">Para esta semana</span>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            {dueThisWeekCount}
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#141622]/60 backdrop-blur-xl border border-white/10 shadow-lg glass-card-hover">
          <span className="text-xs text-white/50 block font-medium">Atrasadas</span>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            {overdueCount}
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#141622]/60 backdrop-blur-xl border border-white/10 shadow-lg glass-card-hover">
          <span className="text-xs text-white/50 block font-medium">Concluídas</span>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            {doneThisWeekCount}
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="p-3 rounded-2xl bg-[#141622]/70 backdrop-blur-xl border border-white/10 shadow-md flex flex-wrap items-center gap-3">
        {/* Dropdown Todos os projetos */}
        <div className="relative">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="text-xs pl-3 pr-8 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none appearance-none cursor-pointer"
          >
            <option value="all">Todos os projetos</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
          />
        </div>

        {/* Alternador Apenas minhas */}
        <button
          onClick={() => setMineOnly((prev) => !prev)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
            mineOnly
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : 'bg-white/5 border border-white/10 text-white/70 hover:text-white'
          }`}
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-4 h-4 rounded-full object-cover"
          />
          Apenas minhas
        </button>

        {/* Dropdown Qualquer prioridade */}
        <div className="relative">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs pl-3 pr-8 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none appearance-none cursor-pointer"
          >
            <option value="all">Qualquer prioridade</option>
            <option value="Urgent">Urgente</option>
            <option value="High">Alta</option>
            <option value="Medium">Média</option>
            <option value="Low">Baixa</option>
          </select>
          <ChevronDown
            size={13}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
          />
        </div>

        {/* Campo de Busca */}
        <div className="flex-1 min-w-[200px] relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, projeto ou pessoa..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20"
          />
        </div>
      </div>

      {/* Visão Principal: Quadro (Kanban) ou Lista */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className="rounded-3xl bg-[#141622]/60 backdrop-blur-2xl border border-white/10 shadow-xl p-4 flex flex-col min-h-[500px]"
              >
                {/* Cabeçalho da Coluna */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                    <span className="text-xs font-bold text-white">{col.label}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                      {colTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={() => openQuickAdd('task')}
                    className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                    title={`Adicionar tarefa em ${col.label}`}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Cartões de Tarefa */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                  {colTasks.map((task) => {
                    const proj = projects.find((p) => p.id === task.projectId);
                    const assignee = members.find((m) => m.id === task.assigneeId);
                    const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => openTaskModal(task.id)}
                        className="p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 shadow-md glass-card-hover cursor-pointer transition-all space-y-2.5 group"
                      >
                        {/* Topo: Chip do Projeto & Prioridade */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          {proj && (
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 border border-white/5">
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: proj.color }}
                              />
                              <span className="text-white/80 truncate max-w-[120px]">
                                {proj.name}
                              </span>
                            </span>
                          )}

                          {task.priority !== 'Medium' && priorityBadge(task.priority)}
                        </div>

                        {/* Título */}
                        <h4
                          className={`text-xs font-bold leading-snug ${
                            task.status === 'done'
                              ? 'line-through text-white/40'
                              : 'text-white/90 group-hover:text-white'
                          }`}
                        >
                          {task.title}
                        </h4>

                        {/* Barra de Subtarefas se houver */}
                        {task.subtasks.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-white/40">
                              <span>Subtarefas</span>
                              <span>
                                {completedSubtasks}/{task.subtasks.length}
                              </span>
                            </div>
                            <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full bg-orange-400 rounded-full"
                                style={{
                                  width: `${(completedSubtasks / task.subtasks.length) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Rodapé: Prazo, Comentários, Responsável */}
                        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-white/50">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <CalendarIcon size={11} className="text-white/40" />
                              {task.dueDisplay}
                            </span>

                            {task.comments.length > 0 && (
                              <span className="flex items-center gap-1">
                                <MessageSquare size={11} className="text-white/40" />
                                {task.comments.length}
                              </span>
                            )}
                          </div>

                          {assignee && (
                            <img
                              src={assignee.avatar}
                              alt={assignee.name}
                              title={assignee.name}
                              className="w-5 h-5 rounded-full object-cover ring-1 ring-white/15"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Visão em Lista */
        <div className="rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white">Todas as tarefas</h3>
              <p className="text-xs text-white/50">{tasks.length} no quadro total</p>
            </div>

            {/* Alternador de Ordenação */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
              <button
                onClick={() => setListSortBy('due')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  listSortBy === 'due'
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Prazo
              </button>
              <button
                onClick={() => setListSortBy('priority')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  listSortBy === 'priority'
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Prioridade
              </button>
            </div>
          </div>

          {/* Agrupamento por Status */}
          <div className="space-y-6">
            {columns.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.id);
              const isCollapsed = !!collapsedSections[col.id];

              return (
                <div key={col.id} className="space-y-2">
                  {/* Cabeçalho Recolhível */}
                  <button
                    onClick={() => toggleSection(col.id)}
                    className="flex items-center gap-2 text-xs font-bold text-white/80 hover:text-white transition-colors"
                  >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                    <span>{col.label}</span>
                    <span className="text-white/40 font-normal">({colTasks.length})</span>
                  </button>

                  {!isCollapsed && (
                    <div className="space-y-1.5 pl-6">
                      {colTasks.length === 0 ? (
                        <p className="text-xs text-white/30 py-2">Nenhuma tarefa nesta coluna</p>
                      ) : (
                        colTasks.map((task) => {
                          const proj = projects.find((p) => p.id === task.projectId);
                          const assignee = members.find((m) => m.id === task.assigneeId);
                          const isDone = task.status === 'done';

                          return (
                            <div
                              key={task.id}
                              className="p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 transition-colors flex items-center justify-between gap-4 group cursor-pointer"
                              onClick={() => openTaskModal(task.id)}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTaskComplete(task.id);
                                  }}
                                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all shrink-0 ${
                                    isDone
                                      ? 'bg-blue-500 text-white'
                                      : 'border border-white/30 group-hover:border-white/60 text-transparent'
                                  }`}
                                  title={isDone ? 'Concluída' : 'Marcar como concluída'}
                                >
                                  <Check size={12} strokeWidth={3} />
                                </button>

                                <span
                                  className={`text-xs font-medium truncate ${
                                    isDone ? 'line-through text-white/40' : 'text-white/90'
                                  }`}
                                >
                                  {task.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-4 shrink-0">
                                {proj && (
                                  <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/5">
                                    <span
                                      className="w-1.5 h-1.5 rounded-full"
                                      style={{ backgroundColor: proj.color }}
                                    />
                                    <span className="text-white/70">{proj.name}</span>
                                  </span>
                                )}

                                <span className="text-[11px] text-white/50 flex items-center gap-1">
                                  <CalendarIcon size={12} className="text-white/40" />
                                  {task.dueDisplay}
                                </span>

                                <div className="w-16">{priorityBadge(task.priority)}</div>

                                {assignee && (
                                  <img
                                    src={assignee.avatar}
                                    alt={assignee.name}
                                    title={assignee.name}
                                    className="w-5 h-5 rounded-full object-cover ring-1 ring-white/15"
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
