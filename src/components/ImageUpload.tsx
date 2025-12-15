"use client";
import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

type ImageUploadProps = {
    currentImage?: string | null;
    onImageUploaded: (url: string) => void;
    onImageRemoved: () => void;
};

export default function ImageUpload({ currentImage, onImageUploaded, onImageRemoved }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            toast.error('Por favor, selecione uma imagem válida');
            return;
        }

        // Validar tamanho (máx 5MB do arquivo original)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('A imagem deve ter no máximo 5MB');
            return;
        }

        try {
            setUploading(true);

            // Criar uma imagem para redimensionar
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(objectUrl);

                // Calcular dimensões mantendo proporção (máx 1200px de largura)
                const maxWidth = 1200;
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                // Criar canvas para redimensionar
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    toast.error('Erro ao processar imagem');
                    setUploading(false);
                    return;
                }

                // Preencher com fundo branco (para imagens PNG com transparência)
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, width, height);

                // Desenhar imagem redimensionada
                ctx.drawImage(img, 0, 0, width, height);

                // Converter para base64 com qualidade ajustada
                // Começar com qualidade 0.8 e reduzir se necessário
                let quality = 0.8;
                let base64String = canvas.toDataURL('image/jpeg', quality);

                // Se ainda estiver muito grande (>500KB em base64), reduzir qualidade
                while (base64String.length > 500 * 1024 && quality > 0.3) {
                    quality -= 0.1;
                    base64String = canvas.toDataURL('image/jpeg', quality);
                }

                console.log(`📊 Imagem processada: ${(base64String.length / 1024).toFixed(2)} KB (qualidade: ${(quality * 100).toFixed(0)}%)`);

                setPreview(base64String);
                onImageUploaded(base64String);
                toast.success('Imagem carregada com sucesso!');
                setUploading(false);
            };

            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                toast.error('Erro ao carregar a imagem');
                setUploading(false);
            };

            img.src = objectUrl;
        } catch (error: any) {
            console.error('Erro ao processar imagem:', error);
            toast.error('Erro ao processar imagem');
            setUploading(false);
        }
    }

    function handleRemove() {
        setPreview(null);
        onImageRemoved();
        toast.success('Imagem removida');
    }

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
                Capa do Módulo
            </label>

            {preview ? (
                <div className="relative group">
                    <img
                        src={preview}
                        alt="Capa do módulo"
                        className="w-full h-64 object-cover rounded-lg border-2 border-slate-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
                        <button
                            onClick={handleRemove}
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-3 rounded-full hover:bg-red-600"
                            type="button"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-64 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-slate-50 transition-colors"
                >
                    <PhotoIcon className="h-16 w-16 text-slate-400 mb-4" />
                    <p className="text-slate-600 font-medium">Clique para selecionar uma imagem</p>
                    <p className="text-slate-400 text-sm mt-1">PNG, JPG ou WEBP (máx. 5MB)</p>
                    <p className="text-slate-400 text-sm">A imagem será otimizada automaticamente</p>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
            />

            {uploading && (
                <div className="flex items-center justify-center gap-2 text-primary">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                    <span className="text-sm font-medium">Processando imagem...</span>
                </div>
            )}
        </div>
    );
}
