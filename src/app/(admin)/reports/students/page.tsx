"use client";
import React, { useState, useEffect } from "react";
import Card from "@/components/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import Badge from "@/components/Badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Força renderização dinâmica para evitar erros de build
export const dynamic = "force-dynamic";

type StudentReport = {
  id: string;
  name: string;
  email: string;
  total_modules: number;
  completed: number;
  in_progress: number;
  avg_score: number;
  completion_rate: number;
};

export default function StudentsReportPage() {
  const [students, setStudents] = useState<StudentReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentsReport();
  }, []);

  async function loadStudentsReport() {
    try {
      setLoading(true);

      // Buscar colaboradores com seus progressos
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          role,
          user_module_progress(
            status,
            final_score
          )
        `)
        .eq('role', 'colaborador')
        .eq('active', true);

      if (error) throw error;

      // Buscar emails dos usuários
      const report: StudentReport[] = [];

      for (const profile of profilesData || []) {
        const { data: { user } } = await supabase.auth.admin.getUserById(profile.id);

        const progress = profile.user_module_progress || [];
        const completed = progress.filter((p: any) => p.status === 'concluido').length;
        const inProgress = progress.filter((p: any) => p.status === 'em_andamento').length;

        const scores = progress
          .filter((p: any) => p.final_score !== null)
          .map((p: any) => p.final_score);
        const avgScore = scores.length > 0
          ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
          : 0;

        const completionRate = progress.length > 0
          ? Math.round((completed / progress.length) * 100)
          : 0;

        report.push({
          id: profile.id,
          name: profile.name,
          email: user?.email || 'Sem email',
          total_modules: progress.length,
          completed,
          in_progress: inProgress,
          avg_score: avgScore,
          completion_rate: completionRate,
        });
      }

      setStudents(report);
    } catch (error: any) {
      console.error('Erro ao carregar relatório de estudantes:', error);
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
      <h2 className="section-title">Relatório de Colaboradores</h2>

      <Card>
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Total Módulos</TableHead>
                <TableHead>Concluídos</TableHead>
                <TableHead>Em Andamento</TableHead>
                <TableHead>Taxa de Conclusão</TableHead>
                <TableHead>Média de Pontuação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                    Nenhum colaborador encontrado
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.total_modules}</TableCell>
                    <TableCell>{student.completed}</TableCell>
                    <TableCell>{student.in_progress}</TableCell>
                    <TableCell>
                      <Badge variant={student.completion_rate >= 70 ? 'success' : student.completion_rate >= 40 ? 'warning' : 'danger'}>
                        {student.completion_rate}%
                      </Badge>
                    </TableCell>
                    <TableCell>{student.avg_score > 0 ? `${student.avg_score}%` : '-'}</TableCell>
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
