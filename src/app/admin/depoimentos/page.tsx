"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { MessageSquareQuote, CheckCircle2, XCircle, Trash2, Clock, User, Plus, X, Send, Loader2, UploadCloud, Edit2 } from "lucide-react";
import type { Testimonial } from "@/lib/types";

type FilterStatus = "all" | "pending" | "approved" | "rejected";

/* ---- Modal para criar depoimento manual ---- */
function CreateTestimonialModal({ isOpen, onClose, onSuccess, testimonialToEdit }: { isOpen: boolean; onClose: () => void; onSuccess: () => void; testimonialToEdit?: Testimonial | null }) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [badgeText, setBadgeText] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0]; // YYYY-MM-DD
  });
  const [targetPage, setTargetPage] = useState<"home" | "cursos">("home");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (testimonialToEdit) {
        setName(testimonialToEdit.user_name || "");
        setTitle(testimonialToEdit.title || "");
        setContent(testimonialToEdit.content || "");
        setBadgeText(testimonialToEdit.badge_text || "");
        setAvatarUrl(testimonialToEdit.user_avatar_url || null);
        setAvatarPreview(testimonialToEdit.user_avatar_url || null);
        setDate(testimonialToEdit.created_at ? new Date(testimonialToEdit.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
        setTargetPage((testimonialToEdit.target_page as "home" | "cursos") || "home");
      } else {
        setName("");
        setTitle("");
        setContent("");
        setBadgeText("");
        setAvatarUrl(null);
        setAvatarPreview(null);
        setDate(new Date().toISOString().split("T")[0]);
        setTargetPage("home");
      }
    }
  }, [isOpen, testimonialToEdit]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `testimonial_avatar_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `testimonials/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("block-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("block-images").getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
      setAvatarPreview(data.publicUrl);
    } catch (err) {
      console.error("Erro no upload:", err);
      alert("Erro ao fazer upload da foto.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !title.trim() || !content.trim()) {
      setError("Nome, título e conteúdo são obrigatórios.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let res;
      if (testimonialToEdit) {
        res = await fetch("/api/testimonials", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: testimonialToEdit.id,
            title: title.trim(),
            content: content.trim(),
            user_name: name.trim(),
            user_avatar_url: avatarUrl,
            created_at: new Date(date).toISOString(),
            badge_text: badgeText.trim() || null,
            target_page: targetPage,
          }),
        });
      } else {
        res = await fetch("/api/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            admin_create: true,
            admin_name: name.trim(),
            admin_avatar_url: avatarUrl,
            admin_date: date,
            badge_text: badgeText.trim(),
            target_page: targetPage,
          }),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao salvar depoimento.");
        return;
      }

      // Reset form
      setName("");
      setTitle("");
      setContent("");
      setBadgeText("");
      setAvatarUrl(null);
      setAvatarPreview(null);
      setDate(new Date().toISOString().split("T")[0]);
      onSuccess();
      onClose();
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="w-full max-w-2xl bg-midnight-900 border border-white/10 rounded-3xl shadow-2xl relative z-10 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-midnight-950/50">
          <div>
            <h2 className="text-xl font-serif text-slate-100">
              {testimonialToEdit ? "Editar Depoimento" : "Criar Depoimento Manual"}
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-light">
              {testimonialToEdit ? "Modifique as informações do depoimento" : "Para clientes que enviaram depoimentos via WhatsApp"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Avatar + Name row */}
          <div className="flex items-start gap-5">
            {/* Avatar upload */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
                disabled={uploading}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="relative w-20 h-20 rounded-full border-2 border-dashed border-white/10 hover:border-gold-500/30 flex items-center justify-center overflow-hidden transition-all group"
              >
                {uploading ? (
                  <Loader2 size={24} className="text-gold-500 animate-spin" />
                ) : avatarPreview ? (
                  <>
                    <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <UploadCloud size={18} className="text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-500">
                    <User size={24} />
                    <span className="text-[8px] uppercase tracking-wider">Foto</span>
                  </div>
                )}
              </button>
              {avatarPreview && (
                <button
                  onClick={() => { setAvatarUrl(null); setAvatarPreview(null); }}
                  className="text-[10px] text-red-400/70 hover:text-red-400 transition-colors"
                >
                  Remover
                </button>
              )}
            </div>

            {/* Name + Date */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-medium tracking-widest text-slate-400 uppercase">Nome do Cliente</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Maria da Silva"
                  className="w-full bg-midnight-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-gold-500/50 transition-colors placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-medium tracking-widest text-slate-400 uppercase">Data do Depoimento</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-midnight-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-gold-500/50 transition-colors [color-scheme:dark]"
                />
                <p className="text-[10px] text-slate-500">Defina uma data anterior para simular um depoimento mais antigo</p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-[10px] font-medium tracking-widest text-slate-400 uppercase">Título do Depoimento</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Mudou a minha vida!"
              maxLength={100}
              className="w-full bg-midnight-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-gold-500/50 transition-colors placeholder:text-slate-600"
            />
            <p className="text-[10px] text-slate-500 text-right">{title.length}/100</p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-[10px] font-medium tracking-widest text-slate-400 uppercase">Texto do Depoimento</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Transcreva o depoimento que o cliente enviou..."
              maxLength={500}
              rows={5}
              className="w-full bg-midnight-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-gold-500/50 transition-colors resize-none placeholder:text-slate-600"
            />
            <p className="text-[10px] text-slate-500 text-right">{content.length}/500</p>
          </div>

          {/* Badge & Target Page */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-medium tracking-widest text-slate-400 uppercase">Pílula / Etiqueta de Destaque (Opcional)</label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="Ex: Aluna da Lótus, Amiga Querida, Gratidão (Deixe vazio para aleatório)"
                maxLength={30}
                className="w-full bg-midnight-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-gold-500/50 transition-colors placeholder:text-slate-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-medium tracking-widest text-slate-400 uppercase">Página de Destino</label>
              <select
                value={targetPage}
                onChange={(e) => setTargetPage(e.target.value as "home" | "cursos")}
                className="w-full bg-midnight-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-gold-500/50 transition-colors appearance-none cursor-pointer"
              >
                <option value="home">Home (Página Inicial)</option>
                <option value="cursos">Cursos</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Info */}
          {!testimonialToEdit && (
            <div className="bg-gold-500/5 border border-gold-500/10 rounded-xl px-4 py-3">
              <p className="text-[10px] text-gold-400/80 font-light">
                💡 Depoimentos criados manualmente são <strong className="font-medium">automaticamente aprovados</strong> e aparecerão no site imediatamente.
              </p>
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
            onClick={handleSubmit}
            disabled={loading || !name.trim() || !title.trim() || !content.trim()}
            className="flex items-center gap-2 px-8 py-2.5 bg-gold-600 hover:bg-gold-500 text-midnight-950 font-medium rounded-full transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (testimonialToEdit ? <CheckCircle2 size={18} /> : <Send size={18} />)}
            {testimonialToEdit ? "Salvar Alterações" : "Criar e Publicar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   Admin Depoimentos Page
   ============================================ */
export default function AdminDepoimentosPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approveBadge, setApproveBadge] = useState("");

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/testimonials?admin=true");
      const data = await res.json();
      if (data.testimonials) {
        setTestimonials(data.testimonials);
      }
    } catch (err) {
      console.error("Erro ao buscar depoimentos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleAction = async (id: string, status: "approved" | "rejected", badge_text?: string) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, badge_text }),
      });
      if (res.ok) {
        fetchTestimonials();
      }
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir permanentemente este depoimento?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/testimonials?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchTestimonials();
      }
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = filter === "all" ? testimonials : testimonials.filter((t) => t.status === filter);

  const counts = {
    all: testimonials.length,
    pending: testimonials.filter((t) => t.status === "pending").length,
    approved: testimonials.filter((t) => t.status === "approved").length,
    rejected: testimonials.filter((t) => t.status === "rejected").length,
  };

  const statusConfig = {
    pending: { label: "Pendente", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: <Clock size={14} /> },
    approved: { label: "Aprovado", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: <CheckCircle2 size={14} /> },
    rejected: { label: "Rejeitado", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: <XCircle size={14} /> },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-slate-100 flex items-center gap-3">
            <MessageSquareQuote className="text-gold-500" />
            Gerenciar Depoimentos
          </h1>
          <p className="text-slate-400 mt-2 font-light">
            Aprove, rejeite ou exclua depoimentos enviados pelos usuários do site.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTestimonial(null);
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gold-600 hover:bg-gold-500 text-midnight-950 font-medium rounded-full transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)]"
        >
          <Plus size={18} />
          Criar Depoimento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["all", "pending", "approved", "rejected"] as FilterStatus[]).map((key) => {
          const labels = { all: "Todos", pending: "Pendentes", approved: "Aprovados", rejected: "Rejeitados" };
          const colors = { all: "text-slate-300 border-white/10", pending: "text-amber-400 border-amber-500/20", approved: "text-emerald-400 border-emerald-500/20", rejected: "text-red-400 border-red-500/20" };
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`p-4 rounded-2xl border transition-all text-left ${
                filter === key
                  ? `${colors[key]} bg-white/5 shadow-lg`
                  : "border-white/5 bg-midnight-900/30 text-slate-400 hover:border-white/10"
              }`}
            >
              <p className="text-2xl font-serif font-medium">{counts[key]}</p>
              <p className="text-xs mt-1 opacity-70">{labels[key]}</p>
            </button>
          );
        })}
      </div>

      {/* Pending Alert */}
      {counts.pending > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <Clock className="text-amber-400" size={20} />
          </div>
          <div>
            <p className="text-sm text-amber-300 font-medium">
              {counts.pending} depoimento{counts.pending > 1 ? "s" : ""} aguardando sua aprovação
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Clique em &quot;Pendentes&quot; acima para filtrar</p>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4 text-gold-500/50">
            <div className="w-12 h-12 border-2 border-t-gold-500 border-gold-500/20 rounded-full animate-spin" />
            <span className="text-sm uppercase tracking-widest">Carregando...</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-midnight-900/30 border border-white/5 border-dashed rounded-3xl p-12 text-center text-slate-400">
          <MessageSquareQuote size={48} className="mx-auto mb-4 opacity-20" />
          <h3 className="text-xl text-slate-300 font-serif mb-2">Nenhum depoimento encontrado</h3>
          <p className="font-light mb-6">
            {filter === "all"
              ? "Os depoimentos aparecerão aqui quando os usuários começarem a enviar."
              : `Nenhum depoimento com status "${filter}".`}
          </p>
          <button
            onClick={() => {
              setEditingTestimonial(null);
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-midnight-800 hover:bg-midnight-700 text-gold-400 border border-gold-500/20 hover:border-gold-500/40 font-medium rounded-full transition-all"
          >
            <Plus size={18} />
            Criar Primeiro Depoimento
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((t) => {
            const config = statusConfig[t.status];
            const isLoading = actionLoading === t.id;

            return (
              <div
                key={t.id}
                className={`bg-midnight-900/60 border rounded-2xl p-5 transition-all ${
                  t.status === "pending"
                    ? "border-amber-500/15 hover:border-amber-500/30"
                    : "border-white/5 hover:border-white/10"
                } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* User avatar & info */}
                  <div className="flex items-center gap-3 md:w-48 flex-shrink-0">
                    {t.user_avatar_url ? (
                      <img
                        src={t.user_avatar_url}
                        alt={t.user_name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-midnight-800 border-2 border-white/10 flex items-center justify-center">
                        <User size={20} className="text-slate-500" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{t.user_name}</p>
                      <p className="text-[10px] text-slate-500">
                        {new Date(t.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-serif text-slate-100 truncate">&ldquo;{t.title}&rdquo;</h3>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${config.bg} ${config.color} flex-shrink-0`}>
                        {config.icon}
                        {config.label}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 uppercase tracking-wider flex-shrink-0">
                        Pág: {t.target_page || "home"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 font-light leading-relaxed">{t.content}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 md:ml-4">
                    {t.status === "pending" && (
                      <>
                        <button
                          onClick={() => setApprovingId(t.id)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all"
                        >
                          <CheckCircle2 size={14} />
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleAction(t.id, "rejected")}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-medium hover:bg-red-500/20 hover:border-red-500/40 transition-all"
                        >
                          <XCircle size={14} />
                          Rejeitar
                        </button>
                      </>
                    )}
                    {t.status === "rejected" && (
                      <button
                        onClick={() => setApprovingId(t.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium hover:bg-emerald-500/20 transition-all"
                      >
                        <CheckCircle2 size={14} />
                        Aprovar
                      </button>
                    )}
                    {t.status === "approved" && (
                      <button
                        onClick={() => handleAction(t.id, "rejected")}
                        className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-red-400 rounded-xl text-xs transition-all"
                      >
                        <XCircle size={14} />
                        Despublicar
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingTestimonial(t);
                        setIsCreateModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                      title="Editar depoimento"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                      title="Excluir permanentemente"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <CreateTestimonialModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingTestimonial(null);
        }}
        onSuccess={fetchTestimonials}
        testimonialToEdit={editingTestimonial}
      />

      {/* Approve Modal */}
      {approvingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setApprovingId(null)} />
          <div className="w-full max-w-sm bg-midnight-900 border border-white/10 rounded-3xl shadow-2xl relative z-10 p-6 flex flex-col gap-4">
            <h3 className="text-lg font-serif text-slate-100">Aprovar Depoimento</h3>
            <div className="space-y-2">
              <label className="text-[10px] font-medium tracking-widest text-slate-400 uppercase">Pílula Dourada (Opcional)</label>
              <input
                type="text"
                value={approveBadge}
                onChange={(e) => setApproveBadge(e.target.value)}
                placeholder="Ex: Amiga Querida"
                maxLength={30}
                className="w-full bg-midnight-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-gold-500/50 transition-colors"
              />
              <p className="text-[10px] text-slate-500">Deixe vazio para usar frases sorteadas aleatoriamente.</p>
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setApprovingId(null)}
                className="flex-1 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  handleAction(approvingId, "approved", approveBadge.trim());
                  setApprovingId(null);
                  setApproveBadge("");
                }}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-midnight-950 font-medium rounded-full transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} /> Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
