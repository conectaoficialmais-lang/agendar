import React, { useState } from 'react';
import {
  Download,
  Table,
  LineChart,
  Check,
  ChevronRight,
  Play,
  Inbox,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { todayIso, addDays, diffDays, toIso, shortDate } from '../dateUtils';
import { clickable } from '../a11y';

type Period = '7D' | '30D' | '90D';

export const InsightsView: React.FC = () => {
  const {
    tasks,
    projects,
    members,
    focusLog,
    focusedMinutesToday,
    focusSessionsToday,
    doneTodayCount,
    doneThisWeekCount,
    overdueCount,
    exportTasksCSV,
    openTaskModal,
    toggleTaskComplete,
    openProjectDetail,
    setActiveTab,
    startFocus,
  } = useApp();

  const [period, setPeriod] = useState<Period>('30D');
  const [throughputView, setThroughputView] = useState<'chart' | 'table'>('chart');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const today = todayIso();
  const N = period === '7D' ? 7 : period === '30D' ? 30 : 90;
  const periodLabel = period === '7D' ? '7 dias' : period === '30D' ? '30 dias' : '90 dias';

  // ---- Base: tarefas concluídas, por data real de conclusão -----------------
  const compDay = (t: { completedAt?: string }) => toIso(new Date(t.completedAt as string));
  const daysAgo = (iso: string) => diffDays(iso, today);
  const doneAll = tasks.filter((t) => t.status === 'done' && t.completedAt);
  const doneCurrent = doneAll.filter((t) => {
    const d = daysAgo(compDay(t));
    return d >= 0 && d < N;
  });
  const donePrevious = doneAll.filter((t) => {
    const d = daysAgo(compDay(t));
    return d >= N && d < 2 * N;
  });

  const completedCount = doneCurrent.length;
  const prevCount = donePrevious.length;
  const hasComparison = prevCount > 0;
  const growth = hasComparison
    ? Math.round(((completedCount - prevCount) / prevCount) * 100)
    : null;

  // ---- Buckets do gráfico de vazão -----------------------------------------
  type Bucket = { label: string; current: number; previous: number; isLast: boolean };
  const buildBuckets = (): Bucket[] => {
    const res: Bucket[] = [];
    if (period === '90D') {
      for (let w = 12; w >= 0; w--) {
        const endAgo = w * 7;
        const startAgo = Math.min(endAgo + 6, N - 1);
        const inRange = (list: typeof doneAll, shift: number) =>
          list.filter((t) => {
            const d = daysAgo(compDay(t));
            return d >= endAgo + shift && d <= startAgo + shift;
          }).length;
        res.push({
          label: shortDate(addDays(today, -startAgo)),
          current: inRange(doneCurrent, 0),
          previous: inRange(donePrevious, N),
          isLast: w === 0,
        });
      }
    } else {
      for (let i = N - 1; i >= 0; i--) {
        const dayIso = addDays(today, -i);
        const prevIso = addDays(today, -(i + N));
        res.push({
          label: shortDate(dayIso),
          current: doneCurrent.filter((t) => compDay(t) === dayIso).length,
          previous: donePrevious.filter((t) => compDay(t) === prevIso).length,
          isLast: i === 0,
        });
      }
    }
    return res;
  };
  const buckets = buildBuckets();
  const prevSum = buckets.reduce((s, b) => s + b.previous, 0);
  const showPrevious = prevSum > 0;

  // ---- No prazo -------------------------------------------------------------
  const dueDone = doneCurrent.filter((t) => t.dueDate);
  const onTime = dueDone.filter((t) => compDay(t) <= t.dueDate).length;
  const late = dueDone.length - onTime;
  const onTimeRate = dueDone.length > 0 ? Math.round((onTime / dueDone.length) * 100) : null;

  // ---- Por projeto ----------------------------------------------------------
  const byProject = projects
    .map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      count: doneCurrent.filter((t) => t.projectId === p.id).length,
    }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);
  const breakdownTotal = byProject.reduce((s, x) => s + x.count, 0) || 1;
  const activeProjects = projects.filter(
    (p) => !['Shipped', 'Entregue'].includes(p.status)
  ).length;

  const donutRadius = 40;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let cumulative = 0;
  const donutSlices = byProject.map((item) => {
    const fraction = item.count / breakdownTotal;
    const dash = fraction * donutCircumference;
    const offset = -(cumulative * donutCircumference);
    cumulative += fraction;
    return {
      ...item,
      percentage: Math.round(fraction * 100),
      strokeDasharray: `${dash.toFixed(2)} ${(donutCircumference - dash).toFixed(2)}`,
      strokeDashoffset: offset.toFixed(2),
    };
  });

  // ---- Tempo de ciclo (createdAt → completedAt; fallback por daysOpen) ------
  const createdIso = (t: { createdAt?: string; completedAt?: string; daysOpen?: number }) => {
    if (t.createdAt) return toIso(new Date(t.createdAt));
    if (t.completedAt && t.daysOpen != null) return addDays(compDay(t), -t.daysOpen);
    return null;
  };
  const cycleDays = doneCurrent
    .map((t) => {
      const c = createdIso(t);
      return c ? diffDays(c, compDay(t)) : null;
    })
    .filter((d): d is number => d != null && d >= 0);
  const avgCycle = cycleDays.length
    ? (cycleDays.reduce((a, b) => a + b, 0) / cycleDays.length).toFixed(1)
    : null;

  // ---- Tarefas abertas mais antigas ----------------------------------------
  const ageOf = (t: { createdAt?: string; daysOpen?: number }) => {
    if (t.createdAt) return diffDays(toIso(new Date(t.createdAt)), today);
    return t.daysOpen || 0;
  };
  const oldestOpen = tasks
    .filter((t) => t.status !== 'done')
    .map((t) => {
      const proj = projects.find((p) => p.id === t.projectId);
      const assignee = members.find((m) => m.id === t.assigneeId);
      return {
        id: t.id,
        title: t.title,
        project: proj?.name || 'Projeto',
        assignee: assignee?.name || 'Equipe',
        color: proj?.color || 'var(--accent)',
        age: ageOf(t),
      };
    })
    .sort((a, b) => b.age - a.age)
    .slice(0, 4);

  // ---- Foco (histórico real) ------------------------------------------------
  const focusDays = Array.from({ length: Math.min(N, 30) }, (_, k) => {
    const i = Math.min(N, 30) - 1 - k;
    const dayIso = addDays(today, -i);
    const isToday = i === 0;
    const mins = isToday ? Math.max(focusLog[dayIso]?.minutes || 0, focusedMinutesToday) : focusLog[dayIso]?.minutes || 0;
    return { dayIso, label: shortDate(dayIso), hours: mins / 60, isToday };
  });
  const focusHoursTotal = focusDays.reduce((s, d) => s + d.hours, 0);
  const activeFocusDays = focusDays.filter((d) => d.hours > 0).length;
  const avgFocusPerActiveDay = activeFocusDays ? focusHoursTotal / activeFocusDays : 0;
  const maxFocusH = Math.max(1, ...focusDays.map((d) => d.hours));

  // ---- Gráfico de vazão (SVG) ----------------------------------------------
  const svgW = 600;
  const svgH = 170;
  const cLeft = 40;
  const cRight = 585;
  const cTop = 18;
  const cBottom = 130;
  const maxVal = Math.max(4, ...buckets.map((b) => Math.max(b.current, b.previous)));
  const pointAt = (i: number, v: number) => ({
    x: cLeft + (buckets.length > 1 ? (i / (buckets.length - 1)) * (cRight - cLeft) : (cRight - cLeft) / 2),
    y: cBottom - (v / maxVal) * (cBottom - cTop),
  });
  const curPts = buckets.map((b, i) => pointAt(i, b.current));
  const prevPts = buckets.map((b, i) => pointAt(i, b.previous));
  const smooth = (pts: { x: number; y: number }[]) => {
    if (!pts.length) return '';
    let p = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const mx = a.x + (b.x - a.x) / 2;
      p += ` C ${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`;
    }
    return p;
  };
  const curPath = smooth(curPts);
  const areaPath = curPts.length
    ? `${curPath} L ${curPts[curPts.length - 1].x},${cBottom} L ${curPts[0].x},${cBottom} Z`
    : '';
  const hasChartData = completedCount > 0 || prevSum > 0;

  const EmptyHint: React.FC<{ icon?: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
    <div className="flex flex-col items-center justify-center text-center gap-2 py-8 text-white/45">
      <div className="text-white/25">{icon ?? <Inbox size={22} />}</div>
      <p className="text-xs max-w-[220px] leading-relaxed">{children}</p>
    </div>
  );

  const Delta: React.FC<{ value: number | null; unit?: string }> = ({ value, unit = '%' }) => {
    if (value == null) return <span className="text-[11px] text-white/35 font-medium">sem comparação</span>;
    const up = value >= 0;
    return (
      <span className={`text-xs font-bold ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
        {up ? '+' : ''}
        {value}
        {unit}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[34px] md:text-[40px] font-bold tracking-tight text-white leading-none">
            Métricas &amp; Insights
          </h1>
          <p className="text-[#8b8b90] text-sm mt-1.5">
            Calculado dos seus dados reais · últimos {periodLabel}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center p-1 rounded-full panel">
            {(['7D', '30D', '90D'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  period === p ? 'bg-white/[0.14] text-white shadow-sm' : 'text-[#8b8b90] hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={exportTasksCSV}
            className="px-4 py-2 rounded-full text-xs font-semibold text-white panel panel-hover flex items-center gap-2"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="p-4 rounded-[18px] panel panel-hover">
          <span className="text-[11px] text-[#8b8b90] font-medium block">Concluídas</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[28px] font-bold text-white leading-none">{completedCount}</span>
            <Delta value={growth} />
          </div>
          <span className="text-[10px] text-[#8b8b90]/80 block mt-1.5">
            {doneTodayCount} hoje · {doneThisWeekCount} nos últimos 7 dias
          </span>
        </div>

        <div className="p-4 rounded-[18px] panel panel-hover">
          <span className="text-[11px] text-[#8b8b90] font-medium block">No prazo</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[28px] font-bold text-white leading-none">
              {onTimeRate != null ? `${onTimeRate}%` : '—'}
            </span>
          </div>
          <span className="text-[10px] text-[#8b8b90]/80 block mt-1.5">
            {dueDone.length > 0 ? `${onTime} de ${dueDone.length} no prazo` : 'sem entregas com prazo'}
          </span>
        </div>

        <div className="p-4 rounded-[18px] panel panel-hover">
          <span className="text-[11px] text-[#8b8b90] font-medium block">Horas de foco</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[28px] font-bold text-white leading-none">
              {focusHoursTotal > 0 ? `${focusHoursTotal.toFixed(1)}h` : '0h'}
            </span>
          </div>
          <span className="text-[10px] text-[#8b8b90]/80 block mt-1.5">
            {(focusedMinutesToday / 60).toFixed(1)}h hoje · {focusSessionsToday} sessões
          </span>
        </div>

        <div className="p-4 rounded-[18px] panel panel-hover">
          <span className="text-[11px] text-[#8b8b90] font-medium block">Tempo de ciclo</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-[28px] font-bold text-white leading-none">
              {avgCycle != null ? `${avgCycle}d` : '—'}
            </span>
          </div>
          <span className="text-[10px] text-[#8b8b90]/80 block mt-1.5">média do início à conclusão</span>
        </div>
      </div>

      {/* Vazão */}
      <div className="p-5 md:p-6 rounded-[18px] panel space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Vazão diária de entregas</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold accent-chip">{period}</span>
            </h3>
            <p className="text-xs text-[#8b8b90] mt-0.5">
              Tarefas finalizadas por {period === '90D' ? 'semana' : 'dia'}
              {showPrevious ? ', comparado ao período anterior' : ''}
            </p>
          </div>
          <button
            onClick={() => setThroughputView(throughputView === 'chart' ? 'table' : 'chart')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold panel-inset hover:text-white text-[#8b8b90] shrink-0"
          >
            {throughputView === 'chart' ? <Table size={13} /> : <LineChart size={13} />}
            <span className="hidden sm:inline">{throughputView === 'chart' ? 'Tabela' : 'Gráfico'}</span>
          </button>
        </div>

        {!hasChartData ? (
          <EmptyHint icon={<LineChart size={22} />}>
            Nenhuma tarefa concluída nos últimos {periodLabel}. Conclua tarefas e o gráfico se preenche sozinho.
          </EmptyHint>
        ) : throughputView === 'chart' ? (
          <>
            {showPrevious && (
              <div className="flex items-center gap-5 text-xs text-[#8b8b90]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 rounded-full" style={{ background: 'var(--accent)' }} />
                  <span>Atual ({period})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 rounded-full border-t border-dashed border-white/40" />
                  <span>Período anterior</span>
                </div>
              </div>
            )}
            <div className="pt-2 h-56 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${svgW} ${svgH}`}>
                <defs>
                  <linearGradient id="vazaoArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" style={{ stopColor: 'var(--accent)' }} stopOpacity="0.32" />
                    <stop offset="100%" style={{ stopColor: 'var(--accent)' }} stopOpacity="0" />
                  </linearGradient>
                </defs>

                <line x1={cLeft} y1={cTop} x2={cRight} y2={cTop} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1={cLeft} y1={(cTop + cBottom) / 2} x2={cRight} y2={(cTop + cBottom) / 2} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1={cLeft} y1={cBottom} x2={cRight} y2={cBottom} stroke="rgba(255,255,255,0.12)" />

                {[maxVal, Math.round(maxVal / 2), 0].map((v, i) => (
                  <text
                    key={v + '-' + i}
                    x={cLeft - 8}
                    y={cTop + i * ((cBottom - cTop) / 2) + 4}
                    fill="rgba(255,255,255,0.35)"
                    fontSize="9"
                    textAnchor="end"
                    fontFamily="monospace"
                  >
                    {v}
                  </text>
                ))}

                {showPrevious && (
                  <path d={smooth(prevPts)} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.8" strokeDasharray="4 3" />
                )}
                <path d={areaPath} fill="url(#vazaoArea)" className="transition-all duration-700 ease-out" />
                <path
                  d={curPath}
                  fill="none"
                  style={{ stroke: 'var(--accent)' }}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-700 ease-out"
                />

                {curPts.map((pt, i) => {
                  const isHover = hoveredIdx === i;
                  const isLast = i === curPts.length - 1;
                  if (!isLast && !isHover && buckets.length > 14 && i % 2 !== 0) {
                    // ponto de hover invisível p/ densidade alta
                    return (
                      <circle key={i} cx={pt.x} cy={pt.y} r="10" fill="transparent"
                        onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)} />
                    );
                  }
                  return (
                    <g key={i}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHover ? 6 : isLast ? 5 : 3.5}
                        fill="#0c0e16"
                        style={{ stroke: 'var(--accent)' }}
                        strokeWidth={isHover ? 3 : 2}
                        className="cursor-pointer transition-all duration-200"
                        onMouseEnter={() => setHoveredIdx(i)}
                        onMouseLeave={() => setHoveredIdx(null)}
                      />
                    </g>
                  );
                })}

                {buckets.map((b, i) => {
                  const show = i === 0 || b.isLast || i % (period === '7D' ? 1 : period === '30D' ? 4 : 2) === 0;
                  if (!show) return null;
                  const x = cLeft + (buckets.length > 1 ? (i / (buckets.length - 1)) * (cRight - cLeft) : (cRight - cLeft) / 2);
                  return (
                    <text key={i} x={x} y={cBottom + 18} fill={b.isLast ? 'var(--accent)' : 'rgba(255,255,255,0.4)'} fontSize="9" fontWeight={b.isLast ? 'bold' : 'normal'} textAnchor="middle">
                      {b.label}
                    </text>
                  );
                })}
              </svg>

              {hoveredIdx != null && buckets[hoveredIdx] && (
                <div
                  className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-full px-3 py-2 rounded-xl bg-[#151722]/95 border border-white/20 text-white shadow-2xl backdrop-blur-xl text-xs"
                  style={{ left: `${(curPts[hoveredIdx].x / svgW) * 100}%`, top: `${(curPts[hoveredIdx].y / svgH) * 100}%` }}
                >
                  <div className="font-bold">{buckets[hoveredIdx].label}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
                    <span>Atual: <strong>{buckets[hoveredIdx].current}</strong></span>
                  </div>
                  {showPrevious && (
                    <div className="flex items-center gap-2 text-white/50 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-white/40" />
                      <span>Anterior: {buckets[hoveredIdx].previous}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="max-h-56 overflow-y-auto pr-1">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] text-[#8b8b90] border-b border-white/5 uppercase sticky top-0 bg-[#0c0e16]">
                <tr>
                  <th className="py-2.5">Período</th>
                  <th className="py-2.5">Concluídas</th>
                  {showPrevious && <th className="py-2.5">Anterior</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {buckets.map((b, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 font-medium">{b.label}</td>
                    <td className="py-2.5 font-bold" style={{ color: 'var(--accent)' }}>{b.current}</td>
                    {showPrevious && <td className="py-2.5 text-white/40">{b.previous}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Por projeto + No prazo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Por projeto */}
        <div className="p-5 md:p-6 rounded-[18px] panel space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Por projeto</h3>
              <p className="text-xs text-[#8b8b90] mt-0.5">Concluídas no período, por projeto</p>
            </div>
            <span className="text-xs text-[#8b8b90]">{activeProjects} ativos</span>
          </div>

          {donutSlices.length === 0 ? (
            <EmptyHint>Nenhuma tarefa concluída nos últimos {periodLabel}.</EmptyHint>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-1">
              <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r={donutRadius} stroke="rgba(255,255,255,0.05)" strokeWidth="13" fill="none" />
                  {donutSlices.map((s) => (
                    <circle
                      key={s.id}
                      cx="60"
                      cy="60"
                      r={donutRadius}
                      stroke={s.color}
                      strokeWidth="13"
                      strokeDasharray={s.strokeDasharray}
                      strokeDashoffset={s.strokeDashoffset}
                      fill="none"
                      className="transition-all duration-700 ease-out"
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-2xl font-bold text-white">{completedCount}</span>
                  <span className="text-[10px] font-semibold text-[#8b8b90]">concluídas</span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-1">
                {donutSlices.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    {...clickable(() => {
                      openProjectDetail(item.id);
                      setActiveTab('projects');
                    })}
                    className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 truncate mr-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-white/85 group-hover:text-white truncate font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2.5 font-mono shrink-0">
                      <span className="text-white/80 font-bold">{item.count}</span>
                      <span className="text-white/40 text-[11px] w-9 text-right">{item.percentage}%</span>
                      <ChevronRight size={12} className="text-white/20 group-hover:text-white/60" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* No prazo + mais antigas */}
        <div className="p-5 md:p-6 rounded-[18px] panel space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white">No prazo</h3>
            <p className="text-xs text-[#8b8b90] mt-0.5">Pontualidade das entregas no período</p>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{onTimeRate != null ? `${onTimeRate}%` : '—'}</span>
              <span className="text-xs text-[#8b8b90]">
                {dueDone.length > 0 ? 'no prazo ou antes' : 'sem entregas com prazo'}
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-white/10 mt-3 flex overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${onTimeRate ?? 0}%` }} />
              <div className="h-full bg-rose-500/80 transition-all duration-700" style={{ width: `${onTimeRate != null ? 100 - onTimeRate : 0}%` }} />
            </div>
            <div className="flex items-center justify-between text-[11px] mt-2">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {onTime} no prazo
              </span>
              <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                {late} com atraso
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#8b8b90] uppercase tracking-wider">
                Tarefas abertas mais antigas
              </span>
              {oldestOpen.length > 0 && (
                <span className="text-[10px] text-[#8b8b90]">clique no check p/ concluir</span>
              )}
            </div>

            {oldestOpen.length === 0 ? (
              <p className="text-xs text-[#8b8b90]/70 py-2">Tudo em dia — nenhuma tarefa em aberto. 🎉</p>
            ) : (
              <div className="space-y-2">
                {oldestOpen.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2.5 rounded-xl panel-inset group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTaskComplete(t.id);
                        }}
                        className="w-5 h-5 rounded-lg border border-white/30 hover:border-emerald-400 hover:bg-emerald-500/20 text-transparent hover:text-emerald-300 flex items-center justify-center shrink-0 transition-all"
                        title="Concluir tarefa"
                      >
                        <Check size={12} strokeWidth={3} />
                      </button>
                      <div {...clickable(() => openTaskModal(t.id))} className="truncate cursor-pointer flex-1">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-[var(--accent)] transition-colors">
                          {t.title}
                        </h4>
                        <span className="flex items-center gap-1.5 text-[10px] text-[#8b8b90] mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color }} />
                          <span className="truncate">{t.project}</span>
                          <span>·</span>
                          <span className="truncate">{t.assignee}</span>
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-400/90 font-mono shrink-0 ml-2 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20">
                      {t.age}d
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Foco */}
      <div className="p-5 md:p-6 rounded-[18px] panel space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">Seu foco</h3>
            <p className="text-xs text-[#8b8b90] mt-0.5">Horas de foco por dia (cresce conforme você usa o timer)</p>
            {focusHoursTotal > 0 && (
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-white">{focusHoursTotal.toFixed(1)}h</span>
                <span className="text-xs text-[#8b8b90]">~{avgFocusPerActiveDay.toFixed(1)}h por dia com foco</span>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              startFocus();
              setActiveTab('home');
            }}
            className="text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-full panel-inset hover:text-white text-[#8b8b90] shrink-0"
            style={{ color: 'var(--accent)' }}
          >
            <Play size={12} />
            <span className="hidden sm:inline">Iniciar foco</span>
          </button>
        </div>

        {focusHoursTotal === 0 ? (
          <EmptyHint icon={<Play size={20} />}>
            Você ainda não registrou foco. Use o timer na Home e seu histórico diário aparece aqui.
          </EmptyHint>
        ) : (
          <div className="pt-1">
            <div className="flex items-end gap-1.5 h-36">
              {focusDays.map((d) => {
                const h = Math.max(d.hours > 0 ? 6 : 2, (d.hours / maxFocusH) * 100);
                return (
                  <div key={d.dayIso} className="flex-1 flex flex-col items-center justify-end h-full group min-w-0">
                    <div className="relative w-full flex justify-center">
                      <div className="absolute -top-7 px-2 py-0.5 rounded-lg bg-[#151722]/95 border border-white/20 text-white text-[10px] font-mono font-bold opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-30">
                        {d.label}: {d.hours.toFixed(1)}h
                      </div>
                      <div
                        className={`w-full rounded-t-md transition-all duration-300 ${d.hours === 0 ? 'bg-white/[0.06]' : 'group-hover:brightness-125'}`}
                        style={{
                          height: `${h}%`,
                          background: d.hours === 0 ? undefined : d.isToday ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 60%, transparent)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#8b8b90] pt-2 border-t border-white/5 mt-2">
              <span>{focusDays[0]?.label}</span>
              <span className="font-bold" style={{ color: 'var(--accent)' }}>{focusDays[focusDays.length - 1]?.label}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
