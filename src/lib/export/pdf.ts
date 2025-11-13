import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AdminOverviewData, AdminPerformanceData, ChartImage, ModuleResult, StudentPerformance, ModulePerformance } from "@/types/report";

function addHeader(doc: jsPDF, title: string) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, 20, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
}

export function exportStudentModuleResultToPDF(result: ModuleResult, images: ChartImage[] = []) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  addHeader(doc, "Relatório de Resultado do Módulo");

  let y = 40;
  doc.setFontSize(11);
  doc.text(`Aluno: ${result.student?.name ?? ""}`.trim(), 20, y);
  y += 16;
  doc.text(`ID do Aluno: ${result.student?.id ?? ""}`.trim(), 20, y);
  y += 16;
  doc.text(`Módulo: ${result.moduleId}`, 20, y);
  y += 16;
  doc.text(`Pontuação: ${result.scorePercent}%`, 20, y);
  y += 22;

  autoTable(doc, {
    startY: y,
    head: [["Módulo", "Pontuação (%)"]],
    body: [[result.moduleId, result.scorePercent.toString()]],
    theme: "grid",
    styles: { fontSize: 10 },
    headStyles: { fillColor: [34, 197, 94] },
  });

  let imgY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 20 : 120;
  images.forEach((img) => {
    try {
      doc.addImage(img.dataUrl, "PNG", 20, imgY, img.width ?? 400, img.height ?? 220);
      doc.text(img.name, 20, imgY - 6);
      imgY += (img.height ?? 220) + 26;
    } catch {}
  });

  doc.save(`relatorio-modulo-${result.moduleId}.pdf`);
}

export function exportAdminDashboardToPDF(overview: AdminOverviewData, perf: AdminPerformanceData, images: ChartImage[] = []) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  addHeader(doc, "Relatório do Dashboard Administrativo");

  let y = 40;
  autoTable(doc, {
    startY: y,
    head: [["Métrica", "Valor"]],
    body: overview.stats.map((s) => [s.label, String(s.value)]),
    theme: "grid",
    styles: { fontSize: 10 },
    headStyles: { fillColor: [34, 197, 94] },
  });

  y = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 16 : 120;
  autoTable(doc, {
    startY: y,
    head: [["Mês", overview.bar.datasetLabel]],
    body: overview.bar.labels.map((m, i) => [m, String(overview.bar.data[i])]),
    theme: "striped",
    styles: { fontSize: 10 },
  });

  y = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 16 : y + 100;
  autoTable(doc, {
    startY: y,
    head: [["Status", overview.pie.datasetLabel]],
    body: overview.pie.labels.map((s, i) => [s, String(overview.pie.data[i])]),
    theme: "striped",
    styles: { fontSize: 10 },
  });

  let imgY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 20 : 120;
  images.forEach((img) => {
    try {
      doc.addImage(img.dataUrl, "PNG", 20, imgY, img.width ?? 400, img.height ?? 220);
      doc.text(img.name, 20, imgY - 6);
      imgY += (img.height ?? 220) + 26;
    } catch {}
  });

  doc.save(`relatorio-dashboard.pdf`);
}

export function exportStudentPerformanceToPDF(sp: StudentPerformance, images: ChartImage[] = []) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  addHeader(doc, "Relatório de Desempenho do Aluno");
  let y = 40;
  doc.setFontSize(11);
  doc.text(`Aluno: ${sp.student.name ?? ""}`.trim(), 20, y);
  y += 16;
  doc.text(`ID do Aluno: ${sp.student.id}`, 20, y);
  y += 22;
  autoTable(doc, {
    startY: y,
    head: [["Módulo", "Nome", "Pontuação (%)", "Concluído em"]],
    body: sp.modules.map((m) => [m.id, m.name, String(m.scorePercent), m.completedAt ?? ""]),
    theme: "grid",
    styles: { fontSize: 10 },
    headStyles: { fillColor: [34, 197, 94] },
  });
  let imgY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 20 : 120;
  images.forEach((img) => {
    try {
      doc.addImage(img.dataUrl, "PNG", 20, imgY, img.width ?? 400, img.height ?? 220);
      doc.text(img.name, 20, imgY - 6);
      imgY += (img.height ?? 220) + 26;
    } catch {}
  });
  doc.save(`relatorio-aluno-${sp.student.id}.pdf`);
}

export function exportModulePerformanceToPDF(mp: ModulePerformance, images: ChartImage[] = []) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  addHeader(doc, "Relatório de Desempenho por Módulo");
  let y = 40;
  doc.setFontSize(11);
  doc.text(`Módulo: ${mp.module.name}`, 20, y);
  y += 16;
  doc.text(`ID do Módulo: ${mp.module.id}`, 20, y);
  y += 22;
  autoTable(doc, {
    startY: y,
    head: [["Aluno ID", "Aluno", "Pontuação (%)", "Concluído em"]],
    body: mp.students.map((s) => [s.id, s.name, String(s.scorePercent), s.completedAt ?? ""]),
    theme: "grid",
    styles: { fontSize: 10 },
    headStyles: { fillColor: [34, 197, 94] },
  });
  let imgY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 20 : 120;
  images.forEach((img) => {
    try {
      doc.addImage(img.dataUrl, "PNG", 20, imgY, img.width ?? 400, img.height ?? 220);
      doc.text(img.name, 20, imgY - 6);
      imgY += (img.height ?? 220) + 26;
    } catch {}
  });
  doc.save(`relatorio-modulo-${mp.module.id}.pdf`);
}
