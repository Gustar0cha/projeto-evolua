"use client";
import React, { use } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ExportButtons from "@/components/ui/export-buttons";
import { buildStudentModuleResult } from "@/lib/report/adapters";
import { buildWorkbookForStudentResult, downloadWorkbook } from "@/lib/export/excel";
import { exportStudentModuleResultToPDF } from "@/lib/export/pdf";

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const search = useSearchParams();
  const score = search.get("score") ?? "0";

  return (
    <div className="max-w-2xl">
      <Card>
        <div className="space-y-3 text-center">
          <h2 className="text-xl font-semibold text-slate-900">Parabéns!</h2>
          <p className="text-sm text-slate-700">
            Você concluiu o módulo <span className="font-medium">{id.toUpperCase()}</span> com <span className="font-semibold">{score}%</span> de acerto.
          </p>
          <ExportButtons
            className="flex justify-center"
            onExportPDF={() => {
              const data = buildStudentModuleResult({ id, score });
              exportStudentModuleResultToPDF(data, []);
            }}
            onExportExcel={() => {
              const data = buildStudentModuleResult({ id, score });
              const wb = buildWorkbookForStudentResult(data);
              const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
              downloadWorkbook(wb, `relatorio-modulo-${id}-${ts}.xlsx`);
            }}
          />
          <div className="pt-2">
            <Link href="/treinamentos">
              <Button>Voltar para Meus Treinamentos</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
