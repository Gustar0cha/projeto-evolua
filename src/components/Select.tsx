"use client";
import React from "react";
import { cn } from "@/lib/utils";
import {
  Select as ShadSelect,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

type BaseProps = {
  label?: string;
  error?: string;
  containerClassName?: string;
  options?: { label: string; value: string }[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
};

export function Select({
  label,
  error,
  containerClassName,
  className,
  options = [],
  children,
  value,
  onChange,
  disabled,
  placeholder,
}: BaseProps) {
  return (
    <div className={cn("w-full", containerClassName)}>
      {label ? (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      ) : null}

      <ShadSelect
        value={value}
        onValueChange={(v) => {
          if (onChange) {
            const event = { target: { value: v } } as unknown as React.ChangeEvent<HTMLSelectElement>;
            onChange(event);
          }
        }}
        disabled={disabled}
      >
        <SelectTrigger className={cn("text-slate-900", error && "border-red-500", className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="text-slate-900">
          {options.length > 0
            ? options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-slate-900">
                  {opt.label}
                </SelectItem>
              ))
            : children}
        </SelectContent>
      </ShadSelect>

      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export default Select;