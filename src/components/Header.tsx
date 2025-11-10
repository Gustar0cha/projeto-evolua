"use client";
import React from "react";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import Button from "@/components/Button";
import Image from "next/image";
import siteIcon from "@/logo/icon.svg";

type HeaderProps = {
  title?: string;
  userName?: string;
  onSignOut?: () => void;
};

export function Header({ title, userName = "Gestor", onSignOut }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="container-page h-14 flex items-center justify-between">
        <div className="flex items-center">
          <Image src={siteIcon} alt="Evolua" className="h-6 w-auto" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-700">{userName}</span>
          <Button variant="secondary" onClick={onSignOut} className="h-8 px-2 py-1">
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;