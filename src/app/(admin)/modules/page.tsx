"use client";
import React, { useState } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import Link from "next/link";

type ModuleItem = { id: string; title: string; createdAt: string; status: "Publicado" | "Rascunho" };

const initialModules: ModuleItem[] = [
  { id: "3", title: "🧠 Avaliação de Aprendizado – Programa de Desenvolvimento IDEIAS", createdAt: "15/10/2023", status: "Rascunho" },
];

export default function ModulesPage() {
  const [modules] = useState<ModuleItem[]>(initialModules);
  const handleDelete = (m: ModuleItem) => {
    toast.success(`Módulo "${m.title}" excluído`);
  };
  const handlePublish = (m: ModuleItem) => {
    toast.success(`Módulo "${m.title}" liberado`);
  };
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
              {modules.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.title}</TableCell>
                  <TableCell>{m.createdAt}</TableCell>
                  <TableCell>
                    <Badge variant={m.status === "Publicado" ? "success" : "warning"}>{m.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="sm">Ações</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Link href={`/modules/${m.id}`}>Editar</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onSelect={() => handleDelete(m)}>Excluir</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handlePublish(m)}>Liberar Módulo</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}