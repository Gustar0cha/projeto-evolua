import ModuleClientPage from "./client";
import { use } from 'react';

export default function ModuleExecutionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <ModuleClientPage id={resolvedParams.id} />;
}