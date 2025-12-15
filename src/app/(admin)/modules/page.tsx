"use client";
import React, { useState, useEffect } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ModuleItem = {
  id: string;
  title: string;
  createdAt: string;
  status: "publicado" | "rascunho";
};

export default function ModulesPage() {
  const router = useRouter();
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(true);

  function handleEdit(moduleId: string) {
    router.push(`/modules/${moduleId}`);
  }

  useEffect(() => {
    loadModules();
  }, []);

  async function loadModules() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedModules = data?.map(m => ({
        id: m.id,
        title: m.title,
        createdAt: new Date(m.created_at).toLocaleDateString('pt-BR'),
        status: m.status as "publicado" | "rascunho"
      })) || [];

      setModules(formattedModules);
    } catch (error: any) {
      console.error('Erro ao carregar módulos:', error);
      console.error('Detalhes do erro:', error.message, error.details, error.hint);
      toast.error(`Erro ao carregar módulos: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(m: ModuleItem) {
    if (!confirm(`Tem certeza que deseja excluir o módulo "${m.title}"?`)) return;

    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', m.id);

      if (error) throw error;

      setModules(modules.filter(mod => mod.id !== m.id));
      toast.success(`Módulo "${m.title}" excluído`);
    } catch (error: any) {
      console.error('Erro ao excluir módulo:', error);
      toast.error('Erro ao excluir módulo');
    }
  }

  async function handlePublish(m: ModuleItem) {
    try {
      const newStatus = m.status === 'publicado' ? 'rascunho' : 'publicado';

      const { error } = await supabase
        .from('modules')
        .update({ status: newStatus })
        .eq('id', m.id);

      if (error) throw error;

      setModules(modules.map(mod =>
        mod.id === m.id ? { ...mod, status: newStatus } : mod
      ));

      toast.success(`Módulo "${m.title}" ${newStatus === 'publicado' ? 'publicado' : 'despublicado'}`);
    } catch (error: any) {
      console.error('Erro ao atualizar módulo:', error);
      toast.error('Erro ao atualizar módulo');
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="section-title">Gerenciamento de Módulos</h2>
        <Card>
          <div className="p-8 text-center text-slate-500">
            Carregando módulos...
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="section-title">Gerenciamento de Módulos</h2>
        <Link href="/modules/new"><Button>Criar Novo Módulo</Button></Link>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                    Nenhum módulo criado ainda
                  </TableCell>
                </TableRow>
              ) : (
                modules.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.title}</TableCell>
                    <TableCell>{m.createdAt}</TableCell>
                    <TableCell>
                      <Badge variant={m.status === "publicado" ? "success" : "warning"}>{m.status === "publicado" ? "Publicado" : "Rascunho"}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="sm">Ações</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleEdit(m.id)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handlePublish(m)}>
                            {m.status === 'publicado' ? 'Despublicar' : 'Publicar'} Módulo
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onSelect={() => handleDelete(m)}>Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}