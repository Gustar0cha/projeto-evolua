"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Select from "@/components/Select";
import { particles as Particles } from "@appletosolutions/reactbits";
// Imagens locais para o painel esquerdo e logo do projeto
import heroImg1 from "./loginimages/imagemlogin1.png";
import heroImg2 from "./loginimages/imagem login2.png";
import heroImg3 from "./loginimages/imagemlogin3.png";
import heroImg4 from "./loginimages/loginimagem4.png";
import logoName from "../../logo/icon-name.svg";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"gestor" | "colaborador">("gestor");
  const [showPassword, setShowPassword] = useState(false);
  // Slideshow de imagens locais no painel esquerdo
  const heroImages = [heroImg1, heroImg2, heroImg3, heroImg4];
  const heroCaptions = [
    "Aprenda um pouco todos os dias",
    "Evolução constante traz resultados",
    "Seu futuro começa com conhecimento",
    "Treinar hoje, vencer amanhã",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % heroImages.length);
    }, 5500);
    return () => clearInterval(id);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simula login: salva perfil e redireciona conforme papel
    try {
      localStorage.setItem("role", role);
    } catch {}
    // Use replace para evitar navegação duplicada e histórico extra
    router.replace(role === "gestor" ? "/dashboard" : "/treinamentos");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="card-base relative w-full max-w-6xl overflow-hidden rounded-2xl">
        {/* Fundo de partículas cobrindo todo o card (acima do fundo) */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <Particles
            particleCount={200}
            particleColors={["#f9a825", "#f57c00", "#ffcc80"]}
            particleSpread={1.2}
            speed={0.12}
            alphaParticles={false}
            particleBaseSize={3.2}
            sizeRandomness={1}
            disableRotation={false}
            moveParticlesOnHover
            particleHoverFactor={0.8}
            cameraDistance={5}
          />
        </div>
        <div className="relative z-20 grid grid-cols-1 lg:grid-cols-2">
          {/* Painel esquerdo com gradiente; imagens centralizadas */}
          <div className="bg-gradient-to-br from-[#ff9d00] via-[#ffb233] to-[#ffcf71] p-8 sm:p-12 flex items-center justify-center">
            <div className="w-full max-w-[520px]">
              <div className="relative aspect-[16/9] w-full">
                {heroImages.map((img, idx) => (
                  <Image
                    key={idx}
                    alt="Visual do login"
                    src={img}
                  className="absolute inset-0 h-full w-full object-contain transition-opacity duration-700"
                    style={{ opacity: currentIndex === idx ? 1 : 0 }}
                  />
                ))}
              </div>
              <p className="mt-4 text-white text-sm sm:text-base font-medium drop-shadow-md text-center transition-opacity duration-700">
                {heroCaptions[currentIndex]}
              </p>
            </div>
          </div>

          {/* Formulário à direita */}
          <div className="relative p-6 sm:p-10">
            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                <Image src={logoName} alt="Logo Evolua" className="h-12 w-auto sm:h-14" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 text-center">Bem-vindo de volta</h3>
              <p className="text-sm text-slate-600 text-center">Faça login para acessar sua conta</p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <Input
                label="Email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div>
                <Input
                  label="Senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="mt-1 flex items-center justify-start">
                  <button
                    type="button"
                    className="text-xs text-slate-600 hover:text-slate-800"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? "Ocultar senha" : "Mostrar senha"}
                  </button>
                </div>
              </div>
              <Select
                label="Perfil"
                value={role}
                onChange={(e) => setRole(e.target.value as "gestor" | "colaborador")}
                options={[
                  { label: "Gestor", value: "gestor" },
                  { label: "Colaborador", value: "colaborador" },
                ]}
              />
              <Button type="submit" className="w-full">Entrar</Button>

              {/* Opções de social login e cadastro removidas conforme solicitação */}
            </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}