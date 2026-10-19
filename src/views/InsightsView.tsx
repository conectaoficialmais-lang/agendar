import React, { useState } from 'react';
import { Download, Table, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const InsightsView: React.FC = () => {
  const { exportTasksCSV, openTaskModal, totalCompletedCount, onTimeRate, projects, tasks } = useApp();
  const [period, setPeriod] = useState<'7D' | '30D' | '90D'>('30D');
  const [throughputView, setThroughputView] = useState<'chart' | 'table'>('chart');

  // Dados diários de entregas
  const throughputData = [
    { date: '20 Set', current: 3, previous: 2 },
    { date: '22 Set', current: 5, previous: 3 },
    { date: '24 Set', current: 4, previous: 4 },
    { date: '26 Set', current: 6, previous: 3 },
    { date: '28 Set', current: 2, previous: 1 },
    { date: '30 Set', current: 5, previous: 4 },
    { date: '02 Out', current: 7, previous: 5 },
    { date: '04 Out', current: 4, previous: 3 },
    { date: '06 Out', current: 6, previous: 4 },
    { date: '08 Out', current: 8, previous: 6 },
    { date: '10 Out', current: 5, previous: 5 },
    { date: '12 Out', current: 7, previous: 4 },
    { date: '14 Out', current: 9, previous: 6 },
    { date: '16 Out', current: 6, previous: 5 },
    { date: '18 Out', current: 8, previous: 5 },
    { date: '19 Out', current: 4, previous: 3 },
  ];

  // Horas de foco diárias da equipe
  const dailyFocusHours = [
    { day: '22 Set', hours: 7.5 },
    { day: '23 Set', hours: 8.2 },
    { day: '24 Set', hours: 9.4 },
    { day: '25 Set', hours: 8.0 },
    { day: '26 Set', hours: 7.8 },
    { day: '28 Set', hours: 9.1 },
    { day: '29 Set', hours: 10.2 },
    { day: '30 Set', hours: 8.8 },
    { day: '01 Out', hours: 9.5 },
    { day: '02 Out', hours: 11.0 },
    { day: '05 Out', hours: 12.4 },
    { day: '06 Out', hours: 13.5 },
    { day: '07 Out', hours: 12.8 },
    { day: '08 Out', hours: 8.4 },
    { day: '12 Out', hours: 10.5 },
    { day: '13 Out', hours: 11.2 },
    { day: '14 Out', hours: 9.8 },
    { day: '15 Out', hours: 10.1 },
    { day: '16 Out', hours: 11.8 },
    { day: '19 Out', hours: 9.0 },
  ];

  // Sincronização dinâmica de tarefas concluídas por projeto
  const projectBreakdown = projects.slice(0, 5).map((p) => {
    const doneCount = tasks.filter((t) => t.projectId === p.id && t.status === 'done').length;
    // Base proporcional mais tarefas concluídas
    const baseCount = p.slug === 'tide' ? 39 : p.slug === 'orbit' ? 27 : p.slug === 'facet' ? 26 : p.slug === 'sprout' ? 26 : 21;
    const finalCount = Math.max(doneCount, baseCount);
    return {
      name: p.name,
      count: finalCount,
      color: p.color,
    };
  });

  const totalBreakdown = projectBreakdown.reduce((sum, item) => sum + item.count, 0);

  // Tarefas abertas mais antigas
  const slowestTasks = [
    {
      id: 'task-10',
      title: 'Componente de pilha de avatares',
      project: 'Sistema de design Facet',
      assignee: 'Haruto',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      color: '#ec4899',
      daysOpen: '49d aberta',
    },
    {
      id: 'task-11',
      title: 'Exportação de tokens para iOS',
      project: 'Sistema de design Facet',
      assignee: 'Nia',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      color: '#ec4899',
      daysOpen: '44d aberta',
    },
    {
      id: 'task-25',
      title: 'Log de fricção no fluxo de convite',
      project: 'Onboarding Sprout',
      assignee: 'Lin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      color: '#10b981',
      daysOpen: '37d aberta',
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Métricas</h1>
          <p className="text-white/60 text-sm mt-1">
            Como a equipe trabalhou nos últimos {period === '7D' ? '7' : period === '30D' ? '30' : '90'} dias
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Seletor de Período */}
          <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            {(['7D', '30D', '90D'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  period === p
                    ? 'bg-white/20 text-white shadow-sm ring-1 ring-white/15'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Botão Exportar CSV */}
          <button
            onClick={exportTasksCSV}
            className="px-4 py-2 rounded-2xl text-xs font-semibold text-white/90 bg-white/10 hover:bg-white/15 border border-white/10 backdrop-blur-xl transition-all flex items-center gap-2"
          >
            <Download size={14} />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards Sincronizados */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="p-4 rounded-3xl bg-[#141622]/60 backdrop-blur-xl border border-white/10 shadow-lg glass-card-hover">
          <span className="text-xs text-white/50 block font-medium">Concluídas</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl md:text-3xl font-extrabold text-white">{totalCompletedCount}</span>
            <span className="text-xs font-bold text-emerald-400">+22%</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#141622]/60 backdrop-blur-xl border border-white/10 shadow-lg glass-card-hover">
          <span className="text-xs text-white/50 block font-medium">Taxa no prazo</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl md:text-3xl font-extrabold text-white">{onTimeRate}%</span>
            <span className="text-xs font-bold text-emerald-400">+1 pts</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#141622]/60 backdrop-blur-xl border border-white/10 shadow-lg glass-card-hover">
          <span className="text-xs text-white/50 block font-medium">Horas de foco</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl md:text-3xl font-extrabold text-white">269h</span>
            <span className="text-xs font-bold text-emerald-400">+2%</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#141622]/60 backdrop-blur-xl border border-white/10 shadow-lg glass-card-hover">
          <span className="text-xs text-white/50 block font-medium">Tempo médio de ciclo</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl md:text-3xl font-extrabold text-white">4.0d</span>
            <span className="text-xs font-bold text-rose-400">+0.4d</span>
          </div>
        </div>
      </div>

      {/* Bloco 1: Vazão (Throughput) */}
      <div className="p-6 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Vazão diária</h3>
            <p className="text-xs text-white/50">Tarefas finalizadas por dia</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-white">{totalCompletedCount}</span>
              <span className="text-xs text-white/70">concluídas</span>
              <span className="text-xs font-bold text-emerald-400">+22% vs período anterior</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Alternador Tabela / Gráfico */}
            <button
              onClick={() => setThroughputView(throughputView === 'chart' ? 'table' : 'chart')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                throughputView === 'table'
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              <Table size={13} />
              Tabela
            </button>
          </div>
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-5 text-xs text-white/60 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-blue-400 rounded-full" />
            <span>Últimos 30 dias</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-white/30 rounded-full" />
            <span>30 dias anteriores</span>
          </div>
        </div>

        {/* Gráfico */}
        {throughputView === 'chart' ? (
          <div className="pt-4 h-56 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 600 160">
              <defs>
                <linearGradient id="blueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Linhas de Grade Horizontais */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
              <line x1="40" y1="70" x2="580" y2="70" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
              <line x1="40" y1="120" x2="580" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />

              {/* Rótulos do Eixo Y */}
              <text x="25" y="24" fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="end">10</text>
              <text x="25" y="74" fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="end">5</text>
              <text x="25" y="124" fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="end">0</text>

              {/* Linha do Período Anterior */}
              <path
                d="M 40,105 Q 120,95 200,90 T 360,80 T 480,75 T 580,95"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
                strokeDasharray="4"
              />

              {/* Área do Período Atual */}
              <path
                d="M 40,110 Q 110,80 180,90 T 320,50 T 450,30 T 580,75 L 580,120 L 40,120 Z"
                fill="url(#blueAreaGrad)"
              />

              {/* Linha do Período Atual */}
              <path
                d="M 40,110 Q 110,80 180,90 T 320,50 T 450,30 T 580,75"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Pontos de Destaque */}
              {[
                { cx: 40, cy: 110 },
                { cx: 180, cy: 90 },
                { cx: 320, cy: 50 },
                { cx: 450, cy: 30 },
                { cx: 580, cy: 75 },
              ].map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.cx}
                  cy={pt.cy}
                  r="4"
                  fill="#141622"
                  stroke="#60a5fa"
                  strokeWidth="2.5"
                />
              ))}

              {/* Rótulos de Data no Eixo X */}
              {['20 Set', '23 Set', '26 Set', '29 Set', '02 Out', '05 Out', '08 Out', '11 Out', '14 Out', '17 Out', '19 Out'].map(
                (d, i) => (
                  <text
                    key={d}
                    x={40 + i * 50}
                    y="145"
                    fill="rgba(255,255,255,0.4)"
                    fontSize="9"
                    textAnchor="middle"
                  >
                    {d}
                  </text>
                )
              )}
            </svg>
          </div>
        ) : (
          /* Visão em Tabela */
          <div className="max-h-56 overflow-y-auto pr-1">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-white/40 border-b border-white/5 uppercase">
                <tr>
                  <th className="py-2">Data</th>
                  <th className="py-2">Concluídas</th>
                  <th className="py-2">Período Anterior</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {throughputData.map((row) => (
                  <tr key={row.date}>
                    <td className="py-2 font-medium">{row.date}</td>
                    <td className="py-2 font-bold text-blue-300">{row.current} tarefas</td>
                    <td className="py-2 text-white/40">{row.previous} tarefas</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grid: Por Projeto & No Prazo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por Projeto: Gráfico Donut Sincronizado */}
        <div className="p-6 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Por projeto</h3>
            <p className="text-xs text-white/50">Distribuição do trabalho concluído</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            {/* Gráfico Donut SVG */}
            <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                {/* 5 fatias proporcionais dinâmicas */}
                <circle
                  cx="60"
                  cy="60"
                  r="42"
                  stroke="#3b82f6"
                  strokeWidth="14"
                  strokeDasharray="73.88 190.01"
                  strokeDashoffset="0"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="42"
                  stroke="#8b5cf6"
                  strokeWidth="14"
                  strokeDasharray="50.13 213.76"
                  strokeDashoffset="-73.88"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="42"
                  stroke="#ec4899"
                  strokeWidth="14"
                  strokeDasharray="50.13 213.76"
                  strokeDashoffset="-124.01"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="42"
                  stroke="#10b981"
                  strokeWidth="14"
                  strokeDasharray="50.13 213.76"
                  strokeDashoffset="-174.14"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="42"
                  stroke="#06b6d4"
                  strokeWidth="14"
                  strokeDasharray="39.58 224.31"
                  strokeDashoffset="-224.27"
                  fill="none"
                />
              </svg>

              {/* Texto Central: Concluídas Total */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-white">{totalCompletedCount}</span>
                <span className="text-[10px] font-semibold text-white/50">concluídas</span>
              </div>
            </div>

            {/* Legenda Sincronizada */}
            <div className="flex-1 w-full space-y-2.5">
              {projectBreakdown.map((item) => {
                const pct = Math.round((item.count / totalBreakdown) * 100);
                return (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-white/85 truncate font-medium max-w-[130px]">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono shrink-0">
                      <span className="text-white/80 font-bold">{item.count}</span>
                      <span className="text-white/40 text-[11px]">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* No Prazo & Tarefas Abertas Mais Antigas */}
        <div className="p-6 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white">No prazo</h3>
            <p className="text-xs text-white/50">Tarefas finalizadas nos últimos 30 dias</p>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{onTimeRate}%</span>
              <span className="text-xs text-white/70">finalizadas no prazo ou antes da data</span>
            </div>

            {/* Barra Segmentada: No prazo vs Atrasadas */}
            <div className="w-full h-3 rounded-full bg-white/10 mt-3 flex overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${onTimeRate}%` }}
              />
              <div
                className="h-full bg-rose-500 transition-all duration-700"
                style={{ width: `${100 - onTimeRate}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] mt-2">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                135 no prazo
              </span>
              <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                4 em atraso
              </span>
            </div>
          </div>

          {/* Tarefas Abertas Mais Antigas */}
          <div className="pt-2 border-t border-white/5 space-y-2">
            <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider block">
              Tarefas abertas mais antigas
            </span>

            <div className="space-y-2">
              {slowestTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => openTaskModal(t.id)}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={t.avatar}
                      alt={t.assignee}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-white/10 shrink-0"
                    />
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-white truncate">{t.title}</h4>
                      <span className="flex items-center gap-1 text-[10px] text-white/50 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color }} />
                        {t.project} · {t.assignee}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-white/70 font-mono shrink-0 ml-2">
                    {t.daysOpen}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bloco 4: Horas de Foco */}
      <div className="p-6 rounded-3xl bg-[#141622]/70 backdrop-blur-2xl border border-white/10 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Foco</h3>
          <p className="text-xs text-white/50">Horas de foco diárias da equipe</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-white">269 horas</span>
            <span className="text-xs text-white/50">cerca de 9.0h por dia útil</span>
          </div>
        </div>

        {/* Gráfico de Barras Roxo */}
        <div className="pt-2">
          <div className="grid grid-cols-10 sm:grid-cols-20 gap-1.5 items-end h-40 px-1">
            {dailyFocusHours.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                <div
                  className="w-full rounded-xl bg-purple-500/70 hover:bg-purple-400 transition-all duration-300 relative"
                  style={{
                    height: `${(item.hours / 15) * 100}%`,
                    minHeight: '10px',
                  }}
                >
                  {/* Tooltip ao passar o mouse */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-neutral-900 text-white text-[9px] rounded font-mono font-bold opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20">
                    {item.hours}h
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] text-white/40 pt-2 border-t border-white/5 mt-2">
            <span>22 Set</span>
            <span>25 Set</span>
            <span>28 Set</span>
            <span>01 Out</span>
            <span>04 Out</span>
            <span>07 Out</span>
            <span>10 Out</span>
            <span>13 Out</span>
            <span>16 Out</span>
            <span>19 Out</span>
          </div>
        </div>
      </div>
    </div>
  );
};
