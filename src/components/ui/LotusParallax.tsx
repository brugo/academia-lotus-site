"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export function LotusParallax() {
  const lotusRef = useRef<HTMLDivElement>(null);
  const petalsOuter = useRef<SVGGElement>(null);
  const petalsMid = useRef<SVGGElement>(null);
  const core = useRef<SVGCircleElement>(null);

  useEffect(() => {
    // Only register and run client side
    gsap.registerPlugin(ScrollTrigger);
    
    // Slight delay to ensure layout is parsed for scroll trigger
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: document.body,
          start: "top top", 
          end: "bottom bottom", 
          scrub: 1.5, 
        },
      });

      if (petalsOuter.current) {
        tl.to(petalsOuter.current, { scale: 3, rotation: 180, opacity: 0.1, transformOrigin: "center" }, 0);
      }

      if (petalsMid.current) {
        tl.to(petalsMid.current, { scale: 2, rotation: -90, opacity: 0.3, transformOrigin: "center" }, 0);
      }

      if (core.current) {
        tl.to(core.current, { scale: 1.5, opacity: 1, fill: "#d4af37", transformOrigin: "center", boxShadow: "0 0 60px #d4af37" }, 0);
      }
    }, lotusRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={lotusRef}
      className="lotus-parallax hidden md:block fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-5xl max-h-5xl pointer-events-none opacity-30"
    >
      <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-gold-500 overflow-visible">
        {/* Sacred Geometry / Stylized Lotus */}
        <g ref={petalsOuter} stroke="currentColor" strokeWidth="0.5" fill="none">
          <path d="M 250 50 Q 300 250 250 450 Q 200 250 250 50" />
          <path d="M 50 250 Q 250 300 450 250 Q 250 200 50 250" />
          <path d="M 108 108 Q 320 250 392 392 Q 180 250 108 108" />
          <path d="M 392 108 Q 250 320 108 392 Q 250 180 392 108" />
        </g>
        
        <g ref={petalsMid} stroke="currentColor" strokeWidth="1" fill="rgba(212, 175, 55, 0.05)">
          <path d="M 250 120 Q 280 250 250 380 Q 220 250 250 120" />
          <path d="M 120 250 Q 250 280 380 250 Q 250 220 120 250" />
        </g>
        
        {/* Center Seed/Core */}
        <circle ref={core} cx="250" cy="250" r="10" fill="currentColor" fillOpacity="0.5" />
      </svg>
    </div>
  );
}
