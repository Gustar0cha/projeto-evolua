"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Card from "@/components/Card";
import Button from "@/components/Button";
import PdfViewer from "@/components/PdfViewer";
import FeedbackModal from "@/components/FeedbackModal";
import { useRouter } from "next/navigation";

type Section = {
  id: string;
  type: 'video' | 'quiz' | 'text' | 'pdf';
  title: string;
  content: string;
  order_index: number;
};

type Question = {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'open' | 'scale';
  options?: { id: string; text: string; correct: boolean }[];
};

export default function ModuleClientPage({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [questions, setQuestions] = useState<Record<string, Question[]>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadModule();
    }
  }, [id]);

  async function loadModule() {
    try {
      setLoading(true);

      // ✅ OTIMIZAÇÃO: Buscar módulo e seções em paralelo
      const [
        { data: moduleData, error: moduleError },
        { data: sectionsData, error: sectionsError }
      ] = await Promise.all([
        supabase
          .from('modules')
          .select('id, title, description, cover_image, status')  // ✅ Só campos necessários
          .eq('id', id)
          .single(),
        supabase
          .from('module_sections')
          .select('id, type, title, content, order_index')  // ✅ Só campos necessários
          .eq('module_id', id)
          .order('order_index')
      ]);

      if (moduleError) throw moduleError;
      if (sectionsError) throw sectionsError;

      setModule(moduleData);
      setSections(sectionsData || []);

      // ✅ OTIMIZAÇÃO: Buscar TODAS questões de uma vez usando IN()
      const quizSectionIds = sectionsData
        ?.filter(s => s.type === 'quiz')
        .map(s => s.id) || [];

      if (quizSectionIds.length > 0) {
        // Uma única query para TODAS as questões de todos os quizzes
        const { data: allQuestionsData } = await supabase
          .from('quiz_questions')
          .select('id, section_id, question_text, question_type, options, order_index')
          .in('section_id', quizSectionIds)
          .order('order_index');

        // ✅ Processar em memória (agrupar por section_id)
        const questionsMap: Record<string, Question[]> = {};
        allQuestionsData?.forEach(q => {
          if (!questionsMap[q.section_id]) {
            questionsMap[q.section_id] = [];
          }
          questionsMap[q.section_id].push({
            ...q,
            options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : undefined
          });
        });

        setQuestions(questionsMap);
      }

      // Carregar respostas anteriores
      if (user) {
        const { data: answersData } = await supabase
          .from('user_quiz_answers')
          .select('question_id, answer')
          .eq('user_id', user.id)
          .eq('module_id', id);

        if (answersData) {
          const answersMap: Record<string, string> = {};
          answersData.forEach(a => {
            answersMap[a.question_id] = a.answer;
          });
          setAnswers(answersMap);
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar módulo:', error);
      toast.error('Erro ao carregar módulo');
    } finally {
      setLoading(false);
    }
  }

  async function saveAnswer(questionId: string, answer: string, question: Question) {
    if (!user) return;

    try {
      // Verificar se a resposta está correta (para múltipla escolha)
      let isCorrect = null;
      if (question.question_type === 'multiple_choice' && question.options) {
        const selectedOption = question.options.find(opt => opt.id === answer);
        isCorrect = selectedOption?.correct || false;
      }

      // Salvar resposta
      const { error } = await supabase
        .from('user_quiz_answers')
        .upsert({
          user_id: user.id,
          question_id: questionId,
          module_id: id,
          answer,
          is_correct: isCorrect
        }, {
          onConflict: 'user_id,question_id'
        });

      if (error) throw error;

      setAnswers({ ...answers, [questionId]: answer });
    } catch (error: any) {
      console.error('Erro ao salvar resposta:', error);
      toast.error('Erro ao salvar resposta');
    }
  }

  // Função para abrir o modal de feedback
  function handleCompleteClick() {
    setShowFeedbackModal(true);
  }

  // Função para salvar o feedback e concluir o módulo
  async function handleFeedbackSubmit(rating: number, comment: string) {
    if (!user) return;

    try {
      // Salvar o feedback
      const { error: feedbackError } = await supabase
        .from('module_feedbacks')
        .upsert({
          user_id: user.id,
          module_id: id,
          rating,
          comment: comment.trim() || null
        }, {
          onConflict: 'user_id,module_id'
        });

      if (feedbackError) {
        console.error('Erro ao salvar feedback:', feedbackError);
        // Continuar mesmo se o feedback falhar
      }

      // Concluir o módulo
      await completeModule();
    } catch (error: any) {
      console.error('Erro ao processar feedback:', error);
      // Mesmo com erro, tentar concluir
      await completeModule();
    }
  }

  // Função para pular o feedback e concluir diretamente
  async function handleSkipFeedback() {
    setShowFeedbackModal(false);
    await completeModule();
  }

  async function completeModule() {
    if (!user) return;

    try {
      // Atualizar progresso
      const { error } = await supabase
        .from('user_module_progress')
        .upsert({
          user_id: user.id,
          module_id: id,
          status: 'concluido',
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,module_id'
        });

      if (error) throw error;

      toast.success('Módulo concluído com sucesso!');
      setShowFeedbackModal(false);
      router.push('/treinamentos');
    } catch (error: any) {
      console.error('Erro ao concluir módulo:', error);
      toast.error('Erro ao salvar progresso');
    }
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

  if (!module || sections.length === 0) {
    return (
      <Card>
        <div className="p-8 text-center text-slate-500">
          Módulo não encontrado ou sem conteúdo
        </div>
      </Card>
    );
  }

  const section = sections[currentSection];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title">{module.title}</h2>
        <Button variant="secondary" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>

      {module.description && (
        <Card>
          <p className="text-slate-700">{module.description}</p>
        </Card>
      )}

      {/* Progress */}
      <div className="flex items-center gap-2">
        {sections.map((_, index) => (
          <div
            key={index}
            className={`h-2 flex-1 rounded ${index < currentSection ? 'bg-green-500' :
              index === currentSection ? 'bg-primary' :
                'bg-slate-200'
              }`}
          />
        ))}
      </div>

      {/* Current Section */}
      <Card title={`${section.title} (${currentSection + 1}/${sections.length})`}>
        {section.type === 'video' && section.content && (
          <div className="aspect-video bg-slate-900 rounded overflow-hidden">
            {section.content.includes('vimeo.com') ? (
              <iframe
                src={`https://player.vimeo.com/video/${section.content.match(/\d+/)?.[0] || ''}`}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : section.content.includes('youtube.com') || section.content.includes('youtu.be') ? (
              <iframe
                src={section.content.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video src={section.content} controls className="w-full h-full" />
            )}
          </div>
        )}

        {section.type === 'text' && (
          <div className="prose max-w-none">
            <p className="text-slate-700 whitespace-pre-wrap">{section.content}</p>
          </div>
        )}

        {section.type === 'pdf' && section.content && (
          <PdfViewer pdfData={section.content} title={section.title} />
        )}

        {section.type === 'quiz' && questions[section.id] && (
          <div className="space-y-6">
            {questions[section.id].map((question, qIndex) => (
              <div key={question.id} className="space-y-3">
                <h4 className="font-medium text-slate-900">
                  {qIndex + 1}. {question.question_text}
                </h4>

                {question.question_type === 'multiple_choice' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${answers[question.id] === option.id
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 hover:border-slate-300'
                          }`}
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option.id}
                          checked={answers[question.id] === option.id}
                          onChange={(e) => saveAnswer(question.id, e.target.value, question)}
                          className="text-primary"
                        />
                        <span className="text-slate-700">{option.text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.question_type === 'open' && (
                  <textarea
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    value={answers[question.id] || ''}
                    onChange={(e) => saveAnswer(question.id, e.target.value, question)}
                    rows={4}
                    placeholder="Digite sua resposta..."
                  />
                )}

                {question.question_type === 'scale' && (
                  <div className="py-4">
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-sm text-slate-500 w-28 text-right">Não aprendi nada</span>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => saveAnswer(question.id, rating.toString(), question)}
                          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-all ${answers[question.id] === rating.toString()
                            ? 'border-primary bg-primary text-white'
                            : 'border-slate-300 text-slate-500 hover:border-primary hover:text-primary'
                            }`}
                        >
                          {rating}
                        </button>
                      ))}
                      <span className="text-sm text-slate-500 w-28 text-left">Aprendi totalmente</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
          disabled={currentSection === 0}
        >
          ← Anterior
        </Button>

        {currentSection < sections.length - 1 ? (
          <Button onClick={() => setCurrentSection(currentSection + 1)}>
            Próxima →
          </Button>
        ) : (
          <Button onClick={handleCompleteClick}>
            Concluir Módulo ✓
          </Button>
        )}
      </div>

      {/* Modal de Feedback */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={handleSkipFeedback}
        onSubmit={handleFeedbackSubmit}
        moduleTitle={module?.title || 'Módulo'}
      />
    </div>
  );
}