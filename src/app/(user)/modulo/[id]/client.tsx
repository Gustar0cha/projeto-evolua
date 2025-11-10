"use client";
import React, { useState } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Link from "next/link";

const steps = [
  { id: 1, title: "Vídeo Introdutório", content: "https://www.example.com/video" },
  { id: 2, title: "Leitura PDF", content: "Documento PDF com conceitos." },
  { id: 3, title: "Questionário Final", content: "Responda às perguntas para concluir." },
];

export default function ModuleClientPage({ id }: { id:string }) {
  const [current, setCurrent] = useState(1);
  const step = steps.find((s) => s.id === current)!;

  const next = () => setCurrent((c) => Math.min(c + 1, steps.length));
  const prev = () => setCurrent((c) => Math.max(c - 1, 1));

  if (!id) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <Card title="Passos do Módulo" className="lg:col-span-1">
        <div className="space-y-2">
          {steps.map((s) => (
            <Button
              key={s.id}
              variant={current === s.id ? "primary" : "secondary"}
              className="w-full justify-start h-8"
              onClick={() => setCurrent(s.id)}
            >
              {s.id}. {s.title}
            </Button>
          ))}
        </div>
      </Card>
      <div className="lg:col-span-3">
        <Card title={`Módulo ${id.toUpperCase()} — ${step.title}`}>
          <div className="space-y-3">
            {step.id === 1 ? (
              <div className="aspect-video bg-slate-200 rounded flex items-center justify-center text-slate-700">Vídeo Placeholder</div>
            ) : step.id === 2 ? (
              <p className="text-sm text-slate-700">{step.content}</p>
            ) : (
              <p className="text-sm text-slate-700">Ao clicar em "Finalizar Módulo", você irá ao questionário.</p>
            )}
            <div className="flex justify-between">
              <Button variant="secondary" onClick={prev} disabled={current === 1}>Voltar</Button>
              {current < steps.length ? (
                <Button onClick={next}>Próximo Passo</Button>
              ) : (
                <Link href={`/modulo/${id}/questionario`}><Button>Finalizar Módulo</Button></Link>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}