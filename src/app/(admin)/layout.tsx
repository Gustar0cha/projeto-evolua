"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import ManagerLayout from "@/components/layouts/ManagerLayout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    try {
      const role = localStorage.getItem("role");
      console.log('🔍 [AdminLayout] Verificando role no localStorage:', role);

      if (role !== "gestor") {
        console.log('❌ [AdminLayout] Role não é gestor, redirecionando para /treinamentos');
        router.replace("/treinamentos");
      } else {
        console.log('✅ [AdminLayout] Role é gestor, permanecendo no dashboard');
      }
    } catch (error) {
      console.error('❌ [AdminLayout] Erro ao verificar role:', error);
    }
  }, [router]);
  return <ManagerLayout>{children}</ManagerLayout>;
}