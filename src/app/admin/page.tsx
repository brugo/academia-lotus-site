"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, GripVertical, Settings2, Trash2, LayoutTemplate } from "lucide-react";
import type { PageBlock, BlockType } from "@/lib/types";
import { BLOCK_TEMPLATES } from "@/lib/types";
import { BlockEditorModal } from "@/components/admin/BlockEditorModal";

export default function AdminDashboardPage() {
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<PageBlock | null>(null);
  const [selectedTypeForNew, setSelectedTypeForNew] = useState<BlockType | undefined>();

  // Fetch blocks from Supabase
  const fetchBlocks = async () => {
    try {
      const { data, error } = await supabase
        .from("page_blocks")
        .select("*")
        .order("order", { ascending: true });

      if (error) throw error;
      setBlocks(data || []);
    } catch (error) {
      console.error("Erro ao buscar blocos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  // Drag and Drop handlers
  const handleDragStart = (index: number) => setDraggedIdx(index);

  const handleDragEnter = (targetIndex: number) => {
    if (draggedIdx === null || draggedIdx === targetIndex) return;
    const newItems = [...blocks];
    const draggedItem = newItems[draggedIdx];
    newItems.splice(draggedIdx, 1);
    newItems.splice(targetIndex, 0, draggedItem);

    const reindexed = newItems.map((item, idx) => ({ ...item, order: idx }));
    setDraggedIdx(targetIndex);
    setBlocks(reindexed);
  };

  const handleDragEnd = async () => {
    setDraggedIdx(null);
    // Persist new order to Supabase
    const promises = blocks.map((b, idx) =>
      supabase.from("page_blocks").update({ order: idx }).eq("id", b.id)
    );
    await Promise.all(promises);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-slate-100 flex items-center gap-3">
            <LayoutTemplate className="text-gold-500" />
            Construtor de Páginas
          </h1>
          <p className="text-slate-400 mt-2 font-light">Gerencie os blocos que compõem a sua Home Page. Arraste para reordenar.</p>
        </div>

        <button 
          onClick={() => {
            setEditingBlock(null);
            setSelectedTypeForNew('hero');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gold-600 hover:bg-gold-500 text-midnight-950 font-medium rounded-full transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)]"
        >
          <Plus size={18} />
          Adicionar Bloco
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4 text-gold-500/50">
            <div className="w-12 h-12 border-2 border-t-gold-500 border-gold-500/20 rounded-full animate-spin" />
            <span className="text-sm uppercase tracking-widest">Carregando blocos...</span>
          </div>
        </div>
      ) : blocks.length === 0 ? (
        <div className="bg-midnight-900/30 border border-white/5 border-dashed rounded-3xl p-12 text-center text-slate-400">
          <LayoutTemplate size={48} className="mx-auto mb-4 opacity-20" />
          <h3 className="text-xl text-slate-300 font-serif mb-2">Nenhum bloco encontrado</h3>
          <p className="mb-6 font-light">Comece adicionando seu primeiro bloco arquitetural para a Home.</p>
          <button 
            onClick={() => {
              setEditingBlock(null);
              setSelectedTypeForNew('hero');
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-midnight-800 hover:bg-midnight-700 text-gold-400 border border-gold-500/20 hover:border-gold-500/40 font-medium rounded-full transition-all"
          >
            <Plus size={18} />
            Adicionar Primeiro Bloco
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {blocks.map((block, index) => {
            const template = BLOCK_TEMPLATES[block.type];
            return (
              <div 
                key={block.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={`bg-midnight-900/60 border rounded-2xl p-4 flex items-center justify-between group hover:border-gold-500/30 transition-all ${
                  draggedIdx === index
                    ? 'opacity-40 border-gold-500 scale-[0.98]'
                    : block.is_active
                      ? 'border-white/10'
                      : 'border-red-500/20 opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="cursor-grab p-2 text-slate-500 hover:text-slate-300 active:cursor-grabbing">
                    <GripVertical size={20} />
                  </div>
                  
                  <div className="w-12 h-12 bg-midnight-950 rounded-xl border border-white/5 flex items-center justify-center text-gold-400">
                    <LayoutTemplate size={20} />
                  </div>
                  
                  <div>
                    <h3 className="text-lg text-slate-200 font-serif">{template?.label || block.type}</h3>
                    <p className="text-xs text-slate-400 font-light font-mono truncate max-w-md">
                      {block.id.split('-')[0]} • {block.is_active ? 'Ativo' : 'Rascunho'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                      setEditingBlock(block);
                      setIsModalOpen(true);
                    }}
                    className="p-2.5 text-slate-400 hover:text-gold-400 hover:bg-gold-500/10 rounded-xl transition-all" 
                    title="Editar Bloco"
                  >
                    <Settings2 size={18} />
                  </button>
                  <button 
                    onClick={async () => {
                      if (confirm("Tem certeza que deseja deletar este bloco?")) {
                        await supabase.from("page_blocks").delete().eq("id", block.id);
                        fetchBlocks();
                      }
                    }}
                    className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all" 
                    title="Remover Bloco"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Editor Modal */}
      <BlockEditorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchBlocks}
        existingBlock={editingBlock}
        selectedType={selectedTypeForNew}
      />
    </div>
  );
}

