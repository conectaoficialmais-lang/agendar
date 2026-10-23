import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Video,
  CheckSquare,
  Calendar as CalendarIcon,
  Trash2,
  Check,
  X,
  Pencil,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CalendarEvent } from '../types';
import { todayIso, timeRangeToHourAndDuration } from '../dateUtils';

const EVENT_TYPES: CalendarEvent['type'][] = ['Reunião', 'Revisão', 'Equipe', 'Bloco de foco'];

// Modal de edição de evento. Estado local — não precisa entrar no AppContext.
const EventEditModal: React.FC<{ event: CalendarEvent; onClose: () => void }> = ({
  event,
  onClose,
}) => {
  const { updateCalendarEvent, deleteCalendarEvent } = useApp();
  const [title, setTitle] = useState(event.title);
  const [date, setDate] = useState(event.date);
  const [startTime, setStartTime] = useState(event.startTime);
  const [endTime, setEndTime] = useState(event.endTime);
  const [location, setLocation] = useState(event.location);
  const [type, setType] = useState<CalendarEvent['type']>(event.type);
  const [error, setError] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const parsed = timeRangeToHourAndDuration(startTime, endTime);
    if (!parsed) {
      setError('O horário de término deve ser depois do início.');
      return;
    }
    updateCalendarEvent(event.id, {
      title: title.trim(),
      date,
      startTime,
      endTime,
      startHour: parsed.startHour,
      durationMinutes: parsed.durationMinutes,
      location,
      type,
    });
    onClose();
  };

  const field =
    'w-full px-3 py-2 rounded-[10px] bg-[#0d0e11] border border-white/[0.10] text-xs text-white focus:outline-none focus:border-white/30';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSave}
        className="w-full max-w-md rounded-[20px] bg-[#181920] border border-white/[0.12] shadow-2xl p-6 space-y-4 text-white"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <h3 className="text-base font-bold">Editar evento</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div>
          <label className="text-xs font-medium text-[#8b8b90] block mb-1">Título</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={field} />
        </div>

        <div>
          <label className="text-xs font-medium text-[#8b8b90] block mb-1">Data</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-[#8b8b90] block mb-1">Início</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={field} />
          </div>
          <div>
            <label className="text-xs font-medium text-[#8b8b90] block mb-1">Término</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={field} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-[#8b8b90] block mb-1">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CalendarEvent['type'])}
              className={field}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[#8b8b90] block mb-1">Local</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className={field} />
          </div>
        </div>

        {error && <p className="text-[11px] text-rose-400">{error}</p>}

        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={() => {
              deleteCalendarEvent(event.id);
              onClose();
            }}
            className="px-3 py-2 rounded-full text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-500/20 transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={13} /> Excluir
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-medium text-[#8b8b90] hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all active:scale-95"
            >
              Salvar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

interface CalendarDayCell {
  day: number;
  month: 'prev' | 'curr' | 'next';
  dateStr: string;
  isToday: boolean;
  isSelected: boolean;
}

export const CalendarView: React.FC = () => {
  const {
    events,
    tasks,
    projects,
    members,
    currentUser,
    openQuickAdd,
    openTaskModal,
    deleteCalendarEvent,
    deleteTask,
    toggleTaskComplete,
  } = useApp();

  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayIso());
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'events' | 'tasks'>('all');
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const TODAY = todayIso();
  const nowDecimalHour = new Date().getHours() + new Date().getMinutes() / 60;

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const MONTH_NAMES = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  const monthTitle = `${MONTH_NAMES[currentMonth]} ${currentYear}`;
  const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  const typeBadges: Record<string, string> = {
    Design: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    Engenharia: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    Produto: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Geral: 'bg-white/[0.06] text-[#8b8b90] border-white/[0.08]',
    Urgente: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  const getDayEvents = (dateStr: string) => {
    return events
      .filter((e) => e.date === dateStr)
      .sort((a, b) => a.startHour - b.startHour);
  };

  const getDayTasks = (dateStr: string) => {
    return tasks.filter((t) => t.dueDate === dateStr);
  };

  const generateMonthGrid = (year: number, month: number): CalendarDayCell[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    const startDayIndex = (firstDay.getDay() + 6) % 7;
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const cells: CalendarDayCell[] = [];

    for (let i = startDayIndex - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, d);
      const dateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        day: d,
        month: 'prev',
        dateStr,
        isToday: dateStr === TODAY,
        isSelected: dateStr === selectedDateStr,
      });
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        day: d,
        month: 'curr',
        dateStr,
        isToday: dateStr === TODAY,
        isSelected: dateStr === selectedDateStr,
      });
    }

    const remaining = (7 - (cells.length % 7)) % 7;
    const targetLength = cells.length + remaining < 35 ? 35 : cells.length + remaining;
    const nextDaysNeeded = targetLength - cells.length;

    for (let d = 1; d <= nextDaysNeeded; d++) {
      const nextDate = new Date(year, month + 1, d);
      const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        day: d,
        month: 'next',
        dateStr,
        isToday: dateStr === TODAY,
        isSelected: dateStr === selectedDateStr,
      });
    }

    return cells;
  };

  const getWeekDays = (centerDateStr: string) => {
    const [y, m, d] = centerDateStr.split('-').map(Number);
    const curr = new Date(y, m - 1, d);
    const dayOfWeek = (curr.getDay() + 6) % 7;
    const monday = new Date(curr);
    monday.setDate(curr.getDate() - dayOfWeek);

    const weekNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

    return Array.from({ length: 7 }, (_, i) => {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);
      const str = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
      return {
        name: weekNames[i],
        day: dayDate.getDate(),
        dateStr: str,
        isToday: str === TODAY,
        fullDate: dayDate,
      };
    });
  };

  const handlePrevMonth = () => {
    if (viewMode === 'month') {
      setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    } else {
      const [y, m, d] = selectedDateStr.split('-').map(Number);
      const prevWeek = new Date(y, m - 1, d - 7);
      const str = `${prevWeek.getFullYear()}-${String(prevWeek.getMonth() + 1).padStart(2, '0')}-${String(prevWeek.getDate()).padStart(2, '0')}`;
      setSelectedDateStr(str);
      setViewDate(prevWeek);
    }
  };

  const handleNextMonth = () => {
    if (viewMode === 'month') {
      setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    } else {
      const [y, m, d] = selectedDateStr.split('-').map(Number);
      const nextWeek = new Date(y, m - 1, d + 7);
      const str = `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, '0')}-${String(nextWeek.getDate()).padStart(2, '0')}`;
      setSelectedDateStr(str);
      setViewDate(nextWeek);
    }
  };

  const handleGoToToday = () => {
    const today = new Date();
    setViewDate(today);
    setSelectedDateStr(TODAY);
  };

  const calendarGrid = generateMonthGrid(currentYear, currentMonth);
  const weekDays = getWeekDays(selectedDateStr);

  const selectedDateEvents = getDayEvents(selectedDateStr);
  const selectedDateTasks = getDayTasks(selectedDateStr);

  const [selY, selM, selD] = selectedDateStr.split('-').map(Number);
  const formattedSelectedDate = `${selD} de ${MONTH_NAMES[selM - 1]} de ${selY}`;
  const isSelectedDateToday = selectedDateStr === TODAY;

  const monthEventsCount = events.filter((e) => e.date.startsWith(currentMonthPrefix)).length;
  const monthTasksCount = tasks.filter(
    (t) => t.dueDate.startsWith(currentMonthPrefix) && t.status !== 'done'
  ).length;

  const quickMonths = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(new Date().getFullYear(), new Date().getMonth() + i, 1);
    return {
      label: `${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`,
      year: d.getFullYear(),
      month: d.getMonth(),
    };
  });

  const todayEventsSorted = events
    .filter((e) => e.date === TODAY)
    .sort((a, b) => a.startHour - b.startHour);
  const nextEventToday = todayEventsSorted.find(
    (e) => e.startHour + e.durationMinutes / 60 > nowDecimalHour
  );

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* ════════════════════════════════════
          HEADER / TOPO
          ════════════════════════════════════ */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[38px] md:text-[42px] font-bold tracking-tight text-white leading-none">
              {monthTitle}
            </h1>

            {/* Setas de navegação */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-[#131417] border border-white/[0.06]">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-full hover:bg-white/[0.08] text-[#8b8b90] hover:text-white transition-colors"
                title="Mês anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-full hover:bg-white/[0.08] text-[#8b8b90] hover:text-white transition-colors"
                title="Mês seguinte"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <p className="text-[#8b8b90] text-sm mt-1.5 font-normal">
            {monthEventsCount} compromissos e {monthTasksCount} tarefas abertas em {MONTH_NAMES[currentMonth]}
          </p>
        </div>

        {/* Linha com 4 Mini Stat Tiles e Controles Principais */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          {/* 4 Mini Stat Tiles */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
            <div className="px-4 py-2.5 rounded-[14px] bg-[#131417] border border-white/[0.06] min-w-[90px] shadow-sm">
              <span className="text-[11px] font-medium text-[#8b8b90] block">Eventos no mês</span>
              <div className="text-[26px] font-bold text-white mt-0.5 leading-none">
                {monthEventsCount}
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-[14px] bg-[#131417] border border-white/[0.06] min-w-[90px] shadow-sm">
              <span className="text-[11px] font-medium text-[#8b8b90] block">Tarefas no mês</span>
              <div className="text-[26px] font-bold text-white mt-0.5 leading-none">
                {monthTasksCount}
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-[14px] bg-[#131417] border border-white/[0.06] min-w-[90px] shadow-sm">
              <span className="text-[11px] font-medium text-[#8b8b90] block">Hoje</span>
              <div className="text-[26px] font-bold text-white mt-0.5 leading-none">
                {events.filter((e) => e.date === TODAY).length}
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-[14px] bg-[#131417] border border-white/[0.06] min-w-[90px] shadow-sm">
              <span className="text-[11px] font-medium text-[#8b8b90] block">Próximo</span>
              <div className="text-[26px] font-bold text-white mt-0.5 leading-none">
                {nextEventToday ? nextEventToday.startTime : '—'}
              </div>
            </div>
          </div>

          {/* Alternador de Visão + Botões de Ação */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={handleGoToToday}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#8b8b90] hover:text-white bg-[#131417] hover:bg-white/[0.08] border border-white/[0.06] transition-all"
              title="Voltar para hoje"
            >
              Hoje
            </button>

            {/* Alternador Mês / Semana */}
            <div className="flex items-center p-1 rounded-full bg-[#131417] border border-white/[0.06]">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  viewMode === 'month'
                    ? 'bg-white/[0.12] text-white shadow-sm'
                    : 'text-[#8b8b90] hover:text-white'
                }`}
              >
                Mês
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  viewMode === 'week'
                    ? 'bg-white/[0.12] text-white shadow-sm'
                    : 'text-[#8b8b90] hover:text-white'
                }`}
              >
                Semana
              </button>
            </div>

            {/* Botão Novo Evento */}
            <button
              onClick={() => openQuickAdd('event')}
              className="px-4 py-2 rounded-full text-xs font-semibold text-white bg-white/[0.1] hover:bg-white/[0.16] border border-white/[0.1] shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus size={14} />
              <span>Novo evento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barra de Acesso Rápido a Meses Futuros */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-medium text-[#8b8b90] uppercase tracking-wider mr-1 shrink-0">
          Explorar meses:
        </span>
        {quickMonths.map((qm) => {
          const isCurrentActiveMonth = currentYear === qm.year && currentMonth === qm.month;
          return (
            <button
              key={qm.label}
              onClick={() => {
                setViewDate(new Date(qm.year, qm.month, 1));
                const newDateStr = `${qm.year}-${String(qm.month + 1).padStart(2, '0')}-01`;
                setSelectedDateStr(newDateStr);
              }}
              className={`px-3.5 py-1 rounded-full text-xs font-medium shrink-0 transition-all ${
                isCurrentActiveMonth
                  ? 'bg-white/[0.12] text-white border border-white/[0.15] shadow-sm font-semibold'
                  : 'bg-[#131417] text-[#8b8b90] hover:text-white hover:bg-white/[0.06] border border-white/[0.06]'
              }`}
            >
              {qm.label}
            </button>
          );
        })}
      </div>

      {/* Grade Principal: Grade à Esquerda + Painel de Agenda à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Grade do Calendário (Mês / Semana) */}
        <div className="lg:col-span-7 rounded-[16px] bg-[#131417] border border-white/[0.06] shadow-sm p-5 overflow-hidden">
          {viewMode === 'month' ? (
            <div>
              {/* Cabeçalho dos dias Seg - Dom */}
              <div className="grid grid-cols-7 gap-2 text-center pb-3 border-b border-white/[0.04] text-[11px] font-bold text-[#8b8b90] uppercase tracking-wider">
                <span>Seg</span>
                <span>Ter</span>
                <span>Qua</span>
                <span>Qui</span>
                <span>Sex</span>
                <span>Sáb</span>
                <span>Dom</span>
              </div>

              {/* Células de dias dinâmicas do mês */}
              <div className="grid grid-cols-7 gap-2 pt-3">
                {calendarGrid.map((cell, idx) => {
                  const isCurrentMonthCell = cell.month === 'curr';
                  const isToday = cell.isToday;
                  const isSelected = selectedDateStr === cell.dateStr;
                  const dayEvents = getDayEvents(cell.dateStr);
                  const dayTasks = getDayTasks(cell.dateStr);
                  const totalItems = dayEvents.length + dayTasks.length;

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedDateStr(cell.dateStr);
                        if (!isCurrentMonthCell) {
                          const [y, m, d] = cell.dateStr.split('-').map(Number);
                          setViewDate(new Date(y, m - 1, d));
                        }
                      }}
                      className={`min-h-[82px] p-2 rounded-[12px] transition-all cursor-pointer flex flex-col justify-between group ${
                        isToday
                          ? 'bg-blue-600/20 border border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.25)]'
                          : isSelected
                          ? 'bg-white/[0.12] border border-white/[0.2] shadow-sm'
                          : isCurrentMonthCell
                          ? 'bg-[#0d0e11] hover:bg-[#121316] border border-white/[0.04]'
                          : 'opacity-30 bg-[#0d0e11]/50 border border-transparent hover:opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isToday
                              ? 'text-blue-400 font-extrabold'
                              : isSelected
                              ? 'text-white font-extrabold'
                              : isCurrentMonthCell
                              ? 'text-white'
                              : 'text-[#8b8b90]'
                          }`}
                        >
                          {cell.day}
                        </span>

                        {totalItems > 0 && (
                          <span className="text-[9px] font-bold text-[#8b8b90] px-1 rounded bg-white/[0.08]">
                            {totalItems}
                          </span>
                        )}
                      </div>

                      {/* Chips de Eventos e Tarefas Dinâmicos */}
                      <div className="space-y-1 mt-1 max-h-12 overflow-hidden">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <div
                            key={ev.id}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-blue-500/10 border border-blue-500/20 truncate"
                            title={`${ev.startTime} - ${ev.title}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-blue-400" />
                            <span className="text-white/90 truncate text-[8.5px] leading-tight font-medium">
                              {ev.title}
                            </span>
                          </div>
                        ))}
                        {dayTasks.slice(0, 1).map((t) => (
                          <div
                            key={t.id}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] ${
                              t.status === 'done'
                                ? 'bg-emerald-500/10 text-emerald-400 line-through'
                                : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                            } truncate`}
                            title={`Tarefa: ${t.title}`}
                          >
                            <CheckSquare size={9} className="shrink-0" />
                            <span className="truncate text-[8.5px] leading-tight font-medium">
                              {t.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Visão em Semana Dinâmica */
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2 text-center pb-2 border-b border-white/[0.04] text-[11px] font-bold text-[#8b8b90]">
                {weekDays.map((item) => (
                  <div
                    key={item.dateStr}
                    onClick={() => setSelectedDateStr(item.dateStr)}
                    className={`p-2 rounded-[10px] cursor-pointer transition-all ${
                      selectedDateStr === item.dateStr
                        ? 'bg-blue-500/20 text-white border border-blue-500/30'
                        : item.isToday
                        ? 'bg-white/[0.08] text-blue-400'
                        : 'hover:bg-white/[0.04] text-[#8b8b90]'
                    }`}
                  >
                    <div>{item.name}</div>
                    <div className="text-sm font-extrabold">{item.day}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 min-h-[380px]">
                {weekDays.map((w) => {
                  const dayEvs = getDayEvents(w.dateStr);
                  const dayTsks = getDayTasks(w.dateStr);

                  return (
                    <div
                      key={w.dateStr}
                      onClick={() => setSelectedDateStr(w.dateStr)}
                      className={`p-1.5 rounded-[12px] transition-all cursor-pointer flex flex-col gap-1.5 ${
                        selectedDateStr === w.dateStr
                          ? 'bg-blue-500/10 border border-blue-500/30'
                          : w.isToday
                          ? 'bg-[#0d0e11] border border-blue-500/20'
                          : 'bg-[#0d0e11] border border-white/[0.04] hover:border-white/[0.1]'
                      }`}
                    >
                      {dayEvs.map((ev) => (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingEvent(ev);
                          }}
                          className="p-1.5 rounded-[8px] bg-blue-500/10 border border-blue-500/20 text-[9.5px] text-white relative group cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-blue-300">{ev.startTime}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCalendarEvent(ev.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[#8b8b90] hover:text-rose-400 transition-opacity"
                              title="Excluir evento"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                          <p className="truncate font-medium mt-0.5 leading-tight">{ev.title}</p>
                        </div>
                      ))}

                      {dayTsks.map((t) => (
                        <div
                          key={t.id}
                          className={`p-1.5 rounded-[8px] text-[9.5px] relative group ${
                            t.status === 'done'
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 line-through'
                              : 'bg-purple-500/10 border border-purple-500/20 text-purple-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold">Tarefa</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTask(t.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[#8b8b90] hover:text-rose-400 transition-opacity"
                              title="Excluir tarefa"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                          <p className="truncate font-medium mt-0.5 leading-tight">{t.title}</p>
                        </div>
                      ))}

                      {dayEvs.length === 0 && dayTsks.length === 0 && (
                        <span className="text-[10px] text-[#8b8b90]/40 text-center py-6 block">Livre</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Painel Direito: Agenda da Data Selecionada */}
        <div className="lg:col-span-5 rounded-[16px] bg-[#131417] border border-white/[0.06] shadow-sm p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{formattedSelectedDate}</span>
                {isSelectedDateToday && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Hoje
                  </span>
                )}
              </h3>
              <p className="text-xs text-[#8b8b90] mt-0.5">
                {selectedDateEvents.length} eventos · {selectedDateTasks.length} tarefas
              </p>
            </div>

            {/* Alternador de Filtro da Agenda */}
            <div className="flex items-center p-1 rounded-full bg-[#0d0e11] border border-white/[0.04] text-xs">
              <button
                onClick={() => setScheduleFilter('all')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  scheduleFilter === 'all' ? 'bg-white/[0.12] text-white shadow-sm' : 'text-[#8b8b90] hover:text-white'
                }`}
              >
                Tudo
              </button>
              <button
                onClick={() => setScheduleFilter('events')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  scheduleFilter === 'events' ? 'bg-white/[0.12] text-white shadow-sm' : 'text-[#8b8b90] hover:text-white'
                }`}
              >
                Eventos ({selectedDateEvents.length})
              </button>
              <button
                onClick={() => setScheduleFilter('tasks')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  scheduleFilter === 'tasks' ? 'bg-white/[0.12] text-white shadow-sm' : 'text-[#8b8b90] hover:text-white'
                }`}
              >
                Tarefas ({selectedDateTasks.length})
              </button>
            </div>
          </div>

          {/* Lista com Eventos e Tarefas Sincronizados */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {/* Seção de Eventos */}
            {(scheduleFilter === 'all' || scheduleFilter === 'events') && (
              <div className="space-y-2.5">
                {selectedDateEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-[12px] bg-[#0d0e11] hover:bg-[#121316] border border-white/[0.04] hover:border-white/[0.1] transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{ev.startTime}</span>
                          <span className="text-[10px] text-[#8b8b90]">
                            {ev.durationMinutes >= 60
                              ? `${ev.durationMinutes / 60}h`
                              : `${ev.durationMinutes} min`}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-white mt-1 truncate">{ev.title}</h4>

                        <div className="flex items-center gap-3 mt-1.5 text-xs text-[#8b8b90]">
                          <span className="flex items-center gap-1 text-[11px]">
                            {ev.location.toLowerCase().includes('vídeo') ||
                            ev.location.toLowerCase().includes('video') ? (
                              <Video size={12} className="text-blue-400" />
                            ) : (
                              <MapPin size={12} className="text-amber-400" />
                            )}
                            {ev.location}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            typeBadges[ev.type] || 'bg-white/[0.06] text-[#8b8b90] border-white/[0.08]'
                          }`}
                        >
                          {ev.type}
                        </span>

                        <button
                          onClick={() => setEditingEvent(ev)}
                          className="p-1 rounded-lg text-[#8b8b90] hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                          title="Editar este evento"
                        >
                          <Pencil size={12} />
                        </button>

                        <button
                          onClick={() => deleteCalendarEvent(ev.id)}
                          className="p-1 rounded-lg text-[#8b8b90] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Excluir este evento"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Participantes */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/[0.04]">
                      <div className="flex -space-x-1.5">
                        {ev.attendeeIds.map((attId) => {
                          const att = members.find((m) => m.id === attId);
                          if (!att) return null;
                          return (
                            <img
                              key={att.id}
                              src={att.avatar}
                              alt={att.name}
                              title={att.name}
                              className="w-5 h-5 rounded-full object-cover ring-2 ring-[#0d0e11]"
                            />
                          );
                        })}
                      </div>

                      {ev.location.toLowerCase().includes('vídeo') || ev.location.toLowerCase().includes('video') ? (
                        <button
                          onClick={() => alert(`Conectando à chamada "${ev.title}"...`)}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 transition-all"
                        >
                          <Video size={11} />
                          <span>Entrar</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Seção de Tarefas */}
            {(scheduleFilter === 'all' || scheduleFilter === 'tasks') && (
              <div className="space-y-2 pt-1">
                {selectedDateTasks.map((task) => {
                  const proj = projects.find((p) => p.id === task.projectId);
                  const isDone = task.status === 'done';

                  return (
                    <div
                      key={task.id}
                      className="p-3 rounded-[12px] bg-[#0d0e11] hover:bg-[#121316] border border-white/[0.04] hover:border-white/[0.1] transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleTaskComplete(task.id)}
                          className={`w-4 h-4 rounded flex items-center justify-center transition-all shrink-0 ${
                            isDone
                              ? 'bg-blue-500 text-white'
                              : 'border border-white/30 hover:border-white/60 text-transparent'
                          }`}
                          title={isDone ? 'Marcar como pendente' : 'Marcar como concluída'}
                        >
                          <Check size={11} strokeWidth={3} />
                        </button>

                        <div className="truncate">
                          <h4
                            onClick={() => openTaskModal(task.id)}
                            className={`text-xs font-semibold cursor-pointer truncate hover:text-blue-300 transition-colors ${
                              isDone ? 'line-through text-[#8b8b90]' : 'text-white'
                            }`}
                          >
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            {proj && (
                              <span className="flex items-center gap-1 text-[10px] text-[#8b8b90]">
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: proj.color }}
                                />
                                {proj.name}
                              </span>
                            )}
                            <span className="text-[10px] text-[#8b8b90]">
                              {task.priority === 'Urgent' ? 'P Urgente' : task.priority === 'High' ? 'Alta' : 'Normal'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 rounded-lg text-[#8b8b90] hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                        title="Excluir tarefa"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Estado Vazio */}
            {selectedDateEvents.length === 0 && selectedDateTasks.length === 0 && (
              <div className="p-8 text-center rounded-[12px] bg-[#0d0e11] border border-white/[0.04]">
                <CalendarIcon size={24} className="mx-auto text-[#8b8b90]/40 mb-2" />
                <p className="text-xs text-[#8b8b90]">
                  Nenhum compromisso ou tarefa para {formattedSelectedDate}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {editingEvent && (
        <EventEditModal event={editingEvent} onClose={() => setEditingEvent(null)} />
      )}
    </div>
  );
};
