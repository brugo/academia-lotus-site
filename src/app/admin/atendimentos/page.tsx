"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Edit2, CheckCircle2, Component, GripVertical, Upload, ImageIcon, X, Settings } from "lucide-react";
import type { DatabaseService, DatabaseTherapist } from "@/lib/types";
import { BlockManager } from "@/components/admin/BlockManager";

// Helper de slug
const toSlug = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

export default function ServicesAdminPage() {
  const supabase = createClient();
  const [services, setServices] = useState<DatabaseService[]>([]);
  const [therapists, setTherapists] = useState<DatabaseTherapist[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Estado para os benefícios, digitados como vírgulas
  const [benefitsInput, setBenefitsInput] = useState("");
  
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'blocks'>('content');
  
  const [reservationFee, setReservationFee] = useState<number>(50);
  const [isSavingFee, setIsSavingFee] = useState(false);
  
  const [formData, setFormData] = useState<Partial<DatabaseService>>({
    title: "", description: "", short_subtitle: "", duration: "1h", icon: "Star", image_url: "", is_active: true, benefits: [], order_index: 0, is_featured: false, base_price: 150
  });

  // Estado temporário na tela de Serviços para quais Terapeutas foram marcados
  const [selectedTherapistIds, setSelectedTherapistIds] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [sRes, tRes, feeRes] = await Promise.all([
      supabase.from("services").select("*").order("order_index", { ascending: true }),
      supabase.from("therapists").select("*").order("name", { ascending: true }),
      supabase.from("system_settings").select("value").eq("id", "reservation_fee").single()
    ]);
    
    if (sRes.data) setServices(sRes.data);
    if (tRes.data) setTherapists(tRes.data as DatabaseTherapist[]);
    if (feeRes.data && feeRes.data.value) setReservationFee(feeRes.data.value.amount || 50);
    
    setLoading(false);
  };

  const handleDragStart = (index: number) => setDraggedIdx(index);

  const handleDragEnter = (targetIndex: number) => {
    if (draggedIdx === null || draggedIdx === targetIndex) return;
    const newItems = [...services];
    const draggedItem = newItems[draggedIdx];
    newItems.splice(draggedIdx, 1);
    newItems.splice(targetIndex, 0, draggedItem);
    
    const reindexedItems = newItems.map((item, idx) => ({...item, order_index: idx}));
    setDraggedIdx(targetIndex);
    setServices(reindexedItems);
  };

  const handleDragEnd = async () => {
    setDraggedIdx(null);
    const promises = services.map((s, idx) => 
      supabase.from("services").update({ order_index: idx }).eq("id", s.id)
    );
    await Promise.all(promises);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description) return alert("Título e Descrição são obrigatórios.");
    
    const slug = toSlug(formData.title);
    const benefitsArray = benefitsInput.split(",").map(b => b.trim()).filter(b => b.length > 0);
    
    const finalData = {
      ...formData,
      slug,
      benefits: benefitsArray
    };

    let serviceId = isEditing;

    if (isEditing) {
      const { error } = await supabase.from("services").update(finalData).eq("id", isEditing);
      if (error) { alert("Erro ao atualizar técnica: " + error.message); return; }
    } else {
      const inserted = await supabase.from("services").insert([finalData]).select().single();
      if (inserted.error) { alert("Erro ao criar técnica: " + inserted.error.message); return; }
      if (inserted.data) {
        serviceId = inserted.data.id;
      }
    }
    
    // Atualizar os Arrays dos Terapeutas (The Reverse Mapping)
    const updates = therapists.map(async (t) => {
       const hasService = t.supported_services?.includes(slug);
       const shouldHave = selectedTherapistIds.includes(t.id);
       
       if (hasService && !shouldHave) {
          // Remove
          const { error } = await supabase.from("therapists")
            .update({ supported_services: t.supported_services.filter(s => s !== slug) })
            .eq("id", t.id);
          if (error) console.error("Erro ao atualizar terapeuta:", error);
       } else if (!hasService && shouldHave) {
          // Add
          const prev = t.supported_services || [];
          const { error } = await supabase.from("therapists")
            .update({ supported_services: [...prev, slug] })
            .eq("id", t.id);
          if (error) console.error("Erro ao atualizar terapeuta:", error);
       }
    });

    await Promise.all(updates);
    
    setShowAddForm(false);
    setIsEditing(null);
    setFormData({ title: "", description: "", short_subtitle: "", duration: "1h", icon: "Star", image_url: "", is_active: true, benefits: [], order_index: 0, is_featured: false, base_price: 150 });
    setBenefitsInput("");
    setSelectedTherapistIds([]);
    fetchData();
  };

  const toggleFeatured = async (s: DatabaseService) => {
    const newState = !s.is_featured;
    setServices((prev) => prev.map(item => item.id === s.id ? { ...item, is_featured: newState } : item));
    await supabase.from("services").update({ is_featured: newState }).eq("id", s.id);
  };

  const handleSaveFee = async () => {
    setIsSavingFee(true);
    await supabase.from('system_settings').upsert({ id: 'reservation_fee', value: { amount: reservationFee } });
    setIsSavingFee(false);
    alert('Taxa de agendamento salva com sucesso!');
  };

  const editService = (s: DatabaseService) => {
    setFormData({ ...s });
    setBenefitsInput(s.benefits ? s.benefits.join(", ") : "");
    setIsEditing(s.id);
    
    // Carregar quem são os terapeutas que já suportam esse serviço
    const preSelected = therapists
      .filter(t => t.supported_services?.includes(s.slug))
      .map(t => t.id);
      
    setSelectedTherapistIds(preSelected);
    setShowAddForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `service-${Date.now()}.${fileExt}`;
    const filePath = `services/${fileName}`;
    
    const { error } = await supabase.storage.from('images').upload(filePath, file, { upsert: true });
    
    if (error) {
      alert(`Erro no upload: ${error.message}`);
      setUploading(false);
      return;
    }
    
    const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath);
    setFormData({ ...formData, image_url: urlData.publicUrl });
    setUploading(false);
  };

  const handleImageRemove = () => {
    setFormData({ ...formData, image_url: "" });
  };

  const startNewService = () => {
    setFormData({ title: "", description: "", short_subtitle: "", duration: "1h", icon: "Star", image_url: "", is_active: true, benefits: [], order_index: 0, is_featured: false, base_price: 150 });
    setBenefitsInput("");
    setIsEditing(null);
    setSelectedTherapistIds([]);
    setShowAddForm(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-white tracking-tight">Técnicas e Atendimentos</h1>
          <p className="text-slate-400 mt-1">Gerencie seu portfólio de jornadas e blocos da página.</p>
        </div>
        
        <div className="flex bg-midnight-950/80 p-1.5 rounded-xl border border-white/10">
           <button 
             onClick={() => setActiveTab('content')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'content' ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
           >
             Gerenciar Técnicas
           </button>
           <button 
             onClick={() => setActiveTab('blocks')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'blocks' ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
           >
             <Settings size={16} /> Blocos da Página
           </button>
        </div>
      </div>

      {activeTab === 'blocks' && (
        <div className="pt-4">
          <BlockManager pageRoute="atendimentos" />
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-8">
          
          <div className="bg-midnight-950/50 p-6 rounded-2xl border border-white/5 shadow-inner mb-8">
            <h3 className="text-lg font-serif text-white mb-2">Taxa de Reserva Global</h3>
            <p className="text-slate-400 text-sm mb-4">Este é o valor cobrado via Stripe no ato do agendamento para confirmar a reserva (sinal), independente do valor total da técnica.</p>
            <div className="flex gap-4 max-w-sm">
              <div className="relative flex-1">
                <span className="absolute left-4 top-3.5 text-slate-400">R$</span>
                <input type="number" value={reservationFee} onChange={e => setReservationFee(Number(e.target.value))} className="w-full bg-midnight-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gold-500" />
              </div>
              <button onClick={handleSaveFee} disabled={isSavingFee} className="px-6 bg-gold-600 hover:bg-gold-500 text-midnight-950 font-medium rounded-xl whitespace-nowrap">
                {isSavingFee ? 'Salvando...' : 'Salvar Taxa'}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            {!showAddForm && (
              <button
                onClick={startNewService}
                className="px-5 py-2.5 bg-gold-600 hover:bg-gold-500 text-midnight-950 font-medium rounded-xl transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Nova Técnica
              </button>
            )}
          </div>

          {showAddForm && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 shadow-xl">
              <h2 className="text-xl font-serif text-white mb-6 bg-gradient-to-r from-gold-400 to-gold-200 bg-clip-text text-transparent">
                {isEditing ? "Editar Técnica Oculta" : "Canalizar Nova Técnica"}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Nome Oficial *</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-midnight-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors" placeholder="Ex: Mesa Radiônica Quântica" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Subtítulo Mágico</label>
                  <input type="text" value={formData.short_subtitle} onChange={e => setFormData({...formData, short_subtitle: e.target.value})} className="w-full bg-midnight-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors" placeholder="Ex: Uma Jornada para Dentro" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-300">Explicação Profunda *</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-midnight-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors min-h-[120px]" placeholder="Como a terapia funciona, o que esperar..." />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Duração</label>
                  <input type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full bg-midnight-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors" placeholder="Ex: 1h 30m" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Ícone Principal (Nome do Astro)</label>
                  <input type="text" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="w-full bg-midnight-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors" placeholder="Moon, Sun, Star, Eye, Compass..." />
                  <p className="text-xs text-slate-500 mt-1">Ex: Star, Moon, Sun, Compass, Brain, Eye</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Preço Total da Consulta</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-400">R$</span>
                    <input type="number" value={formData.base_price || ''} onChange={e => setFormData({...formData, base_price: Number(e.target.value)})} className="w-full bg-midnight-950 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Apenas informativo. O valor cobrado agora será a Taxa de Reserva.</p>
                </div>

                <div className="space-y-2 md:col-span-2 border-t border-white/10 pt-6 mt-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-2"><ImageIcon size={16} /> Imagem de Capa</span>
                    {formData.image_url && <span className="text-emerald-400 text-xs">✓ Imagem Anexada</span>}
                  </label>
                  
                  {formData.image_url ? (
                    <div className="relative group rounded-xl overflow-hidden border border-white/10 w-full h-48">
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <label className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer transition-colors flex items-center gap-2 text-sm">
                          <Upload size={16} /> Trocar
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                        <button onClick={handleImageRemove} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg transition-colors flex items-center gap-2 text-sm">
                          <X size={16} /> Remover
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploading ? 'border-gold-500/50 bg-gold-500/5' : 'border-white/10 hover:border-gold-500/30 hover:bg-white/5'}`}>
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-gold-400">Enviando imagem...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <Upload size={32} className="opacity-40" />
                          <span className="text-sm">Clique para enviar uma imagem</span>
                          <span className="text-xs text-slate-600">PNG, JPG ou WebP</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                    </label>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2 mt-4">
                  <label className="text-sm font-medium text-slate-300">Lista de Benefícios (separados por vírgula)</label>
                  <textarea value={benefitsInput} onChange={e => setBenefitsInput(e.target.value)} className="w-full bg-midnight-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors min-h-[80px]" placeholder="Ex: Limpeza de karmas e bloqueios, Abertura de caminhos, Equilíbrio de Chakras..." />
                </div>

                {/* Checkboxes de Terapeutas que atendem esta técnica */}
                {therapists.length > 0 && (
                  <div className="md:col-span-2 mt-4 bg-midnight-950/50 p-5 rounded-xl border border-white/5 shadow-inner">
                    <label className="text-sm font-medium text-gold-400 block mb-4">Mestres Habilitados para esta Técnica</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {therapists.filter(t => t.is_active).map(t => {
                        const isChecked = selectedTherapistIds.includes(t.id);
                        return (
                          <label key={t.id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={(e) => {
                                if (e.target.checked) setSelectedTherapistIds([...selectedTherapistIds, t.id]);
                                else setSelectedTherapistIds(selectedTherapistIds.filter(id => id !== t.id));
                              }}
                              className="w-4 h-4 accent-gold-500 rounded cursor-pointer"
                            />
                            <div className="flex items-center gap-2">
                              <img src={t.photo_url} alt="" className="w-6 h-6 rounded-full object-cover border border-white/20" />
                              <span className="text-sm text-slate-200">{t.name}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-6 md:col-span-2 mt-2 bg-midnight-950 p-4 rounded-xl border border-white/5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-5 h-5 accent-gold-500 bg-midnight-950 rounded cursor-pointer" />
                    <span className="text-sm text-slate-300">Técnica Ativa (Exibir no site)</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer border-l border-white/10 pl-6">
                    <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} className="w-5 h-5 accent-gold-500 bg-midnight-950 rounded cursor-pointer" />
                    <span className="text-sm text-gold-400 font-medium">Tamanho Grande (G)</span>
                  </label>
                </div>
              </div>

              <div className="mt-8 flex gap-3 justify-end pt-6 border-t border-white/10">
                <button onClick={() => { setShowAddForm(false); setIsEditing(null); }} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all">
                  Cancelar
                </button>
                <button onClick={handleSave} className="px-5 py-2.5 bg-gold-600 hover:bg-gold-500 text-midnight-950 font-medium rounded-xl transition-all shadow-lg flex items-center gap-2">
                  <CheckCircle2 size={18} /> Salvar Técnica
                </button>
              </div>
            </div>
          )}

          {loading && !showAddForm ? (
            <div className="animate-pulse flex flex-col gap-4">
              {[1,2,3].map(n => <div key={n} className="h-24 bg-white/5 rounded-2xl border border-white/5" />)}
            </div>
          ) : !showAddForm && (
            <div className="grid grid-cols-1 gap-4">
              {services.map((s, index) => {
                const profCount = therapists.filter(t => t.supported_services?.includes(s.slug)).length;
                return (
                  <div 
                    key={s.id} 
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row gap-5 relative group cursor-grab active:cursor-grabbing ${draggedIdx === index ? 'opacity-40 border-gold-500 scale-[0.98]' : ''} ${s.is_active ? 'bg-white/5 border-white/10 hover:border-gold-500/30' : 'bg-black/20 border-white/5 opacity-50'}`}
                  >
                    <div className="hidden sm:flex items-center justify-center text-slate-600 px-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      <GripVertical size={20} />
                    </div>
                    
                    <div className="w-16 h-16 rounded-full bg-midnight-950 border border-white/20 overflow-hidden flex-shrink-0 flex items-center justify-center text-gold-400 pointer-events-none">
                      <Component size={24} />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center pointer-events-none">
                      <h3 className="text-lg font-medium text-white flex items-center gap-2">
                        <span className="bg-white/10 text-slate-300 text-xs px-2 py-0.5 rounded-md border border-white/5">#{index + 1}</span>
                        {s.title}
                        {s.is_active && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" title="Ativo" />}
                        {s.is_featured && <span className="bg-gold-500/20 text-gold-400 text-xs px-2 py-0.5 rounded ml-2 border border-gold-500/20">TAMANHO G</span>}
                      </h3>
                      <p className="text-slate-400 text-sm mt-1">{s.short_subtitle}</p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                        <span className="bg-white/5 px-2 py-1 rounded-md text-gold-300">{s.duration}</span>
                        <span className="bg-white/5 px-2 py-1 rounded-md text-emerald-400">R$ {s.base_price?.toFixed(2) || '0.00'}</span>
                        <span className="truncate">{profCount} {profCount === 1 ? 'Terapeuta' : 'Terapeutas'} Habilitados</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 sm:mt-0 sm:absolute sm:top-1/2 sm:-translate-y-1/2 sm:right-6 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => toggleFeatured(s)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${s.is_featured ? 'bg-gold-500/20 text-gold-400 border-gold-500/30 hover:bg-gold-500/30' : 'bg-white/5 text-slate-400 border-transparent hover:bg-white/10 hover:text-white'}`}
                        title="Alternar Tamanho no Site"
                      >
                        {s.is_featured ? 'Tamanho [G]' : 'Expandir p/ [G]'}
                      </button>

                      <button 
                        onClick={() => editService(s)}
                        className="p-3 bg-white/5 hover:bg-gold-500/20 text-slate-400 hover:text-gold-400 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {services.length === 0 && (
                <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl bg-midnight-900/30">
                  <Component size={40} className="mx-auto mb-4 opacity-20 text-white" />
                  <p className="text-slate-400 mb-6">Sua lista de atendimento está limpa. Hora de canalizar os serviços.</p>
                  <button onClick={startNewService} className="px-6 py-3 bg-gold-600/10 text-gold-400 hover:bg-gold-500/20 hover:text-gold-300 rounded-full font-medium transition-colors">
                    Definir a Primeira Técnica
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
