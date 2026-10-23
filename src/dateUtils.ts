// Utilitários de data centralizados — fonte ÚNICA de verdade para "hoje".
// Antes, "hoje" estava escrito à mão como '2026-10-19' em vários lugares, o que
// deixava o app congelado no tempo e com dois "hojes" divergentes. Aqui tudo
// deriva da data real do dispositivo.

/** Converte um Date local para ISO curto (YYYY-MM-DD), sem passar por UTC. */
export function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

/** A data de hoje (local) em ISO curto. */
export function todayIso(): string {
  return toIso(new Date());
}

/**
 * Converte ISO curto para Date LOCAL.
 * Nunca use `new Date('2026-10-19')`: isso interpreta como UTC meia-noite,
 * que no Brasil cai no dia anterior.
 */
export function parseIso(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** Soma `days` a uma data ISO e devolve ISO curto. */
export function addDays(iso: string, days: number): string {
  const d = parseIso(iso);
  d.setDate(d.getDate() + days);
  return toIso(d);
}

/** Diferença em dias inteiros entre duas datas ISO (toIso - fromIso). */
export function diffDays(fromIso: string, toIsoStr: string): number {
  const a = parseIso(fromIso).getTime();
  const b = parseIso(toIsoStr).getTime();
  return Math.round((b - a) / 86_400_000);
}

const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS_SHORT = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

/**
 * Rótulo amigável de prazo, derivado em tempo de render (nunca armazenado):
 * "Hoje", "Amanhã", "Ontem", o dia da semana dentro de ±6 dias, ou "19 out".
 */
export function formatDueLabel(iso: string, today: string = todayIso()): string {
  if (!iso) return '';
  const delta = diffDays(today, iso);
  if (delta === 0) return 'Hoje';
  if (delta === 1) return 'Amanhã';
  if (delta === -1) return 'Ontem';
  const d = parseIso(iso);
  if (delta > 1 && delta <= 6) return WEEKDAYS_SHORT[d.getDay()];
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/**
 * Converte um intervalo "HH:MM"–"HH:MM" em { startHour decimal, durationMinutes }.
 * Devolve null se o horário for inválido ou o fim não for depois do início.
 */
export function timeRangeToHourAndDuration(
  start: string,
  end: string
): { startHour: number; durationMinutes: number } | null {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return null;
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  if (endMin <= startMin) return null;
  return { startHour: sh + sm / 60, durationMinutes: endMin - startMin };
}

/** Data curta, ex.: "23 out" (para eixos de gráfico). */
export function shortDate(iso: string): string {
  const d = parseIso(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/** Saudação conforme a hora do dia. */
export function greeting(d: Date = new Date()): string {
  const h = d.getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

/** Data por extenso em pt-BR, ex.: "Quinta-feira, 23 de outubro". */
export function longDateLabel(iso: string = todayIso()): string {
  const d = parseIso(iso);
  const txt = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(d);
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

// Data em que o seed de demonstração foi escrito ("hoje" na época).
export const SEED_ANCHOR = '2026-10-19';

/**
 * Mapeia uma data "âncora" do seed para a data equivalente relativa a HOJE,
 * preservando a distância em dias. Assim a demo fica sempre centrada no dia
 * atual sem precisar reescrever datas na mão.
 */
export function fromAnchor(iso: string): string {
  return addDays(todayIso(), diffDays(SEED_ANCHOR, iso));
}
