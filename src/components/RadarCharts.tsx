import React from 'react';
import dynamic from 'next/dynamic';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

type RadarComparisonProps = {
    studentPerformances: any[];
    moduleStats: any[];
};

export function RadarComparison({ studentPerformances, moduleStats }: RadarComparisonProps) {
    const topStudent = studentPerformances[0];

    const option = {
        title: {
            text: 'Melhor Aluno vs Média da Turma',
            left: 'center',
            top: 15,
            textStyle: { fontSize: 16, fontWeight: 600, color: '#0f172a' }
        },
        tooltip: { trigger: 'item' },
        legend: {
            bottom: 15,
            left: 'center',
            data: ['Melhor Aluno', 'Média da Turma'],
            textStyle: { fontSize: 11 }
        },
        radar: {
            center: ['50%', '52%'],
            radius: '60%',
            indicator: moduleStats.map(m => ({
                name: m.moduleName.length > 20 ? m.moduleName.substring(0, 18) + '...' : m.moduleName,
                max: 100
            })),
            shape: 'polygon',
            splitNumber: 4,
            axisName: { color: '#475569', fontSize: 10 },
            splitLine: { lineStyle: { color: '#e2e8f0' } }
        },
        series: topStudent && moduleStats.length > 0 ? [{
            type: 'radar',
            data: [
                {
                    value: topStudent.moduleScores.map((ms: any) => ms.score),
                    name: 'Melhor Aluno',
                    areaStyle: { color: 'rgba(139, 92, 246, 0.2)' },
                    lineStyle: { width: 3, color: '#8b5cf6' },
                    itemStyle: { color: '#8b5cf6' }
                },
                {
                    value: moduleStats.map(m => m.averageScore),
                    name: 'Média da Turma',
                    areaStyle: { color: 'rgba(59, 130, 246, 0.2)' },
                    lineStyle: { width: 3, color: '#3b82f6' },
                    itemStyle: { color: '#3b82f6' }
                }
            ]
        }] : []
    };

    return <ReactECharts option={option} style={{ height: '450px' }} />;
}

export function RadarTopBottom({ studentPerformances, moduleStats }: RadarComparisonProps) {
    const top3 = studentPerformances.slice(0, 3);
    const bottom3 = studentPerformances.slice(-3).reverse();

    const option = {
        title: {
            text: 'Top 3 vs Bottom 3 Alunos',
            left: 'center',
            top: 15,
            textStyle: { fontSize: 16, fontWeight: 600, color: '#0f172a' }
        },
        tooltip: { trigger: 'item' },
        legend: {
            bottom: 15,
            left: 'center',
            textStyle: { fontSize: 10 },
            itemGap: 8
        },
        radar: {
            center: ['50%', '52%'],
            radius: '58%',
            indicator: moduleStats.map(m => ({
                name: m.moduleName.length > 18 ? m.moduleName.substring(0, 16) + '...' : m.moduleName,
                max: 100
            })),
            shape: 'polygon',
            splitNumber: 4,
            axisName: { color: '#475569', fontSize: 9 },
            splitLine: { lineStyle: { color: '#e2e8f0' } }
        },
        series: studentPerformances.length >= 3 && moduleStats.length > 0 ? [{
            type: 'radar',
            data: [
                ...top3.map((s: any, i: number) => ({
                    value: moduleStats.map(m => s.moduleScores.find((ms: any) => ms.moduleName === m.moduleName)?.score || 0),
                    name: s.studentName + ' (Top)',
                    lineStyle: { width: 2, color: ['#22c55e', '#16a34a', '#15803d'][i] },
                    areaStyle: { opacity: 0.1 },
                    itemStyle: { color: ['#22c55e', '#16a34a', '#15803d'][i] }
                })),
                ...bottom3.map((s: any, i: number) => ({
                    value: moduleStats.map(m => s.moduleScores.find((ms: any) => ms.moduleName === m.moduleName)?.score || 0),
                    name: s.studentName + ' (Bottom)',
                    lineStyle: { width: 2, color: ['#ef4444', '#dc2626', '#b91c1c'][i], type: 'dashed' },
                    areaStyle: { opacity: 0.1 },
                    itemStyle: { color: ['#ef4444', '#dc2626', '#b91c1c'][i] }
                }))
            ]
        }] : []
    };

    return <ReactECharts option={option} style={{ height: '450px' }} />;
}
