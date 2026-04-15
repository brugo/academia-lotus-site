"use client";

import { useRef } from "react";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { RevealText } from "@/components/ui/RevealText";
import Image from "next/image";
import type { PageBlock, BannerPromocionalContent } from "@/lib/types";

export function BannerPromocionalBlock({ block }: { block: PageBlock }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const content = (block.content as unknown) as BannerPromocionalContent;
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const imgY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  
  const bgImage = block.image_url || "/banner-bg.png"; // Fallback if no image

  return (
    <section ref={containerRef} className="py-20 px-4 md:px-8 w-full bg-midnight-950 relative z-10">
      <RevealText className="max-w-7xl mx-auto w-full relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group">
        
        {/* Parallax Image Background */}
        <div className="absolute inset-0 overflow-hidden bg-midnight-900 -z-20">
           {block.image_url ? (
             <motion.div style={{ y: imgY, height: "140%" }} className="w-full relative">
               <Image src={bgImage} alt="Banner" fill className="object-cover opacity-50 group-hover:opacity-60 transition-opacity duration-1000" />
             </motion.div>
           ) : (
             <div className="absolute inset-0 bg-gradient-to-r from-gold-900/20 to-midnight-900/80" />
           )}
           <div className="absolute inset-0 bg-gradient-to-r from-midnight-950 via-midnight-950/80 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 w-full md:w-2/3 lg:w-1/2 p-10 md:p-16 lg:p-20 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-semibold tracking-widest uppercase mb-6 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
            <Star size={14} className="fill-gold-500 text-gold-500" />
            Promoção
          </div>
          
          <h2 className="font-serif text-3xl md:text-5xl text-white mb-6 leading-tight">
            {content.title || "Condição Especial"}
          </h2>
          
          <p className="text-lg text-slate-300 font-light mb-10 leading-relaxed max-w-md">
            {content.description || "Aproveite esta oportunidade única para transformar a sua jornada com um desconto exclusivo."}
          </p>
          
          <Link 
            href={content.button_link || "/"} 
            className="px-8 py-4 bg-gold-600 hover:bg-gold-500 text-midnight-950 font-medium rounded-full transition-all duration-300 flex items-center gap-3 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transform hover:-translate-y-1"
          >
            {content.button_text || "Aproveitar Oferta"} <ArrowRight size={18} />
          </Link>
        </div>
      </RevealText>
    </section>
  );
}
