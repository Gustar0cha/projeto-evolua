"use client";
import React, { useState, useEffect } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Input from "@/components/Input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

// Força renderização dinâmica para evitar erros de build
export const dynamic = "force-dynamic";

type ClassItem = {
  id: string;
  name: string;
  description: string | null;
  members: number;
};

export default function ClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadClasses();
  }, []);

  async function loadClasses() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          class_members(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const classesWithCount = data?.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        members: c.class_members?.[0]?.count || 0
      })) || [];

      setClasses(classesWithCount);
    } catch (error: any) {
      console.error('Erro ao carregar turmas:', error);
      toast.error('Erro ao carregar turmas');
    } finally {
      setLoading(false);
    }
  }

  async function createClass() {
    if (!name.trim()) {
      toast.error('Digite o nome da turma');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('classes')
        .insert([
          {
            name: name.trim(),
            description: description.trim() || null,
            created_by: user?.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setClasses([{ ...data, members: 0 }, ...classes]);
      setName("");
      setDescription("");
      setOpen(false);
      toast.success("Turma criada com sucesso!");
    } catch (error: any) {
      console.error('Erro ao criar turma:', error);
      toast.error('Erro ao criar turma');
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="section-title">Gerenciamento de Turmas</h2>
        <Card>
          <div className="p-8 text-center text-slate-500">
            Carregando turmas...
          </div>
        </Card>
      </div>
    );
  }

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
                <TableHead>Descrição</TableHead>
                <TableHead>Nº de Colaboradores</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-slate-500 py-8">
                    Nenhuma turma criada ainda
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link className="hover:underline" href={`/classes/${c.id}`} style={{ color: "var(--primary)" }}>{c.name}</Link>
                    </TableCell>
                    <TableCell className="text-slate-600">{c.description || '-'}</TableCell>
                    <TableCell>{c.members}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Criar Nova Turma"
        footer={<>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={createClass}>Criar</Button>
        </>}>
        <div className="space-y-4">
          <Input
            label="Nome da Turma"
            placeholder="Ex: Turma A"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Descrição (opcional)"
            placeholder="Ex: Turma do turno da manhã"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}