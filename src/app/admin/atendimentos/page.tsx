"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Edit2, CheckCircle2, Component } from "lucide-react";
import type { DatabaseService, DatabaseTherapist } from "@/lib/types";

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
  const [services, setServices] = useState<DatabaseService[]>([]);
  const [therapists, setTherapists] = useState<DatabaseTherapist[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Estado para os benefícios, digitados como vírgulas
  const [benefitsInput, setBenefitsInput] = useState("");
  
  const [formData, setFormData] = useState<Partial<DatabaseService>>({
    title: "", description: "", short_subtitle: "", duration: "1h", icon: "Star", is_active: true, benefits: []
  });

  // Estado temporário na tela de Serviços para quais Terapeutas foram marcados
  const [selectedTherapistIds, setSelectedTherapistIds] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [sRes, tRes] = await Promise.all([
      supabase.from("services").select("*").order("created_at", { ascending: false }),
      supabase.from("therapists").select("*").order("name", { ascending: true })
    ]);
    
    if (sRes.data) setServices(sRes.data);
    if (tRes.data) setTherapists(tRes.data as DatabaseTherapist[]);
    
    setLoading(false);
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
      await supabase.from("services").update(finalData).eq("id", isEditing);
    } else {
      const inserted = await supabase.from("services").insert([finalData]).select().single();
      if (inserted.data) {
        serviceId = inserted.data.id;
      }
    }
    
    // Atualizar os Arrays dos Terapeutas (The Reverse Mapping)
    // Para todos os terapeutas: se ele está no selectedTherapistIds, garantimos que tem o slug.
    // Se não está, garantimos que NÃO tem o slug.
    const updates = therapists.map(async (t) => {
       const hasService = t.supported_services?.includes(slug);
       const shouldHave = selectedTherapistIds.includes(t.id);
       
       if (hasService && !shouldHave) {
          // Remove
          await supabase.from("therapists")
            .update({ supported_services: t.supported_services.filter(s => s !== slug) })
            .eq("id", t.id);
       } else if (!hasService && shouldHave) {
          // Add
          const prev = t.supported_services || [];
          await supabase.from("therapists")
            .update({ supported_services: [...prev, slug] })
            .eq("id", t.id);
       }
    });

    await Promise.all(updates);
    
    setShowAddForm(false);
    setIsEditing(null);
    setFormData({ title: "", description: "", short_subtitle: "", duration: "1h", icon: "Star", is_active: true, benefits: [] });
    setBenefitsInput("");
    setSelectedTherapistIds([]);
    fetchData();
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

  const startNewService = () => {
    setFormData({ title: "", description: "", short_subtitle: "", duration: "1h", icon: "Star", is_active: true, benefits: [] });
    setBenefitsInput("");
    setIsEditing(null);
    setSelectedTherapistIds([]);
    setShowAddForm(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-white tracking-tight">Técnicas e Atendimentos</h1>
          <p className="text-slate-400 mt-1">Gerencie seu portfólio de jornadas oferecidas pela Lótus.</p>
        </div>
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

            <div className="space-y-2 md:col-span-2">
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
            
            <div className="flex items-center gap-3 md:col-span-2 mt-2">
              <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-5 h-5 accent-gold-500 bg-midnight-950 rounded cursor-pointer" id="activeServiceToggle" />
              <label htmlFor="activeServiceToggle" className="text-sm text-slate-300 cursor-pointer">Técnica Ativa (Apapece no site)</label>
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
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {services.map((s) => {
             // Contar quantos terapeutas fazem isso
             const profCount = therapists.filter(t => t.supported_services?.includes(s.slug)).length;
             
             return (
              <div key={s.id} className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row gap-5 relative group ${s.is_active ? 'bg-white/5 border-white/10 hover:border-gold-500/30' : 'bg-black/20 border-white/5 opacity-50'}`}>
                
                <div className="w-16 h-16 rounded-full bg-midnight-950 border border-white/20 overflow-hidden flex-shrink-0 flex items-center justify-center text-gold-400">
                  <Component size={24} />
                </div>
                
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    {s.title}
                    {s.is_active && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" title="Ativo" />}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">{s.short_subtitle}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                    <span className="bg-white/5 px-2 py-1 rounded-md text-gold-300">{s.duration}</span>
                    <span className="truncate">{profCount} {profCount === 1 ? 'Terapeuta' : 'Terapeutas'} Habilitados</span>
                  </div>
                </div>

                <button 
                  onClick={() => editService(s)}
                  className="sm:absolute sm:top-1/2 sm:-translate-y-1/2 right-6 p-3 bg-white/5 hover:bg-gold-500/20 text-slate-400 hover:text-gold-400 rounded-lg transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 mt-4 sm:mt-0"
                >
                  <Edit2 size={18} />
                </button>
              </div>
            );
          })}
          
          {services.length === 0 && !showAddForm && (
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
  );
}
