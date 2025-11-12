"use client";
import React, { useState, use } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";

const questions = [
  {
    id: "q1",
    text: "No contexto hospitalar, um líder eficaz é aquele que:",
    type: "multiple",
    options: [
      { id: "q1o1", text: "Centraliza todas as decisões." },
      { id: "q1o2", text: "Foca apenas em resultados técnicos." },
      { id: "q1o3", text: "Inspira e engaja sua equipe por meio do exemplo e da comunicação clara." },
      { id: "q1o4", text: "Evita feedbacks para não gerar desconforto." }
    ]
  },
  {
    id: "q2",
    text: "A inteligência emocional ajuda o profissional a:",
    type: "multiple",
    options: [
      { id: "q2o1", text: "Controlar as emoções dos outros." },
      { id: "q2o2", text: "Reagir de forma automática em situações de estresse." },
      { id: "q2o3", text: "Reconhecer e gerenciar as próprias emoções para manter equilíbrio nas relações." },
      { id: "q2o4", text: "Evitar qualquer tipo de conflito." }
    ]
  },
  {
    id: "q3",
    text: "Em uma negociação eficaz, é essencial:",
    type: "multiple",
    options: [
      { id: "q3o1", text: "Impor a própria opinião." },
      { id: "q3o2", text: "Ouvir ativamente e buscar soluções de ganho mútuo." },
      { id: "q3o3", text: "Ignorar os sentimentos envolvidos." },
      { id: "q3o4", text: "Usar a hierarquia como argumento principal." }
    ]
  },
  {
    id: "q4",
    text: "O protagonismo profissional se manifesta quando o colaborador:",
    type: "multiple",
    options: [
      { id: "q4o1", text: "Espera ordens para agir." },
      { id: "q4o2", text: "Reclama das dificuldades." },
      { id: "q4o3", text: "Toma iniciativa e busca soluções que melhorem os resultados da equipe." },
      { id: "q4o4", text: "Trabalha isoladamente." }
    ]
  },
  {
    id: "q5",
    text: "A comunicação interpessoal eficaz no ambiente hospitalar exige:",
    type: "multiple",
    options: [
      { id: "q5o1", text: "Empatia, escuta ativa e clareza na troca de informações." },
      { id: "q5o2", text: "Uso de linguagem técnica apenas." },
      { id: "q5o3", text: "Evitar conversas diretas." },
      { id: "q5o4", text: "Falar mais alto para ser compreendido." }
    ]
  },
  {
    id: "q6",
    text: "A visão sistêmica permite ao profissional:",
    type: "multiple",
    options: [
      { id: "q6o1", text: "Enxergar apenas as tarefas do seu setor." },
      { id: "q6o2", text: "Compreender como suas ações impactam todo o hospital." },
      { id: "q6o3", text: "Focar exclusivamente nas metas individuais." },
      { id: "q6o4", text: "Reduzir a cooperação entre áreas." }
    ]
  },
  {
    id: "q7",
    text: "Cite uma situação do seu dia a dia no hospital em que você poderá aplicar o que aprendeu sobre Gestão de Conflitos.",
    type: "long_answer"
  },
  {
    id: "q8",
    text: "O Professor mostrou que tem conhecimento do tema:",
    type: "multiple",
    options: [
      { id: "q8o1", text: "Muito conhecimento." },
      { id: "q8o2", text: "Conhecimento regular." },
      { id: "q8o3", text: "Pouco Conhecimento." }
    ]
  },
  {
    id: "q9",
    text: "O Professor trouxe exemplos práticos para sala de aula:",
    type: "multiple",
    options: [
      { id: "q9o1", text: "Sim, trouxe bastantes exemplos." },
      { id: "q9o2", text: "Sim, trouxe poucos exemplos." },
      { id: "q9o3", text: "Não trouxe exemplos." }
    ]
  },
  {
    id: "q10",
    text: "Liderança no Contexto Hospitalar",
    type: "linear_scale",
    min: 1,
    max: 5,
    minLabel: "Não aprendi nada",
    maxLabel: "Aprendi totalmente"
  },
  {
    id: "q11",
    text: "Fundamentos da Inteligência Emocional",
    type: "linear_scale",
    min: 1,
    max: 5,
    minLabel: "Não aprendi nada",
    maxLabel: "Aprendi totalmente"
  },
  {
    id: "q12",
    text: "Negociação e Gestão de Conflitos",
    type: "linear_scale",
    min: 1,
    max: 5,
    minLabel: "Não aprendi nada",
    maxLabel: "Aprendi totalmente"
  },
  {
    id: "q13",
    text: "Protagonismo Profissional",
    type: "linear_scale",
    min: 1,
    max: 5,
    minLabel: "Não aprendi nada",
    maxLabel: "Aprendi totalmente"
  },
  {
    id: "q14",
    text: "Comunicação Interpessoal e Visão Sistêmica",
    type: "linear_scale",
    min: 1,
    max: 5,
    minLabel: "Não aprendi nada",
    maxLabel: "Aprendi totalmente"
  }
];

export default function QuestionnairePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = questions[currentIndex];
  const { id } = use(params);
  
  const handleAnswerChange = (questionId: string, value: number | string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };
  
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simula cálculo de acerto
    const score = Math.round((Object.keys(answers).length / questions.length) * 100);
    router.push(`/modulo/${id}/resultado?score=${score}`);
  };

  return (
    <Card title="Questionário">
      <form className="space-y-6" onSubmit={submit}>
        <div key={currentQuestion.id}>
          <p className="text-sm font-medium text-slate-900 mb-2">{currentIndex + 1}. {currentQuestion.text}</p>
          {currentQuestion.type === "multiple" && currentQuestion.options && (
            <div className="space-y-1">
              {currentQuestion.options.map((opt, i) => (
                <label key={opt.id} className="flex items-center gap-2 text-sm text-slate-800">
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    checked={answers[currentQuestion.id] === i}
                    onChange={() => handleAnswerChange(currentQuestion.id, i)}
                    className="accent-[var(--primary)]"
                  />
                  {opt.text}
                </label>
              ))}
            </div>
          )}
          {currentQuestion.type === "long_answer" && (
            <Textarea
              rows={4}
              value={(answers[currentQuestion.id] as string) || ""}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              placeholder="Digite sua resposta aqui..."
            />
          )}
          {currentQuestion.type === "linear_scale" && currentQuestion.min && currentQuestion.max && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>{currentQuestion.minLabel}</span>
                <span>{currentQuestion.maxLabel}</span>
              </div>
              <div className="flex justify-around">
                {Array.from({ length: currentQuestion.max - currentQuestion.min + 1 }, (_, i) => currentQuestion.min! + i).map((val) => (
                  <label key={val} className="flex flex-col items-center gap-1">
                    <span className="text-sm">{val}</span>
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      checked={answers[currentQuestion.id] === val}
                      onChange={() => handleAnswerChange(currentQuestion.id, val)}
                      className="accent-[var(--primary)]"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-between">
          {currentIndex > 0 && (
            <Button type="button" onClick={() => setCurrentIndex((i) => i - 1)}>
              Anterior
            </Button>
          )}
          <div>
            {currentIndex < questions.length - 1 ? (
              <Button
                type="button"
                onClick={() => setCurrentIndex((i) => i + 1)}
                disabled={answers[currentQuestion.id] === undefined || (typeof answers[currentQuestion.id] === "string" && answers[currentQuestion.id] === "")}
              >
                Próximo
              </Button>
            ) : (
              <Button type="submit" disabled={Object.keys(answers).length < questions.length}>Enviar Respostas</Button>
            )}
          </div>
        </div>
      </form>
    </Card>
  );
}