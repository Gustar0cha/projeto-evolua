"use client";
import React, { useState } from "react";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TrashIcon, PlusIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

// --- Types ---

type Option = { id: string; text: string; correct?: boolean };

type MultipleChoiceQuestion = {
  id: string;
  text: string;
  type: "multiple";
  options: Option[];
};

type ModuleSectionType = 'video' | 'pdf' | 'quiz' | 'open_question' | 'feedback';

type BaseSection = {
  id: string;
  type: ModuleSectionType;
  title: string;
};

type VideoSection = BaseSection & {
  type: 'video';
  videoUrl: string;
  description?: string;
};

type PdfSection = BaseSection & {
  type: 'pdf';
  pdfUrl: string;
  description?: string;
};

type QuizSection = BaseSection & {
  type: 'quiz';
  questions: MultipleChoiceQuestion[];
};

type OpenQuestionSection = BaseSection & {
  type: 'open_question';
  question: string;
};

type FeedbackSection = BaseSection & {
  type: 'feedback';
  question: string;
};

type ModuleSection = VideoSection | PdfSection | QuizSection | OpenQuestionSection | FeedbackSection;

type ModuleEditorProps = {
  module?: {
    title: string;
    desc: string;
    sections: ModuleSection[];
    status: "rascunho" | "publicado";
    publishAt: string;
  };
};

export default function ModuleEditor({ module }: ModuleEditorProps) {
  const [tab, setTab] = useState<"conteudo" | "publicacao">("conteudo");
  const [title, setTitle] = useState(module?.title || "");
  const [desc, setDesc] = useState(module?.desc || "");
  const [sections, setSections] = useState<ModuleSection[]>(module?.sections || []);
  const [status, setStatus] = useState<"rascunho" | "publicado">(module?.status || "rascunho");
  const [publishAt, setPublishAt] = useState<string>(module?.publishAt || "");

  // --- Actions ---

  const addSection = (type: ModuleSectionType) => {
    const id = Math.random().toString(36).slice(2);
    let newSection: ModuleSection;

    switch (type) {
      case 'video':
        newSection = { id, type, title: "Vídeo Introdutório", videoUrl: "", description: "" };
        break;
      case 'pdf':
        newSection = { id, type, title: "Leitura em PDF", pdfUrl: "", description: "" };
        break;
      case 'quiz':
        newSection = { id, type, title: "Questionário Múltipla Escolha", questions: [] };
        break;
      case 'open_question':
        newSection = { id, type, title: "Pergunta Aberta", question: "" };
        break;
      case 'feedback':
        newSection = { id, type, title: "Questionário do Professor", question: "O professor foi efetivo ao passar o módulo?" };
        break;
    }
    setSections([...sections, newSection]);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    if (direction === 'up' && index > 0) {
      [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
    } else if (direction === 'down' && index < sections.length - 1) {
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    }
    setSections(newSections);
  };

  const updateSection = (id: string, data: Partial<ModuleSection>) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, ...data } as ModuleSection : s)));
  };

  // --- Quiz Specific Actions ---

  const addQuizQuestion = (sectionId: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId && s.type === 'quiz') {
        const newQ: MultipleChoiceQuestion = {
          id: Math.random().toString(36).slice(2),
          text: "",
          type: "multiple",
          options: [{ id: Math.random().toString(36).slice(2), text: "", correct: false }]
        };
        return { ...s, questions: [...s.questions, newQ] };
      }
      return s;
    }));
  };

  const updateQuizQuestion = (sectionId: string, qId: string, data: Partial<MultipleChoiceQuestion>) => {
    setSections(sections.map(s => {
      if (s.id === sectionId && s.type === 'quiz') {
        return {
          ...s,
          questions: s.questions.map(q => q.id === qId ? { ...q, ...data } : q)
        };
      }
      return s;
    }));
  };

  const addQuizOption = (sectionId: string, qId: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId && s.type === 'quiz') {
        return {
          ...s,
          questions: s.questions.map(q => q.id === qId ? {
            ...q,
            options: [...q.options, { id: Math.random().toString(36).slice(2), text: "", correct: false }]
          } : q)
        };
      }
      return s;
    }));
  };

  const updateQuizOption = (sectionId: string, qId: string, oId: string, text: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId && s.type === 'quiz') {
        return {
          ...s,
          questions: s.questions.map(q => q.id === qId ? {
            ...q,
            options: q.options.map(o => o.id === oId ? { ...o, text } : o)
          } : q)
        };
      }
      return s;
    }));
  };

  const setQuizCorrect = (sectionId: string, qId: string, oId: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId && s.type === 'quiz') {
        return {
          ...s,
          questions: s.questions.map(q => q.id === qId ? {
            ...q,
            options: q.options.map(o => ({ ...o, correct: o.id === oId }))
          } : q)
        };
      }
      return s;
    }));
  };

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as "conteudo" | "publicacao")} className="space-y-4">
      <TabsList>
        <TabsTrigger value="conteudo">Conteúdo do Módulo</TabsTrigger>
        <TabsTrigger value="publicacao">Publicação</TabsTrigger>
      </TabsList>

      <TabsContent value="conteudo" className="space-y-6">
        {/* Module Info */}
        <Card>
          <div className="grid grid-cols-1 gap-4">
            <Input label="Título do Módulo" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input label="Descrição" value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
        </Card>

        {/* Sections List */}
        <div className="space-y-4">
          {sections.map((section, index) => (
            <Card key={section.id} className="relative border-l-4 border-l-primary">
              <div className="absolute right-4 top-4 flex gap-2">
                <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30">
                  <ChevronUpIcon className="h-5 w-5" />
                </button>
                <button onClick={() => moveSection(index, 'down')} disabled={index === sections.length - 1} className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30">
                  <ChevronDownIcon className="h-5 w-5" />
                </button>
                <button onClick={() => removeSection(section.id)} className="p-1 text-red-400 hover:text-red-600">
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4 pr-24">
                <Input
                  label={`Seção ${index + 1} (${section.type})`}
                  value={section.title}
                  onChange={(e) => updateSection(section.id, { title: e.target.value })}
                  className="font-semibold"
                />
              </div>

              {/* Section Content Based on Type */}
              <div className="space-y-4">
                {section.type === 'video' && (
                  <>
                    <Input
                      label="URL do Vídeo (YouTube, Vimeo, etc)"
                      placeholder="https://..."
                      value={section.videoUrl}
                      onChange={(e) => updateSection(section.id, { videoUrl: e.target.value })}
                    />
                    <Textarea
                      placeholder="Descrição ou instruções para o vídeo..."
                      value={section.description}
                      onChange={(e) => updateSection(section.id, { description: e.target.value })}
                    />
                  </>
                )}

                {section.type === 'pdf' && (
                  <>
                    <Input
                      label="URL do Arquivo PDF"
                      placeholder="https://..."
                      value={section.pdfUrl}
                      onChange={(e) => updateSection(section.id, { pdfUrl: e.target.value })}
                    />
                    <Textarea
                      placeholder="Instruções de leitura..."
                      value={section.description}
                      onChange={(e) => updateSection(section.id, { description: e.target.value })}
                    />
                  </>
                )}

                {section.type === 'open_question' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pergunta para o aluno</label>
                    <Textarea
                      placeholder="Digite a pergunta aberta aqui..."
                      value={section.question}
                      onChange={(e) => updateSection(section.id, { question: e.target.value })}
                    />
                  </div>
                )}

                {section.type === 'feedback' && (
                  <Input
                    label="Pergunta de Feedback (Escala 1-5)"
                    value={section.question}
                    onChange={(e) => updateSection(section.id, { question: e.target.value })}
                  />
                )}

                {section.type === 'quiz' && (
                  <div className="bg-slate-50 p-4 rounded-md space-y-4">
                    {section.questions.map((q, qIndex) => (
                      <div key={q.id} className="border p-3 rounded bg-white">
                        <Input
                          label={`Questão ${qIndex + 1}`}
                          value={q.text}
                          onChange={(e) => updateQuizQuestion(section.id, q.id, { text: e.target.value })}
                          className="mb-2"
                        />
                        <div className="space-y-2 pl-4">
                          {q.options.map((opt) => (
                            <div key={opt.id} className="flex items-center gap-2">
                              <Checkbox checked={!!opt.correct} onCheckedChange={() => setQuizCorrect(section.id, q.id, opt.id)} />
                              <Input
                                className="flex-1 h-8 text-sm"
                                value={opt.text}
                                onChange={(e) => updateQuizOption(section.id, q.id, opt.id, e.target.value)}
                                placeholder="Opção de resposta"
                              />
                            </div>
                          ))}
                          <Button variant="secondary" size="sm" onClick={() => addQuizOption(section.id, q.id)} className="text-xs">
                            + Adicionar Opção
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="secondary" size="sm" onClick={() => addQuizQuestion(section.id)}>
                      + Adicionar Questão ao Quiz
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Add Section Buttons */}
        <div className="flex flex-wrap gap-2 justify-center p-4 border-2 border-dashed border-slate-200 rounded-lg">
          <span className="w-full text-center text-sm text-slate-500 mb-2">Adicionar nova seção:</span>
          <Button variant="secondary" onClick={() => addSection('video')}><PlusIcon className="w-4 h-4 mr-2" /> Vídeo</Button>
          <Button variant="secondary" onClick={() => addSection('pdf')}><PlusIcon className="w-4 h-4 mr-2" /> PDF</Button>
          <Button variant="secondary" onClick={() => addSection('quiz')}><PlusIcon className="w-4 h-4 mr-2" /> Quiz</Button>
          <Button variant="secondary" onClick={() => addSection('open_question')}><PlusIcon className="w-4 h-4 mr-2" /> Pergunta Aberta</Button>
          <Button variant="secondary" onClick={() => addSection('feedback')}><PlusIcon className="w-4 h-4 mr-2" /> Feedback</Button>
        </div>

        <div className="flex justify-end">
          <Button variant="primary" size="lg">Salvar Módulo</Button>
        </div>
      </TabsContent>

      <TabsContent value="publicacao">
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as "rascunho" | "publicado")}
              options={[
                { label: "Rascunho", value: "rascunho" },
                { label: "Publicado", value: "publicado" },
              ]}
            />
            <Input
              label="Agendar publicação"
              type="datetime-local"
              value={publishAt}
              onChange={(e) => setPublishAt(e.target.value)}
            />
            <div className="md:col-span-2 flex justify-end">
              <Button variant="primary">Salvar Publicação</Button>
            </div>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
}