"use client";
import React, { use } from "react";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const search = useSearchParams();
  const score = search.get("score") ?? "0";

  return (
    <div className="max-w-2xl">
      <Card>
        <div className="space-y-3 text-center">
          <h2 className="text-xl font-semibold text-slate-900">Parabéns!</h2>
          <p className="text-sm text-slate-700">
            Você concluiu o módulo <span className="font-medium">{id.toUpperCase()}</span> com <span className="font-semibold">{score}%</span> de acerto.
          </p>
          <div className="pt-2">
            <Link href="/treinamentos">
              <Button>Voltar para Meus Treinamentos</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}