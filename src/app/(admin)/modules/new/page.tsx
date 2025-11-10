"use client";
import ModuleEditor from "@/components/ModuleEditor";

const module = {
  title: "🧠 Avaliação de Aprendizado – Programa de Desenvolvimento IDEIAS",
  desc: "Este formulário tem como objetivo avaliar o aprendizado adquirido durante os módulos do Programa de Desenvolvimento Hospitalar da Prog Treinamento. Por favor, responda de forma sincera e objetiva. Suas respostas contribuirão para aprimorar continuamente a qualidade dos treinamentos.",
  content: "",
  questions: [
    {
      id: "q1",
      type: "multiple",
      text: "No contexto hospitalar, um líder eficaz é aquele que:",
      options: [
        { id: "q1o1", text: "Centraliza todas as decisões." },
        { id: "q1o2", text: "Foca apenas em resultados técnicos." },
        {
          id: "q1o3",
          text: "Inspira e engaja sua equipe por meio do exemplo e da comunicação clara.",
          correct: true,
        },
        { id: "q1o4", text: "Evita feedbacks para não gerar desconforto." },
      ],
    },
    {
      id: "q2",
      type: "multiple",
      text: "A inteligência emocional ajuda o profissional a:",
      options: [
        { id: "q2o1", text: "Controlar as emoções dos outros." },
        { id: "q2o2", text: "Reagir de forma automática em situações de estresse." },
        {
          id: "q2o3",
          text: "Reconhecer e gerenciar as próprias emoções para manter equilíbrio nas relações.",
          correct: true,
        },
        { id: "q2o4", text: "Evitar qualquer tipo de conflito." },
      ],
    },
    {
      id: "q3",
      type: "multiple",
      text: "Em uma negociação eficaz, é essencial:",
      options: [
        { id: "q3o1", text: "Impor a própria opinião." },
        { id: "q3o2", text: "Ouvir ativamente e buscar soluções de ganho mútuo.", correct: true },
        { id: "q3o3", text: "Ignorar os sentimentos envolvidos." },
        { id: "q3o4", text: "Usar a hierarquia como argumento principal." },
      ],
    },
    {
      id: "q4",
      type: "multiple",
      text: "O protagonismo profissional se manifesta quando o colaborador:",
      options: [
        { id: "q4o1", text: "Espera ordens para agir." },
        { id: "q4o2", text: "Reclama das dificuldades." },
        {
          id: "q4o3",
          text: "Toma iniciativa e busca soluções que melhorem os resultados da equipe.",
          correct: true,
        },
        { id: "q4o4", text: "Trabalha isoladamente." },
      ],
    },
    {
      id: "q5",
      type: "multiple",
      text: "A comunicação interpessoal eficaz no ambiente hospitalar exige:",
      options: [
        {
          id: "q5o1",
          text: "Empatia, escuta ativa e clareza na troca de informações.",
          correct: true,
        },
        { id: "q5o2", text: "Uso de linguagem técnica apenas." },
        { id: "q5o3", text: "Evitar conversas diretas." },
        { id: "q5o4", text: "Falar mais alto para ser compreendido." },
      ],
    },
    {
      id: "q6",
      type: "multiple",
      text: "A visão sistêmica permite ao profissional:",
      options: [
        { id: "q6o1", text: "Enxergar apenas as tarefas do seu setor." },
        {
          id: "q6o2",
          text: "Compreender como suas ações impactam todo o hospital.",
          correct: true,
        },
        { id: "q6o3", text: "Focar exclusivamente nas metas individuais." },
        { id: "q6o4", text: "Reduzir a cooperação entre áreas." },
      ],
    },
    {
      id: "q7",
      type: "long_answer",
      text: "Cite uma situação do seu dia a dia no hospital em que você poderá aplicar o que aprendeu sobre Gestão de Conflitos.",
    },
    {
      id: "q8",
      type: "multiple",
      text: "O Professor mostrou que tem conhecimento do tema :",
      options: [
        { id: "q8o1", text: "Muito conhecimento.", correct: true },
        { id: "q8o2", text: "Conhecimento regular." },
        { id: "q8o3", text: "Pouco Conhecimento." },
      ],
    },
    {
      id: "q9",
      type: "multiple",
      text: "O Professor trouxe exemplos práticos para sala de aula:",
      options: [
        { id: "q9o1", text: "Sim, trouxe bastantes exemplos.", correct: true },
        { id: "q9o2", text: "Sim, trouxe poucos exemplos." },
        { id: "q9o3", text: "Não trouxe exemplos." },
      ],
    },
    {
      id: "q10",
      type: "linear_scale",
      text: "Liderança no Contexto Hospitalar",
      min: 1,
      max: 5,
      minLabel: "Não aprendi nada",
      maxLabel: "Aprendi totalmente",
    },
    {
      id: "q11",
      type: "linear_scale",
      text: "Fundamentos da Inteligência Emocional",
      min: 1,
      max: 5,
      minLabel: "Não aprendi nada",
      maxLabel: "Aprendi totalmente",
    },
    {
      id: "q12",
      type: "linear_scale",
      text: "Negociação e Gestão de Conflitos",
      min: 1,
      max: 5,
      minLabel: "Não aprendi nada",
      maxLabel: "Aprendi totalmente",
    },
    {
      id: "q13",
      type: "linear_scale",
      text: "Protagonismo Profissional",
      min: 1,
      max: 5,
      minLabel: "Não aprendi nada",
      maxLabel: "Aprendi totalmente",
    },
    {
      id: "q14",
      type: "linear_scale",
      text: "Comunicação Interpessoal e Visão Sistêmica",
      min: 1,
      max: 5,
      minLabel: "Não aprendi nada",
      maxLabel: "Aprendi totalmente",
    },
  ],
  status: "rascunho",
  publishAt: "",
};

export default function NewModulePage() {
  return <ModuleEditor module={module as any} />;
}