"use client";

import React, { useRef } from "react";
import { RevealText } from "@/components/ui/RevealText";
import type { PageBlock, CardSimplesContent } from "@/lib/types";
import { Moon, Leaf, Sun, Star, Heart, Flame, Sparkles, Zap, Eye, Shield, Flower2, TreePine, Wind, Droplets, CloudSun } from "lucide-react";
import Link from "next/link";

// Helper for dynamic icons
const iconMap: Record<string, React.ReactNode> = {
  Moon: <Moon size={28} className="font-light" />,
  Leaf: <Leaf size={28} className="font-light" />,
  Sun: <Sun size={28} className="font-light" />,
  Star: <Star size={28} className="font-light" />,
  Heart: <Heart size={28} className="font-light" />,
  Flame: <Flame size={28} className="font-light" />,
  Sparkles: <Sparkles size={28} className="font-light" />,
  Zap: <Zap size={28} className="font-light" />,
  Eye: <Eye size={28} className="font-light" />,
  Shield: <Shield size={28} className="font-light" />,
  Flower2: <Flower2 size={28} className="font-light" />,
  TreePine: <TreePine size={28} className="font-light" />,
  Wind: <Wind size={28} className="font-light" />,
  Droplets: <Droplets size={28} className="font-light" />,
  CloudSun: <CloudSun size={28} className="font-light" />,
};


export function CardSimplesBlock({ block }: { block: PageBlock }) {
  const content = (block.content as unknown) as CardSimplesContent;
  const items = content.items || [];

  return (
    <>
      {/* DESKTOP */}
      <section className="hidden md:block py-32 relative z-10 bg-midnight-950/80 backdrop-blur-xl border-y border-white/5 w-full">
        <div className="container mx-auto px-6">
          <div className="text-center md:max-w-4xl mx-auto mb-24">
            <RevealText element="h2" className="font-serif text-3xl md:text-5xl text-gold-400 mb-8">
              {content.title || "Atravesse o Limiar da Cura"}
            </RevealText>
            <RevealText delay={0.2} className="w-12 h-[1px] bg-gold-500/50 mx-auto mb-8"></RevealText>
            <RevealText delay={0.3} element="p" className="text-slate-400 text-xl font-light leading-relaxed">
              {content.subtitle || "Deixe que nossas egrégoras de luz amparem você através dos sagrados ensinamentos."}
            </RevealText>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto px-4">
            {items.map((item, index) => (
              <RevealText key={index} delay={0.1 + (index * 0.2)} className={`h-full ${index === 1 ? 'mt-0 md:mt-12' : index === 2 ? 'mt-0 md:mt-24' : ''}`}>
                <Link href={item.link || '/atendimentos'} className="block h-full bg-midnight-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-10 hover:bg-midnight-800/50 hover:border-gold-500/20 transition-all duration-500 group flex flex-col relative overflow-hidden">
                  {/* Background Image with overlay effect */}
                  {item.image_url && (
                    <div className="absolute inset-0 z-0">
                      <img src={item.image_url} alt="" className="w-full h-full object-cover grayscale mix-blend-overlay opacity-10 group-hover:grayscale-[0.5] group-hover:opacity-[0.22] group-hover:scale-105 transition-all duration-700 ease-out" />
                      <div className="absolute inset-0 bg-gradient-to-t from-midnight-900 via-transparent to-transparent opacity-80" />
                    </div>
                  )}
                  {index === 1 && <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-[50px] -mr-10 -mt-10 rounded-full" />}
                  
                  <div className="w-16 h-16 bg-midnight-950 border border-white/5 shadow-inner text-gold-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-gold-500/10 group-hover:border-gold-500/30 transition-all duration-500 relative z-10">
                    {iconMap[item.icon] || <Moon size={28} className="font-light" />}
                  </div>
                  <h3 className="font-serif text-2xl text-slate-200 mb-4 tracking-wide relative z-10">{item.title}</h3>
                  <p className="text-slate-400 font-light leading-relaxed flex-grow relative z-10 pb-8">
                    {item.description}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-white/5 relative z-10">
                    <span className="text-gold-500 font-medium text-xs tracking-widest group-hover:text-gold-400 transition-colors uppercase cursor-pointer">
                      Saber Mais
                    </span>
                  </div>
                </Link>
              </RevealText>
            ))}
          </div>
        </div>
      </section>

      {/* MOBILE (HTML PURO) */}
      <section className="md:hidden py-16 relative z-10 bg-midnight-950/80 border-y border-white/5 w-full">
        <div className="container mx-auto px-6">
          <div className="text-center mx-auto mb-12">
            <h2 className="font-serif text-3xl text-gold-400 mb-6">{content.title}</h2>
            <div className="w-12 h-[1px] bg-gold-500/50 mx-auto mb-6"></div>
            <p className="text-slate-400 text-lg font-light leading-relaxed">
              {content.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
             {items.map((item, index) => (
              <Link href={item.link || '/atendimentos'} key={index} className="group bg-midnight-900/40 border border-white/5 rounded-3xl p-8 flex flex-col h-full hover:bg-midnight-800/50 hover:border-gold-500/20 transition-all relative overflow-hidden">
                {/* Background Image with overlay effect */}
                {item.image_url && (
                  <div className="absolute inset-0 z-0">
                    <img src={item.image_url} alt="" className="w-full h-full object-cover grayscale mix-blend-overlay opacity-10 group-hover:grayscale-[0.5] group-hover:opacity-[0.22] group-hover:scale-105 transition-all duration-700 ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight-900 via-transparent to-transparent opacity-80" />
                  </div>
                )}
                <div className="w-14 h-14 bg-midnight-950 border border-white/5 text-gold-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gold-500/10 group-hover:border-gold-500/30 transition-all duration-500 relative z-10">
                  {/* Icons for mobile */}
                   {iconMap[item.icon] || <Moon size={24} />}
                </div>
                <h3 className="font-serif text-xl text-slate-200 mb-3 relative z-10">{item.title}</h3>
                <p className="text-slate-400 font-light leading-relaxed mb-6 relative z-10">
                  {item.description}
                </p>
                <div className="mt-auto pt-4 border-t border-white/5 relative z-10">
                  <span className="text-gold-500 font-medium text-xs tracking-widest group-hover:text-gold-400 transition-colors uppercase">
                      Saber Mais
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
