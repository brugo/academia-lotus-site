"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function GoldenParticles() {
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  
  // Efeito Parallax atrelado ao Scroll
  // Diferentes profundidades de campo (multiplicadores de velocidade)
  const layer1Y = useTransform(scrollY, [0, 2000], [0, -150]); // Fundo (lento)
  const layer2Y = useTransform(scrollY, [0, 2000], [0, -350]); // Meio (médio)
  const layer3Y = useTransform(scrollY, [0, 2000], [0, -700]); // Frente (veloz)

  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    // Gerar as partículas apenas no cliente para evitar erros de hidratação no Next.js
    const generated = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      // Distribuímos passando dos limites da tela para não sumirem de vista logo nas bordas
      left: `${(Math.random() * 120) - 10}%`,
      top: `${(Math.random() * 150) - 10}%`,
      size: Math.random() * 4 + 1, // 1px a 5px
      opacity: Math.random() * 0.4 + 0.1,
      layer: i % 3, // Camadas de profundidade z 0, 1 ou 2
      duration: Math.random() * 15 + 15, // Duração do "respiro" infinito
      delay: Math.random() * 5,
    }));
    setParticles(generated);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Luzes de Aura etéreas acompanhando o movimento */}
      <motion.div 
        className="absolute top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-gold-600/5 blur-[120px] rounded-full"
        style={{ y: layer1Y }}
      />
      <motion.div 
        className="absolute top-[50%] -right-[10%] w-[40vw] h-[40vw] bg-midnight-500/10 blur-[130px] rounded-full"
        style={{ y: layer2Y }}
      />

      {/* Partículas flutuantes individuais com físicas atreladas (Paralax + Flutuação natural) */}
      {particles.map((p) => {
        const yTransform = p.layer === 0 ? layer1Y : p.layer === 1 ? layer2Y : layer3Y;
        
        return (
          <motion.div
            key={p.id}
            style={{
              position: "absolute",
              left: p.left,
              top: p.top,
              y: yTransform,
            }}
          >
             <motion.div
                style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  borderRadius: "50%",
                  backgroundColor: "#d4af37", // gold-500
                  opacity: p.opacity,
                  boxShadow: `0 0 ${p.size * 3}px rgba(212, 175, 55, 0.6)`,
                }}
                animate={{
                  y: ["0px", "-30px", "0px"],
                  x: ["0px", `${Math.random() * 30 - 15}px`, "0px"]
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: p.delay,
                }}
             />
          </motion.div>
        );
      })}
    </div>
  );
}
