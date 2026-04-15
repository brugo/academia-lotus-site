"use client";

import { motion } from "framer-motion";
import { UserCircle, Star, ArrowRight } from "lucide-react";
import Image from "next/image";

export function TherapistSelection({ therapists, onSelect, requestedService }: { therapists: any[], onSelect: (t: any) => void, requestedService?: string }) {
  // Helper formatação slug se precisar match flexível
  const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  // Filtrar terapeutas
  const filteredTherapists = therapists.filter(t => {
    if (!t.is_active) return false;
    if (!requestedService) return true;
    
    // Suportado se: a array supported_services inclui o slug do requestedService
    const reqSlug = normalize(requestedService);
    return t.supported_services && t.supported_services.includes(reqSlug);
  });

  if (therapists.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-400">Nenhum terapeuta disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {requestedService && (
        <div className="mb-12 px-6 py-4 bg-gold-900/10 border border-gold-500/20 rounded-2xl flex items-center gap-4 justify-center animate-in fade-in slide-in-from-top-4 duration-700 mx-auto max-w-fit">
          <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse"></span>
          <p className="text-gold-200 text-sm font-light">
            Atendimento Selecionado: <strong className="text-gold-400 font-medium ml-1">{requestedService}</strong>
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 w-full pb-32">
      {filteredTherapists.length > 0 ? filteredTherapists.map((therapist, idx) => (
        <motion.div
          key={therapist.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1, duration: 0.5 }}
          onClick={() => onSelect(therapist)}
          whileHover={{ y: -5, scale: 1.02 }}
          className="group cursor-pointer relative rounded-3xl overflow-hidden bg-midnight-900 border border-white/5 hover:border-gold-500/30 transition-all duration-300 shadow-xl"
        >
          {/* Foto Parallax simulada */}
          <div className="h-64 sm:h-72 w-full relative overflow-hidden bg-midnight-950">
            {therapist.photo_url !== '/user-placeholder.png' ? (
               <Image 
                 src={therapist.photo_url} 
                 alt={therapist.name} 
                 fill 
                 className="object-cover object-top opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
               />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-700">
                <UserCircle size={80} strokeWidth={1} />
              </div>
            )}
            
            {/* Gradiente estilo cinema */}
            <div className="absolute inset-0 bg-gradient-to-t from-midnight-900 via-midnight-900/60 to-transparent" />
          </div>

          <div className="absolute bottom-0 w-full p-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-gold-500/10 text-gold-400 text-xs tracking-widest font-medium uppercase rounded-full border border-gold-500/20 backdrop-blur-sm">
                {therapist.specialty || "Mestre Espiritual"}
              </span>
            </div>
            
            <h3 className="text-2xl font-serif text-white mb-1 group-hover:text-gold-300 transition-colors">
              {therapist.name}
            </h3>
            
            <p className="text-sm text-slate-400 font-light line-clamp-2 mb-4">
              {therapist.bio}
            </p>

            <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
               <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Star size={16} className="text-gold-500 fill-gold-500/20" /> 
                  <span className="text-sm">R$ {therapist.base_price.toFixed(2)}</span>
               </div>
               
               <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold-500 group-hover:text-midnight-950 transition-colors">
                 <ArrowRight size={16} />
               </div>
            </div>
          </div>
        </motion.div>
      )) : (
        <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl bg-midnight-900/30">
          <p className="text-slate-400 font-light">Nenhum de nossos mestres está configurado no sistema para atender a jornada "{requestedService}" no momento.</p>
        </div>
      )}
      </div>
    </div>
  );
}
