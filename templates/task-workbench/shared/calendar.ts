import type { Task } from './types';

export interface WeekRow {
  id: string;
  label: string;
  range: string;
  tasks: Task[];
  empty: boolean;
}

/** 以 asOf 所在月为焦点，按 due 落入自然周分行（Asia/Shanghai 日历日） */
export function buildAgendaWeeks(tasks: Task[], asOf: string, monthYm: string): WeekRow[] {
  const [y, m] = monthYm.split('-').map(Number);
  const weeks: WeekRow[] = [];
  let day = 1;
  const daysInMonth = new Date(y, m, 0).getDate();
  let weekIndex = 1;
  while (day <= daysInMonth) {
    const start = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const endDay = Math.min(day + 6, daysInMonth);
    const end = `${y}-${String(m).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
    const inRange = (due: string) => due >= start && due <= end;
    const rowTasks = tasks.filter((t) => inRange(t.due));
    weeks.push({
      id: `w-${weekIndex}`,
      label: `第 ${weekIndex} 周`,
      range: `${start.slice(5)} – ${end.slice(5)}`,
      tasks: rowTasks,
      empty: rowTasks.length === 0,
    });
    day = endDay + 1;
    weekIndex++;
  }
  return weeks;
}

export function asOfMonth(asOf: string): string {
  return asOf.slice(0, 7);
}

export const MONTH_CHIPS = ['2026-10', '2026-11', '2026-12'];
