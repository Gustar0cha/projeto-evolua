"use client";
import React, { useState } from "react";
import StatCard from "@/components/StatCard";
import Card from "@/components/Card";
import Select from "@/components/Select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Bar, Pie } from "react-chartjs-2";
import "@/lib/charts";
import RadarChart from "@/components/ui/radar-chart";
import { UserGroupIcon, Squares2X2Icon, CheckBadgeIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

// Colunas: conclusões mensais (últimos 6 meses)
const barData = {
  labels: ["Jun", "Jul", "Ago", "Set", "Out", "Nov"],
  datasets: [
    {
      label: "Conclusões por Mês",
      data: [40, 55, 52, 68, 72, 81],
      backgroundColor: "rgba(255, 157, 0, 0.6)",
      borderColor: "#ff9d00",
    },
  ],
};

// Radar: desempenho médio por turma (Shadcn + Recharts)
const radarAvgData = [
  { metric: "Turma A", avg: 78 },
  { metric: "Turma B", avg: 65 },
  { metric: "Turma C", avg: 84 },
  { metric: "Turma D", avg: 72 },
];

// Pizza: distribuição de status dos treinamentos
const pieData = {
  labels: ["Concluído", "Em Andamento", "Pendente"],
  datasets: [
    {
      label: "Status",
      data: [54, 28, 18],
      backgroundColor: ["#22c55e", "#ff9d00", "#b6771d"],
      borderColor: ["#16a34a", "#e68c00", "#9a6319"],
    },
  ],
};

// Radar por colaborador: módulos vs desempenho
const moduleLabels = ["Comunicação", "Segurança", "Qualidade", "Compliance", "Atendimento", "Produtividade"];
const collaboratorScores: Record<string, number[]> = {
  "João da Silva": [82, 74, 88, 69, 77, 85],
  "Maria Souza": [75, 80, 70, 83, 78, 72],
  "Carlos Lima": [68, 71, 76, 65, 70, 69],
  "Ana Pereira": [90, 84, 86, 88, 92, 87],
};
const collaborators = Object.keys(collaboratorScores);
const collaboratorOptions = collaborators.map((name) => ({ label: name, value: name }));

// Médias da turma por módulo para comparação
const classes = ["Turma A", "Turma B", "Turma C", "Turma D"];
const classOptions = classes.map((name) => ({ label: name, value: name }));
const classAvgByModule: Record<string, number[]> = {
  "Turma A": [76, 72, 80, 68, 71, 75],
  "Turma B": [65, 70, 67, 64, 66, 68],
  "Turma C": [84, 82, 86, 80, 83, 85],
  "Turma D": [72, 74, 73, 70, 71, 72],
};

function buildCollaboratorRadarData(name: string) {
  const data = collaboratorScores[name] ?? Array(moduleLabels.length).fill(0);
  return moduleLabels.map((metric, i) => ({ metric, score: data[i] ?? 0 }));
}

function buildCollaboratorVsClassData(collab: string, klass: string) {
  const userData = collaboratorScores[collab] ?? Array(moduleLabels.length).fill(0);
  const klassData = classAvgByModule[klass] ?? Array(moduleLabels.length).fill(0);
  return moduleLabels.map((metric, i) => ({
    metric,
    colaborador: userData[i] ?? 0,
    turma: klassData[i] ?? 0,
  }));
}

export default function DashboardPage() {
  const [selectedCollaborator, setSelectedCollaborator] = useState<string>(collaborators[0]);
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]);
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="w-full">
        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        <TabsTrigger value="performance">Desempenho</TabsTrigger>
        <TabsTrigger value="activities">Atividades</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Colaboradores Ativos" value={128} icon={<UserGroupIcon className="h-5 w-5" />} />
          <StatCard title="Módulos Criados" value={18} icon={<Squares2X2Icon className="h-5 w-5" />} />
          <StatCard title="Taxa de Conclusão Média" value={"74%"} icon={<CheckBadgeIcon className="h-5 w-5" />} />
          <StatCard title="Turmas Ativas" value={7} icon={<AcademicCapIcon className="h-5 w-5" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Conclusões por Mês (Últimos 6 meses)">
            <div className="relative h-56 sm:h-64">
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          </Card>
          <Card title="Distribuição de Status dos Treinamentos">
            <div className="relative h-56 sm:h-64">
              <Pie
                data={pieData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "bottom" } },
                }}
              />
            </div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="performance" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Desempenho Médio por Turma (Radar)" className="h-[360px]">
            <RadarChart
              data={radarAvgData}
              series={[{ key: "avg", label: "Desempenho Médio", color: "var(--primary)" }]}
            />
          </Card>

          <Card title="Comparativo: Colaborador vs Turma" className="h-[360px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <Select
                label="Colaborador"
                value={selectedCollaborator}
                onChange={(e) => setSelectedCollaborator(e.target.value)}
                options={collaboratorOptions}
              />
              <Select
                label="Turma"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                options={classOptions}
              />
            </div>
            <RadarChart
              data={buildCollaboratorVsClassData(selectedCollaborator, selectedClass)}
              series={[
                { key: "colaborador", label: `Colaborador - ${selectedCollaborator}`, color: "var(--primary)" },
                { key: "turma", label: `${selectedClass} (média)`, color: "#22c55e" },
              ]}
            />
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="activities">
        <Card title="Atividades Recentes">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "João da Silva", action: "Concluiu", module: "Módulo X", date: "10/11" },
                  { name: "Maria Souza", action: "Iniciou", module: "Módulo Y", date: "09/11" },
                  { name: "Carlos Lima", action: "Concluiu", module: "Módulo Z", date: "08/11" },
                ].map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.action}</TableCell>
                    <TableCell>{row.module}</TableCell>
                    <TableCell>{row.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
}