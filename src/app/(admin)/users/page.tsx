"use client";
import React, { useState, useEffect, useMemo } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button as UIButton } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/supabase";

// Força renderização dinâmica para evitar erros de build
export const dynamic = "force-dynamic";

type UserWithEmail = Profile & { email: string };

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Novo: busca

  // Modal de criação
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "colaborador" as "gestor" | "colaborador",
  });

  // Modal de edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editUser, setEditUser] = useState<UserWithEmail | null>(null);

  // Modal de redefinir senha
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserWithEmail | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    loadUsers();
  }, [showInactive]);

  // Filtrar usuários pela busca
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;

    const search = searchTerm.toLowerCase();
    return users.filter(user =>
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    );
  }, [users, searchTerm]);

  async function loadUsers() {
    console.log('🔄 Iniciando carregamento de usuários...');

    try {
      setLoading(true);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('❌ Erro ao verificar sessão:', sessionError);
        throw new Error('Erro ao verificar autenticação');
      }

      const session = sessionData?.session;

      if (!session) {
        console.error('❌ Usuário não autenticado');
        toast.error('Você precisa estar logado para acessar esta página');
        setUsers([]);
        return;
      }

      console.log('✅ Usuário autenticado:', {
        userId: session.user.id,
        email: session.user.email
      });

      console.log(`✅ Carregando usuários... (${showInactive ? 'TODOS' : 'apenas ATIVOS'})`);

      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!showInactive) {
        query = query.eq('active', true);
      }

      const { data: profiles, error: profilesError } = await query;

      if (profilesError) {
        console.error('❌ Erro ao buscar profiles:', {
          message: profilesError.message,
          details: profilesError.details,
          hint: profilesError.hint,
          code: profilesError.code
        });

        if (profilesError.code === 'PGRST116' || profilesError.message?.includes('permission')) {
          toast.error('Sem permissão. Apenas gestores podem acessar esta página.');
          setUsers([]);
          return;
        }

        throw new Error(profilesError.message || 'Erro ao buscar usuários');
      }

      console.log(`✅ Profiles carregados: ${profiles?.length || 0} usuários`);

      const usersWithEmails: UserWithEmail[] = (profiles || []).map(profile => ({
        ...profile,
        email: profile.email || 'Email não disponível'
      }));

      console.log('✅ Lista processada com sucesso');
      setUsers(usersWithEmails);

    } catch (error: any) {
      console.error('❌ Erro ao carregar usuários:', error);

      if (error.message?.includes('column')) {
        toast.error('Erro: Execute a migração SQL primeiro!');
      } else if (error.message?.includes('permission')) {
        toast.error('Erro: Sem permissão. Faça login como GESTOR');
      } else if (error.message?.includes('autenticação') || error.message?.includes('autenticado')) {
        toast.error('Você precisa fazer login primeiro');
      } else {
        toast.error(error.message || 'Erro ao carregar usuários');
      }
      setUsers([]);
    } finally {
      setLoading(false);
      console.log('✅ Carregamento finalizado');
    }
  }

  async function toggleActive(id: string) {
    try {
      const user = users.find(u => u.id === id);
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ active: !user.active })
        .eq('id', id);

      if (error) throw error;

      if (user.active && !showInactive) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        setUsers(users.map(u => u.id === id ? { ...u, active: !u.active } : u));
      }

      toast.success(user.active ? "Usuário inativado" : "Usuário ativado");
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao atualizar usuário');
    }
  }

  async function removeUser(id: string) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUsers(users.filter(u => u.id !== id));
      toast.success("Usuário excluído");
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao excluir usuário');
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();

    if (newUser.password !== newUser.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (newUser.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setCreating(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            name: newUser.name,
            role: newUser.role,
          },
        },
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('Usuário não foi criado corretamente');
      }

      toast.success('Usuário criado com sucesso!');

      setIsCreateModalOpen(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "colaborador",
      });

      setTimeout(() => {
        loadUsers();
      }, 1500);

    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast.error(error.message || 'Erro ao criar usuário. Tente novamente.');
    } finally {
      setCreating(false);
    }
  }

  async function handleEditUser(e: React.FormEvent) {
    e.preventDefault();

    if (!editUser) return;

    setEditing(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editUser.name,
          email: editUser.email,
          role: editUser.role,
          active: editUser.active,
        })
        .eq('id', editUser.id);

      if (error) throw error;

      setUsers(users.map(u => u.id === editUser.id ? editUser : u));
      toast.success('Usuário atualizado com sucesso!');
      setIsEditModalOpen(false);
      setEditUser(null);

    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error(error.message || 'Erro ao atualizar usuário');
    } finally {
      setEditing(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();

    if (!resetPasswordUser) return;

    if (newPassword !== confirmNewPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setResettingPassword(true);

    try {
      // Usar a API Admin do Supabase para atualizar senha
      const { error } = await supabase.auth.admin.updateUserById(
        resetPasswordUser.id,
        { password: newPassword }
      );

      if (error) throw error;

      toast.success('Senha redefinida com sucesso!');
      setIsResetPasswordModalOpen(false);
      setResetPasswordUser(null);
      setNewPassword("");
      setConfirmNewPassword("");

    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      toast.error(error.message || 'Erro ao redefinir senha. Verifique suas permissões.');
    } finally {
      setResettingPassword(false);
    }
  }

  function openResetPasswordModal(user: UserWithEmail) {
    setResetPasswordUser(user);
    setNewPassword("");
    setConfirmNewPassword("");
    setIsResetPasswordModalOpen(true);
  }

  function openEditModal(user: UserWithEmail) {
    setEditUser({ ...user });
    setIsEditModalOpen(true);
  }

  function resetCreateForm() {
    setNewUser({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "colaborador",
    });
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="section-title">Usuários</h2>
        <Card>
          <div className="p-8 text-center text-slate-500">
            Carregando usuários...
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="section-title">Usuários</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>Criar Usuário</Button>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <div className="p-4 space-y-3">
          <div className="flex gap-4 items-center">
            {/* Campo de busca */}
            <div className="flex-1">
              <Input
                type="text"
                placeholder="🔍 Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10"
              />
            </div>

            {/* Toggle mostrar inativos */}
            <label className="flex items-center gap-2 text-sm text-slate-600 whitespace-nowrap">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-slate-300"
              />
              Mostrar inativos
            </label>
          </div>

          {/* Info de resultados */}
          {searchTerm && (
            <p className="text-sm text-slate-500">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'usuário encontrado' : 'usuários encontrados'}
            </p>
          )}
        </div>
      </Card>

      {/* Tabela de Usuários */}
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
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                    {searchTerm ? 'Nenhum usuário encontrado com esse termo' : 'Nenhum usuário ativo encontrado'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === "gestor" ? "info" : "default"}>
                        {u.role === "gestor" ? "Gestor" : "Colaborador"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.active ? "success" : "danger"}>
                        {u.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="secondary">Ações</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => openEditModal(u)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => openResetPasswordModal(u)}>
                            Redefinir Senha
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => toggleActive(u.id)}>
                            {u.active ? "Inativar" : "Ativar"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onSelect={() => removeUser(u.id)}>
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modal de Criação */}
      <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
        setIsCreateModalOpen(open);
        if (!open) resetCreateForm();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Criar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo usuário abaixo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="name">
                Nome completo
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Digite o nome"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="h-11"
                required
                disabled={creating}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Digite o e-mail"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="h-11"
                required
                disabled={creating}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="role">
                Tipo de conta
              </label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value as 'gestor' | 'colaborador' })}
                disabled={creating}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="colaborador">Colaborador</SelectItem>
                  <SelectItem value="gestor">Gestor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="password">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="h-11"
                required
                disabled={creating}
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="confirmPassword">
                Confirmar senha
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Digite a senha novamente"
                value={newUser.confirmPassword}
                onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                className="h-11"
                required
                disabled={creating}
              />
            </div>

            <DialogFooter className="mt-6">
              <UIButton
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={creating}
              >
                Cancelar
              </UIButton>
              <UIButton
                type="submit"
                disabled={creating}
                className="bg-primary hover:bg-primary/90"
              >
                {creating ? 'Criando...' : 'Criar Usuário'}
              </UIButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => {
        setIsEditModalOpen(open);
        if (!open) setEditUser(null);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize os dados do usuário abaixo.
            </DialogDescription>
          </DialogHeader>

          {editUser && (
            <form onSubmit={handleEditUser} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="edit-name">
                  Nome completo
                </label>
                <Input
                  id="edit-name"
                  type="text"
                  placeholder="Digite o nome"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  className="h-11"
                  required
                  disabled={editing}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="edit-email">
                  E-mail
                </label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="Digite o e-mail"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="h-11"
                  required
                  disabled={editing}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="edit-role">
                  Tipo de conta
                </label>
                <Select
                  value={editUser.role}
                  onValueChange={(value) => setEditUser({ ...editUser, role: value as 'gestor' | 'colaborador' })}
                  disabled={editing}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="colaborador">Colaborador</SelectItem>
                    <SelectItem value="gestor">Gestor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="edit-active">
                  Status
                </label>
                <Select
                  value={editUser.active ? "true" : "false"}
                  onValueChange={(value) => setEditUser({ ...editUser, active: value === "true" })}
                  disabled={editing}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Ativo</SelectItem>
                    <SelectItem value="false">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="mt-6">
                <UIButton
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={editing}
                >
                  Cancelar
                </UIButton>
                <UIButton
                  type="submit"
                  disabled={editing}
                  className="bg-primary hover:bg-primary/90"
                >
                  {editing ? 'Salvando...' : 'Salvar Alterações'}
                </UIButton>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Redefinir Senha */}
      <Dialog open={isResetPasswordModalOpen} onOpenChange={(open) => {
        setIsResetPasswordModalOpen(open);
        if (!open) {
          setResetPasswordUser(null);
          setNewPassword("");
          setConfirmNewPassword("");
        }
      }}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Redefinir Senha</DialogTitle>
            <DialogDescription>
              {resetPasswordUser && (
                <>Defina uma nova senha para <strong>{resetPasswordUser.name}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>

          {resetPasswordUser && (
            <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="new-password">
                  Nova senha
                </label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-11"
                  required
                  disabled={resettingPassword}
                  minLength={6}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="confirm-new-password">
                  Confirmar nova senha
                </label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="h-11"
                  required
                  disabled={resettingPassword}
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  ⚠️ O usuário poderá fazer login imediatamente com a nova senha.
                </p>
              </div>

              <DialogFooter className="mt-6">
                <UIButton
                  type="button"
                  variant="outline"
                  onClick={() => setIsResetPasswordModalOpen(false)}
                  disabled={resettingPassword}
                >
                  Cancelar
                </UIButton>
                <UIButton
                  type="submit"
                  disabled={resettingPassword}
                  className="bg-primary hover:bg-primary/90"
                >
                  {resettingPassword ? 'Redefinindo...' : 'Redefinir Senha'}
                </UIButton>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}