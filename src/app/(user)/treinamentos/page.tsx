import React from "react";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Link from "next/link";
import Image from "next/image";

type Training = {
  id: string;
  title: string;
  description: string;
  status: "Pendente" | "Em Andamento" | "Concluído";
  image?: string;
};

const trainings: Training[] = [
  {
    id: "m1",
    title: "Comunicação Interpessoal",
    description: "Desenvolva habilidades para se comunicar de forma clara e assertiva.",
    status: "Pendente",
    image: "/assets/modules/comunicacao-interpessoal.png",
  },
  {
    id: "m2",
    title: "Fundamentos da Inteligência Emocional",
    description: "Aprenda a reconhecer e gerenciar suas emoções e as dos outros.",
    status: "Pendente",
    image: "/assets/modules/fundamentos-inteligencia-emocional.png",
  },
  {
    id: "m3",
    title: "🧠 Avaliação de Aprendizado – Programa de Desenvolvimento IDEIAS",
    description: "Este formulário tem como objetivo avaliar o aprendizado adquirido durante os módulos do Programa de Desenvolvimento Hospitalar da Prog Treinamento.",
    status: "Pendente",
  },
  {
    id: "m4",
    title: "Liderança no Contexto Hospitalar",
    description: "Estratégias de liderança focadas no ambiente hospitalar.",
    status: "Em Andamento",
    image: "/assets/modules/lideranca-hospitalar.png",
  },
  {
    id: "m5",
    title: "Negociação e Gerenciamento de Conflitos",
    description: "Técnicas para negociar e resolver conflitos de forma construtiva.",
    status: "Concluído",
    image: "/assets/modules/negociacao-conflitos.png",
  },
  {
    id: "m6",
    title: "Protagonismo Profissional",
    description: "Assuma o controle da sua carreira e desenvolvimento profissional.",
    status: "Pendente",
    image: "/assets/modules/protagonismo-profissional.png",
  },
];

export default function MyTrainingsPage() {
  return (
    <div>
      <h2 className="section-title mb-4">Meus Treinamentos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainings.map((t) => (
          <Link key={t.id} href={`/modulo/${t.id}`} className="group">
            <Card className="h-full flex flex-col overflow-hidden transition-shadow hover:shadow-md">
              {t.image && (
                <div className="relative w-full h-40 bg-slate-100">
                  <Image
                    src={t.image}
                    alt={t.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4 flex flex-col flex-1 gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-primary transition-colors">
                    {t.title}
                  </h3>
                  <Badge variant={t.status === "Concluído" ? "success" : t.status === "Em Andamento" ? "info" : "warning"}>
                    {t.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 line-clamp-3 flex-1">
                  {t.description}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}