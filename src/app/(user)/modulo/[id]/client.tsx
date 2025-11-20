"use client";
import React from "react";
import ModuleViewer, { ModuleSection } from "@/components/ModuleViewer";

// Mock Data matching the new structure
const mockSections: ModuleSection[] = [
  {
    id: "s1",
    type: "video",
    title: "Vídeo Introdutório",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Placeholder
    description: "Assista ao vídeo para entender os conceitos fundamentais deste módulo.",
  },
  {
    id: "s2",
    type: "pdf",
    title: "Leitura em PDF",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", // Placeholder
    description: "Leia o material complementar para aprofundar seu conhecimento.",
  },
  {
    id: "s3",
    type: "quiz",
    title: "Questionário Múltipla Escolha",
    questions: [
      {
        id: "q1",
        text: "Qual o principal objetivo da comunicação assertiva?",
        type: "multiple",
        options: [
          { id: "o1", text: "Falar o máximo possível", correct: false },
          { id: "o2", text: "Expressar-se de forma clara e respeitosa", correct: true },
          { id: "o3", text: "Evitar conflitos a todo custo", correct: false },
        ],
      },
    ],
  },
  {
    id: "s4",
    type: "open_question",
    title: "Pergunta Aberta",
    question: "Descreva uma situação onde você utilizou a inteligência emocional no trabalho.",
  },
  {
    id: "s5",
    type: "feedback",
    title: "Questionário do Professor",
    question: "O professor foi efetivo ao passar o conteúdo do módulo?",
  },
];

export default function ModuleClientPage({ id }: { id: string }) {
  if (!id) return null;

  return (
    <ModuleViewer
      moduleId={id}
      moduleTitle={`Módulo ${id.toUpperCase()}`}
      sections={mockSections}
    />
  );
}