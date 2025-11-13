"use client";
import Button from "@/components/Button";

type Props = {
  onExportPDF: () => void | Promise<void>;
  onExportExcel: () => void | Promise<void>;
  className?: string;
};

export default function ExportButtons({ onExportPDF, onExportExcel, className }: Props) {
  return (
    <div className={className ?? ""}>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => onExportPDF()}>Exportar PDF</Button>
        <Button onClick={() => onExportExcel()}>Exportar Excel</Button>
      </div>
    </div>
  );
}

