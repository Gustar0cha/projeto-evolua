"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function NewModulePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function handleCreate() {
    if (!title.trim()) {
      toast.error('Digite o título do módulo');
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('modules')
        .insert([
          {
            title: title.trim(),
            description: description.trim() || null,
            status: 'rascunho'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success('Módulo criado com sucesso!');
      router.push(`/modules/${data.id}`);
    } catch (error: any) {
      console.error('Erro ao criar módulo:', error);
      toast.error(`Erro ao criar módulo: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Criar Novo Módulo</h2>
        <Button variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>

      <Card>
        <div className="space-y-6">
          <Input
            label="Título do Módulo"
            placeholder="Ex: Introdução à Segurança do Trabalho"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Descrição (opcional)
            </label>
            <textarea
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-primary"
              placeholder="Descreva o conteúdo e objetivos deste módulo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleCreate} disabled={loading || !title.trim()}>
              {loading ? 'Criando...' : 'Criar Módulo'}
            </Button>
            <Button variant="secondary" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Próximos Passos</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>1. Crie o módulo com título e descrição</li>
              <li>2. Adicione seções (vídeo, PDF, quiz, etc.)</li>
              <li>3. Configure as questões e atividades</li>
              <li>4. Publique o módulo para disponibilizar aos colaboradores</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}