"use client";
import React, { useState, useEffect } from "react";
import Card from "@/components/Card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
    StarIcon,
    ChatBubbleLeftIcon,
    UserIcon,
    AcademicCapIcon,
    CalendarIcon,
    FunnelIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

// Força renderização dinâmica para evitar erros de build
export const dynamic = "force-dynamic";

type Feedback = {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    module: {
        id: string;
        title: string;
    };
};

type ModuleOption = {
    id: string;
    title: string;
};

export default function FeedbacksPage() {
    const [loading, setLoading] = useState(true);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [modules, setModules] = useState<ModuleOption[]>([]);
    const [selectedModule, setSelectedModule] = useState<string>("all");
    const [selectedRating, setSelectedRating] = useState<string>("all");
    const [stats, setStats] = useState({
        total: 0,
        average: 0,
        distribution: [0, 0, 0, 0, 0],
    });

    useEffect(() => {
        loadFeedbacks();
        loadModules();
    }, []);

    async function loadModules() {
        const { data } = await supabase
            .from("modules")
            .select("id, title")
            .order("title");
        if (data) {
            setModules(data);
        }
    }

    async function loadFeedbacks() {
        try {
            setLoading(true);

            // Carregar feedbacks com informações do usuário e módulo
            const { data, error } = await supabase
                .from("module_feedbacks")
                .select(`
          id,
          rating,
          comment,
          created_at,
          user_id,
          module_id
        `)
                .order("created_at", { ascending: false });

            if (error) throw error;

            // Carregar informações de usuários e módulos separadamente
            if (data && data.length > 0) {
                const userIds = [...new Set(data.map((f) => f.user_id))];
                const moduleIds = [...new Set(data.map((f) => f.module_id))];

                // Buscar usuários
                const { data: usersData } = await supabase
                    .from("profiles")
                    .select("id, name, email")
                    .in("id", userIds);

                // Buscar módulos
                const { data: modulesData } = await supabase
                    .from("modules")
                    .select("id, title")
                    .in("id", moduleIds);

                const usersMap = new Map(usersData?.map((u) => [u.id, u]) || []);
                const modulesMap = new Map(modulesData?.map((m) => [m.id, m]) || []);

                const enrichedFeedbacks: Feedback[] = data.map((f) => ({
                    id: f.id,
                    rating: f.rating,
                    comment: f.comment,
                    created_at: f.created_at,
                    user: usersMap.get(f.user_id) || {
                        id: f.user_id,
                        name: "Usuário",
                        email: "",
                    },
                    module: modulesMap.get(f.module_id) || {
                        id: f.module_id,
                        title: "Módulo",
                    },
                }));

                setFeedbacks(enrichedFeedbacks);

                // Calcular estatísticas
                const total = enrichedFeedbacks.length;
                const sum = enrichedFeedbacks.reduce((acc, f) => acc + f.rating, 0);
                const average = total > 0 ? sum / total : 0;
                const distribution = [0, 0, 0, 0, 0];
                enrichedFeedbacks.forEach((f) => {
                    distribution[f.rating - 1]++;
                });

                setStats({ total, average, distribution });
            } else {
                setFeedbacks([]);
                setStats({ total: 0, average: 0, distribution: [0, 0, 0, 0, 0] });
            }
        } catch (error: any) {
            console.error("Erro ao carregar feedbacks:", error);
            toast.error("Erro ao carregar feedbacks");
        } finally {
            setLoading(false);
        }
    }

    // Filtrar feedbacks
    const filteredFeedbacks = feedbacks.filter((f) => {
        if (selectedModule !== "all" && f.module.id !== selectedModule) return false;
        if (selectedRating !== "all" && f.rating !== parseInt(selectedRating))
            return false;
        return true;
    });

    // Renderizar estrelas
    const renderStars = (rating: number, size: "sm" | "md" = "md") => {
        const sizeClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) =>
                    star <= rating ? (
                        <StarIconSolid
                            key={star}
                            className={`${sizeClass} text-yellow-400`}
                        />
                    ) : (
                        <StarIcon key={star} className={`${sizeClass} text-slate-300`} />
                    )
                )}
            </div>
        );
    };

    // Formatar data
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Labels de rating
    const ratingLabels: Record<number, string> = {
        1: "Muito Ruim",
        2: "Ruim",
        3: "Regular",
        4: "Bom",
        5: "Excelente",
    };

    const ratingColors: Record<number, string> = {
        1: "bg-red-100 text-red-700",
        2: "bg-orange-100 text-orange-700",
        3: "bg-yellow-100 text-yellow-700",
        4: "bg-lime-100 text-lime-700",
        5: "bg-green-100 text-green-700",
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-slate-600">Carregando feedbacks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="section-title">Feedbacks dos Módulos</h2>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total de Feedbacks */}
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <ChatBubbleLeftIcon className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Total de Feedbacks</p>
                            <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                        </div>
                    </div>
                </Card>

                {/* Média de Avaliação */}
                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 rounded-xl">
                            <StarIconSolid className="w-8 h-8 text-yellow-500" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Média de Avaliação</p>
                            <div className="flex items-center gap-2">
                                <p className="text-3xl font-bold text-slate-900">
                                    {stats.average.toFixed(1)}
                                </p>
                                {renderStars(Math.round(stats.average))}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Distribuição */}
                <Card>
                    <p className="text-sm text-slate-600 mb-3">Distribuição</p>
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const count = stats.distribution[rating - 1];
                            const percentage =
                                stats.total > 0 ? (count / stats.total) * 100 : 0;
                            return (
                                <div key={rating} className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500 w-4">{rating}</span>
                                    <StarIconSolid className="w-4 h-4 text-yellow-400" />
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-400 rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-slate-500 w-8">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Filtros */}
            <Card>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-600">
                        <FunnelIcon className="w-5 h-5" />
                        <span className="font-medium">Filtros:</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <select
                            value={selectedModule}
                            onChange={(e) => setSelectedModule(e.target.value)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                            <option value="all">Todos os Módulos</option>
                            {modules.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.title}
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedRating}
                            onChange={(e) => setSelectedRating(e.target.value)}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                            <option value="all">Todas as Avaliações</option>
                            <option value="5">⭐ 5 - Excelente</option>
                            <option value="4">⭐ 4 - Bom</option>
                            <option value="3">⭐ 3 - Regular</option>
                            <option value="2">⭐ 2 - Ruim</option>
                            <option value="1">⭐ 1 - Muito Ruim</option>
                        </select>
                    </div>
                    <span className="text-sm text-slate-500">
                        {filteredFeedbacks.length} resultado(s)
                    </span>
                </div>
            </Card>

            {/* Lista de Feedbacks */}
            {filteredFeedbacks.length === 0 ? (
                <Card>
                    <div className="text-center py-12">
                        <ChatBubbleLeftIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">
                            Nenhum feedback encontrado
                        </h3>
                        <p className="text-slate-500">
                            {feedbacks.length === 0
                                ? "Os alunos ainda não enviaram feedbacks."
                                : "Nenhum feedback corresponde aos filtros selecionados."}
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredFeedbacks.map((feedback) => (
                        <Card
                            key={feedback.id}
                            className="hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col md:flex-row md:items-start gap-4">
                                {/* Avatar e Info do Usuário */}
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <UserIcon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-slate-900">
                                                {feedback.user.name}
                                            </span>
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded-full ${ratingColors[feedback.rating]
                                                    }`}
                                            >
                                                {ratingLabels[feedback.rating]}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <AcademicCapIcon className="w-4 h-4" />
                                                {feedback.module.title}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <CalendarIcon className="w-4 h-4" />
                                                {formatDate(feedback.created_at)}
                                            </span>
                                        </div>
                                        {feedback.comment && (
                                            <p className="mt-3 text-slate-700 bg-slate-50 rounded-lg p-3 text-sm">
                                                &quot;{feedback.comment}&quot;
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Rating */}
                                <div className="flex flex-col items-end gap-1">
                                    {renderStars(feedback.rating)}
                                    <span className="text-2xl font-bold text-slate-900">
                                        {feedback.rating}/5
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
