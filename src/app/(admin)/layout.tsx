"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import ManagerLayout from "@/components/layouts/ManagerLayout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    try {
      const role = localStorage.getItem("role");
      if (role !== "gestor") router.replace("/treinamentos");
    } catch {}
  }, [router]);
  return <ManagerLayout>{children}</ManagerLayout>;
}