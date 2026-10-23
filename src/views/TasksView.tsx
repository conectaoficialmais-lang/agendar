import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  AlertTriangle,
  GripVertical,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Priority, TaskStatus, Task } from '../types';
import { formatDueLabel } from '../dateUtils';
import { clickable } from '../a11y';

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

  // Drag-and-drop por ponteiro (mouse, toque e caneta) + mover por teclado.
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropCol, setDropCol] = useState<TaskStatus | null>(null);
  const [announce, setAnnounce] = useState('');
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const dragMeta = useRef<{
    id: string;
    startX: number;
    startY: number;
    dragging: boolean;
    title: string;
    color: string;
  } | null>(null);
  const dropColRef = useRef<TaskStatus | null>(null);
  const pointerPos = useRef({ x: 0, y: 0 });
  const scrollRaf = useRef<number | null>(null);

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

  const columnAt = (x: number, y: number): TaskStatus | null => {
    const el = (document.elementFromPoint(x, y) as HTMLElement | null)?.closest(
      '[data-status]'
    ) as HTMLElement | null;
    return (el?.dataset.status as TaskStatus) || null;
  };

  // Auto-scroll perto das bordas: no celular as colunas ficam empilhadas e
  // touch-action:none bloqueia o scroll do dedo durante o arraste.
  const runAutoScroll = () => {
    const y = pointerPos.current.y;
    const margin = 90;
    if (y < margin) window.scrollBy(0, -14);
    else if (y > window.innerHeight - margin) window.scrollBy(0, 14);
    scrollRaf.current = requestAnimationFrame(runAutoScroll);
  };

  const endDrag = (commit: boolean) => {
    if (scrollRaf.current) {
      cancelAnimationFrame(scrollRaf.current);
      scrollRaf.current = null;
    }
    const meta = dragMeta.current;
    const target = dropColRef.current;
    if (commit && meta?.dragging && target) {
      const current = tasks.find((t) => t.id === meta.id)?.status;
      if (target !== current) moveTaskStatus(meta.id, target);
    }
    dragMeta.current = null;
    dropColRef.current = null;
    setDragId(null);
    setDropCol(null);
  };

  const onHandlePointerDown = (e: React.PointerEvent, task: Task) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    const proj = projects.find((p) => p.id === task.projectId);
    dragMeta.current = {
      id: task.id,
      startX: e.clientX,
      startY: e.clientY,
      dragging: false,
      title: task.title,
      color: proj?.color || '#64748b',
    };
    pointerPos.current = { x: e.clientX, y: e.clientY };
  };

  const onHandlePointerMove = (e: React.PointerEvent) => {
    const meta = dragMeta.current;
    if (!meta) return;
    pointerPos.current = { x: e.clientX, y: e.clientY };
    if (!meta.dragging) {
      if (Math.abs(e.clientX - meta.startX) < 6 && Math.abs(e.clientY - meta.startY) < 6) return;
      meta.dragging = true;
      setDragId(meta.id);
      scrollRaf.current = requestAnimationFrame(runAutoScroll);
    }
    if (ghostRef.current) {
      ghostRef.current.style.transform = `translate(${e.clientX + 12}px, ${e.clientY + 12}px)`;
    }
    const col = columnAt(e.clientX, e.clientY);
    if (col !== dropColRef.current) {
      dropColRef.current = col;
      setDropCol(col); // só re-renderiza quando a coluna-alvo muda
    }
  };

  const onHandlePointerUp = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    endDrag(true);
  };

  const onHandlePointerCancel = () => endDrag(false);

  const moveByKeyboard = (task: Task, dir: 1 | -1) => {
    const idx = columns.findIndex((c) => c.id === task.status);
    const next = columns[idx + dir];
    if (!next) return;
    moveTaskStatus(task.id, next.id);
    setAnnounce(`${task.title} movida para ${next.label}`);
    // O card remonta em outra coluna; devolve o foco ao mesmo handle.
    // setTimeout(0) roda após o commit do React (e mesmo com a aba em 2º plano).
    setTimeout(() => {
      (document.querySelector(`[data-handle="${task.id}"]`) as HTMLElement | null)?.focus();
    }, 0);
  };

  const onHandleKeyDown = (e: React.KeyboardEvent, task: Task) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      moveByKeyboard(task, 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      moveByKeyboard(task, -1);
    }
  };

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const priorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'Urgent':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            P Urgente
          </span>
        );
      case 'High':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Alta
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Média
          </span>
        );
      case 'Low':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.06] text-[#8b8b90]">
            Baixa
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* ════════════════════════════════════
          HEADER / TOPO
          ════════════════════════════════════ */}
      <div className="space-y-4">
        <div>
          <h1 className="text-[38px] md:text-[42px] font-bold tracking-tight text-white leading-none">
            Tarefas
          </h1>
          <p className="text-[#8b8b90] text-sm mt-1.5 font-normal">
            {openTasksCount} em aberto em {projects.length} projetos · {doneThisWeekCount} concluídas esta semana
          </p>
        </div>

        {/* Linha com 4 Mini Stat Tiles e Controles Principais */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          {/* 4 Mini Stat Tiles */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
            <div className="px-4 py-2.5 rounded-[14px] panel min-w-[90px] shadow-sm">
              <span className="text-[11px] font-medium text-[#8b8b90] block">Em aberto</span>
              <div className="text-[26px] font-bold text-white mt-0.5 leading-none">
                {openTasksCount}
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-[14px] panel min-w-[90px] shadow-sm">
              <span className="text-[11px] font-medium text-[#8b8b90] block">Esta semana</span>
              <div className="text-[26px] font-bold text-white mt-0.5 leading-none">
                {dueThisWeekCount}
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-[14px] panel min-w-[90px] shadow-sm">
              <span className="text-[11px] font-medium text-[#8b8b90] block">Atrasadas</span>
              <div className="text-[26px] font-bold text-white mt-0.5 leading-none">
                {overdueCount}
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-[14px] panel min-w-[90px] shadow-sm">
              <span className="text-[11px] font-medium text-[#8b8b90] block">Concluídas</span>
              <div className="text-[26px] font-bold text-white mt-0.5 leading-none">
                {doneThisWeekCount}
              </div>
            </div>
          </div>

          {/* Alternador de Visão + Botão Nova Tarefa */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Pílula Alternadora de Visão */}
            <div className="flex items-center p-1 rounded-full panel">
              <button
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  viewMode === 'board'
                    ? 'bg-white/[0.12] text-white shadow-sm'
                    : 'text-[#8b8b90] hover:text-white'
                }`}
              >
                <Kanban size={13} />
                <span>Quadro</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  viewMode === 'list'
                    ? 'bg-white/[0.12] text-white shadow-sm'
                    : 'text-[#8b8b90] hover:text-white'
                }`}
              >
                <List size={13} />
                <span>Lista</span>
              </button>
            </div>

            {/* Botão Nova Tarefa */}
            <button
              onClick={() => openQuickAdd('task')}
              className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-white/[0.1] hover:bg-white/[0.16] border border-white/[0.1] shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus size={14} />
              <span>Nova tarefa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="p-3 rounded-[14px] panel shadow-sm flex flex-wrap items-center gap-3">
        {/* Dropdown Todos os projetos */}
        <div className="relative">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="text-xs pl-3 pr-8 py-2 rounded-full panel-inset text-white font-medium focus:outline-none appearance-none cursor-pointer"
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
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b8b90] pointer-events-none"
          />
        </div>

        {/* Alternador Apenas minhas */}
        <button
          onClick={() => setMineOnly((prev) => !prev)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            mineOnly
              ? 'bg-white/[0.15] text-white border border-white/[0.15]'
              : 'panel-inset text-[#8b8b90] hover:text-white'
          }`}
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-4 h-4 rounded-full object-cover"
          />
          <span>Apenas minhas</span>
        </button>

        {/* Dropdown Qualquer prioridade */}
        <div className="relative">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs pl-3 pr-8 py-2 rounded-full panel-inset text-white font-medium focus:outline-none appearance-none cursor-pointer"
          >
            <option value="all">Qualquer prioridade</option>
            <option value="Urgent">Urgente</option>
            <option value="High">Alta</option>
            <option value="Medium">Média</option>
            <option value="Low">Baixa</option>
          </select>
          <ChevronDown
            size={13}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b8b90] pointer-events-none"
          />
        </div>

        {/* Campo de Busca */}
        <div className="flex-1 min-w-[200px] relative">
          <Search
            size={13}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b8b90] pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, projeto ou pessoa..."
            className="w-full pl-9 pr-3 py-1.5 rounded-full panel-inset text-xs text-white placeholder-[#8b8b90] focus:outline-none focus:border-white/20"
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
                data-status={col.id}
                className={`rounded-[16px] panel shadow-sm p-4 flex flex-col min-h-[500px] transition-shadow ${
                  dropCol === col.id ? 'drop-active' : ''
                }`}
              >
                {/* Cabeçalho da Coluna */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                    <span className="text-xs font-bold text-white">{col.label}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-[#8b8b90]">
                      {colTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={() => openQuickAdd('task')}
                    className="p-1 rounded-lg text-[#8b8b90] hover:text-white hover:bg-white/[0.06] transition-colors"
                    title={`Adicionar tarefa em ${col.label}`}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Cartões de Tarefa */}
                <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5">
                  {colTasks.map((task) => {
                    const proj = projects.find((p) => p.id === task.projectId);
                    const assignee = members.find((m) => m.id === task.assigneeId);
                    const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

                    return (
                      <div
                        key={task.id}
                        {...clickable(() => openTaskModal(task.id))}
                        className={`p-3.5 rounded-[12px] panel-inset panel-hover shadow-sm cursor-pointer transition-all space-y-2.5 group ${
                          dragId === task.id ? 'opacity-40' : ''
                        }`}
                      >
                        {/* Topo: Chip do Projeto & Prioridade */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <button
                              type="button"
                              data-handle={task.id}
                              aria-label={`Mover tarefa: ${task.title}`}
                              title="Arraste para mover, ou use as setas do teclado"
                              onClick={(e) => e.stopPropagation()}
                              onPointerDown={(e) => onHandlePointerDown(e, task)}
                              onPointerMove={onHandlePointerMove}
                              onPointerUp={onHandlePointerUp}
                              onPointerCancel={onHandlePointerCancel}
                              onKeyDown={(e) => onHandleKeyDown(e, task)}
                              className="shrink-0 p-2 -m-1 rounded-lg text-[#8b8b90] hover:text-white hover:bg-white/[0.06] cursor-grab active:cursor-grabbing touch-none select-none"
                            >
                              <GripVertical size={14} />
                            </button>
                            {proj && (
                              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.04] min-w-0">
                                <span
                                  className="w-1.5 h-1.5 rounded-full shrink-0"
                                  style={{ backgroundColor: proj.color }}
                                />
                                <span className="text-[#8b8b90] truncate max-w-[110px]">
                                  {proj.name}
                                </span>
                              </span>
                            )}
                          </div>

                          {task.priority !== 'Medium' && priorityBadge(task.priority)}
                        </div>

                        {/* Título */}
                        <h4
                          className={`text-xs font-bold leading-snug ${
                            task.status === 'done'
                              ? 'line-through text-[#8b8b90]'
                              : 'text-white group-hover:text-blue-300'
                          }`}
                        >
                          {task.title}
                        </h4>

                        {/* Barra de Subtarefas se houver */}
                        {task.subtasks.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-[#8b8b90]">
                              <span>Subtarefas</span>
                              <span>
                                {completedSubtasks}/{task.subtasks.length}
                              </span>
                            </div>
                            <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{
                                  width: `${(completedSubtasks / task.subtasks.length) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Rodapé: Prazo, Comentários, Responsável */}
                        <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[11px] text-[#8b8b90]">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 font-medium">
                              <CalendarIcon size={11} className="text-[#8b8b90]" />
                              {formatDueLabel(task.dueDate)}
                            </span>

                            {task.comments.length > 0 && (
                              <span className="flex items-center gap-1 font-medium">
                                <MessageSquare size={11} className="text-[#8b8b90]" />
                                {task.comments.length}
                              </span>
                            )}
                          </div>

                          {assignee && (
                            <img
                              src={assignee.avatar}
                              alt={assignee.name}
                              title={assignee.name}
                              className="w-5 h-5 rounded-full object-cover ring-1 ring-white/10"
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
        <div className="rounded-[16px] panel shadow-sm p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
            <div>
              <h3 className="text-sm font-bold text-white">Todas as tarefas</h3>
              <p className="text-xs text-[#8b8b90]">{tasks.length} no quadro total</p>
            </div>

            {/* Alternador de Ordenação */}
            <div className="flex items-center p-1 rounded-full panel-inset">
              <button
                onClick={() => setListSortBy('due')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  listSortBy === 'due'
                    ? 'bg-white/[0.12] text-white shadow-sm'
                    : 'text-[#8b8b90] hover:text-white'
                }`}
              >
                Prazo
              </button>
              <button
                onClick={() => setListSortBy('priority')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  listSortBy === 'priority'
                    ? 'bg-white/[0.12] text-white shadow-sm'
                    : 'text-[#8b8b90] hover:text-white'
                }`}
              >
                Prioridade
              </button>
            </div>
          </div>

          {/* Agrupamento por Status */}
          <div className="space-y-5">
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
                    <span className="text-[#8b8b90] font-normal">({colTasks.length})</span>
                  </button>

                  {!isCollapsed && (
                    <div className="space-y-1.5 pl-5">
                      {colTasks.length === 0 ? (
                        <p className="text-xs text-[#8b8b90] py-2">Nenhuma tarefa nesta coluna</p>
                      ) : (
                        colTasks.map((task) => {
                          const proj = projects.find((p) => p.id === task.projectId);
                          const assignee = members.find((m) => m.id === task.assigneeId);
                          const isDone = task.status === 'done';

                          return (
                            <div
                              key={task.id}
                              {...clickable(() => openTaskModal(task.id))}
                              className="p-3 rounded-[10px] panel-inset panel-hover transition-colors flex items-center justify-between gap-4 group cursor-pointer"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTaskComplete(task.id);
                                  }}
                                  className={`w-4 h-4 rounded flex items-center justify-center transition-all shrink-0 ${
                                    isDone
                                      ? 'bg-blue-500 text-white'
                                      : 'border border-white/30 group-hover:border-white/60 text-transparent'
                                  }`}
                                  title={isDone ? 'Concluída' : 'Marcar como concluída'}
                                >
                                  <Check size={11} strokeWidth={3} />
                                </button>

                                <span
                                  className={`text-xs font-medium truncate ${
                                    isDone ? 'line-through text-[#8b8b90]' : 'text-white'
                                  }`}
                                >
                                  {task.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-4 shrink-0">
                                {proj && (
                                  <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.04]">
                                    <span
                                      className="w-1.5 h-1.5 rounded-full"
                                      style={{ backgroundColor: proj.color }}
                                    />
                                    <span className="text-[#8b8b90]">{proj.name}</span>
                                  </span>
                                )}

                                <span className="text-[11px] text-[#8b8b90] flex items-center gap-1 font-medium">
                                  <CalendarIcon size={12} className="text-[#8b8b90]" />
                                  {formatDueLabel(task.dueDate)}
                                </span>

                                <div className="w-16">{priorityBadge(task.priority)}</div>

                                {assignee && (
                                  <img
                                    src={assignee.avatar}
                                    alt={assignee.name}
                                    title={assignee.name}
                                    className="w-5 h-5 rounded-full object-cover ring-1 ring-white/10"
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

      {/* Ghost do arraste — via portal p/ não ser cortado pelo overflow/backdrop-filter */}
      {dragId &&
        createPortal(
          <div
            ref={(el) => {
              ghostRef.current = el;
              // Posiciona já na montagem p/ não piscar no canto superior esquerdo.
              if (el) {
                el.style.transform = `translate(${pointerPos.current.x + 12}px, ${pointerPos.current.y + 12}px)`;
              }
            }}
            className="fixed top-0 left-0 z-[100] pointer-events-none px-3 py-2 rounded-[10px] bg-[#151722]/95 border border-white/20 shadow-2xl text-xs font-bold text-white flex items-center gap-2 max-w-[240px]"
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: dragMeta.current?.color }}
            />
            <span className="truncate">{dragMeta.current?.title}</span>
          </div>,
          document.body
        )}

      {/* Anúncio para leitores de tela ao mover por teclado */}
      <div aria-live="polite" className="sr-only">
        {announce}
      </div>
    </div>
  );
};
