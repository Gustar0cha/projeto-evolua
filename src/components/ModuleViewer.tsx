"use client";
import React, { useState } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { CheckCircleIcon, PlayCircleIcon, DocumentTextIcon, ChatBubbleLeftRightIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// --- Types (mirrored from Editor) ---

type Option = { id: string; text: string; correct?: boolean };

type MultipleChoiceQuestion = {
    id: string;
    text: string;
    type: "multiple";
    options: Option[];
};

type ModuleSectionType = 'video' | 'pdf' | 'quiz' | 'open_question' | 'feedback';

export type ModuleSection = {
    id: string;
    type: ModuleSectionType;
    title: string;
    videoUrl?: string;
    pdfUrl?: string;
    description?: string;
    questions?: MultipleChoiceQuestion[];
    question?: string;
};

type ModuleViewerProps = {
    moduleId: string;
    moduleTitle: string;
    sections: ModuleSection[];
};

export default function ModuleViewer({ moduleId, moduleTitle, sections }: ModuleViewerProps) {
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [completedSections, setCompletedSections] = useState<string[]>([]);

    const currentSection = sections[currentSectionIndex];
    const isLastSection = currentSectionIndex === sections.length - 1;

    const markAsCompleted = (id: string) => {
        if (!completedSections.includes(id)) {
            setCompletedSections([...completedSections, id]);
        }
    };

    const handleNext = () => {
        markAsCompleted(currentSection.id);
        if (!isLastSection) {
            setCurrentSectionIndex(currentSectionIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(currentSectionIndex - 1);
        }
    };

    const getIcon = (type: ModuleSectionType) => {
        switch (type) {
            case 'video': return PlayCircleIcon;
            case 'pdf': return DocumentTextIcon;
            case 'quiz': return QuestionMarkCircleIcon;
            case 'open_question': return ChatBubbleLeftRightIcon;
            case 'feedback': return ChatBubbleLeftRightIcon;
            default: return CheckCircleIcon;
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <Card className="lg:col-span-1 h-fit sticky top-4">
                <h3 className="font-semibold text-slate-900 mb-4 px-2">Passos do Módulo</h3>
                <div className="space-y-1">
                    {sections.map((section, index) => {
                        const Icon = getIcon(section.type);
                        const isCompleted = completedSections.includes(section.id);
                        const isActive = index === currentSectionIndex;

                        return (
                            <button
                                key={section.id}
                                onClick={() => setCurrentSectionIndex(index)}
                                className={clsx(
                                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left",
                                    isActive ? "bg-primary/10 text-primary font-medium" : "text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                <div className={clsx("flex-shrink-0", isCompleted ? "text-green-500" : isActive ? "text-primary" : "text-slate-400")}>
                                    {isCompleted ? <CheckCircleSolidIcon className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                </div>
                                <span className="line-clamp-1">{index + 1}. {section.title}</span>
                            </button>
                        );
                    })}
                </div>
            </Card>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
                <Card>
                    <div className="mb-6 border-b pb-4">
                        <h1 className="text-2xl font-bold text-slate-900">{currentSection.title}</h1>
                        {currentSection.description && <p className="text-slate-600 mt-2">{currentSection.description}</p>}
                    </div>

                    <div className="min-h-[300px]">
                        {/* Content Rendering Logic */}
                        {currentSection.type === 'video' && (
                            <div className="aspect-video bg-black rounded-lg flex items-center justify-center text-white">
                                {currentSection.videoUrl ? (
                                    <iframe
                                        src={currentSection.videoUrl.replace("watch?v=", "embed/")}
                                        className="w-full h-full rounded-lg"
                                        allowFullScreen
                                        title="Video Player"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <PlayCircleIcon className="w-16 h-16 opacity-50" />
                                        <span>Vídeo não disponível</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {currentSection.type === 'pdf' && (
                            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                                <DocumentTextIcon className="w-16 h-16 text-slate-400 mb-4" />
                                <p className="text-slate-600 mb-4 text-center">
                                    Clique abaixo para acessar o material de leitura.
                                </p>
                                {currentSection.pdfUrl ? (
                                    <a href={currentSection.pdfUrl} target="_blank" rel="noopener noreferrer">
                                        <Button variant="secondary">Abrir PDF</Button>
                                    </a>
                                ) : (
                                    <Button disabled variant="secondary">PDF Indisponível</Button>
                                )}
                            </div>
                        )}

                        {currentSection.type === 'quiz' && (
                            <div className="space-y-6">
                                {currentSection.questions?.map((q, idx) => (
                                    <div key={q.id} className="space-y-3">
                                        <p className="font-medium text-slate-900">{idx + 1}. {q.text}</p>
                                        <div className="space-y-2">
                                            {q.options.map((opt) => (
                                                <label key={opt.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                                                    <input type="radio" name={q.id} className="w-4 h-4 text-primary border-slate-300 focus:ring-primary" />
                                                    <span className="text-slate-700">{opt.text}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {currentSection.type === 'open_question' && (
                            <div className="space-y-4">
                                <p className="font-medium text-slate-900">{currentSection.question}</p>
                                <Textarea placeholder="Digite sua resposta aqui..." rows={6} />
                            </div>
                        )}

                        {currentSection.type === 'feedback' && (
                            <div className="space-y-6">
                                <p className="font-medium text-slate-900">{currentSection.question}</p>
                                <div className="flex gap-4 justify-center">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <label key={rating} className="flex flex-col items-center gap-2 cursor-pointer group">
                                            <div className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center text-lg font-bold text-slate-500 group-hover:border-primary group-hover:text-primary transition-all peer-checked:bg-primary peer-checked:text-white">
                                                {rating}
                                            </div>
                                            <input type="radio" name="feedback-rating" value={rating} className="sr-only peer" />
                                            <span className="text-xs text-slate-500">{rating === 1 ? 'Ruim' : rating === 5 ? 'Excelente' : ''}</span>
                                        </label>
                                    ))}
                                </div>
                                <Textarea placeholder="Comentários adicionais (opcional)..." rows={3} />
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-8 pt-6 border-t flex justify-between">
                        <Button variant="secondary" onClick={handlePrev} disabled={currentSectionIndex === 0}>
                            Voltar
                        </Button>

                        {isLastSection ? (
                            <Link href="/treinamentos">
                                <Button onClick={() => markAsCompleted(currentSection.id)}>Concluir Módulo</Button>
                            </Link>
                        ) : (
                            <Button onClick={handleNext}>
                                Próximo Passo
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
