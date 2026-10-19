import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  MapPin,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ACCENTS } from '../themeUtils';

export const CalendarView: React.FC = () => {
  const { events, members, openQuickAdd, preferences } = useApp();
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedDay, setSelectedDay] = useState<number>(19); // 19 de Outubro é hoje

  const currentAccent = ACCENTS[preferences.accent] || ACCENTS.blue;

  // Grade de Outubro de 2026 (Segunda a Domingo)
  const calendarGrid = [
    // Semana 1 (28 Set - 4 Out)
    { day: 28, month: 'prev', events: [] },
    { day: 29, month: 'prev', events: [{ title: 'Planejamento', color: '#3b82f6' }] },
    { day: 30, month: 'prev', events: [] },
    { day: 1, month: 'curr', events: [{ title: 'Kickoff', color: '#f97316' }] },
    { day: 2, month: 'curr', events: [] },
    { day: 3, month: 'curr', events: [] },
    { day: 4, month: 'curr', events: [] },

    // Semana 2 (5 Out - 11 Out)
    { day: 5, month: 'curr', events: [{ title: 'Planejamento', color: '#8b5cf6' }] },
    { day: 6, month: 'curr', events: [] },
    { day: 7, month: 'curr', events: [{ title: 'Alinhamento', color: '#10b981' }] },
    { day: 8, month: 'curr', events: [] },
    { day: 9, month: 'curr', events: [] },
    { day: 10, month: 'curr', events: [] },
    { day: 11, month: 'curr', events: [{ title: 'Deploy', color: '#10b981' }] },

    // Semana 3 (12 Out - 18 Out)
    { day: 12, month: 'curr', events: [] },
    { day: 13, month: 'curr', events: [{ title: 'Preparação', color: '#ec4899' }] },
    { day: 14, month: 'curr', events: [{ title: 'Auditoria Design', color: '#ec4899' }] },
    { day: 15, month: 'curr', events: [{ title: 'Entrevistas', color: '#10b981' }] },
    { day: 16, month: 'curr', events: [{ title: 'Retrospectiva', color: '#3b82f6' }] },
    { day: 17, month: 'curr', events: [] },
    { day: 18, month: 'curr', events: [] },

    // Semana 4 (19 Out - 25 Out) - ESTA SEMANA
    {
      day: 19,
      month: 'curr',
      isToday: true,
      events: [
        { title: 'Stand-up', color: '#3b82f6' },
        { title: 'Revisão Tide', color: '#3b82f6' },
        { title: 'Almoço & aprendizado', color: '#ec4899' },
      ],
      overflow: '+2',
    },
    {
      day: 20,
      month: 'curr',
      events: [
        { title: 'Stand-up', color: '#3b82f6' },
        { title: 'Crítica Design', color: '#ec4899' },
        { title: '1:1 Peter', color: '#6366f1' },
      ],
      overflow: '+1',
    },
    {
      day: 21,
      month: 'curr',
      events: [
        { title: 'Stand-up', color: '#3b82f6' },
        { title: 'Sync offline', color: '#3b82f6' },
        { title: 'Deep work', color: '#8b5cf6' },
      ],
    },
    {
      day: 22,
      month: 'curr',
      events: [
        { title: 'Pitch agência', color: '#f97316' },
        { title: 'Retro equipe', color: '#10b981' },
      ],
    },
    {
      day: 23,
      month: 'curr',
      events: [
        { title: 'Stand-up', color: '#10b981' },
        { title: 'Check lançamento', color: '#8b5cf6' },
      ],
      overflow: '+1',
    },
    { day: 24, month: 'curr', events: [{ title: 'Congelamento QA', color: '#10b981' }] },
    { day: 25, month: 'curr', events: [{ title: 'Preparação release', color: '#3b82f6' }] },

    // Semana 5 (26 Out - 1 Nov)
    { day: 26, month: 'curr', events: [{ title: 'Planejamento sprint', color: '#10b981' }] },
    { day: 27, month: 'curr', events: [{ title: 'Fila offline', color: '#3b82f6' }] },
    { day: 28, month: 'curr', events: [{ title: 'Gate de qualidade', color: '#3b82f6' }] },
    { day: 29, month: 'curr', events: [{ title: 'Comitê contratação', color: '#f97316' }] },
    { day: 30, month: 'curr', events: [] },
    { day: 31, month: 'curr', events: [{ title: 'Lançamento', color: '#8b5cf6' }] },
    { day: 1, month: 'next', events: [] },
  ];

  // Eventos de hoje (19 Out)
  const todayEvents = events.filter((e) => e.date === '2026-10-19');

  const typeBadges: Record<string, string> = {
    Reunião: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    Revisão: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    Equipe: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
    'Bloco de foco': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    Meeting: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    Review: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    Team: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
    'Focus block': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Outubro de 2026
          </h1>
          <p className="text-white/60 text-sm mt-1">{events.length} eventos registrados</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Navegação */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-white">
            <button
              onClick={() => setSelectedDay((d) => Math.max(1, d - 1))}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setSelectedDay(19)}
              className="px-3 py-1 rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors"
            >
              Hoje
            </button>
            <button
              onClick={() => setSelectedDay((d) => Math.min(31, d + 1))}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Alternador Mês / Semana */}
          <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'month'
                  ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/15'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'week'
                  ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/15'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Semana
            </button>
          </div>

          {/* Botão Novo Evento */}
          <button
            onClick={() => openQuickAdd('event')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-semibold text-white bg-gradient-to-r ${currentAccent.gradient} shadow-lg ${currentAccent.activeNavGlow} hover:brightness-110 active:scale-95 transition-all flex items-center gap-2`}
          >
            <Plus size={15} />
            <span>Novo evento</span>
          </button>
        </div>
      </div>

      {/* Grade Principal: Grade à Esquerda + Painel Hoje à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Grade do Calendário (Mês / Semana) */}
        <div className="lg:col-span-7 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl p-5 overflow-hidden">
          {viewMode === 'month' ? (
            <div>
              {/* Cabeçalho dos dias Seg - Dom */}
              <div className="grid grid-cols-7 gap-2 text-center pb-3 border-b border-white/5 text-[11px] font-bold text-white/50 uppercase tracking-wider">
                <span>Seg</span>
                <span>Ter</span>
                <span>Qua</span>
                <span>Qui</span>
                <span>Sex</span>
                <span>Sáb</span>
                <span>Dom</span>
              </div>

              {/* Células de dias */}
              <div className="grid grid-cols-7 gap-2 pt-3">
                {calendarGrid.map((cell, idx) => {
                  const isCurrentMonth = cell.month === 'curr';
                  const isToday = cell.isToday;
                  const isSelected = selectedDay === cell.day && isCurrentMonth;

                  return (
                    <div
                      key={idx}
                      onClick={() => isCurrentMonth && setSelectedDay(cell.day)}
                      className={`min-h-[72px] sm:min-h-[82px] p-2 rounded-2xl transition-all cursor-pointer flex flex-col justify-between ${
                        isToday
                          ? 'bg-blue-600/20 border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] ring-1 ring-blue-400/40'
                          : isSelected
                          ? 'bg-white/15 border border-white/30'
                          : isCurrentMonth
                          ? 'bg-white/[0.02] hover:bg-white/[0.06] border border-white/5'
                          : 'opacity-25 bg-transparent border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isToday ? 'text-blue-300' : isCurrentMonth ? 'text-white' : 'text-white/40'
                          }`}
                        >
                          {cell.day}
                        </span>

                        {cell.overflow && (
                          <span className="text-[10px] font-semibold text-white/50 px-1 rounded bg-white/10">
                            {cell.overflow}
                          </span>
                        )}
                      </div>

                      {/* Chips de Evento */}
                      <div className="space-y-1 mt-1">
                        {cell.events.map((ev, eIdx) => (
                          <div
                            key={eIdx}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-white/5 border border-white/5 truncate"
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: ev.color }}
                            />
                            <span className="text-white/80 truncate text-[9px] leading-tight font-medium">
                              {ev.title}
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
            /* Visão em Semana */
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2 text-center pb-2 border-b border-white/5 text-[11px] font-bold text-white/60">
                {[
                  { d: 'Seg', num: 19, today: true },
                  { d: 'Ter', num: 20 },
                  { d: 'Qua', num: 21 },
                  { d: 'Qui', num: 22 },
                  { d: 'Sex', num: 23 },
                  { d: 'Sáb', num: 24 },
                  { d: 'Dom', num: 25 },
                ].map((item) => (
                  <div
                    key={item.d}
                    className={`p-2 rounded-xl ${
                      item.today ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : ''
                    }`}
                  >
                    <div>{item.d}</div>
                    <div className="text-sm font-extrabold">{item.num}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 min-h-[350px]">
                {/* Seg 19 */}
                <div className="p-1 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                  <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-[10px] font-bold text-blue-200">
                    09:30 Stand-up
                  </div>
                  <div className="p-2 rounded-xl bg-blue-500/30 border border-blue-500/40 text-[10px] font-bold text-white">
                    11:00 Revisão Tide
                  </div>
                  <div className="p-2 rounded-xl bg-pink-500/20 border border-pink-500/30 text-[10px] font-bold text-pink-200">
                    12:30 Almoço & aprendizado
                  </div>
                  <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-[10px] font-bold text-purple-200">
                    14:00 Deep work
                  </div>
                </div>

                {/* Ter 20 */}
                <div className="p-1 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-[10px] text-white/80">
                    09:30 Stand-up
                  </div>
                  <div className="p-2 rounded-xl bg-pink-500/15 text-[10px] text-pink-300">
                    11:00 Crítica Facet
                  </div>
                </div>

                {/* Qua 21 */}
                <div className="p-1 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="p-2 rounded-xl bg-blue-500/15 text-[10px] text-blue-300">
                    10:30 Sync offline
                  </div>
                  <div className="p-2 rounded-xl bg-purple-500/15 text-[10px] text-purple-300">
                    14:00 Deep work
                  </div>
                </div>

                {/* Qui 22 */}
                <div className="p-1 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="p-2 rounded-xl bg-orange-500/15 text-[10px] text-orange-300">
                    10:00 Pitch agência
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-[10px] text-emerald-300">
                    16:00 Retrospectiva
                  </div>
                </div>

                {/* Sex 23 */}
                <div className="p-1 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-[10px] text-emerald-300">
                    09:30 Demo semanal
                  </div>
                  <div className="p-2 rounded-xl bg-purple-500/15 text-[10px] text-purple-300">
                    14:30 Alinhamento Orbit
                  </div>
                </div>

                {/* Sáb 24 */}
                <div className="p-1 rounded-2xl bg-white/[0.01] border border-white/5 text-[10px] text-white/30 text-center pt-4">
                  Sem eventos
                </div>

                {/* Dom 25 */}
                <div className="p-1 rounded-2xl bg-white/[0.01] border border-white/5 text-[10px] text-white/30 text-center pt-4">
                  Sem eventos
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Painel Direito: Agenda de Hoje */}
        <div className="lg:col-span-5 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white">Hoje</h3>
              <p className="text-xs text-white/50">19 de outubro · 5 eventos</p>
            </div>

            <button
              onClick={() => openQuickAdd('event')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition-all flex items-center gap-1.5"
            >
              <Plus size={13} />
              Adicionar evento
            </button>
          </div>

          {/* Lista da Agenda com Indicador Vermelho de HORA ATUAL */}
          <div className="space-y-4 relative">
            {todayEvents.map((ev) => {
              const isAroundNow = ev.startHour === 11.0;

              return (
                <React.Fragment key={ev.id}>
                  {/* Linha Vermelha de Agora antes das 11:00 */}
                  {isAroundNow && (
                    <div className="relative flex items-center gap-2 my-2 py-1 z-10">
                      <span className="text-[11px] font-bold text-rose-400 shrink-0 font-mono">
                        10:27
                      </span>
                      <div className="relative flex-1 flex items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e] shrink-0" />
                        <div className="h-[2px] w-full bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                      </div>
                    </div>
                  )}

                  {/* Cartão de Evento */}
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      ev.startHour === 11.0
                        ? 'bg-blue-500/10 border-blue-500/30 shadow-md ring-1 ring-blue-500/20'
                        : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{ev.startTime}</span>
                          <span className="text-[10px] text-white/40">
                            {ev.durationMinutes >= 60
                              ? `${ev.durationMinutes / 60}h`
                              : `${ev.durationMinutes} min`}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white/95 mt-1">{ev.title}</h4>

                        <div className="flex items-center gap-3 mt-1.5 text-xs text-white/50">
                          <span className="flex items-center gap-1 text-[11px]">
                            {ev.location.toLowerCase().includes('vídeo') || ev.location.toLowerCase().includes('video') ? (
                              <Video size={12} className="text-blue-400" />
                            ) : (
                              <MapPin size={12} className="text-amber-400" />
                            )}
                            {ev.location}
                          </span>
                        </div>
                      </div>

                      {/* Badge do Tipo de Evento */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          typeBadges[ev.type] || 'bg-white/10 text-white/70 border-white/10'
                        }`}
                      >
                        {ev.type}
                      </span>
                    </div>

                    {/* Avatares dos Participantes */}
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5">
                      <div className="flex -space-x-2">
                        {ev.attendeeIds.map((attId) => {
                          const att = members.find((m) => m.id === attId);
                          if (!att) return null;
                          return (
                            <img
                              key={att.id}
                              src={att.avatar}
                              alt={att.name}
                              title={att.name}
                              className="w-5 h-5 rounded-full object-cover ring-2 ring-[#141622]"
                            />
                          );
                        })}
                        {ev.attendeeIds.length > 3 && (
                          <span className="w-5 h-5 rounded-full bg-white/10 ring-2 ring-[#141622] text-[9px] font-bold text-white/70 flex items-center justify-center">
                            +1
                          </span>
                        )}
                      </div>

                      {ev.startHour === 11.0 && (
                        <button className="px-3 py-1 rounded-xl text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white shadow-sm flex items-center gap-1 transition-all">
                          <Video size={12} />
                          Entrar na chamada
                        </button>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
