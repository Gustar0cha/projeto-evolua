"use client";
import React, { useState, useMemo } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Select from "@/components/Select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import RadarChart from "@/components/ui/radar-chart";

type Member = { id: string; name: string };
type Mod = { id: string; title: string };

const allMembers: Member[] = [
  { id: "1", name: "João da Silva" },
  { id: "2", name: "Maria Souza" },
  { id: "3", name: "Carlos Lima" },
];

const allModules: Mod[] = [
  { id: "m1", title: "Boas Práticas de Segurança" },
  { id: "m2", title: "Onboarding da Empresa" },
];

export default function ClassDetailPage({ params }: { params: { id: string } }) {
  const [members, setMembers] = useState<Member[]>([allMembers[0]]);
  const [mods, setMods] = useState<Mod[]>([allModules[0]]);
  const [openMembers, setOpenMembers] = useState(false);
  const [openModules, setOpenModules] = useState(false);
  const [selectedModule, setSelectedModule] = useState(allModules[0].id);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(allMembers[0].id);

  const toggleMember = (m: Member) => {
    setMembers((arr) => (arr.some((x) => x.id === m.id) ? arr.filter((x) => x.id !== m.id) : [...arr, m]));
  };

  const addModule = () => {
    const mod = allModules.find((mm) => mm.id === selectedModule);
    if (mod && !mods.some((x) => x.id === mod.id)) setMods((ms) => [...ms, mod]);
    setOpenModules(false);
  };

  // Dados de desempenho fictícios por colaborador (0-100)
  const radarLabels = ["Concluídos", "Quiz", "Participação", "Pontualidade", "Engajamento"];
  const perfByMember: Record<string, number[]> = {
    "1": [78, 82, 70, 88, 75],
    "2": [92, 90, 85, 93, 88],
    "3": [65, 72, 60, 70, 65],
  };

  const classAverage = useMemo(() => {
    const arrs = members.map((m) => perfByMember[m.id] ?? [0, 0, 0, 0, 0]);
    if (arrs.length === 0) return [0, 0, 0, 0, 0];
    const sums = arrs.reduce((acc, cur) => acc.map((v, i) => v + (cur[i] ?? 0)), [0, 0, 0, 0, 0]);
    return sums.map((v) => Math.round(v / arrs.length));
  }, [members]);

  const selectedMember = members.find((m) => m.id === selectedMemberId) ?? members[0] ?? allMembers[0];
  const collaboratorScores = perfByMember[selectedMember.id] ?? [0, 0, 0, 0, 0];
  const radarData = radarLabels.map((metric, i) => ({
    metric,
    colaborador: collaboratorScores[i] ?? 0,
    turma: classAverage[i] ?? 0,
  }));

  return (
    <div className="space-y-4">
      <h2 className="section-title">Detalhe da Turma: {(params?.id ?? "").toUpperCase()}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Membros (Colaboradores)">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-3">
            <Button variant="secondary" onClick={() => setOpenMembers(true)}>Adicionar/Remover Membros</Button>
          </div>
        </Card>

        <Card title="Módulos Liberados">
          <ul className="list-disc pl-5 text-sm text-slate-800">
            {mods.map((m) => (
              <li key={m.id}>{m.title}</li>
            ))}
          </ul>
          <div className="mt-3">
            <Button onClick={() => setOpenModules(true)}>Liberar Novo Módulo</Button>
          </div>
        </Card>
      </div>

      <Modal isOpen={openMembers} onClose={() => setOpenMembers(false)} title="Gerenciar Membros"
        footer={<>
          <Button variant="secondary" onClick={() => setOpenMembers(false)}>Concluir</Button>
        </>}>
        <div className="space-y-2">
          {allMembers.map((m) => (
            <label key={m.id} className="flex items-center gap-2 text-sm">
              <Checkbox checked={members.some((x) => x.id === m.id)} onCheckedChange={() => toggleMember(m)} />
              {m.name}
            </label>
          ))}
        </div>
      </Modal>

      {/* Dashboard centralizado: gráfico comparativo foi movido para o módulo Dashboard */}

      <Modal isOpen={openModules} onClose={() => setOpenModules(false)} title="Liberar Novo Módulo"
        footer={<>
          <Button variant="secondary" onClick={() => setOpenModules(false)}>Cancelar</Button>
          <Button onClick={addModule}>Liberar</Button>
        </>}>
        <Select label="Módulo" value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}
          options={allModules.map((m) => ({ label: m.title, value: m.id }))} />
      </Modal>
    </div>
  );
}