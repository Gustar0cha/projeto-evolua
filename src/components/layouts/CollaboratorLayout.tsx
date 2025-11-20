"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

type Props = {
  children: React.ReactNode;
};

export default function CollaboratorLayout({ children }: Props) {
  const [collapsed, setCollapsed] = useState(true);
  const router = useRouter();
  const handleSignOut = () => {
    try {
      localStorage.removeItem("role");
    } catch { }
    router.replace("/login");
  };
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        userName="Colaborador"
        role="colaborador"
        onSignOut={handleSignOut}
      />
      <div className="flex-1">
        <main className="container-page py-6">{children}</main>
      </div>
    </div>
  );
}