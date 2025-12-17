"use client";
import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { DocumentTextIcon, XMarkIcon, ArrowUpTrayIcon, EyeIcon } from '@heroicons/react/24/outline';
import Button from '@/components/Button';

type PdfUploadProps = {
    currentPdf?: string | null;
    onPdfUploaded: (data: string) => void;
    onPdfRemoved: () => void;
    showPreview?: boolean;
};

export default function PdfUpload({ currentPdf, onPdfUploaded, onPdfRemoved, showPreview = true }: PdfUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [pdfData, setPdfData] = useState<string | null>(currentPdf || null);
    const [showPdfViewer, setShowPdfViewer] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Detectar se é uma URL externa ou base64/blob
    const isExternalUrl = pdfData && (pdfData.startsWith('http://') || pdfData.startsWith('https://'));
    const isBase64 = pdfData && pdfData.startsWith('data:application/pdf');

    async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validar tipo de arquivo
        if (file.type !== 'application/pdf') {
            toast.error('Por favor, selecione um arquivo PDF válido');
            return;
        }

        // Validar tamanho (máx 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('O arquivo PDF deve ter no máximo 10MB');
            return;
        }

        try {
            setUploading(true);

            // Converter para base64
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result as string;
                console.log(`📊 PDF processado: ${(base64String.length / 1024).toFixed(2)} KB`);

                setPdfData(base64String);
                onPdfUploaded(base64String);
                toast.success('PDF carregado com sucesso!');
                setUploading(false);
            };

            reader.onerror = () => {
                toast.error('Erro ao ler o arquivo PDF');
                setUploading(false);
            };

            reader.readAsDataURL(file);
        } catch (error: any) {
            console.error('Erro ao processar PDF:', error);
            toast.error('Erro ao processar PDF');
            setUploading(false);
        }
    }

    function handleRemove() {
        setPdfData(null);
        onPdfRemoved();
        setShowPdfViewer(false);
        toast.success('PDF removido');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    function handleUrlInput(url: string) {
        if (url.trim()) {
            setPdfData(url.trim());
            onPdfUploaded(url.trim());
        }
    }

    // Obter nome do arquivo para exibição
    function getFileName() {
        if (isExternalUrl && pdfData) {
            try {
                const url = new URL(pdfData);
                return url.pathname.split('/').pop() || 'documento.pdf';
            } catch {
                return 'documento.pdf';
            }
        }
        return 'documento.pdf';
    }

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
                Arquivo PDF
            </label>

            {pdfData ? (
                <div className="space-y-4">
                    {/* Card do PDF carregado */}
                    <div className="relative group border-2 border-primary/30 rounded-lg bg-primary/5 p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg">
                                <DocumentTextIcon className="h-10 w-10 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 truncate">{getFileName()}</p>
                                <p className="text-sm text-slate-500">
                                    {isExternalUrl ? 'Link externo' : 'Arquivo carregado'}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {showPreview && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setShowPdfViewer(!showPdfViewer)}
                                    >
                                        <EyeIcon className="h-4 w-4 mr-1" />
                                        {showPdfViewer ? 'Ocultar' : 'Visualizar'}
                                    </Button>
                                )}
                                <button
                                    onClick={handleRemove}
                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                    type="button"
                                    title="Remover PDF"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Visualizador do PDF embutido */}
                    {showPreview && showPdfViewer && (
                        <div className="border rounded-lg overflow-hidden bg-slate-100">
                            <div className="bg-slate-200 px-4 py-2 border-b flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700">Pré-visualização do PDF</span>
                                <a
                                    href={pdfData}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline"
                                >
                                    Abrir em nova aba
                                </a>
                            </div>
                            <iframe
                                src={pdfData}
                                className="w-full h-[500px]"
                                title="Visualização do PDF"
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Área de upload */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-48 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-slate-50 transition-colors"
                    >
                        <ArrowUpTrayIcon className="h-12 w-12 text-slate-400 mb-3" />
                        <p className="text-slate-600 font-medium">Clique para selecionar um PDF</p>
                        <p className="text-slate-400 text-sm mt-1">Arquivo PDF (máx. 10MB)</p>
                    </div>

                    {/* Alternativa: URL externa */}
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-slate-200"></div>
                        <span className="text-xs text-slate-400 uppercase">ou cole uma URL</span>
                        <div className="flex-1 h-px bg-slate-200"></div>
                    </div>

                    <input
                        type="url"
                        placeholder="https://exemplo.com/arquivo.pdf"
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                        onChange={(e) => handleUrlInput(e.target.value)}
                        onBlur={(e) => handleUrlInput(e.target.value)}
                    />
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
            />

            {uploading && (
                <div className="flex items-center justify-center gap-2 text-primary">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                    <span className="text-sm font-medium">Carregando PDF...</span>
                </div>
            )}
        </div>
    );
}
