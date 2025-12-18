"use client";
import React, { useState, useEffect } from "react";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Training = {
  id: string;
  title: string;
  description: string;
  cover_image?: string | null;
  status: "Pendente" | "Em Andamento" | "Concluído";
};

export default function MyTrainingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        loadTrainings();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  async function loadTrainings() {
    try {
      setLoading(true);

      // ✅ OTIMIZAÇÃO: Buscar módulos e progresso em PARALELO
      const [
        { data: modules, error: modulesError },
        { data: progress, error: progressError }
      ] = await Promise.all([
        supabase
          .from('modules')
          .select('id, title, description, cover_image')  // ✅ Só campos necessários (removido SELECT *)
          .eq('status', 'publicado')
          .order('created_at', { ascending: false }),
        supabase
          .from('user_module_progress')
          .select('module_id, status')
          .eq('user_id', user?.id)
      ]);

      if (modulesError) throw modulesError;
      if (progressError) {
        console.error('Erro ao buscar progresso:', progressError);
      }

      // ✅ Usar Map para lookup O(1) em vez de find() O(n)
      const progressMap = new Map(progress?.map(p => [p.module_id, p.status]) || []);

      // Mapear módulos com status
      const trainingsData: Training[] = modules?.map(m => {
        const userStatus = progressMap.get(m.id);
        let status: "Pendente" | "Em Andamento" | "Concluído" = "Pendente";

        if (userStatus === 'concluido') {
          status = "Concluído";
        } else if (userStatus === 'em_andamento') {
          status = "Em Andamento";
        }

        return {
          id: m.id,
          title: m.title,
          description: m.description || 'Sem descrição',
          cover_image: m.cover_image,
          status
        };
      }) || [];

      setTrainings(trainingsData);
    } catch (error: any) {
      console.error('Erro ao carregar treinamentos:', error);
      toast.error('Erro ao carregar treinamentos');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando treinamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="section-title mb-4">Meus Treinamentos</h2>

      {trainings.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-slate-500">
            Nenhum treinamento disponível no momento.
            <br />
            <span className="text-sm">Entre em contato com seu gestor para mais informações.</span>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainings.map((t) => (
            <Link key={t.id} href={`/modulo/${t.id}`} className="group">
              <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                {t.cover_image && (
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={t.cover_image}
                      alt={t.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge variant={t.status === "Concluído" ? "success" : t.status === "Em Andamento" ? "info" : "warning"}>
                        {t.status}
                      </Badge>
                    </div>
                  </div>
                )}
                <div className="p-4 flex flex-col flex-1 gap-3">
                  {!t.cover_image && (
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-primary transition-colors">
                        {t.title}
                      </h3>
                      <Badge variant={t.status === "Concluído" ? "success" : t.status === "Em Andamento" ? "info" : "warning"}>
                        {t.status}
                      </Badge>
                    </div>
                  )}
                  {t.cover_image && (
                    <h3 className="text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-primary transition-colors">
                      {t.title}
                    </h3>
                  )}
                  <div className="mt-auto pt-3 border-t border-slate-100">
                    <span className="text-sm text-primary font-medium group-hover:underline">
                      Iniciar Avaliação
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}