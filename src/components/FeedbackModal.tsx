"use client";
import React, { useState } from 'react';
import Button from '@/components/Button';

type FeedbackModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => Promise<void>;
    moduleTitle: string;
};

export default function FeedbackModal({ isOpen, onClose, onSubmit, moduleTitle }: FeedbackModalProps) {
    const [rating, setRating] = useState<number | null>(null);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [hoveredRating, setHoveredRating] = useState<number | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!rating) return;

        setSubmitting(true);
        try {
            await onSubmit(rating, comment);
        } finally {
            setSubmitting(false);
        }
    };

    const ratingLabels: Record<number, string> = {
        1: 'Muito Ruim',
        2: 'Ruim',
        3: 'Regular',
        4: 'Bom',
        5: 'Excelente'
    };

    const ratingEmojis: Record<number, string> = {
        1: '😞',
        2: '😕',
        3: '😐',
        4: '🙂',
        5: '😄'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header com gradiente */}
                <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-8 text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Parabéns! 🎉</h2>
                    <p className="text-white/90">
                        Você concluiu o módulo <strong>&quot;{moduleTitle}&quot;</strong>
                    </p>
                </div>

                {/* Conteúdo */}
                <div className="px-6 py-6 space-y-6">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            Como você avalia este módulo?
                        </h3>
                        <p className="text-sm text-slate-500">
                            Sua opinião nos ajuda a melhorar os treinamentos
                        </p>
                    </div>

                    {/* Rating com estrelas/emojis */}
                    <div className="flex justify-center gap-3">
                        {[1, 2, 3, 4, 5].map((value) => (
                            <button
                                key={value}
                                onClick={() => setRating(value)}
                                onMouseEnter={() => setHoveredRating(value)}
                                onMouseLeave={() => setHoveredRating(null)}
                                className={`relative flex flex-col items-center transition-all duration-200 transform ${rating === value
                                        ? 'scale-110'
                                        : hoveredRating && hoveredRating >= value
                                            ? 'scale-105'
                                            : ''
                                    }`}
                            >
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all ${rating === value
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : hoveredRating && hoveredRating >= value
                                            ? 'bg-primary/20 text-primary'
                                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                    }`}>
                                    {rating === value || (hoveredRating && hoveredRating >= value)
                                        ? ratingEmojis[value]
                                        : value
                                    }
                                </div>
                                <span className={`text-xs mt-1 transition-colors ${rating === value || hoveredRating === value
                                        ? 'text-primary font-medium'
                                        : 'text-slate-400'
                                    }`}>
                                    {hoveredRating === value || rating === value ? ratingLabels[value] : ''}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Comentário */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Comentário (opcional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Conte-nos mais sobre sua experiência..."
                            rows={3}
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 flex gap-3 justify-end border-t">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Pular
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!rating || submitting}
                    >
                        {submitting ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Enviando...
                            </span>
                        ) : (
                            'Enviar Avaliação'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
