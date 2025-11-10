import React from "react";
import { Badge as ShadBadge, type BadgeProps as ShadBadgeProps } from "@/components/ui/badge";

type BadgeProps = {
  variant?: "success" | "warning" | "info" | "danger" | "default";
  children: React.ReactNode;
  className?: string;
};

const variantMap: Record<NonNullable<BadgeProps["variant"]>, ShadBadgeProps["variant"]> = {
  default: "default",
  success: "success",
  warning: "warning",
  info: "info",
  danger: "destructive",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <ShadBadge variant={variantMap[variant]} className={className}>{children}</ShadBadge>
  );
}

export default Badge;