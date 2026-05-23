"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// Padrão caso não exista configuração no banco
const DEFAULT_PHONE = "5511956589429";
const DEFAULT_MESSAGE = "Olá! Vim através do site e gostaria de obter mais informações sobre os atendimentos e cursos. ✨";

export default function WhatsAppButton() {
  const pathname = usePathname();
  const supabase = createClient();
  const [phoneNumber, setPhoneNumber] = useState(DEFAULT_PHONE);
  const [showBubble, setShowBubble] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [isDismissed, setIsDismissed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeOutTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fullText = "Olá! Se precisar de ajuda, estou aqui. ✨";

  // 1. Carregar telefone das configurações globais do sistema
  useEffect(() => {
    async function loadWhatsAppSettings() {
      try {
        const { data, error } = await supabase
          .from("system_settings")
          .select("value")
          .eq("id", "whatsapp_settings")
          .single();

        if (data && data.value && (data.value as any).phone) {
          const rawPhone = (data.value as any).phone.replace(/\D/g, "");
          // Garantir DDI do Brasil (55) se não houver
          const finalPhone = rawPhone.startsWith("55") && rawPhone.length >= 12
            ? rawPhone
            : `55${rawPhone}`;
          setPhoneNumber(finalPhone);
        }
      } catch (err) {
        console.error("Erro ao carregar configurações do WhatsApp:", err);
      }
    }

    loadWhatsAppSettings();
  }, [supabase]);

  // 2. Controlar o aparecimento inicial do balão de fala
  useEffect(() => {
    // Aparece após 1.5s
    const startTimer = setTimeout(() => {
      if (!isDismissed) {
        setShowBubble(true);
      }
    }, 1500);

    return () => {
      clearTimeout(startTimer);
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      if (fadeOutTimerRef.current) clearTimeout(fadeOutTimerRef.current);
    };
  }, [isDismissed]);

  // 3. Efeito Máquina de Escrever (Typewriter)
  useEffect(() => {
    if (!showBubble) {
      setDisplayText("");
      return;
    }

    let currentIndex = 0;
    setDisplayText("");

    // Digita caractere por caractere
    typingTimerRef.current = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayText((prev) => prev + fullText.charAt(currentIndex));
        currentIndex++;
      } else {
        // Digitação finalizada
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        
        // Iniciar timer de 6 segundos para desaparecer
        fadeOutTimerRef.current = setTimeout(() => {
          setShowBubble(false);
        }, 6000);
      }
    }, 45); // Velocidade de digitação elegante

    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      if (fadeOutTimerRef.current) clearTimeout(fadeOutTimerRef.current);
    };
  }, [showBubble]);

  const handleCloseBubble = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowBubble(false);
    setIsDismissed(true);
  };

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  // Não renderizar em rotas administrativas ou de login (executado com segurança após todos os hooks)
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/login")) {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-8 right-6 md:right-8 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Balão de Conversa (Speech Bubble) */}
      <AnimatePresence>
        {(showBubble || (isHovered && !isDismissed)) && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="pointer-events-auto relative mb-4 mr-1 max-w-[260px] bg-midnight-900/95 backdrop-blur-md border border-gold-500/20 text-gold-100 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(212,175,55,0.05)] text-sm leading-relaxed"
          >
            {/* Botão para Fechar Balão */}
            <button
              onClick={handleCloseBubble}
              className="absolute top-2.5 right-2.5 text-gold-400/40 hover:text-gold-400 transition-colors p-0.5 rounded-full hover:bg-white/5"
              aria-label="Fechar balão"
            >
              <X size={13} />
            </button>

            {/* Texto com Efeito Máquina de Escrever ou Estático no Hover */}
            <p className="pr-4 font-sans font-light select-none">
              {showBubble ? displayText : fullText}
              {showBubble && displayText.length < fullText.length && (
                <span className="inline-block w-1.5 h-3 ml-0.5 bg-gold-400 animate-pulse align-middle" />
              )}
            </p>

            {/* Balão "Speech Bubble Pointer" (Triângulozinho) */}
            <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-midnight-900 border-r border-b border-gold-500/20 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão do WhatsApp Principal */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          y: [0, -5, 0] // Flutuação infinita sutil
        }}
        transition={{
          opacity: { delay: 1, duration: 0.5 },
          scale: { delay: 1, type: "spring" },
          y: {
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut"
          }
        }}
        whileHover={{ 
          scale: 1.08,
          boxShadow: "0 0 25px rgba(212, 175, 55, 0.35)",
        }}
        whileTap={{ scale: 0.95 }}
        className="pointer-events-auto flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tr from-emerald-950 via-emerald-800 to-emerald-750 text-gold-100 shadow-[0_5px_20px_rgba(0,0,0,0.4),0_0_15px_rgba(212,175,55,0.15)] border border-gold-500/30 hover:border-gold-400/60 transition-all cursor-pointer relative group overflow-hidden"
        title="Falar no WhatsApp"
      >
        {/* Efeito Glow Interno */}
        <div className="absolute inset-0 bg-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
        
        {/* Efeito Pulse Circular de Destaque */}
        <div className="absolute inset-[-4px] rounded-full border border-gold-500/10 animate-ping pointer-events-none opacity-40 group-hover:opacity-60" />

        {/* Ícone do WhatsApp Vetorial (Customizado de forma limpa e bonita) */}
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-7 h-7 md:w-8 md:h-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover:scale-105"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </motion.a>
      
    </div>
  );
}
