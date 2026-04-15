"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TherapistSelection } from "./TherapistSelection";
import { CalendarSelection } from "./CalendarSelection";
import { ConfirmationStep } from "./ConfirmationStep";

type Step = 1 | 2 | 3;

export function BookingFlow({ initialTherapists, requestedService }: { initialTherapists: any[], requestedService?: string }) {
  const [step, setStep] = useState<Step>(1);
  const [selectedTherapist, setSelectedTherapist] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const direction = 1; // Para animações deslizantes

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      z: 0,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      scale: 0.98,
    }),
  };

  return (
    <div className="relative w-full min-h-[500px]">
      <AnimatePresence mode="wait" custom={direction}>
        
        {step === 1 && (
          <motion.div
            key="step1"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
          >
            <TherapistSelection 
              therapists={initialTherapists} 
              onSelect={(therapist) => {
                setSelectedTherapist(therapist);
                setStep(2);
              }} 
              requestedService={requestedService}
            />
          </motion.div>
        )}

        {step === 2 && selectedTherapist && (
          <motion.div
            key="step2"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
          >
            <CalendarSelection 
              therapist={selectedTherapist} 
              onBack={() => setStep(1)}
              onDateSelect={(date) => {
                setSelectedDate(date);
                setStep(3);
              }}
              requestedService={requestedService}
            />
          </motion.div>
        )}

        {step === 3 && selectedTherapist && selectedDate && (
          <motion.div
            key="step3"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
          >
            <ConfirmationStep 
              therapist={selectedTherapist}
              date={selectedDate}
              onBack={() => setStep(2)}
              requestedService={requestedService}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
