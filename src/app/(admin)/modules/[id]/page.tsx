import React from "react";
import ModuleEditor from "@/components/ModuleEditor";

export default function EditModulePage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h2 className="section-title mb-4">Editar Módulo #{params.id}</h2>
      <ModuleEditor />
    </div>
  );
}