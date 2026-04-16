"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { X, Save, RefreshCw, Moon, Leaf, Sun, Star, Heart, Flame, Sparkles, Zap, Eye, Shield, Flower2, TreePine, Wind, Droplets, CloudSun, ChevronLeft, ChevronRight, Plus, Trash2, UploadCloud, Image as ImageIcon, Loader2, Users } from "lucide-react";
import type { PageBlock, BlockType, CardItem, DatabaseTherapist } from "@/lib/types";
import { BLOCK_TEMPLATES } from "@/lib/types";
import { ImageUploader } from "./ImageUploader";

/* ---- Ícones disponíveis para os cards ---- */
const AVAILABLE_ICONS: { name: string; icon: React.ReactNode }[] = [
  { name: "Moon", icon: <Moon size={20} /> },
  { name: "Leaf", icon: <Leaf size={20} /> },
  { name: "Sun", icon: <Sun size={20} /> },
  { name: "Star", icon: <Star size={20} /> },
  { name: "Heart", icon: <Heart size={20} /> },
  { name: "Flame", icon: <Flame size={20} /> },
  { name: "Sparkles", icon: <Sparkles size={20} /> },
  { name: "Zap", icon: <Zap size={20} /> },
  { name: "Eye", icon: <Eye size={20} /> },
  { name: "Shield", icon: <Shield size={20} /> },
  { name: "Flower2", icon: <Flower2 size={20} /> },
  { name: "TreePine", icon: <TreePine size={20} /> },
  { name: "Wind", icon: <Wind size={20} /> },
  { name: "Droplets", icon: <Droplets size={20} /> },
  { name: "CloudSun", icon: <CloudSun size={20} /> },
];

/* ---- Páginas disponíveis para redirecionamento ---- */
const AVAILABLE_PAGES = [
  { value: "/", label: "Início" },
  { value: "/atendimentos", label: "Atendimentos" },
  { value: "/cursos", label: "Cursos" },
  { value: "/terapeutas", label: "Terapeutas" },
  { value: "/agendamento", label: "Agendamento" },
];

/* ---- Editor individual dos cards ---- */
function CardItemsEditor({ items, onChange }: { items: CardItem[]; onChange: (items: CardItem[]) => void }) {
  const [activeCard, setActiveCard] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateItem = (index: number, field: keyof CardItem, value: string | undefined) => {
    const updated = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    onChange(updated);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `cards/${fileName}`;
      const { error: uploadError } = await supabase.storage.from("block-images").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("block-images").getPublicUrl(filePath);
      updateItem(activeCard, "image_url", data.publicUrl);
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao fazer upload da imagem.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const addCard = () => {
    if (items.length >= 6) return; // max 6 cards
    onChange([...items, { icon: "Star", title: "Novo Card", description: "Descrição do card.", link: "/atendimentos" }]);
    setActiveCard(items.length);
  };

  const removeCard = (index: number) => {
    if (items.length <= 1) return; // min 1 card
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
    setActiveCard(Math.min(activeCard, updated.length - 1));
  };

  const currentItem = items[activeCard];
  if (!currentItem) return null;

  return (
    <div className="space-y-5">
      {/* Header: Tabs dos cards */}
      <div className="flex items-center gap-2 flex-wrap">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => setActiveCard(i)}
            className={`
              relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
              ${activeCard === i
                ? "bg-gold-500/20 text-gold-400 border border-gold-500/40 shadow-[0_0_12px_rgba(212,175,55,0.1)]"
                : "bg-midnight-950/60 text-slate-400 border border-white/5 hover:border-white/15 hover:text-slate-300"
              }
            `}
          >
            Card {i + 1}
            {activeCard === i && (
              <span className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-6 h-[2px] bg-gold-500 rounded-full" />
            )}
          </button>
        ))}

        {/* Adicionar Card */}
        {items.length < 6 && (
          <button
            onClick={addCard}
            className="p-2 rounded-xl text-slate-500 border border-dashed border-white/10 hover:border-gold-500/30 hover:text-gold-400 transition-all"
            title="Adicionar card"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Navegação rápida mobile */}
      <div className="flex items-center justify-between md:hidden">
        <button
          onClick={() => setActiveCard(Math.max(0, activeCard - 1))}
          disabled={activeCard === 0}
          className="p-2 text-slate-400 disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-xs text-slate-400 tracking-widest uppercase">
          Card {activeCard + 1} de {items.length}
        </span>
        <button
          onClick={() => setActiveCard(Math.min(items.length - 1, activeCard + 1))}
          disabled={activeCard === items.length - 1}
          className="p-2 text-slate-400 disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Editor do card ativo */}
      <div className="bg-midnight-950/40 border border-white/5 rounded-2xl p-5 space-y-5">
        {/* Ícone */}
        <div className="space-y-2">
          <label className="text-[10px] font-medium tracking-widest text-slate-400 uppercase">Ícone</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_ICONS.map(({ name, icon }) => (
              <button
                key={name}
                onClick={() => updateItem(activeCard, "icon", name)}
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
                  ${currentItem.icon === name
                    ? "bg-gold-500/20 text-gold-400 border border-gold-500/50 shadow-[0_0_10px_rgba(212,175,55,0.15)] scale-110"
                    : "bg-midnight-900/60 text-slate-500 border border-white/5 hover:text-slate-300 hover:border-white/15"
                  }
                `}
                title={name}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Título */}
        <div className="space-y-2">
          <label className="text-[10px] font-medium tracking-widest text-slate-400 uppercase">Título do Card</label>
          <input
            type="text"
            value={currentItem.title}
            onChange={(e) => updateItem(activeCard, "title", e.target.value)}
            placeholder="Ex: Terapia Holística"
            className="w-full bg-midnight-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-gold-500/50 transition-colors"
          />
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <label className="text-[10px] font-medium tracking-widest text-slate-400 uppercase">Descrição</label>
          <textarea
            value={currentItem.description}
            onChange={(e) => updateItem(activeCard, "description", e.target.value)}
            placeholder="Descreva o conteúdo deste card..."
            rows={3}
            className="w-full bg-midnight-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-gold-500/50 transition-colors resize-none"
          />
          <p className="text-[10px] text-slate-500">{currentItem.description.length}/150 caracteres recomendados</p>
        </div>

        {/* Destino (link) */}
        <div className="space-y-2">
          <label className="text-[10px] font-medium tracking-widest text-slate-400 uppercase">Redirecionar para</label>
          <select
            value={currentItem.link || "/atendimentos"}
            onChange={(e) => updateItem(activeCard, "link", e.target.value)}
            className="w-full bg-midnight-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-gold-500/50 transition-colors appearance-none cursor-pointer"
          >
            {AVAILABLE_PAGES.map((page) => (
              <option key={page.value} value={page.value}>
                {page.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-500">Página de destino ao clicar neste card</p>
        </div>

        {/* Imagem de fundo do card */}
        <div className="space-y-2">
          <label className="text-[10px] font-medium tracking-widest text-slate-400 uppercase">Imagem de Fundo</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
            disabled={uploading}
          />
          {currentItem.image_url ? (
            <div className="relative group rounded-xl overflow-hidden h-28 bg-midnight-950/50 border border-white/10">
              <img src={currentItem.image_url} alt="" className="w-full h-full object-cover opacity-70" />
              <div className="absolute inset-0 bg-midnight-950/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-black/90 transition-colors"
                >
                  <UploadCloud size={12} /> Trocar
                </button>
                <button
                  onClick={() => updateItem(activeCard, "image_url", undefined)}
                  className="bg-red-900/70 text-red-200 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-red-800/90 transition-colors"
                >
                  <X size={12} /> Remover
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full h-20 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:border-gold-500/30 hover:text-slate-400 transition-all cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin text-gold-500" />
                  <span className="text-[10px]">Enviando...</span>
                </>
              ) : (
                <>
                  <ImageIcon size={18} />
                  <span className="text-[10px]">Adicionar imagem de fundo</span>
                </>
              )}
            </button>
          )}
          <p className="text-[10px] text-slate-500">A imagem aparece com efeito de sobreposição no card</p>
        </div>

        {/* Remover card */}
        {items.length > 1 && (
          <button
            onClick={() => removeCard(activeCard)}
            className="flex items-center gap-2 text-xs text-red-400/70 hover:text-red-400 transition-colors mt-2"
          >
            <Trash2 size={14} />
            Remover este card
          </button>
        )}
      </div>

      {/* Preview mini */}
      <div className="space-y-2">
        <p className="text-[10px] font-medium tracking-widest text-slate-500 uppercase">Preview dos cards</p>
        <div className="flex gap-2">
          {items.map((item, i) => {
            const iconEntry = AVAILABLE_ICONS.find((ic) => ic.name === item.icon);
            return (
              <div
                key={i}
                onClick={() => setActiveCard(i)}
                className={`
                  flex-1 min-w-0 bg-midnight-950/60 border rounded-xl p-3 cursor-pointer transition-all duration-200
                  ${activeCard === i ? "border-gold-500/40 bg-gold-500/5" : "border-white/5 hover:border-white/15"}
                `}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${activeCard === i ? "text-gold-400" : "text-slate-500"}`}>
                  {iconEntry?.icon || <Moon size={20} />}
                </div>
                <p className="text-xs text-slate-300 font-medium truncate">{item.title || "Sem título"}</p>
                <p className="text-[10px] text-slate-500 truncate">{item.description || "Sem descrição"}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


/* ============================================
   Block Editor Modal (Principal)
   ============================================ */

interface BlockEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  existingBlock: PageBlock | null;
  selectedType?: BlockType;
}

export function BlockEditorModal({ isOpen, onClose, onSave, existingBlock, selectedType }: BlockEditorModalProps) {
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [type, setType] = useState<BlockType>(existingBlock?.type || selectedType || "hero");
  const [content, setContent] = useState<Record<string, any>>({});
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [allTherapists, setAllTherapists] = useState<DatabaseTherapist[]>([]);

  // Fetch therapists when type is lista_terapeutas
  useEffect(() => {
    if (type === "lista_terapeutas") {
      supabase.from("therapists").select("*").eq("is_active", true).order("name").then(({ data }) => {
        if (data) setAllTherapists(data as DatabaseTherapist[]);
      });
    }
  }, [type]);

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

  // Check if this block type has items (e.g. card_simples)
  const hasItems = type === "card_simples" && Array.isArray(content.items);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal — wider for card_simples to fit editor */}
      <div className={`w-full ${hasItems ? 'max-w-4xl' : 'max-w-3xl'} bg-midnight-900 border border-white/10 rounded-3xl shadow-2xl relative z-10 max-h-[90vh] flex flex-col overflow-hidden`}>
        
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
                if (field === 'items') return null;
                // Skip therapist_ids — rendered as special selector
                if (field === 'therapist_ids') return null;
                
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

          {/* ---- Editor de Cards Individuais (card_simples) ---- */}
          {hasItems && (
            <div className="border-t border-white/5 pt-6">
              <h3 className="text-lg font-medium text-slate-200 mb-1">Editar Cards Individualmente</h3>
              <p className="text-xs text-slate-500 mb-5">Clique em cada card para alterar título, descrição e ícone de forma independente.</p>
              <CardItemsEditor
                items={content.items as CardItem[]}
                onChange={(newItems) => setContent({ ...content, items: newItems })}
              />
            </div>
          )}

          {/* ---- Seletor de Terapeutas (lista_terapeutas) ---- */}
          {type === "lista_terapeutas" && (
            <div className="border-t border-white/5 pt-6">
              <h3 className="text-lg font-medium text-slate-200 mb-1 flex items-center gap-2">
                <Users size={18} className="text-gold-400" />
                Selecionar Terapeutas
              </h3>
              <p className="text-xs text-slate-500 mb-5">Marque quais terapeutas devem aparecer neste bloco. Se nenhum for selecionado, todos os terapeutas ativos serão exibidos.</p>
              
              {allTherapists.length === 0 ? (
                <p className="text-sm text-slate-500 italic">Nenhum terapeuta cadastrado.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {allTherapists.map((t) => {
                    const selectedIds: string[] = (content.therapist_ids as string[]) || [];
                    const isChecked = selectedIds.includes(t.id);
                    return (
                      <label
                        key={t.id}
                        className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-all ${
                          isChecked
                            ? "bg-gold-500/10 border-gold-500/30"
                            : "bg-midnight-950/40 border-white/5 hover:border-white/15"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const newIds = e.target.checked
                              ? [...selectedIds, t.id]
                              : selectedIds.filter((id) => id !== t.id);
                            setContent({ ...content, therapist_ids: newIds });
                          }}
                          className="w-4 h-4 accent-gold-500 rounded cursor-pointer flex-shrink-0"
                        />
                        <div className="flex items-center gap-2 min-w-0">
                          {t.photo_url ? (
                            <img src={t.photo_url} alt="" className="w-8 h-8 rounded-full object-cover border border-white/10 flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-midnight-800 flex items-center justify-center text-gold-500/40 flex-shrink-0">
                              <Users size={14} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm text-slate-200 truncate">{t.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{t.specialty}</p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
              {((content.therapist_ids as string[]) || []).length > 0 && (
                <p className="text-[10px] text-gold-400/70 mt-3">
                  {((content.therapist_ids as string[]) || []).length} terapeuta(s) selecionado(s)
                </p>
              )}
            </div>
          )}

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
