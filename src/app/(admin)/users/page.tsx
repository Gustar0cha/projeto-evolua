"use client";
import React, { useState } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Badge from "@/components/Badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

type Role = "gestor" | "colaborador";
type User = { id: string; name: string; email: string; role: Role; active: boolean };

const initialUsers: User[] = [
  { id: "u1", name: "Ana Gestora", email: "ana@example.com", role: "gestor", active: true },
  { id: "u2", name: "Bruno Colab", email: "bruno@example.com", role: "colaborador", active: true },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<User>>({ role: "colaborador", active: true });

  const openCreate = () => { setForm({ role: "colaborador", active: true }); setOpen(true); };

  const saveUser = () => {
    if (!form.name || !form.email || !form.role) return;
    const newUser: User = {
      id: Math.random().toString(36).slice(2),
      name: form.name!,
      email: form.email!,
      role: form.role as Role,
      active: !!form.active,
    };
    setUsers((us) => [newUser, ...us]);
    setOpen(false);
  };

  const removeUser = (id: string) => {
    setUsers((us) => us.filter((u) => u.id !== id));
    toast.success("Usuário excluído");
  };
  const toggleActive = (id: string) => {
    setUsers((us) => {
      const current = us.find((u) => u.id === id);
      const next = us.map((u) => (u.id === id ? { ...u, active: !u.active } : u));
      const nowActive = current ? !current.active : false;
      toast.success(nowActive ? "Usuário ativado" : "Usuário inativado");
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="section-title">Usuários</h2>
        <Button onClick={openCreate}>Criar Usuário</Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role === "gestor" ? "Gestor" : "Colaborador"}</TableCell>
                  <TableCell>
                    <Badge variant={u.active ? "success" : "danger"}>{u.active ? "Ativo" : "Inativo"}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="secondary">Ações</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => toggleActive(u.id)}>{u.active ? "Inativar" : "Ativar"}</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onSelect={() => removeUser(u.id)}>Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Criar Usuário" footer={<>
        <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
        <Button onClick={() => { saveUser(); toast.success("Usuário criado"); }}>Salvar</Button>
      </>}>
        <div className="space-y-3">
          <Input label="Nome" value={form.name ?? ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Email" type="email" value={form.email ?? ""} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <Select label="Perfil" value={(form.role ?? "colaborador") as string} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
            options={[{ label: "Gestor", value: "gestor" }, { label: "Colaborador", value: "colaborador" }]} />
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={!!form.active} onCheckedChange={(checked) => setForm((f) => ({ ...f, active: !!checked }))} />
            Usuário Ativo
          </label>
        </div>
      </Modal>
    </div>
  );
}