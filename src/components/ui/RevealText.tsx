"use client";

import { ElementType, ReactNode } from "react";
import { motion } from "framer-motion";

interface RevealTextProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  element?: ElementType | string;
  duration?: number;
}

export function RevealText({ children, delay = 0, className, element = "div", duration = 0.8 }: RevealTextProps) {
  const MotionComponent = motion[element as keyof typeof motion] || motion.div;

  return (
    <MotionComponent
      initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={`reveal-text ${className || ''}`}
    >
      {children}
    </MotionComponent>
  );
}

