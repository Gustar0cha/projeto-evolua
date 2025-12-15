"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Fazer login no Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        console.log('✅ Login bem-sucedido! User ID:', data.user.id);

        // Buscar o profile do usuário para obter o role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, name')
          .eq('id', data.user.id)
          .single();

        console.log('Profile encontrado:', profile);
        console.log('Erro ao buscar profile:', profileError);

        if (profileError) {
          console.error('❌ Erro ao buscar profile:', profileError);
          // Se não conseguir buscar o profile, redireciona para colaborador por padrão
          localStorage.setItem('role', 'colaborador');
          toast.warning('Não foi possível verificar seu perfil. Redirecionando...');
          router.replace('/treinamentos');
          return;
        }

        // Salvar role no localStorage ANTES de redirecionar
        if (profile && profile.role) {
          localStorage.setItem('role', profile.role);
          console.log('💾 Role salvo no localStorage:', profile.role);
        }

        // Pequeno delay para garantir que o localStorage foi salvo
        await new Promise(resolve => setTimeout(resolve, 100));

        // Redirecionar baseado no role
        if (profile && profile.role === 'gestor') {
          console.log('🎯 Redirecionando GESTOR para /dashboard');
          toast.success(`Bem-vindo, ${profile.name || 'Gestor'}!`);
          // Usar window.location para forçar reload completo
          window.location.href = '/dashboard';
        } else {
          console.log('🎯 Redirecionando COLABORADOR para /treinamentos');
          toast.success(`Bem-vindo, ${profile?.name || 'Colaborador'}!`);
          window.location.href = '/treinamentos';
        }
      }
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      toast.error(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 sm:p-12 lg:p-16 xl:p-24 justify-between overflow-y-auto">
        <div className="w-full max-w-md mx-auto flex flex-col h-full justify-center">
          {/* Logo */}
          <div className="mb-12 flex justify-center">
            <Image
              src="/assets/logo-evolua.svg"
              alt="Evolua Logo"
              width={180}
              height={60}
              className="h-12 w-auto"
            />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              <span className="text-primary mr-2">→</span>
              Bem vindo de volta
            </h1>
            <p className="text-slate-500">Faça login na sua conta</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-slate-200 focus-visible:ring-primary"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="password">
                Senha
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 border-slate-200 focus-visible:ring-primary"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(c) => setRememberMe(c as boolean)}
                  className="border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  disabled={loading}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-500"
                >
                  Lembre-me
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm font-bold text-primary hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary-700 text-white"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar agora'}
            </Button>
          </form>

          {/* Footer Logos */}
          <div className="mt-8 flex items-center justify-center gap-6 w-full">
            <Image
              src="/assets/logo-ie.svg"
              alt="IECérebro"
              width={200}
              height={66}
              className="h-16 w-auto object-contain"
            />
            <div className="h-12 w-px bg-slate-300 mx-2"></div>
            <Image
              src="/assets/logo-progressiva.png"
              alt="Progressiva"
              width={200}
              height={66}
              className="h-12 w-auto object-contain"
            />
          </div>

          {/* Desenvolvido por */}
          <p className="mt-6 text-center text-sm text-slate-400">
            Desenvolvido por{' '}
            <a
              href="https://thegustavo.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              Gustavo
            </a>
          </p>
        </div>
      </div>

      {/* Right Panel - Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-slate-100">
        <Image
          src="/assets/login-side.jpg"
          alt="Office meeting"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}