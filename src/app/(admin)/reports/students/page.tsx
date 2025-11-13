"use client";
import React, { useMemo, useState } from "react";
import Card from "@/components/Card";
import Select from "@/components/Select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import ExportButtons from "@/components/ui/export-buttons";
import { buildStudentPerformanceMock } from "@/lib/report/adapters";
import { buildWorkbookForStudentPerformance, downloadWorkbook } from "@/lib/export/excel";
import { exportStudentPerformanceToPDF } from "@/lib/export/pdf";

const students = [
  { id: "u2", name: "Bruno Colab" },
  { id: "u3", name: "Carla Colab" },
  { id: "u4", name: "Diego Colab" },
];

export default function AdminStudentReportsPage() {
  const [selected, setSelected] = useState<string>(students[0].id);
  const student = useMemo(() => students.find((s) => s.id === selected)!, [selected]);
  const perf = useMemo(() => buildStudentPerformanceMock(student), [student]);
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="section-title">Relatórios por Aluno</h2>
        <ExportButtons
          onExportPDF={() => exportStudentPerformanceToPDF(perf, [])}
          onExportExcel={() => {
            const wb = buildWorkbookForStudentPerformance(perf);
            const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
            downloadWorkbook(wb, `relatorio-aluno-${student.id}-${ts}.xlsx`);
          }}
        />
      </div>
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <Select
            label="Aluno"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            options={students.map((s) => ({ label: s.name, value: s.id }))}
          />
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Módulo</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Pontuação (%)</TableHead>
                <TableHead>Concluído em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perf.modules.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.id}</TableCell>
                  <TableCell>{m.name}</TableCell>
                  <TableCell>{m.scorePercent}</TableCell>
                  <TableCell>{m.completedAt ?? ""}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

