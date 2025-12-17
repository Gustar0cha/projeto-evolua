"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import dynamic from 'next/dynamic';
import {
  AcademicCapIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon,
  CheckCircleIcon,
  UserGroupIcon,
  TrophyIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

// Força renderização dinâmica para evitar erros de build
export const dynamicRendering = "force-dynamic";

type DashboardStats = {
  totalStudents: number;
  totalModules: number;
  totalQuestions: number;
  averageScore: number;
  completionRate: number;
  activeStudents: number;
};

type StudentPerformance = {
  studentName: string;
  moduleScores: { moduleName: string; score: number }[];
  averageScore: number;
  completedModules: number;
};

type ModuleStats = {
  moduleName: string;
  totalStudents: number;
  completed: number;
  averageScore: number;
  completionRate: number;
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalModules: 0,
    totalQuestions: 0,
    averageScore: 0,
    completionRate: 0,
    activeStudents: 0
  });
  const [studentPerformances, setStudentPerformances] = useState<StudentPerformance[]>([]);
  const [moduleStats, setModuleStats] = useState<ModuleStats[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);

      // ✅ OTIMIZAÇÃO: Buscar TODOS os dados em paralelo (5 queries em vez de 100+)
      const [
        { data: students },
        { data: modules },
        { data: questions },
        { data: allProgress },
        { data: allAnswers }
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, name')
          .eq('role', 'colaborador')
          .eq('active', true),
        supabase
          .from('modules')
          .select('id, title')
          .eq('status', 'publicado'),
        supabase
          .from('quiz_questions')
          .select('id'),
        supabase
          .from('user_module_progress')
          .select('status, user_id, module_id'),
        supabase
          .from('user_quiz_answers')
          .select('user_id, module_id, is_correct')
      ]);

      // ✅ Processar dados em memória (sem queries adicionais)
      const completed = allProgress?.filter(p => p.status === 'concluido').length || 0;
      const total = allProgress?.length || 1;
      const activeStudentsSet = new Set(allProgress?.map(p => p.user_id) || []);

      // Criar maps para lookup rápido
      const answersByUser = new Map<string, typeof allAnswers>();
      const answersByModule = new Map<string, typeof allAnswers>();
      allAnswers?.forEach(answer => {
        // Por usuário
        const userAnswers = answersByUser.get(answer.user_id) || [];
        userAnswers.push(answer);
        answersByUser.set(answer.user_id, userAnswers);
        // Por módulo
        const moduleAnswers = answersByModule.get(answer.module_id) || [];
        moduleAnswers.push(answer);
        answersByModule.set(answer.module_id, moduleAnswers);
      });

      const progressByUser = new Map<string, typeof allProgress>();
      const progressByModule = new Map<string, typeof allProgress>();
      allProgress?.forEach(progress => {
        // Por usuário
        const userProgress = progressByUser.get(progress.user_id) || [];
        userProgress.push(progress);
        progressByUser.set(progress.user_id, userProgress);
        // Por módulo
        const moduleProgress = progressByModule.get(progress.module_id) || [];
        moduleProgress.push(progress);
        progressByModule.set(progress.module_id, moduleProgress);
      });

      const modulesMap = new Map(modules?.map(m => [m.id, m]) || []);

      // ✅ Calcular performance dos alunos SEM queries adicionais
      const studentPerfs: StudentPerformance[] = (students || []).map(student => {
        const answers = answersByUser.get(student.id) || [];
        const progress = progressByUser.get(student.id) || [];

        const moduleScoresMap: Record<string, { correct: number; total: number; name: string }> = {};

        for (const answer of answers) {
          if (!moduleScoresMap[answer.module_id]) {
            const module = modulesMap.get(answer.module_id);
            moduleScoresMap[answer.module_id] = {
              correct: 0,
              total: 0,
              name: module?.title || 'Módulo'
            };
          }
          moduleScoresMap[answer.module_id].total++;
          if (answer.is_correct) {
            moduleScoresMap[answer.module_id].correct++;
          }
        }

        const moduleScores = Object.values(moduleScoresMap).map(m => ({
          moduleName: m.name,
          score: m.total > 0 ? Math.round((m.correct / m.total) * 100) : 0
        }));

        const avgScore = moduleScores.length > 0
          ? Math.round(moduleScores.reduce((sum, m) => sum + m.score, 0) / moduleScores.length)
          : 0;

        return {
          studentName: student.name,
          moduleScores,
          averageScore: avgScore,
          completedModules: progress.filter(p => p.status === 'concluido').length
        };
      });

      // ✅ Calcular stats dos módulos SEM queries adicionais
      const modStats: ModuleStats[] = (modules || []).map(module => {
        const moduleProgress = progressByModule.get(module.id) || [];
        const moduleAnswers = answersByModule.get(module.id) || [];

        const completedCount = moduleProgress.filter(p => p.status === 'concluido').length;
        const correctAnswers = moduleAnswers.filter(a => a.is_correct).length;
        const totalAnswers = moduleAnswers.length || 1;
        const avgScore = Math.round((correctAnswers / totalAnswers) * 100);

        return {
          moduleName: module.title,
          totalStudents: moduleProgress.length,
          completed: completedCount,
          averageScore: avgScore,
          completionRate: moduleProgress.length ? Math.round((completedCount / moduleProgress.length) * 100) : 0
        };
      });

      setStats({
        totalStudents: students?.length || 0,
        totalModules: modules?.length || 0,
        totalQuestions: questions?.length || 0,
        averageScore: studentPerfs.length > 0
          ? Math.round(studentPerfs.reduce((sum, s) => sum + s.averageScore, 0) / studentPerfs.length)
          : 0,
        completionRate: Math.round((completed / total) * 100),
        activeStudents: activeStudentsSet.size
      });

      setStudentPerformances(studentPerfs.sort((a, b) => b.averageScore - a.averageScore));
      setModuleStats(modStats);

    } catch (error: any) {
      console.error('Erro ao carregar dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  }

  const radarOption = {
    title: {
      text: 'Performance por Módulo - Top 5 Alunos',
      left: 'center',
      textStyle: { fontSize: 18, fontWeight: 600, color: '#0f172a' }
    },
    tooltip: { trigger: 'item' },
    legend: {
      bottom: 10,
      data: studentPerformances.slice(0, 5).map(s => s.studentName),
      textStyle: { fontSize: 12 }
    },
    radar: {
      indicator: moduleStats.length > 0
        ? moduleStats.map(m => ({
          name: m.moduleName.length > 25 ? m.moduleName.substring(0, 22) + '...' : m.moduleName,
          max: 100
        }))
        : [{ name: 'Sem dados', max: 100 }],
      shape: 'polygon',
      splitNumber: 5,
      axisName: { color: '#475569', fontSize: 11 },
      splitLine: { lineStyle: { color: '#e2e8f0' } },
      splitArea: {
        areaStyle: {
          color: ['rgba(0, 95, 143, 0.05)', 'rgba(0, 95, 143, 0.1)']
        }
      }
    },
    series: moduleStats.length > 0 && studentPerformances.length > 0 ? [{
      type: 'radar',
      data: studentPerformances.slice(0, 5).map((student, idx) => ({
        value: moduleStats.map(module => {
          const score = student.moduleScores.find(ms => ms.moduleName === module.moduleName);
          return score?.score || 0;
        }),
        name: student.studentName,
        areaStyle: { opacity: 0.15 + (idx * 0.05) },
        lineStyle: { width: 2 }
      }))
    }] : []
  };

  const barOption = {
    title: {
      text: 'Desempenho Médio por Módulo',
      left: 'center',
      textStyle: { fontSize: 18, fontWeight: 600, color: '#0f172a' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const data = params[0];
        return `${data.name}<br/>Média: <strong>${data.value}%</strong>`;
      }
    },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: moduleStats.map(m => m.moduleName),
      axisLabel: {
        rotate: 30,
        interval: 0,
        fontSize: 11,
        color: '#475569'
      }
    },
    yAxis: {
      type: 'value',
      max: 100,
      name: 'Pontuação (%)',
      nameTextStyle: { color: '#475569' },
      axisLabel: { color: '#475569' }
    },
    series: [{
      type: 'bar',
      data: moduleStats.map(m => ({
        value: m.averageScore,
        itemStyle: {
          color: m.averageScore >= 70 ? '#22c55e' : m.averageScore >= 50 ? '#f59e0b' : '#ef4444',
          borderRadius: [8, 8, 0, 0]
        }
      })),
      barWidth: '60%',
      label: {
        show: true,
        position: 'top',
        formatter: '{c}%',
        fontWeight: 600,
        color: '#0f172a'
      }
    }]
  };

  const pieOption = {
    title: {
      text: 'Taxa de Conclusão Geral',
      left: 'center',
      top: 15,
      textStyle: { fontSize: 16, fontWeight: 600, color: '#0f172a' }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: <strong>{d}%</strong>'
    },
    legend: {
      bottom: 15,
      left: 'center',
      textStyle: { fontSize: 11 },
      itemGap: 20
    },
    series: [{
      type: 'pie',
      center: ['50%', '52%'],
      radius: ['40%', '65%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 3
      },
      label: {
        show: true,
        formatter: '{b}\n{d}%',
        fontSize: 14,
        fontWeight: 600
      },
      emphasis: {
        label: { fontSize: 16, fontWeight: 700 }
      },
      data: [
        {
          value: stats.completionRate,
          name: 'Concluído',
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#22c55e' },
                { offset: 1, color: '#16a34a' }
              ]
            }
          }
        },
        {
          value: 100 - stats.completionRate,
          name: 'Pendente',
          itemStyle: { color: '#e2e8f0' }
        }
      ]
    }]
  };

  const lineOption = {
    title: {
      text: 'Ranking de Alunos por Desempenho',
      left: 'center',
      textStyle: { fontSize: 18, fontWeight: 600, color: '#0f172a' }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0];
        return `${data.name}<br/>Média: <strong>${data.value}%</strong>`;
      }
    },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: studentPerformances.map(s => s.studentName),
      axisLabel: {
        rotate: 30,
        interval: 0,
        fontSize: 11,
        color: '#475569'
      }
    },
    yAxis: {
      type: 'value',
      max: 100,
      name: 'Média (%)',
      nameTextStyle: { color: '#475569' },
      axisLabel: { color: '#475569' }
    },
    series: [{
      type: 'line',
      data: studentPerformances.map(s => s.averageScore),
      smooth: true,
      lineStyle: {
        width: 3,
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: '#3b82f6' },
            { offset: 1, color: '#8b5cf6' }
          ]
        }
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
            { offset: 1, color: 'rgba(139, 92, 246, 0.05)' }
          ]
        }
      },
      itemStyle: { color: '#3b82f6', borderWidth: 2, borderColor: '#fff' },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}%',
        fontSize: 11,
        fontWeight: 600
      }
    }]
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-primary mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ChartBarIcon className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-slate-600 mt-4 font-medium">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard de Desempenho</h1>
            <p className="text-slate-600 mt-1">Visão geral do progresso dos alunos</p>
          </div>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <ClockIcon className="h-5 w-5 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Atualizar</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total de Alunos</p>
                <p className="text-4xl font-bold mt-2">{stats.totalStudents}</p>
                <p className="text-blue-100 text-xs mt-1">{stats.activeStudents} ativos</p>
              </div>
              <UserGroupIcon className="h-16 w-16 text-blue-300 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Módulos Publicados</p>
                <p className="text-4xl font-bold mt-2">{stats.totalModules}</p>
                <p className="text-green-100 text-xs mt-1">{stats.totalQuestions} questões</p>
              </div>
              <BookOpenIcon className="h-16 w-16 text-green-300 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Média Geral</p>
                <p className="text-4xl font-bold mt-2">{stats.averageScore}%</p>
                <p className="text-purple-100 text-xs mt-1">
                  {stats.averageScore >= 70 ? '🎉 Excelente!' : stats.averageScore >= 50 ? '👍 Bom' : '⚠️ Precisa melhorar'}
                </p>
              </div>
              <TrophyIcon className="h-16 w-16 text-purple-300 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Taxa de Conclusão</p>
                <p className="text-4xl font-bold mt-2">{stats.completionRate}%</p>
                <div className="w-full bg-orange-400 rounded-full h-2 mt-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all duration-500"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>
              <CheckCircleIcon className="h-16 w-16 text-orange-300 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm font-medium">Total de Questões</p>
                <p className="text-4xl font-bold mt-2">{stats.totalQuestions}</p>
                <p className="text-pink-100 text-xs mt-1">Respondidas pelos alunos</p>
              </div>
              <QuestionMarkCircleIcon className="h-16 w-16 text-pink-300 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Melhor Aluno</p>
                <p className="text-xl font-bold mt-2 truncate">
                  {studentPerformances[0]?.studentName || 'N/A'}
                </p>
                <p className="text-indigo-100 text-xs mt-1">
                  {studentPerformances[0]?.averageScore || 0}% de média
                </p>
              </div>
              <AcademicCapIcon className="h-16 w-16 text-indigo-300 opacity-50" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <ReactECharts option={radarOption} style={{ height: '450px' }} />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <ReactECharts option={pieOption} style={{ height: '450px' }} />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg lg:col-span-2">
            <ReactECharts option={barOption} style={{ height: '450px' }} />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg lg:col-span-2">
            <ReactECharts option={lineOption} style={{ height: '450px' }} />
          </div>
        </div>

        {/* Detailed Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-900">Detalhes por Módulo</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Módulo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Alunos</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Concluídos</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Média</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Taxa</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {moduleStats.map((module, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold mr-3">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-slate-900">{module.moduleName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{module.totalStudents}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{module.completed}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${module.averageScore >= 70 ? 'bg-green-100 text-green-800' :
                        module.averageScore >= 50 ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {module.averageScore}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-1 bg-slate-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-gradient-to-r from-primary to-blue-600 rounded-full h-2 transition-all duration-500"
                            style={{ width: `${module.completionRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-600">{module.completionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
