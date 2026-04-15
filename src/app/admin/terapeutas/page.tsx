"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Edit2, CheckCircle2, UserCircle, Star } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import Image from "next/image";

type Therapist = {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  photo_url: string;
  email: string;
  google_calendar_id: string;
  base_price: number;
  is_active: boolean;
  supported_services: string[];
};

export default function TerapeutasAdminPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [services, setServices] = useState<{slug: string, title: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Therapist>>({
    name: "", specialty: "", bio: "", email: "", google_calendar_id: "", photo_url: "/user-placeholder.png", base_price: 150, is_active: true, supported_services: []
  });

  useEffect(() => {
    fetchTherapistsAndServices();
  }, []);

  const fetchTherapistsAndServices = async () => {
    setLoading(true);
    const [tRes, sRes] = await Promise.all([
      supabase.from("therapists").select("*").order("created_at", { ascending: false }),
      supabase.from("services").select("title, slug").eq("is_active", true)
    ]);
    if (tRes.data) setTherapists(tRes.data);
    if (sRes.data) setServices(sRes.data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) return alert("Nome e Email são obrigatórios.");
    
    // Se não preencheu o ID de calendário, assumimos que é o próprio email.
    const finalData = {
      ...formData,
      google_calendar_id: formData.google_calendar_id || formData.email
    };

    if (isEditing) {
      await supabase.from("therapists").update(finalData).eq("id", isEditing);
    } else {
      await supabase.from("therapists").insert([finalData]);
    }
    
    setShowAddForm(false);
    setIsEditing(null);
    setFormData({ name: "", specialty: "", bio: "", email: "", google_calendar_id: "", photo_url: "/user-placeholder.png", base_price: 150, is_active: true, supported_services: [] });
    fetchTherapistsAndServices();
  };

  const editTherapist = (t: Therapist) => {
    setFormData(t);
    setIsEditing(t.id);
    setShowAddForm(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-white tracking-tight">Equipe Lótus</h1>
          <p className="text-slate-400 mt-1">Gerencie seus terapeutas e conexões com o Google Agenda</p>
        </div>
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

            <div className="space-y-4">
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {therapists.map((t) => (
            <div key={t.id} className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row gap-5 relative group ${t.is_active ? 'bg-white/5 border-white/10 hover:border-gold-500/30' : 'bg-black/20 border-white/5 opacity-50'}`}>
              
              <div className="w-16 h-16 rounded-full bg-midnight-950 border border-white/20 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {t.photo_url !== '/user-placeholder.png' ? <img src={t.photo_url} alt={t.name} className="w-full h-full object-cover" /> : <UserCircle size={40} className="text-slate-500" />}
              </div>
              
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  {t.name}
                  {t.is_active && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" title="Ativo" />}
                </h3>
                <p className="text-gold-400 text-sm">{t.specialty}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Star size={12}/> R$ {t.base_price}</span>
                  <span className="truncate">{t.email}</span>
                </div>
              </div>

              <button 
                onClick={() => editTherapist(t)}
                className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-gold-500/20 text-slate-400 hover:text-gold-400 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Edit2 size={16} />
              </button>
            </div>
          ))}
          {therapists.length === 0 && !showAddForm && (
            <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
              <p className="text-slate-400 mb-4">Nenhum terapeuta cadastrado ainda.</p>
              <button onClick={() => setShowAddForm(true)} className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
                + Adicionar o Primeiro Terapeuta
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
