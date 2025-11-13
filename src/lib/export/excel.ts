import * as XLSX from "xlsx";
import { AdminOverviewData, AdminPerformanceData, ModuleResult, StudentPerformance, ModulePerformance } from "@/types/report";

function aoaToSheet(aoa: Array<Array<string | number>>) {
  return XLSX.utils.aoa_to_sheet(aoa);
}

function appendSheet(wb: XLSX.WorkBook, name: string, sheet: XLSX.WorkSheet) {
  XLSX.utils.book_append_sheet(wb, sheet, name);
}

export function buildWorkbookForStudentResult(result: ModuleResult) {
  const wb = XLSX.utils.book_new();
  const alunoSheet = aoaToSheet([
    ["Aluno", result.student?.name ?? ""],
    ["ID do Aluno", result.student?.id ?? ""],
    ["Módulo", result.moduleId],
    ["Pontuação (%)", result.scorePercent],
    ["Concluído em", result.completedAt ?? ""],
  ]);
  appendSheet(wb, "Aluno", alunoSheet);

  const resultadosSheet = aoaToSheet([
    ["Módulo", "Pontuação (%)"],
    [result.moduleId, result.scorePercent],
  ]);
  appendSheet(wb, "Resultados", resultadosSheet);

  return wb;
}

export function buildWorkbookForAdminDashboard(overview: AdminOverviewData, perf: AdminPerformanceData) {
  const wb = XLSX.utils.book_new();

  const statsSheet = aoaToSheet([["Métrica", "Valor"], ...overview.stats.map((s) => [s.label, s.value])]);
  appendSheet(wb, "VisãoGeral", statsSheet);

  const barSheet = aoaToSheet([["Mês", overview.bar.datasetLabel], ...overview.bar.labels.map((m, i) => [m, overview.bar.data[i]])]);
  appendSheet(wb, "Conclusões", barSheet);

  const pieSheet = aoaToSheet([["Status", overview.pie.datasetLabel], ...overview.pie.labels.map((s, i) => [s, overview.pie.data[i]])]);
  appendSheet(wb, "Status", pieSheet);

  const radarAvgSheet = aoaToSheet([["Turma", "Média"], ...perf.radarAvg.map((r) => [r.metric, r.avg])]);
  appendSheet(wb, "RadarTurmas", radarAvgSheet);

  const compSheet = aoaToSheet([["Módulo", "Colaborador", "Turma"], ...perf.collaboratorVsClass.map((r) => [r.metric, r.colaborador, r.turma])]);
  appendSheet(wb, "ColabVsTurma", compSheet);

  if (overview.weekly) {
    const weeklySheet = aoaToSheet([["Semana", overview.weekly.datasetLabel], ...overview.weekly.labels.map((l, i) => [l, overview.weekly!.data[i]])]);
    appendSheet(wb, "Semanal", weeklySheet);
  }
  if (overview.modulesAvg) {
    const modAvgSheet = aoaToSheet([["Módulo", overview.modulesAvg.datasetLabel], ...overview.modulesAvg.labels.map((l, i) => [l, overview.modulesAvg!.data[i]])]);
    appendSheet(wb, "MediaModulos", modAvgSheet);
  }

  return wb;
}

export function downloadWorkbook(wb: XLSX.WorkBook, filename: string) {
  const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function buildWorkbookForStudentPerformance(sp: StudentPerformance) {
  const wb = XLSX.utils.book_new();
  const alunoSheet = aoaToSheet([
    ["Aluno", sp.student.name ?? ""],
    ["ID do Aluno", sp.student.id],
    ["Total de Módulos", sp.modules.length],
  ]);
  appendSheet(wb, "Aluno", alunoSheet);

  const header = ["Módulo", "Nome", "Pontuação (%)", "Concluído em"];
  const body = sp.modules.map((m) => [m.id, m.name, m.scorePercent, m.completedAt ?? ""]);
  const resultadosSheet = aoaToSheet([header, ...body]);
  appendSheet(wb, "Resultados", resultadosSheet);

  return wb;
}

export function buildWorkbookForModulePerformance(mp: ModulePerformance) {
  const wb = XLSX.utils.book_new();
  const modSheet = aoaToSheet([
    ["Módulo", mp.module.name],
    ["ID do Módulo", mp.module.id],
    ["Total de Alunos", mp.students.length],
  ]);
  appendSheet(wb, "Módulo", modSheet);
  const header = ["Aluno ID", "Aluno", "Pontuação (%)", "Concluído em"];
  const body = mp.students.map((s) => [s.id, s.name, s.scorePercent, s.completedAt ?? ""]);
  const alunosSheet = aoaToSheet([header, ...body]);
  appendSheet(wb, "Alunos", alunosSheet);
  return wb;
}
