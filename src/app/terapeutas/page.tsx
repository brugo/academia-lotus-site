"use client";

import { RevealText } from "@/components/ui/RevealText";
import Image from "next/image";
import Link from "next/link";

const therapists = [
  {
    name: "Lucy Ferranti",
    role: "Fundadora & Mestra",
    description: "Criadora da Mesa Radiônica de Lótus e autora de 'A Jornada Kármica da Alma'. Especialista em Iridologia Emocional e Unconscious Therapy.",
    image: "/terapeutas/lucy-cut.png"
  },
  {
    name: "Rafael Torresan",
    role: "Terapeuta Sênior",
    description: "Especialista em Mapa Anual, Oráculo da Alma e Unconscious Therapy. Guia para a descoberta do seu propósito verdadeiro.",
    image: "/terapeutas/rafael-cut.png"
  },
  {
    name: "Leandro Ferrante",
    role: "Terapeuta Sênior",
    description: "Facilitador de Constelações Cósmicas e Terapias de Lótus. Focado em desatar nós sistêmicos familiares.",
    image: "/terapeutas/leandro-cut.png"
  },
  {
    name: "Sabrina Ferrante",
    role: "Terapeuta Sênior",
    description: "Especialista em Tarot Cósmico de Lótus. Traz clareza para momentos de decisão através de arquétipos universais.",
    image: "/terapeutas/sabrina-cut.png"
  },
  {
    name: "Belinda Aramayo",
    role: "Terapeuta Sênior",
    description: "Canalizadora das Terapias Cósmicas. Profissional dedicada ao alinhamento energético profundo.",
    image: "/terapeutas/belinda-cut.png"
  }
];

export default function TerapeutasPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gold-900/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-midnight-800/40 blur-[120px] rounded-full -z-10" />

      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <RevealText delay={0.1} element="div" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-medium tracking-widest uppercase mb-6">
            Egrégora da Lótus
          </RevealText>
          <RevealText delay={0.2} element="h1" className="font-serif text-5xl md:text-7xl text-white mb-6">
            Nossos <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 italic px-2">Terapeutas</span>
          </RevealText>
          <RevealText delay={0.3} element="p" className="text-lg text-slate-400 font-light leading-relaxed">
            Uma equipe sênior dedicada a ancorar frequências de cura. Somos condutores de energias elevadas prontos para auxiliar no seu despertar.
          </RevealText>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {therapists.map((therapist, index) => (
            <RevealText key={therapist.name} delay={0.2 + index * 0.1} className="h-full">
              <div className="group h-full bg-midnight-900/30 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden hover:border-gold-500/30 transition-all duration-700 flex flex-col relative">
                {/* Magical Image area */}
                <div className="h-64 sm:h-80 w-full relative overflow-hidden bg-midnight-950 flex items-end justify-center pt-8">
                  {/* Glowing background aura */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/15 via-midnight-900/50 to-midnight-950 opacity-60 group-hover:opacity-100 transition-opacity duration-1000 z-0" />
                  
                  {/* Aura ring pattern effect */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-gold-500/10 shadow-[0_0_50px_rgba(212,175,55,0.05)] group-hover:scale-110 group-hover:border-gold-500/30 transition-all duration-1000 z-0" />

                  <Image 
                    src={therapist.image}
                    alt={`${therapist.name} - ${therapist.role}`}
                    fill
                    className="object-contain object-bottom relative z-10 group-hover:scale-105 transition-transform duration-1000 ease-out"
                  />
                  {/* Gradient to blend the bottom of the cutouts smoothly into the card */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-midnight-900 to-transparent z-20 pointer-events-none" />
                </div>
                
                <div className="p-8 flex-grow flex flex-col relative z-20 -mt-10">
                  <div className="bg-midnight-950/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex-grow flex flex-col shadow-2xl">
                    <span className="text-gold-500 text-xs font-semibold tracking-widest uppercase mb-2">
                      {therapist.role}
                    </span>
                    <h3 className="font-serif text-2xl text-slate-100 mb-4">{therapist.name}</h3>
                    <p className="text-slate-400 font-light text-sm leading-relaxed flex-grow">
                      {therapist.description}
                    </p>
                    
                    <Link href={`/agendamento?terapeuta=${encodeURIComponent(therapist.name)}`} className="mt-8 self-start text-sm text-gold-400 font-medium tracking-wide flex items-center gap-2 hover:text-gold-300 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-gold-400 hover:after:w-full after:transition-all after:duration-300 pb-1">
                      Agendar Consulta
                    </Link>
                  </div>
                </div>
              </div>
            </RevealText>
          ))}
        </div>
      </div>
    </div>
  );
}
