"use client";
import React, { useState } from "react";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Option = { id: string; text: string; correct?: boolean };

type MultipleChoiceQuestion = {
  id: string;
  text: string;
  type: "multiple";
  options: Option[];
};

type LongAnswerQuestion = {
  id: string;
  text: string;
  type: "long_answer";
};

type LinearScaleQuestion = {
  id: string;
  text: string;
  type: "linear_scale";
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
};

type Question = MultipleChoiceQuestion | LongAnswerQuestion | LinearScaleQuestion;

type ModuleEditorProps = {
  module?: {
    title: string;
    desc: string;
    content: string;
    questions: Question[];
    status: "rascunho" | "publicado";
    publishAt: string;
  };
};

export default function ModuleEditor({ module }: ModuleEditorProps) {
  const [tab, setTab] = useState<"conteudo" | "questionario" | "publicacao">("conteudo");
  const [title, setTitle] = useState(module?.title || "");
  const [desc, setDesc] = useState(module?.desc || "");
  const [content, setContent] = useState(module?.content || "");
  const [questions, setQuestions] = useState<Question[]>(module?.questions || []);
  const [status, setStatus] = useState<"rascunho" | "publicado">(module?.status || "rascunho");
  const [publishAt, setPublishAt] = useState<string>(module?.publishAt || "");

  const addQuestion = () => {
    const q: Question = {
      id: Math.random().toString(36).slice(2),
      text: "",
      type: "multiple",
      options: [{ id: Math.random().toString(36).slice(2), text: "", correct: false }],
    };
    setQuestions((qs) => [...qs, q]);
  };

  const changeQuestionType = (qid: string, newType: "multiple" | "long_answer" | "linear_scale") => {
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.id !== qid) return q;

        const base = { id: q.id, text: q.text };

        if (newType === "multiple") {
          return {
            ...base,
            type: "multiple",
            options:
              q.type === "multiple" && q.options.length
                ? q.options
                : [{ id: Math.random().toString(36).slice(2), text: "", correct: false }],
          };
        }
        if (newType === "long_answer") {
          return { ...base, type: "long_answer" };
        }
        if (newType === "linear_scale") {
          return {
            ...base,
            type: "linear_scale",
            min: 1,
            max: 5,
            minLabel: "Ruim",
            maxLabel: "Excelente",
          };
        }
        return q;
      })
    );
  };

  const addOption = (qid: string) => {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qid && q.type === "multiple"
          ? {
              ...q,
              options: [...q.options, { id: Math.random().toString(36).slice(2), text: "", correct: false }],
            }
          : q
      )
    );
  };

  const setCorrect = (qid: string, oid: string) => {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qid && q.type === "multiple"
          ? {
              ...q,
              options: q.options.map((o) => ({ ...o, correct: o.id === oid })),
            }
          : q
      )
    );
  };

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as "conteudo" | "questionario" | "publicacao")} className="space-y-4">
      <TabsList>
        <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
        <TabsTrigger value="questionario">Questionário</TabsTrigger>
        <TabsTrigger value="publicacao">Publicação</TabsTrigger>
      </TabsList>

      <TabsContent value="conteudo">
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input label="Descrição" value={desc} onChange={(e) => setDesc(e.target.value)} />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Conteúdo (Texto ou link de vídeo)</label>
              <Textarea rows={6} value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button variant="primary">Salvar</Button>
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="questionario">
        <Card>
          <div className="flex justify-end mb-3">
            <Button onClick={addQuestion}>Adicionar Pergunta</Button>
          </div>
          <div className="space-y-6">
            {questions.map((q) => (
              <div key={q.id} className="space-y-3 p-4 border rounded-md">
                <Input
                  label="Texto da Pergunta"
                  value={q.text}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQuestions((qs) => qs.map((qq) => (qq.id === q.id ? { ...qq, text: val } : qq)));
                  }}
                />
                <Select
                  label="Tipo"
                  value={q.type}
                  onChange={(e) => changeQuestionType(q.id, e.target.value as any)}
                  options={[
                    { label: "Múltipla Escolha", value: "multiple" },
                    { label: "Resposta Longa", value: "long_answer" },
                    { label: "Escala Linear", value: "linear_scale" },
                  ]}
                />

                {q.type === "multiple" && (
                  <>
                    <div className="space-y-2">
                      {q.options.map((o) => (
                        <div key={o.id} className="flex items-center gap-2">
                          <Checkbox checked={!!o.correct} onCheckedChange={() => setCorrect(q.id, o.id)} />
                          <Input
                            className="flex-1"
                            placeholder="Texto da opção"
                            value={o.text}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQuestions((qs) =>
                                qs.map((qq) =>
                                  qq.id === q.id && qq.type === "multiple"
                                    ? {
                                        ...qq,
                                        options: qq.options.map((oo) => (oo.id === o.id ? { ...oo, text: val } : oo)),
                                      }
                                    : qq
                                )
                              );
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <Button variant="secondary" onClick={() => addOption(q.id)}>
                        Adicionar Opção
                      </Button>
                    </div>
                  </>
                )}

                {q.type === "long_answer" && <Textarea placeholder="O aluno irá inserir a resposta aqui." disabled rows={4} />}

                {q.type === "linear_scale" && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>{q.minLabel}</span>
                      <span>{q.maxLabel}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      {Array.from({ length: q.max - q.min + 1 }, (_, i) => q.min + i).map((v) => (
                        <div key={v} className="flex flex-col items-center gap-1">
                          <label className="text-sm font-medium">{v}</label>
                          <input type="radio" name={`linear-scale-${q.id}`} value={v} disabled className="h-4 w-4" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="primary">Salvar Questionário</Button>
          </div>
        </Card>
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