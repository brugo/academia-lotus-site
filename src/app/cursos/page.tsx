import { createClient } from "@supabase/supabase-js";
import { PageBlock } from "@/lib/types";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";

export const dynamic = "force-dynamic";

export default async function CursosPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: pageBlocksData } = await supabase
    .from('page_blocks')
    .select('*')
    .eq('is_active', true)
    .order('order', { ascending: true });

  const pageBlocks = (pageBlocksData || []).filter(b => b.content?.page === 'cursos');
  return (
    <div className="min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold-900/10 via-midnight-950 to-midnight-950 -z-10" />

      <div className="relative z-10 w-full mb-12 flex flex-col gap-12">
        <BlockRenderer blocks={pageBlocks as PageBlock[]} />
      </div>
    </div>
  );
}
