import { AdminOverviewData, AdminPerformanceData, Metric, ModuleResult, Student, StudentPerformance } from "@/types/report";

export function buildStudentModuleResult(params: { id: string; score: string; student?: Student; completedAt?: string }): ModuleResult {
  const scorePercent = Number(params.score) || 0;
  return {
    moduleId: params.id,
    scorePercent,
    completedAt: params.completedAt,
    student: params.student,
  };
}

export function buildAdminOverviewData(): AdminOverviewData {
  const stats: Metric[] = [
    { label: "Colaboradores Ativos", value: 128 },
    { label: "Módulos Criados", value: 18 },
    { label: "Taxa de Conclusão Média", value: "74%" },
    { label: "Turmas Ativas", value: 7 },
  ];

  const bar = {
    labels: ["Jun", "Jul", "Ago", "Set", "Out", "Nov"],
    datasetLabel: "Conclusões por Mês",
    data: [40, 55, 52, 68, 72, 81],
  };

  const pie = {
    labels: ["Concluído", "Em Andamento", "Pendente"],
    datasetLabel: "Status",
    data: [54, 28, 18],
  };

  const weekly = {
    labels: Array.from({ length: 12 }, (_, i) => `Sem ${i + 1}`),
    datasetLabel: "Conclusões/semana",
    data: [12, 18, 15, 22, 24, 28, 26, 30, 34, 31, 29, 35],
  };

  const modulesAvg = {
    labels: ["Comunicação", "Segurança", "Qualidade", "Compliance", "Atendimento", "Produtividade"],
    datasetLabel: "Média de Pontuação",
    data: [78, 72, 81, 69, 75, 77],
  };

  return { stats, bar, pie, weekly, modulesAvg };
}

export function buildAdminPerformanceData(selectedCollaborator: string, selectedClass: string): AdminPerformanceData {
  const radarAvg = [
    { metric: "Turma A", avg: 78 },
    { metric: "Turma B", avg: 65 },
    { metric: "Turma C", avg: 84 },
    { metric: "Turma D", avg: 72 },
  ];

  const moduleLabels = ["Comunicação", "Segurança", "Qualidade", "Compliance", "Atendimento", "Produtividade"];

  const collaboratorScores: Record<string, number[]> = {
    "João da Silva": [82, 74, 88, 69, 77, 85],
    "Maria Souza": [75, 80, 70, 83, 78, 72],
    "Carlos Lima": [68, 71, 76, 65, 70, 69],
    "Ana Pereira": [90, 84, 86, 88, 92, 87],
  };
  const classAvgByModule: Record<string, number[]> = {
    "Turma A": [76, 72, 80, 68, 71, 75],
    "Turma B": [65, 70, 67, 64, 66, 68],
    "Turma C": [84, 82, 86, 80, 83, 85],
    "Turma D": [72, 74, 73, 70, 71, 72],
  };

  const userData = collaboratorScores[selectedCollaborator] ?? Array(moduleLabels.length).fill(0);
  const klassData = classAvgByModule[selectedClass] ?? Array(moduleLabels.length).fill(0);
  const collaboratorVsClass = moduleLabels.map((metric, i) => ({ metric, colaborador: userData[i] ?? 0, turma: klassData[i] ?? 0 }));

  return { radarAvg, collaboratorVsClass, moduleLabels };
}

export function buildStudentPerformanceMock(student: Student): StudentPerformance {
  const modules = [
    { id: "mod1", name: "Comunicação", scorePercent: 82, completedAt: "2025-11-01" },
    { id: "mod2", name: "Segurança", scorePercent: 74, completedAt: "2025-11-03" },
    { id: "mod3", name: "Qualidade", scorePercent: 88, completedAt: "2025-11-07" },
    { id: "mod4", name: "Compliance", scorePercent: 69, completedAt: "2025-11-09" },
  ];
  return { student, modules };
}

export function buildModulePerformanceMock(module: { id: string; name: string }): import("@/types/report").ModulePerformance {
  const students = [
    { id: "u2", name: "Bruno Colab", scorePercent: 82, completedAt: "2025-11-01" },
    { id: "u3", name: "Carla Colab", scorePercent: 74, completedAt: "2025-11-03" },
    { id: "u4", name: "Diego Colab", scorePercent: 69, completedAt: "2025-11-06" },
  ];
  return { module, students };
}
