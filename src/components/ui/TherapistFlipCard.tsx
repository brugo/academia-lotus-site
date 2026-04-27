"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, RotateCcw } from "lucide-react";

interface TherapistFlipCardProps {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  photoUrl: string;
  services: string[];
}

export function TherapistFlipCard({ id, name, specialty, bio, photoUrl, services }: TherapistFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="flip-card-container h-[520px] group"
      style={{ perspective: "1200px" }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div 
        className="flip-card-inner relative w-full h-full transition-transform duration-700 ease-out"
        style={{ 
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ============ FRONT ============ */}
        <div 
          className={`absolute inset-0 rounded-3xl overflow-hidden ${isFlipped ? 'pointer-events-none' : ''}`}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Full-card photo background */}
          <div className="absolute inset-0 bg-midnight-950">
            <Image 
              src={photoUrl || "/user-placeholder.png"}
              alt={`${name} - ${specialty}`}
              fill
              className="object-cover object-top opacity-90 group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            {/* Cinematic gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-midnight-950/30 to-transparent h-1/3" />
          </div>

          {/* Gold aura glow on hover */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-48 bg-gold-500/8 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
          
          {/* Decorative ring */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-gold-500/0 group-hover:border-gold-500/15 group-hover:shadow-[0_0_40px_rgba(212,175,55,0.08)] transition-all duration-1000 pointer-events-none" />

          {/* Content overlay at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-7 z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-gold-500/15 text-gold-400 text-[10px] tracking-[0.2em] font-semibold uppercase rounded-full border border-gold-500/20 backdrop-blur-sm">
                {specialty || "Terapeuta Sênior"}
              </span>
            </div>
            
            <h3 className="font-serif text-3xl text-white mb-3 drop-shadow-lg">
              {name}
            </h3>

            <p className="text-slate-300/70 text-xs font-light tracking-wider uppercase flex items-center gap-2">
              <RotateCcw size={12} className="text-gold-500/60 group-hover:text-gold-400 transition-colors" />
              Passe o mouse para saber mais
            </p>
          </div>

          {/* Border styling */}
          <div className="absolute inset-0 rounded-3xl border border-white/[0.06] group-hover:border-gold-500/20 transition-colors duration-700 pointer-events-none" />
        </div>

        {/* ============ BACK ============ */}
        <div 
          className={`absolute inset-0 rounded-3xl overflow-hidden ${isFlipped ? 'pointer-events-auto' : 'pointer-events-none'}`}
          style={{ 
            backfaceVisibility: "hidden", 
            transform: "rotateY(180deg)",
          }}
        >
          {/* Luxurious dark background */}
          <div className="absolute inset-0 bg-gradient-to-br from-midnight-900 via-midnight-950 to-midnight-900" />
          
          {/* Decorative golden accents */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/5 blur-[60px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold-500/3 blur-[40px] rounded-full pointer-events-none" />
          
          {/* Geometric sacred pattern */}
          <div className="absolute top-6 right-6 w-20 h-20 rounded-full border border-gold-500/10" />
          <div className="absolute top-9 right-9 w-14 h-14 rounded-full border border-gold-500/8" />
          <div className="absolute top-[46px] right-[46px] w-8 h-8 rounded-full border border-gold-500/6" />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col p-7">
            {/* Header with small photo */}
            <div className="flex items-center gap-4 mb-6 pb-5 border-b border-white/5">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gold-500/30 shadow-[0_0_15px_rgba(212,175,55,0.15)] flex-shrink-0">
                <Image 
                  src={photoUrl || "/user-placeholder.png"}
                  alt={name}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-serif text-2xl text-white">{name}</h3>
                <span className="text-gold-400/80 text-[11px] tracking-[0.15em] uppercase font-semibold">
                  {specialty || "Terapeuta Sênior"}
                </span>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-5 flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={13} className="text-gold-500/60" />
                <span className="text-[11px] text-gold-400/60 uppercase tracking-[0.2em] font-semibold">Sobre</span>
              </div>
              <p className="text-slate-300 font-light text-base leading-relaxed line-clamp-4">
                {bio}
              </p>
            </div>

            {/* Services/Techniques */}
            {services.length > 0 && (
              <div className="mb-auto">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={13} className="text-gold-500/60" />
                  <span className="text-[11px] text-gold-400/60 uppercase tracking-[0.2em] font-semibold">Técnicas</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {services.map(title => (
                    <span 
                      key={title} 
                      className="text-[11px] px-2.5 py-1 rounded-full bg-gold-500/8 border border-gold-500/15 text-gold-200/80 font-medium tracking-wider"
                    >
                      {title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Button */}
            <div className="mt-auto pt-5 border-t border-white/5">
              <Link 
                href={`/atendimentos?terapeuta=${id}`}
                className="flex items-center justify-center gap-3 w-full py-3.5 bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 text-midnight-950 rounded-xl font-bold text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(212,175,55,0.25)] hover:shadow-[0_0_35px_rgba(212,175,55,0.4)] hover:-translate-y-0.5 transition-all duration-300"
              >
                Agendar Consulta
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Border styling */}
          <div className="absolute inset-0 rounded-3xl border border-gold-500/15 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
