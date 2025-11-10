"use client";
import React from "react";
import { Input as ShadInput, type InputProps as ShadInputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type InputProps = ShadInputProps & {
  label?: string;
  error?: string;
  containerClassName?: string;
};

export function Input({ label, error, containerClassName, className, ...props }: InputProps) {
  return (
    <div className={cn("w-full", containerClassName)}>
      {label ? (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      ) : null}
      <ShadInput className={cn(error && "border-red-500", className)} {...props} />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export default Input;