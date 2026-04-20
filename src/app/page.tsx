"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PageBlock } from "@/lib/types";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { LotusParallax } from "@/components/ui/LotusParallax";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [blocks, setBlocks] = useState<PageBlock[] | null>(null);

  useEffect(() => {
    async function fetchActiveBlocks() {
      const { data, error } = await supabase
        .from('page_blocks')
        .select('*')
        .eq('is_active', true)
        .order('order', { ascending: true });
        
      if (!error && data) {
        const homeBlocks = data.filter(b => !b.content?.page || b.content.page === 'home');
        setBlocks(homeBlocks);
      } else {
        setBlocks([]);
      }
    }
    fetchActiveBlocks();
  }, []);

  return (
    <>
      <LotusParallax />

      {blocks === null ? (
        <div className="min-h-screen flex items-center justify-center text-gold-500">
           <Loader2 className="animate-spin mr-3" size={24} />
           <span className="tracking-widest uppercase text-sm">Carregando a Essência Lótus...</span>
        </div>
      ) : (
        <BlockRenderer blocks={blocks} />
      )}
    </>
  );
}
