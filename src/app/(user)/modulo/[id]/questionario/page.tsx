"use client";
import React, { useState, use } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";

const questions = [
  { id: "q1", text: "O que significa LGPD?", options: ["Lei Geral de Proteção de Dados", "Lei Geral de Padrões Digitais", "Lei de Gestão Pública Digital"] },
  { id: "q2", text: "Qual é a cor primária do tema?", options: ["Verde", "Azul", "Amarelo"] },
];

export default function QuestionnairePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const { id } = use(params);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simula cálculo de acerto
    const score = Math.round((Object.keys(answers).length / questions.length) * 100);
    router.push(`/modulo/${id}/resultado?score=${score}`);
  };

  return (
    <Card title="Questionário">
      <form className="space-y-6" onSubmit={submit}>
        {questions.map((q, idx) => (
          <div key={q.id}>
            <p className="text-sm font-medium text-slate-900 mb-2">{idx + 1}. {q.text}</p>
            <div className="space-y-1">
              {q.options.map((opt, i) => (
                <label key={i} className="flex items-center gap-2 text-sm text-slate-800">
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === i}
                    onChange={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                    className="accent-[var(--primary)]"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
        <div className="flex justify-end">
          <Button type="submit">Enviar Respostas</Button>
        </div>
      </form>
    </Card>
  );
}