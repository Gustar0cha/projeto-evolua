import React from "react";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Link from "next/link";

type Training = { id: string; title: string; description: string; status: "Pendente" | "Em Andamento" | "Concluído" };

const trainings: Training[] = [
  { id: "m3", title: "🧠 Avaliação de Aprendizado – Programa de Desenvolvimento IDEIAS", description: "Este formulário tem como objetivo avaliar o aprendizado adquirido durante os módulos do Programa de Desenvolvimento Hospitalar da Prog Treinamento. Por favor, responda de forma sincera e objetiva. Suas respostas contribuirão para aprimorar continuamente a qualidade dos treinamentos.", status: "Pendente" },
];

export default function MyTrainingsPage() {
  return (
    <div>
      <h2 className="section-title mb-4">Meus Treinamentos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {trainings.map((t) => (
          <Link key={t.id} href={`/modulo/${t.id}`}>
            <Card>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">{t.title}</h3>
                  <Badge variant={t.status === "Concluído" ? "success" : t.status === "Em Andamento" ? "info" : "warning"}>{t.status}</Badge>
                </div>
                <p className="text-sm text-slate-600">{t.description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}