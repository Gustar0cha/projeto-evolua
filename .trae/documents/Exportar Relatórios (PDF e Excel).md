## Objetivo
- Permitir exportar relatórios de alunos (resultados, métricas e gráficos) em `PDF` e `Excel` nas páginas de resultado do aluno e no dashboard administrativo.

## Estado Atual
- Front-end: `Next.js (App Router)` com `React` e `Tailwind`.
- Gráficos: `chart.js` + `react-chartjs-2` e `recharts` já em uso.
- Páginas-alvo:
  - Resultado do módulo: `src/app/(user)/modulo/[id]/resultado/page.tsx`
  - Dashboard admin: `src/app/(admin)/dashboard/page.tsx`
- Backend/API: inexistente (dados mock). Exportação: não há utilitários nem bibliotecas instaladas.

## Estratégia de Implementação
- Geração 100% client-side para PDF e Excel, com bibliotecas consolidadas.
- Evitar impacto de bundle inicial usando `dynamic import` para carregar bibliotecas de exportação sob demanda.

## Bibliotecas Propostas
- `xlsx` (SheetJS) para gerar `Excel`.
- `jspdf` + `jspdf-autotable` para `PDF` (tabelas e conteúdo textual).
- `html2canvas` para capturar gráficos `Recharts` (SVG) e containers complexos em imagem.
- Uso nativo de `Chart.js`: `chart.toBase64Image()` para obter imagens dos gráficos.

## Modelagem de Dados de Relatório
- Criar tipos e adaptadores para normalizar dados das páginas:
  - `src/types/report.ts`: `Student`, `ModuleResult`, `Metric`, `ChartImage`.
  - `src/lib/report/adapters.ts`: funções que extraem/formatam dados das páginas atuais (mock) e, futuramente, da API.

## Exportação para Excel
- Arquivo: `src/lib/export/excel.ts`.
- Funções:
  - `buildWorkbookForStudentResult(data)` → sheets: `Resultados`, `Aluno`, `Métricas`.
  - `buildWorkbookForAdminDashboard(data)` → sheets: `VisãoGeral`, `Métricas`, `Gráficos` (dados base dos gráficos).
  - `downloadWorkbook(workbook, filename)` → gera `Blob` e baixa com `a[href]`/`URL.createObjectURL`.
- Colunas: identificadores, nome do aluno, módulo, pontuação, status, data, métricas agregadas.

## Exportação para PDF
- Arquivo: `src/lib/export/pdf.ts`.
- Montagem do documento A4 com:
  - Cabeçalho: título do relatório, aluno/módulo, data.
  - Tabela de resultados via `autotable`.
  - Seções de métricas e observações (texto).
  - Imagens de gráficos (PNG base64).
- Funções:
  - `exportStudentModuleResultToPDF(data, images)`.
  - `exportAdminDashboardToPDF(data, images)`.

## Captura de Imagens dos Gráficos
- Hook utilitário: `src/hooks/useChartImages.ts`.
- `Chart.js`: via `chartRef.current?.toBase64Image()`.
- `Recharts (Radar)`: capturar container com `html2canvas(ref)` e converter para PNG.
- Retorno: `{ barPng, piePng, radarPng }` para compor no PDF.

## Componentização de UI
- `src/components/ui/export-buttons.tsx`: componente com botões `Exportar PDF` e `Exportar Excel`.
- Integração nas páginas:
  - `resultado/page.tsx`: passa dados do aluno/módulo e refs dos gráficos (se houver) para os utilitários.
  - `dashboard/page.tsx`: coleta dados das métricas e usa os refs dos gráficos (`Bar`, `Pie`, `Radar`).
- Mensagens e labels em português.

## Performance e UX
- `dynamic import` para `xlsx`, `jspdf`, `autotable`, `html2canvas` apenas ao clicar em exportar.
- Feedback de carregamento (spinner/toast) durante geração dos arquivos.
- Tamanhos e qualidade das imagens dos gráficos ajustados para boa legibilidade em A4.

## Segurança e Acesso
- Botões de exportação visíveis conforme contexto (admin vs aluno).
- Sem dados sensíveis no arquivo. Nome do arquivo com timestamp: `relatorio-<contexto>-YYYYMMDD-HHmm.pdf/xlsx`.

## Testes e Validação
- Testar manualmente downloads e abertura em Excel/Adobe Reader.
- Validar se tabelas e gráficos aparecem corretamente e com dados consistentes.
- Cross-browser básico (Chromium/Firefox).

## Entregáveis (Arquivos/Alterações)
- `src/types/report.ts`
- `src/lib/report/adapters.ts`
- `src/lib/export/excel.ts`
- `src/lib/export/pdf.ts`
- `src/hooks/useChartImages.ts`
- `src/components/ui/export-buttons.tsx`
- Ajustes em:
  - `src/app/(user)/modulo/[id]/resultado/page.tsx`
  - `src/app/(admin)/dashboard/page.tsx`

## Plano por Fases
- Fase 1: Tipos e adaptadores de dados.
- Fase 2: Exportação Excel e botão na UI (resultado e dashboard).
- Fase 3: Captura de gráficos e exportação PDF com imagens.
- Fase 4: UX (loading/toasts), refino de layout e nomes de arquivos.
- Fase 5: Validação final e ajustes.

## Próximo Passo
- Após aprovação, adiciono as bibliotecas e implemento as funções/utilitários e os botões de exportação nas páginas citadas.