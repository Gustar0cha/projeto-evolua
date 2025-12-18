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
  BookOpen,
  Users,
  TrendingUp,
  CheckCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  X,
  Download,
  Award,
  Clock
} from "lucide-react";

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
  completion_rate: number;
};

type StudentProgress = {
  user_id: string;
  user_name: string;
  user_email: string;
  status: string;
  score_percent: number | null;
  completed_at: string | null;
};

type ModuleDetail = {
  id: string;
  title: string;
  status: string;
  students: StudentProgress[];
};

export default function ModulesReportPage() {
  const [modules, setModules] = useState<ModuleReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof ModuleReport>("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedModule, setSelectedModule] = useState<ModuleDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Estatísticas gerais
  const totalModules = modules.length;
  const publishedModules = modules.filter(m => m.status === 'publicado').length;
  const avgCompletionRate = modules.length > 0
    ? Math.round(modules.reduce((sum, m) => sum + m.completion_rate, 0) / modules.length)
    : 0;
  const avgScore = modules.filter(m => m.avg_score > 0).length > 0
    ? Math.round(modules.filter(m => m.avg_score > 0).reduce((sum, m) => sum + m.avg_score, 0) / modules.filter(m => m.avg_score > 0).length)
    : 0;

  useEffect(() => {
    loadModulesReport();
  }, []);

  async function loadModulesReport() {
    try {
      setLoading(true);

      console.log('🔍 Carregando relatório de módulos...');

      const { data: modulesData, error } = await supabase
        .from('modules')
        .select(`
          id,
          title,
          status,
          user_module_progress(
            status,
            score_percent
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro na query:', error);
        throw error;
      }

      console.log('📊 Módulos encontrados:', modulesData?.length || 0);

      const report: ModuleReport[] = (modulesData || []).map((module: any) => {
        const progress = module.user_module_progress || [];
        const completed = progress.filter((p: any) => p.status === 'concluido').length;
        const inProgress = progress.filter((p: any) => p.status === 'em_andamento').length;
        const pending = progress.length - completed - inProgress;

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
          id: module.id,
          title: module.title,
          status: module.status,
          total_users: progress.length,
          completed,
          in_progress: inProgress,
          pending: pending > 0 ? pending : 0,
          avg_score: avgScore,
          completion_rate: completionRate,
        };
      });

      setModules(report);
    } catch (error: any) {
      console.error('Erro ao carregar relatório de módulos:', error);
      toast.error('Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  }

  async function loadModuleDetail(moduleId: string) {
    try {
      setLoadingDetail(true);

      // Buscar dados do módulo
      const { data: moduleData, error: moduleError } = await supabase
        .from('modules')
        .select('id, title, status')
        .eq('id', moduleId)
        .single();

      if (moduleError) throw moduleError;

      // Buscar progresso com detalhes dos usuários
      const { data: progressData, error: progressError } = await supabase
        .from('user_module_progress')
        .select(`
          user_id,
          status,
          score_percent,
          completed_at,
          profiles:user_id(name, email)
        `)
        .eq('module_id', moduleId);

      if (progressError) throw progressError;

      const students: StudentProgress[] = (progressData || []).map((p: any) => ({
        user_id: p.user_id,
        user_name: p.profiles?.name || 'Sem nome',
        user_email: p.profiles?.email || 'Sem email',
        status: p.status,
        score_percent: p.score_percent ? Number(p.score_percent) : null,
        completed_at: p.completed_at
      }));

      setSelectedModule({
        id: moduleData.id,
        title: moduleData.title,
        status: moduleData.status,
        students
      });
    } catch (error: any) {
      console.error('Erro ao carregar detalhes do módulo:', error);
      toast.error('Erro ao carregar detalhes');
    } finally {
      setLoadingDetail(false);
    }
  }

  // Filtrar e ordenar módulos
  const filteredModules = modules
    .filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()))
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

  function handleSort(field: keyof ModuleReport) {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }

  function SortIcon({ field }: { field: keyof ModuleReport }) {
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

  // Calcular estatísticas do módulo
  function getModuleStats() {
    if (!selectedModule) return { completed: 0, inProgress: 0, avgScore: 0 };
    const completed = selectedModule.students.filter(s => s.status === 'concluido').length;
    const inProgress = selectedModule.students.filter(s => s.status === 'em_andamento').length;
    const scores = selectedModule.students
      .filter(s => s.score_percent !== null)
      .map(s => s.score_percent as number);
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    return { completed, inProgress, avgScore };
  }

  // Exportar relatório do módulo em PDF
  function exportModulePDF() {
    if (!selectedModule) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const stats = getModuleStats();

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Relatório de Módulo", 40, 40);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Módulo: ${selectedModule.title}`, 40, 70);
    doc.text(`Status: ${selectedModule.status === 'publicado' ? 'Publicado' : 'Rascunho'}`, 40, 88);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 40, 106);

    // Estatísticas resumidas
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Resumo", 40, 140);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Total de Colaboradores: ${selectedModule.students.length}`, 40, 160);
    doc.text(`Concluídos: ${stats.completed}`, 40, 178);
    doc.text(`Em Andamento: ${stats.inProgress}`, 40, 196);
    doc.text(`Média Geral: ${stats.avgScore > 0 ? stats.avgScore + '%' : 'N/A'}`, 40, 214);

    // Tabela de alunos
    if (selectedModule.students.length > 0) {
      autoTable(doc, {
        startY: 240,
        head: [["Colaborador", "Email", "Status", "Nota", "Concluído em"]],
        body: selectedModule.students.map(s => [
          s.user_name,
          s.user_email,
          getStatusLabel(s.status),
          s.score_percent !== null ? `${s.score_percent}%` : '-',
          s.completed_at ? new Date(s.completed_at).toLocaleDateString('pt-BR') : '-'
        ]),
        theme: "striped",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [34, 197, 94], textColor: 255 },
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
    const fileName = `relatorio-modulo-${selectedModule.title.toLowerCase().replace(/\s+/g, '-').substring(0, 30)}-${new Date().toISOString().split('T')[0]}.pdf`;
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
        <h2 className="section-title">Relatório de Módulos</h2>
        <Button variant="secondary" onClick={loadModulesReport}>
          Atualizar
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-700 font-medium">Total de Módulos</p>
              <p className="text-2xl font-bold text-blue-900">{totalModules}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500 rounded-xl">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-700 font-medium">Publicados</p>
              <p className="text-2xl font-bold text-green-900">{publishedModules}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-purple-700 font-medium">Taxa Média Conclusão</p>
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
              <p className="text-sm text-amber-700 font-medium">Média Geral de Notas</p>
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
              placeholder="Buscar por nome do módulo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <span className="text-sm text-slate-500">
            {filteredModules.length} de {modules.length} módulos
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
                  onClick={() => handleSort('title')}
                >
                  Módulo <SortIcon field="title" />
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-slate-50 transition-colors text-center"
                  onClick={() => handleSort('total_users')}
                >
                  Usuários <SortIcon field="total_users" />
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
              {filteredModules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    {searchTerm ? (
                      <div className="text-slate-500">
                        Nenhum módulo encontrado com esses termos
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <BookOpen className="w-12 h-12 mx-auto text-slate-300" />
                        <p className="text-slate-600 font-medium">Nenhum módulo cadastrado</p>
                        <p className="text-sm text-slate-500">
                          Crie módulos em <strong>Módulos</strong> para ver relatórios aqui.
                        </p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredModules.map((module) => (
                  <TableRow key={module.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium max-w-[250px] truncate">{module.title}</TableCell>
                    <TableCell>
                      <Badge variant={module.status === 'publicado' ? 'success' : 'warning'}>
                        {module.status === 'publicado' ? 'Publicado' : 'Rascunho'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{module.total_users}</TableCell>
                    <TableCell className="text-center">
                      <span className="text-green-600 font-medium">{module.completed}</span>
                      {module.in_progress > 0 && (
                        <span className="text-slate-400 text-xs ml-1">
                          (+{module.in_progress})
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={module.completion_rate >= 70 ? 'success' : module.completion_rate >= 40 ? 'warning' : 'danger'}>
                        {module.completion_rate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {module.avg_score > 0 ? (
                        <Badge variant={module.avg_score >= 70 ? 'success' : module.avg_score >= 50 ? 'warning' : 'danger'}>
                          {module.avg_score}%
                        </Badge>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => loadModuleDetail(module.id)}
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

      {/* Modal de Detalhes do Módulo */}
      {selectedModule && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{selectedModule.title}</h3>
                  <p className="text-white/80 text-sm">
                    {selectedModule.status === 'publicado' ? '📢 Publicado' : '📝 Rascunho'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedModule(null)}
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
              ) : selectedModule.students.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>Nenhum colaborador iniciou este módulo ainda.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cards de Resumo */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-700">{selectedModule.students.length}</p>
                      <p className="text-xs text-blue-600">Colaboradores</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-700">
                        {getModuleStats().completed}
                      </p>
                      <p className="text-xs text-green-600">Concluíram</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-700">
                        {getModuleStats().avgScore > 0 ? `${getModuleStats().avgScore}%` : '-'}
                      </p>
                      <p className="text-xs text-purple-600">Média</p>
                    </div>
                  </div>

                  <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Colaboradores ({selectedModule.students.length})
                  </h4>

                  <div className="space-y-3">
                    {selectedModule.students.map((student) => (
                      <div
                        key={student.user_id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{student.user_name}</p>
                          <p className="text-xs text-slate-500">{student.user_email}</p>
                          {student.completed_at && (
                            <p className="text-xs text-slate-500 mt-1">
                              Concluído em: {new Date(student.completed_at).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {student.score_percent !== null && (
                            <Badge variant={student.score_percent >= 70 ? 'success' : student.score_percent >= 50 ? 'warning' : 'danger'}>
                              {student.score_percent}%
                            </Badge>
                          )}
                          <Badge variant={getStatusVariant(student.status)}>
                            {getStatusLabel(student.status)}
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
                onClick={() => setSelectedModule(null)}
              >
                Fechar
              </Button>
              {selectedModule.students.length > 0 && (
                <Button
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={exportModulePDF}
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
