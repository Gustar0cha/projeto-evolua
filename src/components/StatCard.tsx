import React from "react";
import { Card as UICard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
};

export function StatCard({ title, value, icon, className }: StatCardProps) {
  return (
    <UICard className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
          {icon ? <div className="text-muted-foreground">{icon}</div> : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold text-slate-900">{value}</div>
      </CardContent>
    </UICard>
  );
}

export default StatCard;