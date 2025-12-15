"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState<'gestor' | 'colaborador'>('colaborador');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            // Criar usuário no Supabase
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        role,
                    },
                },
            });

            if (error) throw error;

            toast.success('Conta criada com sucesso! Verifique seu e-mail para confirmar.');

            // Redirecionar para login
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (error: any) {
            console.error('Erro no registro:', error);
            toast.error(error.message || 'Erro ao criar conta. Tente novamente.');
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
                    <div className="mb-8 flex justify-center">
                        <Image
                            src="/assets/logo-evolua.svg"
                            alt="Evolua Logo"
                            width={180}
                            height={60}
                            className="h-12 w-auto"
                        />
                    </div>

                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">
                            <span className="text-primary mr-2">→</span>
                            Criar nova conta
                        </h1>
                        <p className="text-slate-500">Preencha os dados para começar</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700" htmlFor="name">
                                Nome completo
                            </label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Digite seu nome"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-12 border-slate-200 focus-visible:ring-primary"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700" htmlFor="email">
                                E-mail
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Digite seu e-mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 border-slate-200 focus-visible:ring-primary"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700" htmlFor="role">
                                Tipo de conta
                            </label>
                            <Select value={role} onValueChange={(value) => setRole(value as 'gestor' | 'colaborador')} disabled={loading}>
                                <SelectTrigger className="h-12">
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
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Mínimo 6 caracteres"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pr-10 h-12 border-slate-200 focus-visible:ring-primary"
                                    required
                                    disabled={loading}
                                    minLength={6}
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700" htmlFor="confirmPassword">
                                Confirmar senha
                            </label>
                            <Input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="Digite a senha novamente"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="h-12 border-slate-200 focus-visible:ring-primary"
                                required
                                disabled={loading}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary-700 text-white"
                            disabled={loading}
                        >
                            {loading ? 'Criando conta...' : 'Criar conta'}
                        </Button>

                        <p className="text-center text-sm text-slate-600">
                            Já tem uma conta?{' '}
                            <Link href="/login" className="font-bold text-primary hover:underline">
                                Fazer login
                            </Link>
                        </p>
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
