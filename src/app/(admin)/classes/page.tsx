"use client";
import React, { useState } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import Link from "next/link";

type ClassItem = { id: string; name: string; members: number };

const initialClasses: ClassItem[] = [
  { id: "a", name: "Turma A", members: 25 },
  { id: "b", name: "Turma B", members: 18 },
];

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const createClass = () => {
    if (!name.trim()) return;
    setClasses((cs) => [{ id: Math.random().toString(36).slice(2), name, members: 0 }, ...cs]);
    setName("");
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="section-title">Gerenciamento de Turmas</h2>
        <Button onClick={() => setOpen(true)}>Criar Nova Turma</Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Nome da Turma</TableHead>
                <TableHead>Nº de Colaboradores</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link className="hover:underline" href={`/classes/${c.id}`} style={{ color: "var(--primary)" }}>{c.name}</Link>
                  </TableCell>
                  <TableCell>{c.members}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Criar Nova Turma"
        footer={<>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={createClass}>Criar</Button>
        </>}>
        <input
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[var(--primary)] focus:ring-[var(--primary)]"
          placeholder="Nome da Turma"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Modal>
    </div>
  );
}