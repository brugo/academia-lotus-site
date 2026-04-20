import { RevealText } from "@/components/ui/RevealText";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import type { DatabaseTherapist, PageBlock } from "@/lib/types";
import { GoldenParticles } from "@/components/ui/GoldenParticles";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";

export const dynamic = "force-dynamic";

export default async function TerapeutasPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: therapistsData } = await supabase
    .from("therapists")
    .select("*")
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  const therapists = (therapistsData as DatabaseTherapist[]) || [];

  const { data: pageBlocksData } = await supabase
    .from('page_blocks')
    .select('*')
    .eq('is_active', true)
    .order('order', { ascending: true });

  const pageBlocks = (pageBlocksData || []).filter(b => b.content?.page === 'terapeutas');

  return (
    <div className="min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* Background animado e fundo paralax novo */}
      <GoldenParticles />

      <div className="relative z-10 w-full mb-12">
        <BlockRenderer blocks={pageBlocks as PageBlock[]} hideEmptyState={true} />
      </div>

      <div className="container mx-auto px-6 relative z-20">


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {therapists.map((therapist, index) => (
            <RevealText key={therapist.id || therapist.name} delay={0.2 + index * 0.1} className="h-full">
              <div className="group h-full bg-midnight-900/30 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden hover:border-gold-500/30 transition-all duration-700 flex flex-col relative">
                {/* Magical Image area */}
                <div className="h-64 sm:h-80 w-full relative overflow-hidden bg-midnight-950 flex items-end justify-center pt-8">
                  {/* Glowing background aura */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/15 via-midnight-900/50 to-midnight-950 opacity-60 group-hover:opacity-100 transition-opacity duration-1000 z-0" />
                  
                  {/* Aura ring pattern effect */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-gold-500/10 shadow-[0_0_50px_rgba(212,175,55,0.05)] group-hover:scale-110 group-hover:border-gold-500/30 transition-all duration-1000 z-0" />

                  <Image 
                    src={therapist.photo_url || "/user-placeholder.png"}
                    alt={`${therapist.name} - ${therapist.specialty}`}
                    fill
                    className="object-contain object-bottom relative z-10 group-hover:scale-105 transition-transform duration-1000 ease-out"
                  />
                  {/* Gradient to blend the bottom of the cutouts smoothly into the card */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-midnight-900 to-transparent z-20 pointer-events-none" />
                </div>
                
                <div className="p-8 flex-grow flex flex-col relative z-20 -mt-10">
                  <div className="bg-midnight-950/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex-grow flex flex-col shadow-2xl">
                    <span className="text-gold-500 text-xs font-semibold tracking-widest uppercase mb-2">
                      {therapist.specialty || "Terapeuta Sênior"}
                    </span>
                    <h3 className="font-serif text-2xl text-slate-100 mb-4">{therapist.name}</h3>
                    <p className="text-slate-400 font-light text-sm leading-relaxed flex-grow">
                      {therapist.bio}
                    </p>
                    
                    <Link href={`/agendamento?terapeuta=${encodeURIComponent(therapist.name)}`} className="mt-8 self-start text-sm text-gold-400 font-medium tracking-wide flex items-center gap-2 hover:text-gold-300 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-gold-400 hover:after:w-full after:transition-all after:duration-300 pb-1">
                      Agendar Consulta
                    </Link>
                  </div>
                </div>
              </div>
            </RevealText>
          ))}
          
          {therapists.length === 0 && (
             <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl bg-midnight-900/30">
               <h3 className="text-xl text-slate-300 font-serif mb-2">Recrutando Estrelas</h3>
               <p className="text-slate-400 font-light">Os perfis de nossos mestres estão sendo atualizados no sistema.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
