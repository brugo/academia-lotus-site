import { RevealText } from "@/components/ui/RevealText";

interface PageHeaderProps {
  badge: string;
  title1: string;
  title2: string;
  description: string;
  className?: string;
}

export function PageHeader({ badge, title1, title2, description, className = "" }: PageHeaderProps) {
  return (
    <div className={`max-w-4xl mx-auto text-center mb-16 md:mb-24 relative z-10 ${className}`}>
      <RevealText delay={0.1} element="div" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-medium tracking-widest uppercase mb-6">
        {badge}
      </RevealText>
      <RevealText delay={0.2} element="h1" className="font-serif text-5xl md:text-7xl text-white mb-6">
        {title1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 italic px-2">{title2}</span>
      </RevealText>
      <RevealText delay={0.3} element="p" className="text-lg text-slate-400 font-light leading-relaxed max-w-2xl mx-auto text-balance">
        {description}
      </RevealText>
    </div>
  );
}
