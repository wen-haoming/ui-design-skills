export interface Member {
  id: string;
  name: string;
  initials: string;
  role: string;
}

export interface StatusDef {
  id: string;
  label: string;
}

export interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignees: string[];
  due: string;
  estimateHours: number;
  tags: string[];
  description: string;
  activity: string[];
}

export interface Benchmark {
  id: string;
  title: string;
  asOf: string;
  timezone: string;
  disclaimer: string;
  workspace: { name: string; subtitle: string; defaultView: string };
  members: Member[];
  statuses: StatusDef[];
  priorities: { id: string; label: string }[];
  tasks: Task[];
  defaultSelection: string;
}

export interface FilterState {
  q: string;
  status: string;
  assignee: string;
  due: 'all' | 'overdue' | 'today' | 'week';
}

export interface WorkbenchMetrics {
  openTasks: number;
  inProgress: number;
  review: number;
  doneThisWeek: number;
  overdue: number;
}
