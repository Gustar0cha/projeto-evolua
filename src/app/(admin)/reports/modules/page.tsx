"use client";
import React, { useState, useEffect } from "react";
import Card from "@/components/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import Badge from "@/components/Badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Força renderização dinâmica para evitar erros de build
export const dynamic = "force-dynamic";

type ModuleReport = {
  id: string;
  title: string;
  status: 'publicado' | 'rascunho';
  total_users: number;
  completed: number;
  in_progress: number;
  pending: number;
  avg_score: number;
};

export default function ModulesReportPage() {
  const [modules, setModules] = useState<ModuleReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModulesReport();
  }, []);

  async function loadModulesReport() {
    try {
      setLoading(true);

      const { data: modulesData, error } = await supabase
        .from('modules')
        .select(`
          id,
          title,
          status,
          user_module_progress(
            status,
            final_score
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const report: ModuleReport[] = modulesData?.map((module: any) => {
        const progress = module.user_module_progress || [];
        const completed = progress.filter((p: any) => p.status === 'concluido').length;
        const inProgress = progress.filter((p: any) => p.status === 'em_andamento').length;
        const pending = progress.filter((p: any) => p.status === 'nao_iniciado').length;

        const scores = progress
          .filter((p: any) => p.final_score !== null)
          .map((p: any) => p.final_score);
        const avgScore = scores.length > 0
          ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
          : 0;

        return {
          id: module.id,
          title: module.title,
          status: module.status,
          total_users: progress.length,
          completed,
          in_progress: inProgress,
          pending,
          avg_score: avgScore,
        };
      }) || [];

      setModules(report);
    } catch (error: any) {
      console.error('Erro ao carregar relatório de módulos:', error);
      toast.error('Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="section-title">Relatório de Módulos</h2>

      <Card>
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Módulo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Usuários</TableHead>
                <TableHead>Concluídos</TableHead>
                <TableHead>Em Andamento</TableHead>
                <TableHead>Pendentes</TableHead>
                <TableHead>Média de Pontuação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                    Nenhum módulo encontrado
                  </TableCell>
                </TableRow>
              ) : (
                modules.map((module) => (
                  <TableRow key={module.id}>
                    <TableCell className="font-medium">{module.title}</TableCell>
                    <TableCell>
                      <Badge variant={module.status === 'publicado' ? 'success' : 'warning'}>
                        {module.status === 'publicado' ? 'Publicado' : 'Rascunho'}
                      </Badge>
                    </TableCell>
                    <TableCell>{module.total_users}</TableCell>
                    <TableCell>{module.completed}</TableCell>
                    <TableCell>{module.in_progress}</TableCell>
                    <TableCell>{module.pending}</TableCell>
                    <TableCell>{module.avg_score > 0 ? `${module.avg_score}%` : '-'}</TableCell>
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
