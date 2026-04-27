"use client";

import { useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { UploadCloud, Image as ImageIcon, Loader2, X } from "lucide-react";
import Image from "next/image";

interface ImageUploaderProps {
  currentImageUrl?: string | null;
  onImageUploaded: (url: string) => void;
}

export function ImageUploader({ currentImageUrl, onImageUploaded }: ImageUploaderProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      const file = event.target.files?.[0];
      if (!file) return;

      // Unique file name to avoid collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `blocks/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('block-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data } = supabase.storage
        .from('block-images')
        .getPublicUrl(filePath);

      setPreview(data.publicUrl);
      onImageUploaded(data.publicUrl);
      
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao fazer upload da imagem. Verifique as permissões do Storage no Supabase.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium tracking-wide text-slate-300 uppercase">
        Imagem de Fundo/Destaque
      </label>
      
      <div 
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
          preview 
            ? 'border-gold-500/30 bg-midnight-900/50 p-1 relative overflow-hidden group' 
            : 'border-white/10 hover:border-gold-500/50 hover:bg-white/5'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          accept="image/*" 
          className="hidden" 
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="flex flex-col items-center text-gold-500">
            <Loader2 className="animate-spin mb-2" size={24} />
            <span className="text-sm">Enviando...</span>
          </div>
        ) : preview ? (
          <>
            <Image 
              src={preview} 
              alt="Preview" 
              fill
              className="object-cover rounded-lg opacity-80 group-hover:opacity-40 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="bg-black/80 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
                <UploadCloud size={14} /> Trocar Imagem
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-slate-400">
            <div className="w-12 h-12 bg-midnight-950 rounded-full flex items-center justify-center mb-3">
              <ImageIcon size={20} className="text-gold-500/70" />
            </div>
            <span className="text-sm font-medium text-slate-300">Clique para fazer upload</span>
            <span className="text-xs font-light mt-1 text-slate-500">JPG, PNG, WebP (Max 5MB)</span>
          </div>
        )}
      </div>
      {preview && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setPreview(null);
            onImageUploaded("");
          }}
          className="text-xs text-red-400 flex items-center gap-1 hover:text-red-300"
        >
          <X size={12} /> Remover imagem
        </button>
      )}
    </div>
  );
}
