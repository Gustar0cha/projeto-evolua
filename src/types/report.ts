export type Student = {
  id: string;
  name?: string;
};

export type ModuleResult = {
  moduleId: string;
  scorePercent: number;
  completedAt?: string;
  student?: Student;
};

export type Metric = {
  label: string;
  value: number | string;
};

export type ChartImage = {
  name: string;
  dataUrl: string;
  width?: number;
  height?: number;
};

export type AdminOverviewData = {
  stats: Metric[];
  bar: { labels: string[]; datasetLabel: string; data: number[] };
  pie: { labels: string[]; datasetLabel: string; data: number[] };
  weekly?: { labels: string[]; datasetLabel: string; data: number[] };
  modulesAvg?: { labels: string[]; datasetLabel: string; data: number[] };
};

export type AdminPerformanceData = {
  radarAvg: Array<{ metric: string; avg: number }>;
  collaboratorVsClass: Array<{ metric: string; colaborador: number; turma: number }>;
  moduleLabels: string[];
};

export type StudentPerformance = {
  student: Student;
  modules: Array<{ id: string; name: string; scorePercent: number; completedAt?: string }>;
};

export type ModulePerformance = {
  module: { id: string; name: string };
  students: Array<{ id: string; name: string; scorePercent: number; completedAt?: string }>;
};
