import { PageBlock } from "@/lib/types";
import { HeroBlock } from "./HeroBlock";
import { CardSimplesBlock } from "./CardSimplesBlock";
import { CtaSectionBlock } from "./CtaSectionBlock";
import { BannerPromocionalBlock } from "./BannerPromocionalBlock";
import { DestaqueBlock } from "./DestaqueBlock";
import { ListaTerapeutasBlock } from "./ListaTerapeutasBlock";
import { DuploCardBlock } from "./DuploCardBlock";
import { TextoNarrativaBlock } from "./TextoNarrativaBlock";
import { CupomBlock } from "./CupomBlock";
import { VideoBannerBlock } from "./VideoBannerBlock";
import { PageHeaderBlock } from "./PageHeaderBlock";

// Renderizador principal: Mapeia o tipo de banco de dados para os componentes visuais
export function BlockRenderer({ blocks, hideEmptyState = false }: { blocks: PageBlock[], hideEmptyState?: boolean }) {
  if (!blocks || blocks.length === 0) {
    if (hideEmptyState) return null;
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center z-10 relative">
        <p className="text-gold-500 font-light text-center mb-4 text-xl">
          Nenhum conteúdo encontrado.
        </p>
        <p className="text-slate-400 font-light text-center">
          Acesse o painel Administrador para adicionar belos blocos a esta página!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      {blocks.map((block) => {
        switch (block.type) {
          case 'hero':
            return <HeroBlock key={block.id} block={block} />;
          
          case 'card_simples':
            return <CardSimplesBlock key={block.id} block={block} />;
            
          case 'banner_promocional':
            return <BannerPromocionalBlock key={block.id} block={block} />;
            
          case 'cta_section':
            return <CtaSectionBlock key={block.id} block={block} />;

          case 'cupom':
            return <CupomBlock key={block.id} block={block} />;

          case 'video_banner':
            return <VideoBannerBlock key={block.id} block={block} />;

          case 'destaque':
            return <DestaqueBlock key={block.id} block={block} />;

          case 'lista_terapeutas':
            return <ListaTerapeutasBlock key={block.id} block={block} />;

          case 'texto_narrativa':
            return <TextoNarrativaBlock key={block.id} block={block} />;

          case 'duplo_card':
            return <DuploCardBlock key={block.id} block={block} />;

          case 'page_header':
            return <PageHeaderBlock key={block.id} block={block} />;

          // Default fallback para blocos que ainda não têm componente visual pronto
          default:
            return (
              <div key={block.id} className="w-full border-t border-white/10 py-20 relative p-6 bg-midnight-950 z-10">
                <div className="absolute top-4 right-4 bg-red-900 border border-red-500/30 text-red-100 text-[10px] px-2 py-1 rounded-full uppercase tracking-widest z-50">
                  Em Construção: {block.type}
                </div>
                <h3 className="text-gold-400 font-serif mb-4">O bloco "{block.type}" ainda não tem componente visual!</h3>
                <pre className="bg-midnight-900/80 p-6 rounded-lg text-slate-300 font-mono text-xs overflow-auto z-10 relative max-h-64">
                  {JSON.stringify(block.content, null, 2)}
                </pre>
              </div>
            );
        }
      })}
    </div>
  );
}

