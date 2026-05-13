"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { RevealText } from "@/components/ui/RevealText";
import { ChevronLeft, ChevronRight, Quote, Send, X, Loader2, CheckCircle, User, Sparkles } from "lucide-react";
import type { PageBlock, DepoimentosContent, Testimonial } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

/* ---- Testimonial Submit Modal ---- */
function TestimonialModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Por favor, preencha o título e o depoimento.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao enviar depoimento.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setTitle("");
        setContent("");
        setSuccess(false);
      }, 2500);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="w-full max-w-lg bg-midnight-900 border border-white/10 rounded-3xl shadow-2xl relative z-10 overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gold-500/10 blur-[80px] pointer-events-none" />

        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between relative">
          <div>
            <h2 className="text-xl font-serif text-slate-100">Deixe seu Depoimento</h2>
            <p className="text-xs text-slate-400 mt-1 font-light">Compartilhe sua experiência conosco</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 relative">
          {success ? (
            <div className="py-12 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle className="text-emerald-400" size={32} />
              </div>
              <h3 className="text-lg font-serif text-slate-100">Depoimento Enviado!</h3>
              <p className="text-sm text-slate-400 font-light max-w-xs">
                Seu depoimento foi recebido e será publicado após aprovação. Obrigado por compartilhar! ✨
              </p>
            </div>
          ) : (
            <>
              {/* Title */}
              <div className="space-y-2">
                <label className="text-[10px] font-medium tracking-widest text-slate-400 uppercase">Título</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Experiência transformadora!"
                  maxLength={100}
                  className="w-full bg-midnight-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-gold-500/50 transition-colors placeholder:text-slate-600"
                />
                <p className="text-[10px] text-slate-500 text-right">{title.length}/100</p>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label className="text-[10px] font-medium tracking-widest text-slate-400 uppercase">Seu Depoimento</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Conte-nos sobre sua experiência..."
                  maxLength={500}
                  rows={4}
                  className="w-full bg-midnight-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-gold-500/50 transition-colors resize-none placeholder:text-slate-600"
                />
                <p className="text-[10px] text-slate-500 text-right">{content.length}/500</p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !title.trim() || !content.trim()}
              className="flex items-center gap-2 px-8 py-2.5 bg-gold-600 hover:bg-gold-500 text-midnight-950 font-medium rounded-full transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              Enviar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- Testimonial Card ---- */
function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="flex-shrink-0 w-[320px] md:w-[380px]">
      <div className="h-full bg-midnight-900/60 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 md:p-8 relative overflow-hidden group hover:border-gold-500/20 transition-all duration-500">
        {/* Decorative quote */}
        <div className="absolute top-4 right-4 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500">
          <Quote size={80} />
        </div>

        {/* Top glow on hover */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 bg-gold-500/0 group-hover:bg-gold-500/5 blur-[40px] transition-all duration-700 pointer-events-none" />

        {/* Title */}
        <h4 className="text-base md:text-lg font-serif text-slate-100 mb-3 leading-snug line-clamp-2 relative">
          &ldquo;{testimonial.title}&rdquo;
        </h4>

        {/* Content */}
        <p className="text-sm text-slate-400 font-light leading-relaxed line-clamp-5 mb-6">
          {testimonial.content}
        </p>

        {/* User info */}
        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/[0.04]">
          {testimonial.user_avatar_url ? (
            <img
              src={testimonial.user_avatar_url}
              alt={testimonial.user_name}
              className="w-10 h-10 rounded-full object-cover border-2 border-gold-500/20 shadow-[0_0_10px_rgba(212,175,55,0.1)]"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-midnight-800 border-2 border-gold-500/20 flex items-center justify-center">
              <User size={18} className="text-gold-400/60" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{testimonial.user_name}</p>
            <p className="text-[10px] text-slate-500 tracking-wide uppercase">
              {new Date(testimonial.created_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Featured Testimonial Card ---- */
const FALLBACK_TAGS = ["Amiga Querida", "Gratidão Eterna", "Alma Iluminada", "Ser de Luz", "Cura Verdadeira", "Jornada Compartilhada"];

function FeaturedTestimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const AUTOPLAY_INTERVAL = 6000; // 6 seconds

  useEffect(() => {
    if (testimonials.length <= 1) return;
    
    let interval: NodeJS.Timeout;
    if (!isHovered) {
      interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
      }, AUTOPLAY_INTERVAL);
    }
    return () => clearInterval(interval);
  }, [isHovered, testimonials.length]);

  if (testimonials.length === 0) return null;
  
  const current = testimonials[activeIndex];
  const tag = current.badge_text || FALLBACK_TAGS[activeIndex % FALLBACK_TAGS.length];

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto px-4 md:px-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <div className="relative rounded-[2rem] overflow-hidden border border-gold-500/20 bg-gradient-to-br from-midnight-900/80 via-midnight-950/90 to-midnight-900/80 backdrop-blur-xl shadow-[0_0_60px_rgba(212,175,55,0.08)]">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-gold-500/5 blur-[60px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gold-500/5 blur-[60px] rounded-full pointer-events-none" />

        <div className="p-6 md:p-10 flex flex-col items-center relative min-h-[350px] md:min-h-[280px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full h-full flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-10"
            >
              {/* Left: User Info */}
              <div className="flex flex-col items-center text-center flex-shrink-0 md:border-r border-dashed border-gold-500/20 md:pr-10 w-full md:w-[220px]">
                <div className="mb-4 relative">
                  <div className="absolute inset-0 rounded-full bg-gold-500/20 blur-md" />
                  {current.user_avatar_url ? (
                    <img
                      src={current.user_avatar_url}
                      alt={current.user_name}
                      className="relative w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-[3px] border-midnight-950 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                    />
                  ) : (
                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-midnight-800 border-[3px] border-midnight-950 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                      <User size={32} className="text-gold-400/60" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-lg font-medium text-gold-400">{current.user_name}</p>
                  <p className="text-[10px] text-slate-500 tracking-widest uppercase mt-1">
                    {new Date(current.created_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Right: Content */}
              <div className="flex-1 text-center md:text-left relative w-full pt-4 md:pt-0">
                {/* Badge Top Right (Mobile relative, Desktop absolute) */}
                <div className="absolute -top-12 md:-top-6 right-0 md:-right-4 w-full md:w-auto flex justify-center md:justify-end">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-[10px] font-semibold tracking-widest uppercase">
                    <Sparkles size={10} className="fill-gold-500" />
                    {tag}
                  </div>
                </div>

                <div className="mb-4 text-gold-500/20 flex justify-center md:justify-start">
                  <Quote size={32} />
                </div>
                
                <h4 className="text-xl md:text-2xl font-serif text-slate-100 mb-4 leading-snug">
                  &ldquo;{current.title}&rdquo;
                </h4>
                <p className="text-sm md:text-base text-slate-400 font-light leading-relaxed">
                  {current.content}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress Indicator */}
      {testimonials.length > 1 && (
        <div className="flex justify-center gap-3 mt-8">
          {testimonials.map((_, idx) => (
            <div
              key={idx}
              className="relative h-1.5 w-12 rounded-full overflow-hidden bg-slate-800 cursor-pointer"
              onClick={() => setActiveIndex(idx)}
            >
              {idx === activeIndex && !isHovered ? (
                <motion.div
                  className="absolute left-0 top-0 bottom-0 bg-gold-500 shadow-[0_0_10px_rgba(212,175,55,0.5)] rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: AUTOPLAY_INTERVAL / 1000, ease: "linear" }}
                  key={activeIndex} // restarts animation on index change
                />
              ) : (
                <div className={`absolute left-0 top-0 bottom-0 rounded-full transition-all duration-300 ${idx === activeIndex ? "w-full bg-gold-500 shadow-[0_0_10px_rgba(212,175,55,0.5)]" : "w-0 bg-transparent"}`} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================
   DepoimentosBlock — Main Component
   ============================================ */
export function DepoimentosBlock({ block }: { block: PageBlock }) {
  const content = block.content as unknown as DepoimentosContent;
  const supabase = createClient();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchTestimonials = useCallback(async () => {
    try {
      const pageParam = (content as any).page || 'home';
      const res = await fetch(`/api/testimonials?limit=${content.max_visible || 20}&page=${pageParam}`);
      const data = await res.json();
      if (data.testimonials) {
        setTestimonials(data.testimonials);
      }
    } catch (err) {
      console.error("Erro ao buscar depoimentos:", err);
    } finally {
      setLoading(false);
    }
  }, [content]);

  useEffect(() => {
    fetchTestimonials();
    // Check auth
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, [fetchTestimonials]);

  const handleSubmitClick = () => {
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <section className="relative z-10 py-20 bg-midnight-950 w-full">
        <div className="flex justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4 text-gold-500/50">
            <div className="w-10 h-10 border-2 border-t-gold-500 border-gold-500/20 rounded-full animate-spin" />
            <span className="text-xs uppercase tracking-widest">Carregando depoimentos...</span>
          </div>
        </div>
      </section>
    );
  }

  const showSubmit = content.show_submit_button !== false;

  let speedMultiplier = 6;
  if (content.marquee_speed === 'super_lento') speedMultiplier = 12;
  else if (content.marquee_speed === 'lento') speedMultiplier = 9;
  else if (content.marquee_speed === 'rapido') speedMultiplier = 3;

  const marqueeDuration = Math.max(testimonials.length * speedMultiplier, speedMultiplier * 3);

  return (
    <>
      {/* DESKTOP */}
      <section className="hidden md:block relative z-10 py-24 bg-midnight-950 w-full overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gold-900/[0.03] blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl relative">
          {/* Header */}
          <div className="text-center mb-16">
            <RevealText element="div" className="inline-block">
              <span className="inline-block px-5 py-1.5 bg-gold-500/10 border border-gold-500/20 rounded-full text-[10px] font-medium tracking-[0.2em] text-gold-400 uppercase mb-6">
                Depoimentos
              </span>
            </RevealText>
            <RevealText element="h2" delay={0.1} className="font-serif text-4xl md:text-5xl text-slate-200 mb-5 font-medium">
              {content.title || "O que dizem nossos clientes"}
            </RevealText>
            <RevealText element="p" delay={0.2} className="text-lg text-slate-400 font-light max-w-2xl mx-auto">
              {content.subtitle || "Experiências reais de transformação e cura"}
            </RevealText>
          </div>

          {testimonials.length === 0 ? (
            <div className="text-center py-16">
              <Quote size={48} className="mx-auto mb-4 text-gold-500/20" />
              <p className="text-slate-400 font-light text-lg mb-2">Ainda não há depoimentos publicados.</p>
              <p className="text-slate-500 text-sm">Seja o primeiro a compartilhar sua experiência!</p>
            </div>
          ) : content.view_mode === 'featured' ? (
            <FeaturedTestimonials testimonials={testimonials} />
          ) : (
            <div className="relative overflow-hidden w-full flex">
              {/* Fade edges */}
              <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-midnight-950 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-midnight-950 to-transparent z-10 pointer-events-none" />

              {/* Infinite Marquee Container */}
              <div 
                className="flex w-max animate-marquee pause-marquee hover:[animation-play-state:paused]"
                style={{ animationDuration: `${marqueeDuration}s` }}
              >
                {[1, 2, 3, 4].map((set) => (
                  <div key={set} className="flex gap-6 pr-6">
                    {testimonials.map((testimonial) => (
                      <TestimonialCard key={`${testimonial.id}-${set}`} testimonial={testimonial} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit button */}
          {showSubmit && (
            <RevealText delay={0.4} className="text-center mt-14">
              <button
                onClick={handleSubmitClick}
                className="inline-flex items-center gap-3 px-10 py-4 bg-gold-500/10 border border-gold-500/30 text-gold-400 rounded-full hover:bg-gold-500 hover:text-midnight-950 transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:shadow-[0_0_40px_rgba(212,175,55,0.3)] font-medium tracking-wide group"
              >
                <Send size={18} className="group-hover:translate-x-0.5 transition-transform" />
                {content.submit_button_text || "Deixe seu depoimento"}
              </button>
            </RevealText>
          )}
        </div>
      </section>

      {/* MOBILE */}
      <section className="md:hidden relative z-10 py-16 bg-midnight-950 w-full overflow-hidden">
        <div className="px-6 mb-10">
          <span className="inline-block px-4 py-1 bg-gold-500/10 border border-gold-500/20 rounded-full text-[9px] font-medium tracking-[0.2em] text-gold-400 uppercase mb-4">
            Depoimentos
          </span>
          <h2 className="font-serif text-3xl text-slate-200 mb-3 font-medium">
            {content.title || "O que dizem nossos clientes"}
          </h2>
          <p className="text-base text-slate-400 font-light">
            {content.subtitle || "Experiências reais de transformação e cura"}
          </p>
        </div>

        {testimonials.length === 0 ? (
          <div className="text-center py-12 px-6">
            <Quote size={36} className="mx-auto mb-3 text-gold-500/20" />
            <p className="text-slate-400 font-light">Ainda não há depoimentos.</p>
          </div>
        ) : content.view_mode === 'featured' ? (
          <FeaturedTestimonials testimonials={testimonials} />
        ) : (
          <div className="relative overflow-hidden w-full flex">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-midnight-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-midnight-950 to-transparent z-10 pointer-events-none" />

            {/* Infinite Marquee Container */}
            <div 
              className="flex w-max animate-marquee pause-marquee"
              style={{ animationDuration: `${marqueeDuration}s` }}
            >
              {[1, 2, 3, 4].map((set) => (
                <div key={set} className="flex gap-4 pr-4">
                  {testimonials.map((testimonial) => (
                    <TestimonialCard key={`${testimonial.id}-${set}`} testimonial={testimonial} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {showSubmit && (
          <div className="text-center mt-10 px-6">
            <button
              onClick={handleSubmitClick}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold-500/10 border border-gold-500/30 text-gold-400 rounded-full font-medium tracking-wide text-sm"
            >
              <Send size={16} />
              {content.submit_button_text || "Deixe seu depoimento"}
            </button>
          </div>
        )}
      </section>

      {/* Submit Modal */}
      <TestimonialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTestimonials}
      />

      {/* Hide scrollbar and Marquee CSS */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        .animate-marquee {
          animation: marquee linear infinite;
        }
        .pause-marquee:hover {
          animation-play-state: paused;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
      `}</style>
    </>
  );
}
