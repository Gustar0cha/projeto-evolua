"use client";
import React, { useEffect, useRef } from "react";

type Props = {
  className?: string;
  colors?: string[];
  particleCount?: number;
  speed?: number; // pixels per frame base
  sizeMin?: number;
  sizeMax?: number;
  opacity?: number; // 0..1
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
};

export default function Particles({
  className,
  colors = ["#ffcf71", "#ffb233", "#ff9d00"],
  particleCount = 60,
  speed = 0.3,
  sizeMin = 1.5,
  sizeMax = 3.5,
  opacity = 0.3,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setSize = () => {
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? parent.clientHeight : window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    setSize();

    const rand = (min: number, max: number) => Math.random() * (max - min) + min;
    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

    const initParticles = () => {
      const list: Particle[] = [];
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speedVar = speed * rand(0.6, 1.4);
        list.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: Math.cos(angle) * speedVar,
          vy: Math.sin(angle) * speedVar,
          r: rand(sizeMin, sizeMax),
          color: pick(colors),
        });
      }
      particlesRef.current = list;
    };

    initParticles();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = opacity;
      const ps = particlesRef.current;
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    const onResize = () => {
      setSize();
      initParticles();
    };
    window.addEventListener("resize", onResize);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [colors, particleCount, speed, sizeMin, sizeMax, opacity]);

  return <canvas ref={canvasRef} className={className} />;
}