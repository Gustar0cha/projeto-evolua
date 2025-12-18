"use client";
import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Select from "@/components/Select";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import ImageUpload from "@/components/ImageUpload";
import PdfUpload from "@/components/PdfUpload";

// Força renderização dinâmica para evitar erros de build
export const dynamic = "force-dynamic";

type Section = {
  id: string;
  type: 'video' | 'quiz' | 'text' | 'pdf';
  title: string;
  content: string;
  order_index: number;
};

type Question = {
  id: string;
  section_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'open' | 'scale';
  options?: { id: string; text: string; correct: boolean }[];
  correct_answer?: string;
  order_index: number;
};

export default function EditModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [status, setStatus] = useState<"rascunho" | "publicado">("rascunho");
  const [sections, setSections] = useState<Section[]>([]);
  const [questions, setQuestions] = useState<Record<string, Question[]>>({});

  useEffect(() => {
    loadModule();
  }, [id]);

  async function loadModule() {
    try {
      setLoading(true);

      // Carregar módulo
      const { data: module, error: moduleError } = await supabase
        .from('modules')
        .select('*')
        .eq('id', id)
        .single();

      if (moduleError) throw moduleError;

      setTitle(module.title || "");
      setDescription(module.description || "");
      setCoverImage(module.cover_image || null);
      setStatus(module.status || "rascunho");

      // Carregar seções
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('module_sections')
        .select('*')
        .eq('module_id', id)
        .order('order_index');

      if (sectionsError) throw sectionsError;

      setSections(sectionsData || []);

      // Carregar questões para cada seção
      if (sectionsData && sectionsData.length > 0) {
        const questionsMap: Record<string, Question[]> = {};

        for (const section of sectionsData) {
          if (section.type === 'quiz') {
            const { data: questionsData } = await supabase
              .from('quiz_questions')
              .select('*')
              .eq('section_id', section.id)
              .order('order_index');

            // Parse do JSON no campo options
            questionsMap[section.id] = (questionsData || []).map(q => ({
              ...q,
              options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : undefined
            }));
          }
        }

        setQuestions(questionsMap);
      }
    } catch (error: any) {
      console.error('Erro ao carregar módulo:', error);
      toast.error('Erro ao carregar módulo');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      toast.error('Digite o título do módulo');
      return;
    }

    try {
      setSaving(true);
      console.log('🔄 Iniciando salvamento...');

      // Salvar módulo
      console.log('📝 Salvando informações básicas do módulo...');
      console.log('📊 Tamanho da imagem:', coverImage ? `${(coverImage.length / 1024).toFixed(2)} KB` : 'Sem imagem');

      const { error: moduleError } = await supabase
        .from('modules')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          cover_image: coverImage,
          status
        })
        .eq('id', id);

      if (moduleError) {
        console.error('❌ Erro ao salvar módulo:', moduleError);
        console.error('❌ Erro completo:', JSON.stringify(moduleError, null, 2));
        console.error('❌ Message:', moduleError.message);
        console.error('❌ Details:', moduleError.details);
        console.error('❌ Hint:', moduleError.hint);
        console.error('❌ Code:', moduleError.code);
        throw moduleError;
      }
      console.log('✅ Informações básicas salvas');

      // Salvar seções
      console.log(`📚 Salvando ${sections.length} seções...`);
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        console.log(`  📄 Seção ${i + 1}: ${section.title} (${section.type})`);

        if (section.id.startsWith('temp-')) {
          // Nova seção
          console.log('    ➕ Criando nova seção...');
          const { data: newSection, error } = await supabase
            .from('module_sections')
            .insert([{
              module_id: id,
              type: section.type,
              title: section.title,
              content: section.content,
              order_index: i
            }])
            .select()
            .single();

          if (error) {
            console.error('    ❌ Erro ao criar seção:', error);
            console.error('    📋 Erro serializado:', JSON.stringify(error, null, 2));
            console.error('    📋 Dados enviados:', {
              module_id: id,
              type: section.type,
              title: section.title,
              content: section.content,
              order_index: i
            });
            throw error;
          }
          console.log('    ✅ Seção criada:', newSection.id);

          // Se for quiz, salvar questões
          if (section.type === 'quiz' && questions[section.id]) {
            console.log(`    📝 Salvando ${questions[section.id].length} questões...`);
            for (let j = 0; j < questions[section.id].length; j++) {
              const q = questions[section.id][j];
              const { error: qError } = await supabase
                .from('quiz_questions')
                .insert([{
                  section_id: newSection.id,
                  question_text: q.question_text,
                  question_type: q.question_type,
                  options: q.options ? JSON.stringify(q.options) : null,
                  correct_answer: q.correct_answer,
                  order_index: j
                }]);

              if (qError) {
                console.error(`    ❌ Erro ao salvar questão ${j + 1}:`, qError);
                console.error(`    ❌ Erro completo:`, JSON.stringify(qError, null, 2));
                console.error(`    ❌ Message:`, qError.message);
                console.error(`    ❌ Code:`, qError.code);
                throw qError;
              }
            }
            console.log('    ✅ Questões salvas');
          }
        } else {
          // Atualizar seção existente
          console.log('    🔄 Atualizando seção existente...');
          const { error: updateError } = await supabase
            .from('module_sections')
            .update({
              title: section.title,
              content: section.content,
              order_index: i
            })
            .eq('id', section.id);

          if (updateError) {
            console.error('    ❌ Erro ao atualizar seção:', updateError);
            throw updateError;
          }
          console.log('    ✅ Seção atualizada');

          // Atualizar questões se for quiz
          if (section.type === 'quiz' && questions[section.id]) {
            console.log('    🗑️ Deletando questões antigas...');
            const { error: deleteError } = await supabase
              .from('quiz_questions')
              .delete()
              .eq('section_id', section.id);

            if (deleteError) {
              console.error('    ❌ Erro ao deletar questões:', deleteError);
              throw deleteError;
            }

            console.log(`    📝 Inserindo ${questions[section.id].length} novas questões...`);
            for (let j = 0; j < questions[section.id].length; j++) {
              const q = questions[section.id][j];
              const { error: qError } = await supabase
                .from('quiz_questions')
                .insert([{
                  section_id: section.id,
                  question_text: q.question_text,
                  question_type: q.question_type,
                  options: q.options ? JSON.stringify(q.options) : null,
                  correct_answer: q.correct_answer,
                  order_index: j
                }]);

              if (qError) {
                console.error(`    ❌ Erro ao inserir questão ${j + 1}:`, qError);
                throw qError;
              }
            }
            console.log('    ✅ Questões atualizadas');
          }
        }
      }

      console.log('✅ Módulo salvo com sucesso!');
      toast.success('Módulo salvo com sucesso!');

      if (status === 'publicado') {
        toast.success('Módulo publicado! Agora está disponível para os colaboradores.');
      }

      console.log('🔄 Recarregando dados...');
      loadModule(); // Recarregar dados
    } catch (error: any) {
      console.error('Erro ao salvar módulo:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      toast.error(`Erro ao salvar: ${error.message || error.details || error.hint || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  }

  function addSection(type: 'video' | 'quiz' | 'text' | 'pdf') {
    const newSection: Section = {
      id: `temp-${Date.now()}`,
      type,
      title: type === 'video' ? 'Vídeo' : type === 'quiz' ? 'Questionário' : type === 'pdf' ? 'Material em PDF' : 'Texto',
      content: '',
      order_index: sections.length
    };
    setSections([...sections, newSection]);
  }

  async function removeSection(index: number) {
    const sectionToRemove = sections[index];

    // Se não for uma seção temporária, deletar do banco de dados
    if (!sectionToRemove.id.startsWith('temp-')) {
      try {
        // Primeiro, deletar as questões associadas se for um quiz
        if (sectionToRemove.type === 'quiz') {
          const { error: questionsError } = await supabase
            .from('quiz_questions')
            .delete()
            .eq('section_id', sectionToRemove.id);

          if (questionsError) {
            console.error('Erro ao deletar questões:', questionsError);
            toast.error('Erro ao deletar questões da seção');
            return;
          }
        }

        // Deletar a seção
        const { error: sectionError } = await supabase
          .from('module_sections')
          .delete()
          .eq('id', sectionToRemove.id);

        if (sectionError) {
          console.error('Erro ao deletar seção:', sectionError);
          toast.error('Erro ao deletar seção');
          return;
        }

        toast.success('Seção excluída com sucesso!');
      } catch (error: any) {
        console.error('Erro ao excluir seção:', error);
        toast.error('Erro ao excluir seção');
        return;
      }
    }

    // Remover do estado local
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);

    // Remover questões do estado se existirem
    if (questions[sectionToRemove.id]) {
      const newQuestions = { ...questions };
      delete newQuestions[sectionToRemove.id];
      setQuestions(newQuestions);
    }
  }

  function updateSection(index: number, field: keyof Section, value: any) {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
  }

  function addQuestion(sectionId: string) {
    const newQuestion: Question = {
      id: `temp-${Date.now()}`,
      section_id: sectionId,
      question_text: '',
      question_type: 'multiple_choice',
      options: [
        { id: 'a', text: '', correct: false },
        { id: 'b', text: '', correct: false }
      ],
      order_index: (questions[sectionId] || []).length
    };

    setQuestions({
      ...questions,
      [sectionId]: [...(questions[sectionId] || []), newQuestion]
    });
  }

  function removeQuestion(sectionId: string, questionIndex: number) {
    const newQuestions = { ...questions };
    newQuestions[sectionId] = newQuestions[sectionId].filter((_, i) => i !== questionIndex);
    setQuestions(newQuestions);
  }

  function updateQuestion(sectionId: string, questionIndex: number, field: keyof Question, value: any) {
    const newQuestions = { ...questions };
    newQuestions[sectionId][questionIndex] = {
      ...newQuestions[sectionId][questionIndex],
      [field]: value
    };
    setQuestions(newQuestions);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando módulo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Editar Módulo</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.push('/modules')}>
            Voltar
          </Button>
        </div>
      </div>

      <Card title="Informações Básicas">
        <div className="space-y-4">
          <Input
            label="Título do Módulo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Descrição</label>
            <textarea
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <ImageUpload
            currentImage={coverImage}
            onImageUploaded={(url) => setCoverImage(url)}
            onImageRemoved={() => setCoverImage(null)}
          />

          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            options={[
              { label: "Rascunho", value: "rascunho" },
              { label: "Publicado", value: "publicado" },
            ]}
          />
        </div>
      </Card>

      <Card title="Seções do Módulo">
        <div className="space-y-4">
          {sections.map((section, sectionIndex) => (
            <div key={section.id} className="border border-slate-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  {section.type === 'video' ? '🎥' : section.type === 'quiz' ? '📝' : section.type === 'pdf' ? '📕' : '📄'} Seção {sectionIndex + 1}
                </h3>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeSection(sectionIndex)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>

              <Input
                label="Título da Seção"
                value={section.title}
                onChange={(e) => updateSection(sectionIndex, 'title', e.target.value)}
              />

              {section.type === 'video' && (
                <Input
                  label="URL do Vídeo"
                  placeholder="https://vimeo.com/... ou https://youtube.com/..."
                  value={section.content}
                  onChange={(e) => updateSection(sectionIndex, 'content', e.target.value)}
                />
              )}

              {section.type === 'text' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Conteúdo</label>
                  <textarea
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    value={section.content}
                    onChange={(e) => updateSection(sectionIndex, 'content', e.target.value)}
                    rows={4}
                  />
                </div>
              )}

              {section.type === 'pdf' && (
                <div className="space-y-3">
                  <PdfUpload
                    currentPdf={section.content}
                    onPdfUploaded={(data) => updateSection(sectionIndex, 'content', data)}
                    onPdfRemoved={() => updateSection(sectionIndex, 'content', '')}
                    showPreview={true}
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Descrição/Instruções (opcional)</label>
                    <textarea
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Instruções de leitura para o aluno..."
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {section.type === 'quiz' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-slate-700">Questões</h4>
                    <Button
                      size="sm"
                      onClick={() => addQuestion(section.id)}
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Adicionar Questão
                    </Button>
                  </div>

                  {(questions[section.id] || []).map((question, qIndex) => (
                    <div key={question.id} className="bg-slate-50 p-4 rounded space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Questão {qIndex + 1}</span>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeQuestion(section.id, qIndex)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>

                      <Input
                        label="Pergunta"
                        value={question.question_text}
                        onChange={(e) => updateQuestion(section.id, qIndex, 'question_text', e.target.value)}
                      />

                      <Select
                        label="Tipo"
                        value={question.question_type}
                        onChange={(e) => updateQuestion(section.id, qIndex, 'question_type', e.target.value)}
                        options={[
                          { label: "Múltipla Escolha", value: "multiple_choice" },
                          { label: "Verdadeiro/Falso", value: "true_false" },
                          { label: "Resposta Aberta", value: "open" },
                          { label: "Escala 1 a 5", value: "scale" },
                        ]}
                      />

                      {question.question_type === 'multiple_choice' && question.options && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Opções</label>
                          {question.options.map((option, optIndex) => (
                            <div key={option.id} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={option.correct}
                                onChange={(e) => {
                                  const newOptions = [...question.options!];
                                  newOptions[optIndex].correct = e.target.checked;
                                  updateQuestion(section.id, qIndex, 'options', newOptions);
                                }}
                                className="rounded"
                              />
                              <input
                                type="text"
                                value={option.text}
                                onChange={(e) => {
                                  const newOptions = [...question.options!];
                                  newOptions[optIndex].text = e.target.value;
                                  updateQuestion(section.id, qIndex, 'options', newOptions);
                                }}
                                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                                placeholder={`Opção ${String.fromCharCode(65 + optIndex)}`}
                              />
                            </div>
                          ))}
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              const newOptions = [...(question.options || [])];
                              newOptions.push({
                                id: String.fromCharCode(97 + newOptions.length),
                                text: '',
                                correct: false
                              });
                              updateQuestion(section.id, qIndex, 'options', newOptions);
                            }}
                          >
                            + Adicionar Opção
                          </Button>
                        </div>
                      )}

                      {question.question_type === 'scale' && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-600">Preview da Escala</label>
                          <div className="flex gap-2 items-center bg-slate-50 p-3 rounded-lg justify-center">
                            <span className="text-xs text-slate-500">Não aprendi nada</span>
                            {[1, 2, 3, 4, 5].map((num) => (
                              <div
                                key={num}
                                className="w-10 h-10 rounded-full border-2 border-slate-300 flex items-center justify-center text-slate-500 font-medium"
                              >
                                {num}
                              </div>
                            ))}
                            <span className="text-xs text-slate-500">Aprendi totalmente</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => addSection('video')}>
              + Adicionar Vídeo
            </Button>
            <Button onClick={() => addSection('pdf')} variant="secondary">
              + Adicionar PDF
            </Button>
            <Button onClick={() => addSection('quiz')} variant="secondary">
              + Adicionar Quiz
            </Button>
            <Button onClick={() => addSection('text')} variant="secondary">
              + Adicionar Texto
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving || !title.trim()}>
          {saving ? 'Salvando...' : 'Salvar Módulo'}
        </Button>
        <Button variant="secondary" onClick={() => router.push('/modules')}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}