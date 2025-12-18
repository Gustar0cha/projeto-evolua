"use client";
import React, { useState, useEffect } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import Badge from "@/components/Badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Users,
  TrendingUp,
  CheckCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  X,
  BookOpen,
  Award,
  Download
} from "lucide-react";

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

type ModuleProgress = {
  module_id: string;
  module_title: string;
  status: string;
  final_score: number | null;
  completed_at: string | null;
};

type StudentDetail = {
  id: string;
  name: string;
  email: string;
  modules: ModuleProgress[];
};

export default function StudentsReportPage() {
  const [students, setStudents] = useState<StudentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof StudentReport>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Estatísticas gerais
  const totalStudents = students.length;
  const avgCompletionRate = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + s.completion_rate, 0) / students.length)
    : 0;
  const avgScore = students.filter(s => s.avg_score > 0).length > 0
    ? Math.round(students.filter(s => s.avg_score > 0).reduce((sum, s) => sum + s.avg_score, 0) / students.filter(s => s.avg_score > 0).length)
    : 0;
  const totalCompleted = students.reduce((sum, s) => sum + s.completed, 0);

  useEffect(() => {
    loadStudentsReport();
  }, []);

  async function loadStudentsReport() {
    try {
      setLoading(true);

      console.log('🔍 Iniciando busca de colaboradores...');

      // Buscar colaboradores com seus progressos
      let { data: profilesData, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          role,
          active,
          user_module_progress(
            status,
            score_percent
          )
        `)
        .eq('role', 'colaborador')
        .order('name', { ascending: true });

      console.log('📊 Resultado da query:', {
        count: profilesData?.length || 0,
        error: error?.message || 'sem erro',
        data: profilesData
      });

      if (error) {
        console.error('❌ Erro na query de profiles:', error);
        throw error;
      }

      // Se não encontrou dados, tenta buscar todos os profiles para debug
      if (!profilesData || profilesData.length === 0) {
        console.log('⚠️ Nenhum colaborador encontrado. Tentando buscar todos os profiles...');

        const { data: allProfiles, error: allError } = await supabase
          .from('profiles')
          .select('id, name, role, active')
          .limit(10);

        console.log('📋 Todos os profiles (debug):', allProfiles, allError);
      }

      // Não filtrar por active - mostrar todos os colaboradores
      console.log('✅ Colaboradores encontrados:', profilesData?.length || 0);

      const report: StudentReport[] = (profilesData || []).map((profile: any) => {
        const progress = profile.user_module_progress || [];
        const completed = progress.filter((p: any) => p.status === 'concluido').length;
        const inProgress = progress.filter((p: any) => p.status === 'em_andamento').length;

        // Calcular média usando score_percent
        const scores = progress
          .filter((p: any) => p.score_percent !== null && p.score_percent !== undefined)
          .map((p: any) => Number(p.score_percent));
        const avgScore = scores.length > 0
          ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
          : 0;

        const completionRate = progress.length > 0
          ? Math.round((completed / progress.length) * 100)
          : 0;

        return {
          id: profile.id,
          name: profile.name || 'Sem nome',
          email: profile.email || 'Sem email',
          total_modules: progress.length,
          completed,
          in_progress: inProgress,
          avg_score: avgScore,
          completion_rate: completionRate,
        };
      });

      setStudents(report);
    } catch (error: any) {
      console.error('Erro ao carregar relatório de estudantes:', error);
      toast.error('Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  }

  async function loadStudentDetail(studentId: string) {
    try {
      setLoadingDetail(true);

      // Buscar dados do aluno
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('id', studentId)
        .single();

      if (profileError) throw profileError;

      // Buscar progresso com detalhes dos módulos
      const { data: progressData, error: progressError } = await supabase
        .from('user_module_progress')
        .select(`
          module_id,
          status,
          score_percent,
          completed_at,
          modules:module_id(title)
        `)
        .eq('user_id', studentId);

      if (progressError) throw progressError;

      const modules: ModuleProgress[] = (progressData || []).map((p: any) => ({
        module_id: p.module_id,
        module_title: p.modules?.title || 'Módulo sem título',
        status: p.status,
        final_score: p.score_percent ? Number(p.score_percent) : null,
        completed_at: p.completed_at
      }));

      setSelectedStudent({
        id: profileData.id,
        name: profileData.name || 'Sem nome',
        email: profileData.email || 'Sem email',
        modules
      });
    } catch (error: any) {
      console.error('Erro ao carregar detalhes do aluno:', error);
      toast.error('Erro ao carregar detalhes');
    } finally {
      setLoadingDetail(false);
    }
  }

  // Filtrar e ordenar alunos
  const filteredStudents = students
    .filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

  function handleSort(field: keyof StudentReport) {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }

  function SortIcon({ field }: { field: keyof StudentReport }) {
    if (sortField !== field) return null;
    return sortDirection === 'asc'
      ? <ChevronUp className="w-4 h-4 inline ml-1" />
      : <ChevronDown className="w-4 h-4 inline ml-1" />;
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'concluido': return 'Concluído';
      case 'em_andamento': return 'Em Andamento';
      default: return 'Pendente';
    }
  }

  function getStatusVariant(status: string): 'success' | 'info' | 'warning' {
    switch (status) {
      case 'concluido': return 'success';
      case 'em_andamento': return 'info';
      default: return 'warning';
    }
  }

  // Calcular média do aluno selecionado
  function getStudentAverage(): number {
    if (!selectedStudent) return 0;
    const scores = selectedStudent.modules
      .filter(m => m.final_score !== null)
      .map(m => m.final_score as number);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  // Exportar relatório do aluno em PDF
  function exportStudentPDF() {
    if (!selectedStudent) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Relatório de Desempenho", 40, 40);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Colaborador: ${selectedStudent.name}`, 40, 70);
    doc.text(`Email: ${selectedStudent.email}`, 40, 88);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 40, 106);

    // Estatísticas resumidas
    const completed = selectedStudent.modules.filter(m => m.status === 'concluido').length;
    const inProgress = selectedStudent.modules.filter(m => m.status === 'em_andamento').length;
    const avgScore = getStudentAverage();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Resumo", 40, 140);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Total de Módulos: ${selectedStudent.modules.length}`, 40, 160);
    doc.text(`Concluídos: ${completed}`, 40, 178);
    doc.text(`Em Andamento: ${inProgress}`, 40, 196);
    doc.text(`Média Geral: ${avgScore > 0 ? avgScore + '%' : 'N/A'}`, 40, 214);

    // Tabela de módulos
    if (selectedStudent.modules.length > 0) {
      autoTable(doc, {
        startY: 240,
        head: [["Módulo", "Status", "Nota", "Concluído em"]],
        body: selectedStudent.modules.map(m => [
          m.module_title,
          getStatusLabel(m.status),
          m.final_score !== null ? `${m.final_score}%` : '-',
          m.completed_at ? new Date(m.completed_at).toLocaleDateString('pt-BR') : '-'
        ]),
        theme: "striped",
        styles: { fontSize: 10 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] }
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${pageCount} - Gerado em ${new Date().toLocaleString('pt-BR')}`,
        40,
        doc.internal.pageSize.height - 20
      );
    }

    // Salvar
    const fileName = `relatorio-${selectedStudent.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    toast.success('PDF gerado com sucesso!');
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
      <div className="flex items-center justify-between">
        <h2 className="section-title">Relatório de Colaboradores</h2>
        <Button variant="secondary" onClick={loadStudentsReport}>
          Atualizar
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-700 font-medium">Total de Colaboradores</p>
              <p className="text-2xl font-bold text-blue-900">{totalStudents}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500 rounded-xl">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-700 font-medium">Módulos Concluídos</p>
              <p className="text-2xl font-bold text-green-900">{totalCompleted}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-purple-700 font-medium">Taxa de Conclusão</p>
              <p className="text-2xl font-bold text-purple-900">{avgCompletionRate}%</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500 rounded-xl">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-amber-700 font-medium">Média de Notas</p>
              <p className="text-2xl font-bold text-amber-900">{avgScore > 0 ? `${avgScore}%` : '-'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Barra de Busca */}
      <Card>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <span className="text-sm text-slate-500">
            {filteredStudents.length} de {students.length} colaboradores
          </span>
        </div>
      </Card>

      {/* Tabela */}
      <Card>
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  Nome <SortIcon field="name" />
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-slate-50 transition-colors text-center"
                  onClick={() => handleSort('total_modules')}
                >
                  Módulos <SortIcon field="total_modules" />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-slate-50 transition-colors text-center"
                  onClick={() => handleSort('completed')}
                >
                  Concluídos <SortIcon field="completed" />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-slate-50 transition-colors text-center"
                  onClick={() => handleSort('completion_rate')}
                >
                  Taxa <SortIcon field="completion_rate" />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-slate-50 transition-colors text-center"
                  onClick={() => handleSort('avg_score')}
                >
                  Média <SortIcon field="avg_score" />
                </TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    {searchTerm ? (
                      <div className="text-slate-500">
                        Nenhum colaborador encontrado com esses termos
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Users className="w-12 h-12 mx-auto text-slate-300" />
                        <p className="text-slate-600 font-medium">Nenhum colaborador cadastrado</p>
                        <p className="text-sm text-slate-500 max-w-md mx-auto">
                          Para ver relatórios aqui, cadastre colaboradores em <strong>Usuários</strong> com a role "colaborador".
                          Eles aparecerão automaticamente após iniciarem os treinamentos.
                        </p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="text-slate-600">{student.email}</TableCell>
                    <TableCell className="text-center">{student.total_modules}</TableCell>
                    <TableCell className="text-center">
                      <span className="text-green-600 font-medium">{student.completed}</span>
                      {student.in_progress > 0 && (
                        <span className="text-slate-400 text-xs ml-1">
                          (+{student.in_progress} em andamento)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={student.completion_rate >= 70 ? 'success' : student.completion_rate >= 40 ? 'warning' : 'danger'}>
                        {student.completion_rate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {student.avg_score > 0 ? (
                        <Badge variant={student.avg_score >= 70 ? 'success' : student.avg_score >= 50 ? 'warning' : 'danger'}>
                          {student.avg_score}%
                        </Badge>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => loadStudentDetail(student.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modal de Detalhes do Aluno */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{selectedStudent.name}</h3>
                  <p className="text-white/80 text-sm">{selectedStudent.email}</p>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingDetail ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : selectedStudent.modules.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>Este colaborador ainda não iniciou nenhum módulo.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cards de Resumo */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-700">{selectedStudent.modules.length}</p>
                      <p className="text-xs text-blue-600">Módulos</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-700">
                        {selectedStudent.modules.filter(m => m.status === 'concluido').length}
                      </p>
                      <p className="text-xs text-green-600">Concluídos</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-700">
                        {getStudentAverage() > 0 ? `${getStudentAverage()}%` : '-'}
                      </p>
                      <p className="text-xs text-purple-600">Média</p>
                    </div>
                  </div>

                  <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Progresso por Módulo ({selectedStudent.modules.length})
                  </h4>

                  <div className="space-y-3">
                    {selectedStudent.modules.map((module) => (
                      <div
                        key={module.module_id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{module.module_title}</p>
                          {module.completed_at && (
                            <p className="text-xs text-slate-500 mt-1">
                              Concluído em: {new Date(module.completed_at).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {module.final_score !== null && (
                            <Badge variant={module.final_score >= 70 ? 'success' : module.final_score >= 50 ? 'warning' : 'danger'}>
                              {module.final_score}%
                            </Badge>
                          )}
                          <Badge variant={getStatusVariant(module.status)}>
                            {getStatusLabel(module.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 p-4 bg-slate-50 flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setSelectedStudent(null)}
              >
                Fechar
              </Button>
              {selectedStudent.modules.length > 0 && (
                <Button
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={exportStudentPDF}
                >
                  <Download className="w-4 h-4" />
                  Baixar PDF
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
