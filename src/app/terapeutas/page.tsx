import { RevealText } from "@/components/ui/RevealText";
import { createClient } from "@supabase/supabase-js";
import type { DatabaseTherapist, PageBlock } from "@/lib/types";
import { GoldenParticles } from "@/components/ui/GoldenParticles";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { TherapistFlipCard } from "@/components/ui/TherapistFlipCard";

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

  const { data: servicesData } = await supabase
    .from("services")
    .select("slug, title")
    .eq("is_active", true);

  const services = servicesData || [];

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
          {therapists.map((therapist, index) => {
            const therapistServices = (therapist.supported_services || [])
              .map(slug => services.find(s => s.slug === slug)?.title)
              .filter(Boolean) as string[];

            return (
              <RevealText key={therapist.id || therapist.name} delay={0.2 + index * 0.1} className="h-[520px]">
                <TherapistFlipCard
                  id={therapist.id}
                  name={therapist.name}
                  specialty={therapist.specialty}
                  bio={therapist.bio}
                  photoUrl={therapist.photo_url}
                  services={therapistServices}
                />
              </RevealText>
            );
          })}
          
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
