"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Button from '@/components/Button';

type PdfViewerProps = {
    pdfData: string;
    title?: string;
};

export default function PdfViewer({ pdfData, title = "Material de Leitura" }: PdfViewerProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);

    // Detectar se é base64 ou URL externa
    const isBase64 = pdfData.startsWith('data:application/pdf');
    const isExternalUrl = pdfData.startsWith('http://') || pdfData.startsWith('https://');

    // Converter base64 para Blob URL para melhor performance
    useEffect(() => {
        if (isBase64) {
            try {
                setLoading(true);
                setError(false);

                // Extrair o conteúdo base64 (remover o prefixo data:application/pdf;base64,)
                const base64Content = pdfData.split(',')[1];

                // Converter base64 para bytes
                const byteCharacters = atob(base64Content);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);

                // Criar Blob
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);

                setBlobUrl(url);
                setLoading(false);
            } catch (err) {
                console.error('Erro ao processar PDF:', err);
                setError(true);
                setLoading(false);
            }
        } else if (isExternalUrl) {
            setBlobUrl(pdfData);
            setLoading(false);
        }

        // Cleanup: revogar Blob URL quando o componente desmontar
        return () => {
            if (blobUrl && isBase64) {
                URL.revokeObjectURL(blobUrl);
            }
        };
    }, [pdfData, isBase64, isExternalUrl]);

    // URL final para exibir
    const displayUrl = blobUrl || pdfData;

    // Função para download do PDF
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = displayUrl;
        link.download = 'documento.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-4">
            {/* Cabeçalho do visualizador */}
            <div className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-medium text-slate-900">{title}</h3>
                        <p className="text-sm text-slate-500">Leia o documento abaixo para continuar</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Baixar</span>
                    </button>
                    <a
                        href={displayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/10"
                    >
                        <span>Abrir em nova aba</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </div>
            </div>

            {/* Estado de carregamento */}
            {loading && (
                <div className="border-2 border-slate-200 rounded-xl overflow-hidden bg-slate-50 h-[600px] flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                        <p className="text-slate-600 font-medium">Carregando PDF...</p>
                        <p className="text-slate-400 text-sm mt-1">Aguarde um momento</p>
                    </div>
                </div>
            )}

            {/* Estado de erro */}
            {error && !loading && (
                <div className="border-2 border-red-200 rounded-xl overflow-hidden bg-red-50 h-[300px] flex items-center justify-center">
                    <div className="text-center p-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-red-700 font-medium mb-2">Não foi possível carregar o PDF</p>
                        <p className="text-red-500 text-sm mb-4">Tente abrir em uma nova aba</p>
                        <a
                            href={pdfData}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button>Abrir PDF em nova aba</Button>
                        </a>
                    </div>
                </div>
            )}

            {/* Visualizador do PDF */}
            {!loading && !error && displayUrl && (
                <div className="border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                    <object
                        data={displayUrl}
                        type="application/pdf"
                        className="w-full h-[600px]"
                        title="Visualização do PDF"
                    >
                        {/* Fallback para navegadores que não suportam object */}
                        <iframe
                            src={displayUrl}
                            className="w-full h-[600px]"
                            title="Visualização do PDF"
                            style={{ border: 'none' }}
                        />
                    </object>
                </div>
            )}

            {/* Dica para mobile */}
            <p className="text-center text-xs text-slate-400">
                💡 Se o PDF não carregar corretamente, use os botões acima para baixar ou abrir em nova aba
            </p>
        </div>
    );
}
