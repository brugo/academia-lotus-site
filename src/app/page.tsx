import { createClient } from "@supabase/supabase-js";
import { PageBlock } from "@/lib/types";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { LotusParallax } from "@/components/ui/LotusParallax";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from('page_blocks')
    .select('*')
    .eq('is_active', true)
    .order('order', { ascending: true });
    
  let blocks: PageBlock[] = [];
  
  if (!error && data) {
    blocks = data.filter(b => !b.content?.page || b.content.page === 'home') as PageBlock[];
  }

  return (
    <>
      <LotusParallax />
      <BlockRenderer blocks={blocks} />
    </>
  );
}
