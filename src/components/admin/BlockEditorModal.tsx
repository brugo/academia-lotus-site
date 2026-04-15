"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { X, Save, RefreshCw } from "lucide-react";
import type { PageBlock, BlockType } from "@/lib/types";
import { BLOCK_TEMPLATES } from "@/lib/types";
import { ImageUploader } from "./ImageUploader";

interface BlockEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  existingBlock: PageBlock | null;
  // If no existing block, they can select a type
  selectedType?: BlockType;
}

export function BlockEditorModal({ isOpen, onClose, onSave, existingBlock, selectedType }: BlockEditorModalProps) {
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [type, setType] = useState<BlockType>(existingBlock?.type || selectedType || "hero");
  const [content, setContent] = useState<Record<string, any>>({});
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);

  // Initialize form when opened
  useEffect(() => {
    if (isOpen) {
      if (existingBlock) {
        setType(existingBlock.type);
        setContent(existingBlock.content || {});
        setImageUrl(existingBlock.image_url);
        setIsActive(existingBlock.is_active);
      } else {
        const newType = selectedType || "hero";
        setType(newType);
        setContent(BLOCK_TEMPLATES[newType].defaultContent);
        setImageUrl(null);
        setIsActive(true);
      }
    }
  }, [isOpen, existingBlock, selectedType]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const blockData = {
        type,
        content,
        image_url: imageUrl,
        is_active: isActive,
      };

      if (existingBlock) {
        // Update
        const { error } = await supabase
          .from("page_blocks")
          .update(blockData)
          .eq("id", existingBlock.id);
        if (error) throw error;
      } else {
        // Insert (Get max order first to append at the end)
        const { count } = await supabase
          .from("page_blocks")
          .select("id", { count: "exact" });
          
        const { error } = await supabase
          .from("page_blocks")
          .insert([{ ...blockData, order: (count || 0) * 10 }]);
        if (error) throw error;
      }

      onSave(); // Refetch parent list
      onClose();
    } catch (error) {
      console.error("Erro ao salvar bloco:", error);
      alert("Erro ao salvar. Verifique o console.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="w-full max-w-3xl bg-midnight-900 border border-white/10 rounded-3xl shadow-2xl relative z-10 max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-midnight-950/50">
          <h2 className="text-xl font-serif text-slate-100">
            {existingBlock ? `Editar ${BLOCK_TEMPLATES[type]?.label || type}` : "Novo Bloco"}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Esquerda: Tipo e Ativação */}
            <div className="space-y-6">
              {!existingBlock && (
                <div className="space-y-2">
                  <label className="text-xs font-medium tracking-wide text-slate-300 uppercase">Tipo do Bloco</label>
                  <select 
                    value={type} 
                    onChange={(e) => {
                      const newType = e.target.value as BlockType;
                      setType(newType);
                      setContent(BLOCK_TEMPLATES[newType].defaultContent);
                    }}
                    className="w-full bg-midnight-950/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-gold-500/50"
                  >
                    {Object.entries(BLOCK_TEMPLATES).map(([key, tpl]) => (
                      <option key={key} value={key}>{tpl.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <ImageUploader 
                currentImageUrl={imageUrl} 
                onImageUploaded={setImageUrl} 
              />
              
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-12 h-6 rounded-full transition-colors relative ${isActive ? 'bg-gold-500' : 'bg-midnight-700'}`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : ''}`} />
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={isActive} 
                  onChange={(e) => setIsActive(e.target.checked)} 
                />
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                  Bloco Visível na Home
                </span>
              </label>
            </div>

            {/* Direita: Campos de Conteúdo (Geração Dinâmica do JSONB) */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-200 mb-4 border-b border-white/5 pb-2">Conteúdo</h3>
              
              {Object.keys(content).map((field) => {
                if (field === 'items') return <div key={field} className="text-sm text-gold-400 italic">A edição de listas/itens complexos requer implementação avançada no CMS. Por agora, edite o texto principal.</div>;
                
                return (
                  <div key={field} className="space-y-2">
                    <label className="text-[10px] font-medium tracking-widest text-slate-400 uppercase">
                      {field.replace('_', ' ')}
                    </label>
                    {field.includes('description') || field.includes('subtitle') ? (
                      <textarea
                        value={content[field] as string}
                        onChange={(e) => setContent({ ...content, [field]: e.target.value })}
                        className="w-full bg-midnight-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-gold-500/50 min-h-[100px]"
                      />
                    ) : (
                      <input
                        type="text"
                        value={content[field] as string}
                        onChange={(e) => setContent({ ...content, [field]: e.target.value })}
                        className="w-full bg-midnight-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-gold-500/50"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex items-center justify-end gap-4 bg-midnight-950/50">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-2.5 bg-gold-600 hover:bg-gold-500 text-midnight-950 font-medium rounded-full transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] disabled:opacity-70"
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            Salvar Bloco
          </button>
        </div>
      </div>
    </div>
  );
}
