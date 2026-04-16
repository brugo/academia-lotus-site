"use client";

import { useState } from "react";
import { RevealText } from "@/components/ui/RevealText";
import { Play, X } from "lucide-react";
import type { PageBlock, VideoBannerContent } from "@/lib/types";

// Extract YouTube video ID from various URL formats
function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function VideoBannerBlock({ block }: { block: PageBlock }) {
  const content = (block.content as unknown) as VideoBannerContent;
  const [isPlaying, setIsPlaying] = useState(false);

  const videoUrl = content.video_url || "";
  const youtubeId = getYouTubeId(videoUrl);
  const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : null;
  const embedUrl = youtubeId ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0` : videoUrl;

  return (
    <>
      {/* DESKTOP */}
      <section className="hidden md:block py-24 px-4 md:px-8 w-full bg-midnight-950 relative z-10">
        <div className="max-w-5xl mx-auto">
          <RevealText className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-5xl text-slate-200 mb-4">
              {content.title || "Assista e Desperte"}
            </h2>
            <p className="text-slate-400 font-light text-lg max-w-2xl mx-auto">
              {content.description || "Uma mensagem especial para sua jornada."}
            </p>
          </RevealText>

          <RevealText delay={0.3} className="relative">
            {/* Video Container */}
            <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(212,175,55,0.06)] aspect-video bg-midnight-900">
              {isPlaying ? (
                <>
                  <iframe
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                    title={content.title || "Video"}
                  />
                  <button
                    onClick={() => setIsPlaying(false)}
                    className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <>
                  {/* Thumbnail */}
                  {thumbnailUrl && (
                    <img
                      src={thumbnailUrl}
                      alt={content.title || "Video thumbnail"}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[0.3]"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/40 to-midnight-950/20" />

                  {/* Play Button */}
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center group cursor-pointer z-10"
                  >
                    <div className="relative">
                      {/* Pulse ring */}
                      <div className="absolute inset-0 w-24 h-24 rounded-full bg-gold-500/20 animate-ping" style={{ animationDuration: "2s" }} />
                      {/* Button */}
                      <div className="relative w-24 h-24 rounded-full bg-gold-500/20 border border-gold-500/40 backdrop-blur-md flex items-center justify-center group-hover:bg-gold-500/30 group-hover:scale-110 transition-all duration-500 shadow-[0_0_40px_rgba(212,175,55,0.2)]">
                        <Play size={32} className="text-gold-400 ml-1.5 fill-gold-400/30" />
                      </div>
                    </div>
                  </button>
                </>
              )}
            </div>
          </RevealText>
        </div>
      </section>

      {/* MOBILE */}
      <section className="md:hidden py-16 px-4 w-full bg-midnight-950 relative z-10">
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl text-slate-200 mb-3">
            {content.title || "Assista e Desperte"}
          </h2>
          <p className="text-slate-400 font-light text-base">
            {content.description || "Uma mensagem especial para sua jornada."}
          </p>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video bg-midnight-900">
          {isPlaying ? (
            <>
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                title={content.title || "Video"}
              />
              <button
                onClick={() => setIsPlaying(false)}
                className="absolute top-3 right-3 z-20 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              {thumbnailUrl && (
                <img
                  src={thumbnailUrl}
                  alt={content.title || "Video thumbnail"}
                  className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale-[0.3]"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/40 to-midnight-950/20" />
              <button
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 flex items-center justify-center z-10"
              >
                <div className="w-16 h-16 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                  <Play size={24} className="text-gold-400 ml-1 fill-gold-400/30" />
                </div>
              </button>
            </>
          )}
        </div>
      </section>
    </>
  );
}
