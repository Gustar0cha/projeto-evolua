import React from "react";
import CollaboratorLayout from "@/components/layouts/CollaboratorLayout";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <CollaboratorLayout>{children}</CollaboratorLayout>;
}