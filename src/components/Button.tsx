"use client";
import React from "react";
import { Button as ShadButton, type ButtonProps as ShadButtonProps } from "@/components/ui/button";

type ButtonProps = Omit<ShadButtonProps, "variant" | "size"> & {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
};

const sizeMap: Record<NonNullable<ButtonProps["size"]>, ShadButtonProps["size"]> = {
  sm: "sm",
  md: "default",
  lg: "lg",
};

const variantMap: Record<NonNullable<ButtonProps["variant"]>, ShadButtonProps["variant"]> = {
  primary: "default",
  secondary: "secondary",
  danger: "destructive",
};

export function Button({ variant = "primary", size = "md", ...props }: ButtonProps) {
  return <ShadButton variant={variantMap[variant]} size={sizeMap[size]} {...props} />;
}

export default Button;