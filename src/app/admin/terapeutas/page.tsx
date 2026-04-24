"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Edit2, CheckCircle2, UserCircle, Star, Trash2, AlertTriangle, GripVertical, Settings } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import Image from "next/image";
import { BlockManager } from "@/components/admin/BlockManager";

type Therapist = {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  photo_url: string;
  email: string;
  google_calendar_id: string;
  whatsapp: string; // Adicionado WhatsApp do terapeuta
  base_price: number;
  is_active: boolean;
  supported_services: string[];
  order_index: number;
};

export default function TerapeutasAdminPage() {
  const supabase = createClient();
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [services, setServices] = useState<{slug: string, title: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [therapistToDelete, setTherapistToDelete] = useState<Therapist | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'blocks'>('content');
  const [formData, setFormData] = useState<Partial<Therapist>>({
    name: "", specialty: "", bio: "", email: "", google_calendar_id: "", whatsapp: "", photo_url: "/user-placeholder.png", base_price: 150, is_active: true, supported_services: [], order_index: 0
  });

  useEffect(() => {
    fetchTherapistsAndServices();
  }, []);

  const fetchTherapistsAndServices = async () => {
    setLoading(true);
    const [tRes, sRes] = await Promise.all([
      supabase.from("therapists").select("*").order("order_index", { ascending: true }),
      supabase.from("services").select("title, slug").eq("is_active", true)
    ]);
    if (tRes.data) setTherapists(tRes.data);
    if (sRes.data) setServices(sRes.data);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!therapistToDelete) return;
    await supabase.from("therapists").delete().eq("id", therapistToDelete.id);
    setTherapistToDelete(null);
    fetchTherapistsAndServices();
  };

  const handleDragStart = (index: number) => {
    setDraggedIdx(index);
  };

  const handleDragEnter = (targetIndex: number) => {
    if (draggedIdx === null || draggedIdx === targetIndex) return;
    const newItems = [...therapists];
    const draggedItem = newItems[draggedIdx];
    newItems.splice(draggedIdx, 1);
    newItems.splice(targetIndex, 0, draggedItem);
    
    // Atualiza os índices visualmente em tempo real
    const reindexedItems = newItems.map((item, idx) => ({...item, order_index: idx}));
    setDraggedIdx(targetIndex);
    setTherapists(reindexedItems);
  };

  const handleDragEnd = async () => {
    setDraggedIdx(null);
    
    // Só atualizamos no banco após soltar o mouse (otimização de banco)
    const promises = therapists.map((t, idx) => 
      supabase.from("therapists").update({ order_index: idx }).eq("id", t.id)
    );
    
    await Promise.all(promises);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) return alert("Nome e Email são obrigatórios.");
    
    // Se não preencheu o ID de calendário, assumimos que é o próprio email.
    const finalData = {
      ...formData,
      google_calendar_id: formData.google_calendar_id || formData.email
    };

    if (isEditing) {
      const { error } = await supabase.from("therapists").update(finalData).eq("id", isEditing);
      if (error) {
        alert("Erro ao salvar terapeuta: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("therapists").insert([finalData]);
      if (error) {
        alert("Erro ao criar terapeuta: " + error.message);
        return;
      }
    }
    
    setShowAddForm(false);
    setIsEditing(null);
    setFormData({ name: "", specialty: "", bio: "", email: "", google_calendar_id: "", whatsapp: "", photo_url: "/user-placeholder.png", base_price: 150, is_active: true, supported_services: [], order_index: 0 });
    fetchTherapistsAndServices();
  };

  const editTherapist = (t: Therapist) => {
    setFormData(t);
    setIsEditing(t.id);
    setShowAddForm(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-white tracking-tight">Equipe Lótus</h1>
          <p className="text-slate-400 mt-1">Gerencie seus terapeutas e os blocos desta página.</p>
        </div>
        <div className="flex bg-midnight-950/80 p-1.5 rounded-xl border border-white/10">
           <button 
             onClick={() => setActiveTab('content')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'content' ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
           >
             Gerenciar Terapeutas
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
          <BlockManager pageRoute="terapeutas" />
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-8">
          <div className="flex justify-end">
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-5 py-2.5 bg-gold-600 hover:bg-gold-500 text-midnight-950 font-medium rounded-xl transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Novo Terapeuta
              </button>
            )}
          </div>

          {showAddForm && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 shadow-xl">
              <h2 className="text-xl font-serif text-white mb-6 bg-gradient-to-r from-gold-400 to-gold-200 bg-clip-text text-transparent">
                {isEditing ? "Editar Terapeuta" : "Cadastrar Novo Terapeuta"}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Nome Mestre *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-midnight-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors" placeholder="Ex: Mestre Humberto" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Especialidade Principal</label>
                  <input type="text" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} className="w-full bg-midnight-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors" placeholder="Ex: Acupuntura Quântica" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-300">Bio (Resumo para o Site)</label>
                  <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full bg-midnight-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors min-h-[100px]" placeholder="Breve currículo energético..." />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">E-mail de Login * (Usado para o Meet)</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-midnight-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors" placeholder="terapeuta@gmail.com" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">WhatsApp de Contato *</label>
                  <input type="tel" value={formData.whatsapp || ""} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-midnight-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors" placeholder="(11) 99999-9999" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Google Calendar ID (Opcional)</label>
                  <input type="text" value={formData.google_calendar_id} onChange={e => setFormData({...formData, google_calendar_id: e.target.value})} className="w-full bg-midnight-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors" placeholder="Deixe em branco para usar o próprio E-mail" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Preço da Consulta (Sinal de Reserva)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-400">R$</span>
                    <input type="number" value={formData.base_price} onChange={e => setFormData({...formData, base_price: Number(e.target.value)})} className="w-full bg-midnight-950 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors" />
                  </div>
                </div>

                <div className="space-y-4 md:col-span-2">
                  <label className="text-sm font-medium text-slate-300 block">Foto de Rosto (Upload ou Link)</label>
                  <ImageUploader 
                    currentImageUrl={formData.photo_url === '/user-placeholder.png' ? null : formData.photo_url} 
                    onImageUploaded={(url) => setFormData({...formData, photo_url: url || '/user-placeholder.png'})} 
                  />
                </div>
                
                <div className="flex items-center gap-3 md:col-span-2 mt-2">
                  <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-5 h-5 accent-gold-500 bg-midnight-950 rounded cursor-pointer" id="activeToggle" />
                  <label htmlFor="activeToggle" className="text-sm text-slate-300 cursor-pointer">Terapeuta Ativo no Agendamento</label>
                </div>

                {/* Checkboxes de Técnicas/Serviços */}
                {services.length > 0 && (
                  <div className="md:col-span-2 mt-4 bg-midnight-950/50 p-5 rounded-xl border border-white/5">
                    <label className="text-sm font-medium text-slate-300 block mb-4">Técnicas Atendidas por este Mentor</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {services.map(svc => {
                        const isChecked = formData.supported_services?.includes(svc.slug);
                        return (
                          <label key={svc.slug} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded-lg transition-colors">
                            <input 
                              type="checkbox" 
                              checked={isChecked || false} 
                              onChange={(e) => {
                                const prev = formData.supported_services || [];
                                if (e.target.checked) setFormData({ ...formData, supported_services: [...prev, svc.slug]});
                                else setFormData({ ...formData, supported_services: prev.filter(s => s !== svc.slug)});
                              }}
                              className="w-4 h-4 accent-gold-500 rounded cursor-pointer"
                            />
                            <span className="text-sm text-slate-300">{svc.title}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex gap-3 justify-end">
                <button onClick={() => { setShowAddForm(false); setIsEditing(null); }} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all">
                  Cancelar
                </button>
                <button onClick={handleSave} className="px-5 py-2.5 bg-gold-600 hover:bg-gold-500 text-midnight-950 font-medium rounded-xl transition-all shadow-lg flex items-center gap-2">
                  <CheckCircle2 size={18} /> Salvar Terapeuta
                </button>
              </div>
            </div>
          )}

          {loading && !showAddForm ? (
            <div className="animate-pulse flex flex-col gap-4">
              {[1,2].map(n => <div key={n} className="h-24 bg-white/5 rounded-2xl border border-white/5" />)}
            </div>
          ) : !showAddForm && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {therapists.map((t, index) => (
                <div 
                  key={t.id} 
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row gap-5 relative group cursor-grab active:cursor-grabbing ${draggedIdx === index ? 'opacity-40 border-gold-500 scale-[0.98]' : ''} ${t.is_active ? 'bg-white/5 border-white/10 hover:border-gold-500/30' : 'bg-black/20 border-white/5 opacity-50'}`}
                >
                  
                  <div className="hidden sm:flex items-center justify-center text-slate-600 px-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <GripVertical size={20} />
                  </div>

                  <div className="w-16 h-16 rounded-full bg-midnight-950 border border-white/20 overflow-hidden flex-shrink-0 flex items-center justify-center pointer-events-none">
                    {t.photo_url !== '/user-placeholder.png' ? <img src={t.photo_url} alt={t.name} className="w-full h-full object-cover" /> : <UserCircle size={40} className="text-slate-500" />}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center pointer-events-none">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      <span className="bg-white/10 text-slate-300 text-xs px-2 py-0.5 rounded-md border border-white/5">#{index + 1}</span>
                      {t.name}
                      {t.is_active && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" title="Ativo" />}
                    </h3>
                    <p className="text-gold-400 text-sm">{t.specialty}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Star size={12}/> R$ {t.base_price}</span>
                      <span className="truncate">{t.email}</span>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => editTherapist(t)}
                      className="p-2 bg-white/5 hover:bg-gold-500/20 text-slate-400 hover:text-gold-400 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => setTherapistToDelete(t)}
                      className="p-2 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-all"
                      title="Excluir Definitivamente"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {therapists.length === 0 && (
                <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                  <p className="text-slate-400 mb-4">Nenhum terapeuta cadastrado ainda.</p>
                  <button onClick={() => setShowAddForm(true)} className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
                    + Adicionar o Primeiro Terapeuta
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Modal de Exclusão */}
          {therapistToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-gradient-to-b from-midnight-900 to-midnight-950 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[50px] rounded-full pointer-events-none" />
                
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                  <AlertTriangle className="text-red-400" size={32} />
                </div>
                
                <h3 className="text-2xl font-serif text-white mb-2">Desligamento Permanente</h3>
                <p className="text-slate-400 font-light text-sm mb-8">
                  Você está prestes a apagar definitivamente <strong className="text-white font-medium">{therapistToDelete.name}</strong> das esferas do sistema. 
                  Esta ação rompe todos os vínculos no banco de dados e é totalmente irreversível. Tem certeza que deseja prosseguir com a exclusão?
                </p>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => setTherapistToDelete(null)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors"
                  >
                    Cancelar 
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  >
                    Sim, Excluir Terapeuta
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
