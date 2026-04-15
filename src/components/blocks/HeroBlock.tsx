"use client";

import { useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { RevealText } from "@/components/ui/RevealText";
import Image from "next/image";
import type { HeroContent, PageBlock } from "@/lib/types";

export function HeroBlock({ block }: { block: PageBlock }) {
  const heroRef = useRef<HTMLDivElement>(null);
  
  const content = (block.content as unknown) as HeroContent;
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.4]);
  const bgOpacity = useTransform(scrollYProgress, [0, 1], [0.8, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 250]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.4 } },
  };

  const letter = {
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    hidden: { opacity: 0, y: 20 },
  };

  const titleP1 = content.title_part1 || "Liberte-se das ";
  const titleHighlight = content.highlight || "Amarras";
  const titleP2 = content.title_part2 || " e Encontre a Paz";
  const bgImage = block.image_url || "/hero-bg.png";

  return (
    <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center items-center pt-24 pb-32 overflow-hidden w-full">
      {/* Animated Background Image - desktop */}
      <motion.div 
        className="absolute inset-0 -z-20 w-full h-full hidden md:block"
        style={{ scale: bgScale, opacity: bgOpacity }}
      >
        <Image src={bgImage} alt="Cover" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-midnight-950/10 via-midnight-950/50 to-midnight-950" />
      </motion.div>

      {/* Static Background Image para mobile */}
      <div className="absolute inset-0 -z-20 w-full h-full md:hidden opacity-60">
        <Image src={bgImage} alt="Cover" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-midnight-950/10 via-midnight-950/50 to-midnight-950" />
      </div>

      {/* Desktop Wrapper */}
      <motion.div style={{ y: textY, opacity: textOpacity }} className="hidden md:flex container mx-auto px-6 text-center z-10 flex-col items-center mt-[-5vh]">
        <RevealText delay={0.2} element="div" className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-black/40 backdrop-blur-md border border-gold-500/20 text-gold-400 text-sm font-light mb-10 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
          <Sparkles size={16} className="text-gold-500" />
          <span className="tracking-widest uppercase text-[10px] md:text-xs font-semibold">{content.badge || "A essência pura"}</span>
        </RevealText>
        
        <motion.h1 variants={container} initial="hidden" animate="visible" className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white tracking-tight max-w-5xl mx-auto mb-10 text-balance leading-[1.1] drop-shadow-2xl">
          {titleP1.split("").map((char, i) => (
            <motion.span key={`dp1-${i}`} variants={letter} style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : "normal" }}>{char}</motion.span>
          ))}
          <motion.span variants={letter} className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 italic px-1 drop-shadow-lg">
            {titleHighlight}
          </motion.span>
          {titleP2.split("").map((char, i) => (
            <motion.span key={`dp2-${i}`} variants={letter} style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : "normal" }}>{char}</motion.span>
          ))}
        </motion.h1>
        
        <RevealText delay={1.5} duration={1.2} element="p" className="text-lg sm:text-2xl text-slate-300/90 max-w-2xl mx-auto mb-16 font-light leading-relaxed drop-shadow-lg">
          {content.subtitle || "Pare de sofrer com depressão..."}
        </RevealText>
        
        <RevealText delay={2.0} duration={1.0} element="div" className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
          <Link href={content.button_link || "/atendimentos"} className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-gold-600 to-gold-500 text-midnight-950 rounded-full hover:from-gold-500 hover:to-gold-400 transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center gap-3 text-base font-semibold tracking-wide">
            {content.button_text || "Iniciar Jornada"} <ArrowRight size={18} />
          </Link>
        </RevealText>
      </motion.div>

      {/* Mobile Wrapper */}
      <div className="flex md:hidden container mx-auto px-6 text-center z-10 flex-col items-center mt-[-5vh]">
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-black/40 border border-gold-500/20 text-gold-400 text-sm font-light mb-10">
          <Sparkles size={16} className="text-gold-500" />
          <span className="tracking-widest uppercase text-[10px] font-semibold">{content.badge || "A essência pura"}</span>
        </div>
        
        <h1 className="font-serif text-4xl sm:text-5xl text-white tracking-tight max-w-5xl mx-auto mb-10 text-balance leading-[1.1]">
          {titleP1}
          <span className="text-gold-400 italic">{titleHighlight}</span>
          {titleP2}
        </h1>
        
        <p className="text-lg text-slate-300/90 max-w-2xl mx-auto mb-16 font-light leading-relaxed">
          {content.subtitle}
        </p>
        
        <div className="flex flex-col items-center justify-center gap-6 w-full">
          <Link href={content.button_link || "/atendimentos"} className="w-full px-10 py-5 bg-gradient-to-r from-gold-600 to-gold-500 text-midnight-950 rounded-full flex items-center justify-center gap-3 text-base font-semibold tracking-wide">
            {content.button_text || "Iniciar Jornada"} <ArrowRight size={18} />
          </Link>
        </div>
      </div>

       <RevealText delay={2.8} className="hidden md:flex absolute bottom-12 left-1/2 -translate-x-1/2 flex-col items-center gap-3 text-gold-500/50">
          <span className="text-[10px] uppercase tracking-[0.4em] font-medium">Respire e Desça</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-gold-500/80 to-transparent"></div>
        </RevealText>
    </section>
  );
}
