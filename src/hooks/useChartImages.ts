import { useCallback } from "react";
import html2canvas from "html2canvas";
import type { Chart as ChartJS } from "chart.js";
import { ChartImage } from "@/types/report";

export function useChartImages() {
  const getChartJsImage = useCallback(async (chartRef: React.MutableRefObject<ChartJS | null>, name: string, width = 500, height = 280): Promise<ChartImage | null> => {
    const chart = chartRef.current;
    if (!chart) return null;
    const dataUrl = chart.toBase64Image();
    return { name, dataUrl, width, height };
  }, []);

  const getRechartsContainerImage = useCallback(async (containerRef: React.MutableRefObject<HTMLElement | null>, name: string, width = 500, height = 280): Promise<ChartImage | null> => {
    const el = containerRef.current;
    if (!el) return null;
    const canvas = await html2canvas(el, { backgroundColor: "#ffffff", scale: 2 });
    const dataUrl = canvas.toDataURL("image/png");
    return { name, dataUrl, width, height };
  }, []);

  return { getChartJsImage, getRechartsContainerImage };
}

