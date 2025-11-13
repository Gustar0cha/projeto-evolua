"use client";
import React, { useMemo, useState } from "react";
import Card from "@/components/Card";
import Select from "@/components/Select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import ExportButtons from "@/components/ui/export-buttons";
import { buildModulePerformanceMock } from "@/lib/report/adapters";
import { buildWorkbookForModulePerformance, downloadWorkbook } from "@/lib/export/excel";
import { exportModulePerformanceToPDF } from "@/lib/export/pdf";

const modules = [
  { id: "mod1", name: "Comunicação" },
  { id: "mod2", name: "Segurança" },
  { id: "mod3", name: "Qualidade" },
  { id: "mod4", name: "Compliance" },
];

export default function AdminModuleReportsPage() {
  const [selected, setSelected] = useState<string>(modules[0].id);
  const module = useMemo(() => modules.find((m) => m.id === selected)!, [selected]);
  const perf = useMemo(() => buildModulePerformanceMock(module), [module]);
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="section-title">Relatórios por Módulo</h2>
        <ExportButtons
          onExportPDF={() => exportModulePerformanceToPDF(perf, [])}
          onExportExcel={() => {
            const wb = buildWorkbookForModulePerformance(perf);
            const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
            downloadWorkbook(wb, `relatorio-modulo-${module.id}-${ts}.xlsx`);
          }}
        />
      </div>
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <Select
            label="Módulo"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            options={modules.map((m) => ({ label: m.name, value: m.id }))}
          />
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Aluno ID</TableHead>
                <TableHead>Aluno</TableHead>
                <TableHead>Pontuação (%)</TableHead>
                <TableHead>Concluído em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perf.students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.id}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.scorePercent}</TableCell>
                  <TableCell>{s.completedAt ?? ""}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

