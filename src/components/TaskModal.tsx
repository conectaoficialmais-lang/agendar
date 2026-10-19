import React, { useState } from 'react';
import {
  X,
  Check,
  Play,
  Trash2,
  Send,
  CheckCircle2,
  Circle,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Priority, TaskStatus } from '../types';
import { ACCENTS } from '../themeUtils';

export const TaskModal: React.FC = () => {
  const {
    selectedTaskId,
    closeTaskModal,
    tasks,
    projects,
    members,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    addSubtask,
    toggleSubtask,
    addTaskComment,
    startFocus,
    setActiveTab,
    preferences,
  } = useApp();

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [commentText, setCommentText] = useState('');

  if (!selectedTaskId) return null;

  const task = tasks.find((t) => t.id === selectedTaskId);
  if (!task) return null;

  const project = projects.find((p) => p.id === task.projectId);
  const isDone = task.status === 'done';
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addTaskComment(task.id, commentText.trim());
    setCommentText('');
  };

  const priorityLabels: Record<Priority, { label: string; class: string }> = {
    Urgent: { label: 'P Urgente', class: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
    High: { label: 'Alta', class: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
    Medium: { label: 'Média', class: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
    Low: { label: 'Baixa', class: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[#151722]/95 backdrop-blur-2xl border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.6)] text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            {/* Complete Toggle Button */}
            <button
              onClick={() => toggleTaskComplete(task.id)}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                isDone
                  ? 'bg-blue-500 text-white'
                  : 'border border-white/30 hover:border-white/60 text-transparent hover:text-white/20'
              }`}
              title={isDone ? 'Marcar como não concluída' : 'Marcar como concluída'}
            >
              <Check size={14} strokeWidth={3} />
            </button>

            {/* Project badge */}
            {project && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <span className="text-white/90">{project.name}</span>
              </div>
            )}

            {/* Priority Badge */}
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                priorityLabels[task.priority].class
              }`}
            >
              {priorityLabels[task.priority].label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Focus Button */}
            <button
              onClick={() => {
                startFocus(25, task.id);
                setActiveTab('home');
                closeTaskModal();
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30 transition-all flex items-center gap-1.5"
            >
              <Play size={12} fill="currentColor" />
              Focar agora
            </button>

            {/* Delete */}
            <button
              onClick={() => deleteTask(task.id)}
              className="p-1.5 rounded-xl text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Excluir tarefa"
            >
              <Trash2 size={16} />
            </button>

            {/* Close */}
            <button
              onClick={closeTaskModal}
              className="p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title */}
          <div>
            <input
              type="text"
              value={task.title}
              onChange={(e) => updateTask(task.id, { title: e.target.value })}
              className={`w-full text-xl font-bold bg-transparent border-none outline-none text-white focus:ring-1 focus:ring-blue-500/50 rounded-lg p-1 ${
                isDone ? 'line-through text-white/50' : ''
              }`}
            />
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-xs">
            {/* Status */}
            <div>
              <span className="text-white/40 block mb-1">Status</span>
              <select
                value={task.status}
                onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}
                className="w-full bg-[#1c1f2e] border border-white/10 text-white rounded-lg px-2 py-1.5 focus:outline-none"
              >
                <option value="todo">A fazer</option>
                <option value="in_progress">Em andamento</option>
                <option value="in_review">Em revisão</option>
                <option value="done">Concluída</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <span className="text-white/40 block mb-1">Prioridade</span>
              <select
                value={task.priority}
                onChange={(e) => updateTask(task.id, { priority: e.target.value as Priority })}
                className="w-full bg-[#1c1f2e] border border-white/10 text-white rounded-lg px-2 py-1.5 focus:outline-none"
              >
                <option value="Urgent">Urgente</option>
                <option value="High">Alta</option>
                <option value="Medium">Média</option>
                <option value="Low">Baixa</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <span className="text-white/40 block mb-1">Data de entrega</span>
              <input
                type="date"
                value={task.dueDate}
                onChange={(e) =>
                  updateTask(task.id, {
                    dueDate: e.target.value,
                    dueDisplay: e.target.value === '2026-10-19' ? 'Hoje' : e.target.value,
                  })
                }
                className="w-full bg-[#1c1f2e] border border-white/10 text-white rounded-lg px-2 py-1 focus:outline-none"
              />
            </div>

            {/* Assignee */}
            <div>
              <span className="text-white/40 block mb-1">Responsável</span>
              <select
                value={task.assigneeId}
                onChange={(e) => updateTask(task.id, { assigneeId: e.target.value })}
                className="w-full bg-[#1c1f2e] border border-white/10 text-white rounded-lg px-2 py-1.5 focus:outline-none"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                Subtarefas {task.subtasks.length > 0 && `(${completedSubtasks}/${task.subtasks.length})`}
              </h3>
              {task.subtasks.length > 0 && (
                <div className="w-28 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{
                      width: `${(completedSubtasks / task.subtasks.length) * 100}%`,
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              {task.subtasks.map((st) => (
                <div
                  key={st.id}
                  onClick={() => toggleSubtask(task.id, st.id)}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 cursor-pointer transition-colors"
                >
                  {st.completed ? (
                    <CheckCircle2 size={16} className="text-blue-400 shrink-0" />
                  ) : (
                    <Circle size={16} className="text-white/30 shrink-0" />
                  )}
                  <span
                    className={`text-xs ${
                      st.completed ? 'line-through text-white/40' : 'text-white/90'
                    }`}
                  >
                    {st.title}
                  </span>
                </div>
              ))}

              {/* Add subtask inline */}
              <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Adicionar uma subtarefa..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                />
                <button
                  type="submit"
                  disabled={!newSubtaskTitle.trim()}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-40 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </form>
            </div>
          </div>

          {/* Activity & Comments */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
              Discussão & Notas ({task.comments.length})
            </h3>

            <div className="space-y-3">
              {task.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3 text-xs">
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-white/10 flex items-center justify-center font-bold text-[10px] shrink-0 text-white">
                    {comment.authorName[0]}
                  </div>
                  <div className="flex-1 p-3 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white/90">{comment.authorName}</span>
                      <span className="text-[10px] text-white/40">{comment.createdAt}</span>
                    </div>
                    <p className="text-white/80 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}

              {/* Post comment */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Escreva um comentário ou anotação..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-3.5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Send size={12} />
                  Publicar
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-0 -z-10" onClick={closeTaskModal} />
    </div>
  );
};
