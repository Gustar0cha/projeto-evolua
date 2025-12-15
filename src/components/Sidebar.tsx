"use client";
import React from "react";
import Link from "next/link";
import clsx from "clsx";
import Button from "@/components/Button";
import { usePathname } from "next/navigation";
import Image from "next/image";


import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  HomeIcon,
  RectangleStackIcon,
  UserGroupIcon,
  UserIcon,
  ChartBarIcon,
  PresentationChartBarIcon,
} from "@heroicons/react/24/outline";
// Logo removida da Sidebar conforme solicitação

type SidebarProps = {
  collapsed?: boolean;
  onToggle?: () => void;
  userName?: string;
  role?: "gestor" | "colaborador";
  onSignOut?: () => void;
};

const groups = [
  {
    id: "vision",
    label: "Visão Geral",
    items: [{ href: "/dashboard", label: "Dashboard", icon: HomeIcon }],
  },
  {
    id: "content",
    label: "Conteúdo",
    items: [{ href: "/modules", label: "Módulos", icon: RectangleStackIcon }],
  },
  {
    id: "management",
    label: "Gestão",
    items: [
      { href: "/classes", label: "Turmas", icon: UserGroupIcon },
      { href: "/users", label: "Usuários", icon: UserIcon },
    ],
  },
  {
    id: "reports",
    label: "Relatórios",
    items: [
      { href: "/reports/students", label: "Relatórios de Alunos", icon: PresentationChartBarIcon },
      { href: "/reports/modules", label: "Relatórios de Módulos", icon: ChartBarIcon },
    ],
  },
];

export function Sidebar({ collapsed = false, onToggle, userName, role = "gestor", onSignOut }: SidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside
      className={clsx(
        "sticky top-0 h-screen border-r border-slate-200 bg-white flex flex-col overflow-y-auto transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur p-2">
        <div className="flex items-center justify-center">
          <button
            type="button"
            className="relative flex items-center justify-center w-full"
            aria-label="Alternar menu"
            aria-expanded={!collapsed}
            aria-controls="sidebar-nav"
            onClick={onToggle}
          >
            <div className={clsx("relative transition-all duration-400 ease-in-out", collapsed ? "h-8 w-8" : "h-11 w-full max-w-[140px]")}>
              {/* Ícone compacto quando recolhido */}
              <Image
                src="/assets/icon-evolua.svg"
                alt="Logo"
                width={32}
                height={32}
                className={clsx(
                  "absolute left-1/2 -translate-x-1/2 object-contain transition-all duration-400 ease-in-out",
                  collapsed ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-1 scale-95"
                )}
              />
              {/* Logo com nome quando expandido */}
              {/* Logo com nome quando expandido */}
              <Image
                src="/assets/logo-evolua.svg"
                alt="Logo Evolua"
                width={140}
                height={40}
                className={clsx(
                  "absolute left-1/2 -translate-x-1/2 object-contain transition-all duration-400 ease-in-out",
                  collapsed ? "opacity-0 -translate-y-1 scale-95" : "opacity-100 translate-y-0 scale-100"
                )}
              />
            </div>
          </button>
        </div>
      </div>
      <nav id="sidebar-nav" className="mt-2" aria-label="Menu lateral">
        {collapsed ? (
          <div className="space-y-1">
            {(role === "colaborador"
              ? [
                { href: "/treinamentos", label: "Meus Treinamentos", icon: RectangleStackIcon },
              ]
              : groups.flatMap((g) => g.items)
            ).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={clsx(
                    "flex items-center justify-center px-3 py-2 text-sm rounded-md",
                    active
                      ? "bg-[var(--primary)] text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              );
            })}
          </div>
        ) : (
          <Accordion type="multiple" defaultValue={role === "colaborador" ? ["training"] : ["vision", "content", "management"]}>
            {(role === "colaborador"
              ? [
                {
                  id: "training",
                  label: "Treinamentos",
                  items: [
                    { href: "/treinamentos", label: "Meus Treinamentos", icon: RectangleStackIcon },
                  ],
                },
              ]
              : groups
            ).map((group) => (
              <AccordionItem key={group.id} value={group.id}>
                <AccordionTrigger>{group.label}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={clsx(
                            "flex items-center gap-3 px-3 py-2 text-sm rounded-md",
                            active
                              ? "bg-[var(--primary)] text-white"
                              : "text-slate-700 hover:bg-slate-100"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </nav>
      <div className="mt-auto p-2 border-t border-slate-200 bg-white">
        {userName ? <span className="text-xs text-slate-600 block mb-2">{userName}</span> : null}
        {onSignOut ? (
          <Button type="button" variant="secondary" onClick={onSignOut} className="w-full h-8">
            Sair
          </Button>
        ) : null}
      </div>
    </aside>
  );
}

export default Sidebar;
