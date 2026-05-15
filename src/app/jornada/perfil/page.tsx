"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, UserCircle, UploadCloud, Loader2, Camera } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function PerfilPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    cpf: "",
    avatar_url: ""
  });
  
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?next=/jornada/perfil");
        return;
      }
      setFormData({
        name: user.user_metadata?.full_name || "",
        whatsapp: user.user_metadata?.whatsapp || "",
        cpf: formatCpf(user.user_metadata?.cpf || ""),
        avatar_url: user.user_metadata?.avatar_url || ""
      });
      if (user.user_metadata?.avatar_url) {
        setPreview(user.user_metadata.avatar_url);
      }
      setLoading(false);
    }
    loadUser();
  }, [router, supabase.auth]);

  const formatCpf = (cpf: string) => {
    if (!cpf) return "";
    const digits = cpf.replace(/\D/g, '');
    let res = digits.substring(0, 11);
    if (digits.length > 9) {
      res = `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6, 9)}-${digits.substring(9, 11)}`;
    } else if (digits.length > 6) {
      res = `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6, 9)}`;
    } else if (digits.length > 3) {
      res = `${digits.substring(0, 3)}.${digits.substring(3, 6)}`;
    }
    return res;
  };

  const formatPhone = (phone: string) => {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, '');
    let res = digits.substring(0, 11);
    if (res.length > 2) res = `(${res.substring(0, 2)}) ${res.substring(2)}`;
    if (digits.length > 10) {
      res = `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7, 11)}`;
    } else if (digits.length > 6) {
      res = `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6, 10)}`;
    }
    return res;
  };

  // Função para comprimir a imagem antes de subir
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 400; // Tamanho ideal para avatar
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Comprime para WebP com 80% de qualidade
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Erro ao comprimir imagem"));
            },
            "image/webp",
            0.8
          );
        };
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploadingImage(true);
      setMessage(null);

      // Comprimir a imagem
      const compressedBlob = await compressImage(file);
      const compressedFile = new File([compressedBlob], `avatar_${Date.now()}.webp`, { type: "image/webp" });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // O caminho usa o ID do usuário para organizar melhor no Storage
      const filePath = `avatars/${user.id}/${compressedFile.name}`;

      // Upload para o bucket 'block-images' (mesmo usado pelos terapeutas)
      const { error: uploadError } = await supabase.storage
        .from('block-images')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('block-images')
        .getPublicUrl(filePath);

      setPreview(data.publicUrl);
      setFormData(prev => ({ ...prev, avatar_url: data.publicUrl }));

    } catch (error: any) {
      console.error("Erro no upload:", error);
      setMessage({ text: "Erro ao subir imagem. Tente novamente.", type: "error" });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.name,
          whatsapp: formData.whatsapp,
          cpf: formData.cpf.replace(/\D/g, ''),
          avatar_url: formData.avatar_url
        }
      });

      if (error) throw error;
      
      setMessage({ text: "Perfil atualizado com sucesso!", type: "success" });
      
      // Volta para a jornada após 1.5s
      setTimeout(() => {
        router.push("/jornada");
        router.refresh();
      }, 1500);

    } catch (error: any) {
      console.error("Erro ao salvar perfil:", error);
      setMessage({ text: error.message || "Erro ao salvar. Tente novamente.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-20 bg-midnight-950 font-sans text-white flex justify-center items-center">
        <Loader2 className="animate-spin text-gold-500" size={32} />
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-20 bg-midnight-950 font-sans text-white selection:bg-gold-500/30 overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gold-900/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-2xl mx-auto px-4 md:px-8 pt-8">
        <Link href="/jornada" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group w-max">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Voltar para Minha Jornada
        </Link>

        <h1 className="font-serif text-3xl md:text-4xl text-white mb-2">Editar Perfil</h1>
        <p className="text-slate-400 font-light mb-10">Mantenha seus dados atualizados para uma melhor experiência.</p>

        {message && (
          <div className={`p-4 rounded-xl mb-8 flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-900/30 border border-emerald-500/30 text-emerald-200' : 'bg-red-900/30 border border-red-500/30 text-red-200'}`}>
            {message.type === 'success' && <CheckCircle2 size={20} className="text-emerald-400" />}
            <p>{message.text}</p>
          </div>
        )}

        <div className="bg-midnight-900 border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl">
          <form onSubmit={handleSave} className="space-y-8">
            
            {/* Foto de Perfil */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-white/5">
              <div 
                className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-white/10 bg-midnight-950 flex items-center justify-center group cursor-pointer"
                onClick={() => !uploadingImage && fileInputRef.current?.click()}
              >
                {uploadingImage ? (
                  <Loader2 className="animate-spin text-gold-500" size={32} />
                ) : preview ? (
                  <Image src={preview} alt="Avatar" fill className="object-cover" />
                ) : (
                  <UserCircle size={64} className="text-slate-600" />
                )}
                
                {/* Overlay de Câmera (Hover) */}
                {!uploadingImage && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera size={28} className="text-white" />
                  </div>
                )}
              </div>
              
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-medium text-white mb-1">Foto de Perfil</h3>
                <p className="text-sm text-slate-400 mb-3">Sua imagem será automaticamente otimizada.</p>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 mx-auto sm:mx-0"
                >
                  <UploadCloud size={16} /> 
                  {uploadingImage ? "Processando..." : "Alterar Foto"}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/jpeg, image/png, image/webp"
                  className="hidden"
                />
              </div>
            </div>

            {/* Dados Pessoais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-300">Nome Completo</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-midnight-950 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-gold-500 transition-colors" 
                  placeholder="Seu nome verdadeiro" 
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-1">
                <label className="text-sm font-medium text-slate-300">WhatsApp</label>
                <input 
                  type="tel" 
                  value={formData.whatsapp}
                  onChange={e => setFormData({...formData, whatsapp: formatPhone(e.target.value)})}
                  className="w-full bg-midnight-950 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-gold-500 transition-colors" 
                  placeholder="(11) 99999-9999"
                />
                <p className="text-xs text-slate-500">Usado para lembretes.</p>
              </div>

              <div className="space-y-2 md:col-span-1">
                <label className="text-sm font-medium text-slate-300">CPF</label>
                <input 
                  type="text" 
                  value={formData.cpf}
                  onChange={e => setFormData({...formData, cpf: formatCpf(e.target.value)})}
                  className="w-full bg-midnight-950 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-gold-500 transition-colors" 
                  placeholder="000.000.000-00"
                />
                <p className="text-xs text-slate-500">Apenas para cobranças e recibos.</p>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-4">
              <Link href="/jornada" className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors">
                Cancelar
              </Link>
              <button 
                type="submit" 
                disabled={saving || uploadingImage}
                className="px-8 py-3.5 bg-gold-600 hover:bg-gold-500 disabled:opacity-50 text-midnight-950 font-medium rounded-xl transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                {saving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </main>
  );
}
