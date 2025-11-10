import React from "react";
import { Card as UICard, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type CardProps = {
  title?: string;
  className?: string;
  children: React.ReactNode;
};

export function Card({ title, className, children }: CardProps) {
  return (
    <UICard className={className}>
      {title ? (
        <CardHeader>
          <CardTitle className="text-slate-900">{title}</CardTitle>
        </CardHeader>
      ) : null}
      <CardContent className={title ? undefined : "p-4"}>{children}</CardContent>
    </UICard>
  );
}

export default Card;