"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Clock, Save, Plus, Trash2, CalendarOff, CalendarCheck,
  Loader2, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, X
} from "lucide-react";
import { format, addDays, startOfDay } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo", short: "Dom" },
  { value: 1, label: "Segunda-feira", short: "Seg" },
  { value: 2, label: "Terça-feira", short: "Ter" },
  { value: 3, label: "Quarta-feira", short: "Qua" },
  { value: 4, label: "Quinta-feira", short: "Qui" },
  { value: 5, label: "Sexta-feira", short: "Sex" },
  { value: 6, label: "Sábado", short: "Sáb" },
];

const HOUR_OPTIONS = Array.from({ length: 16 }, (_, i) => {
  const h = i + 7; // 07:00 até 22:00
  return `${h.toString().padStart(2, "0")}:00`;
});

type TimeSlot = { start: string; end: string };
type AvailabilityRule = {
  id?: string;
  therapist_id: string;
  rule_type: "weekly" | "date_override";
  day_of_week: number | null;
  specific_date: string | null;
  time_slots: TimeSlot[];
  is_blocked: boolean;
};

export function AvailabilityManager({ therapistId }: { therapistId: string }) {
  const [weeklyRules, setWeeklyRules] = useState<AvailabilityRule[]>([]);
  const [overrides, setOverrides] = useState<AvailabilityRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<number | null>(null);

  // Override form
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [overrideDate, setOverrideDate] = useState("");
  const [overrideBlocked, setOverrideBlocked] = useState(true);
  const [overrideSlots, setOverrideSlots] = useState<TimeSlot[]>([]);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/therapist/availability?therapist_id=${therapistId}`);
      const data = await res.json();
      if (data.success) {
        setWeeklyRules(data.rules.filter((r: AvailabilityRule) => r.rule_type === "weekly"));
        setOverrides(data.rules.filter((r: AvailabilityRule) => r.rule_type === "date_override"));
      }
    } catch (err) {
      setError("Falha ao carregar configurações.");
    } finally {
      setLoading(false);
    }
  }, [therapistId]);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  // Encontra regra semanal existente para um dia
  const getWeeklyRule = (dayOfWeek: number): AvailabilityRule | undefined => {
    return weeklyRules.find(r => r.day_of_week === dayOfWeek);
  };

  const getSlots = (dayOfWeek: number): TimeSlot[] => {
    return getWeeklyRule(dayOfWeek)?.time_slots || [];
  };

  const isDayBlocked = (dayOfWeek: number): boolean => {
    return getWeeklyRule(dayOfWeek)?.is_blocked || false;
  };

  const hasConfig = (dayOfWeek: number): boolean => {
    const rule = getWeeklyRule(dayOfWeek);
    return !!rule && (rule.is_blocked || rule.time_slots.length > 0);
  };

  // Salvar regra semanal
  const saveWeeklyRule = async (dayOfWeek: number, slots: TimeSlot[], blocked: boolean) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/therapist/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapist_id: therapistId,
          rule_type: "weekly",
          day_of_week: dayOfWeek,
          time_slots: slots,
          is_blocked: blocked,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      await fetchRules();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  // Adicionar slot a um dia da semana (local)
  const addSlotToDay = (dayOfWeek: number) => {
    const existing = getSlots(dayOfWeek);
    const lastEnd = existing.length > 0 ? existing[existing.length - 1].end : "09:00";
    const nextStartH = parseInt(lastEnd.split(":")[0]) + 1;
    const newSlot: TimeSlot = {
      start: `${nextStartH.toString().padStart(2, "0")}:00`,
      end: `${(nextStartH + 1).toString().padStart(2, "0")}:00`,
    };
    const newSlots = [...existing, newSlot];

    // Atualizar local
    setWeeklyRules(prev => {
      const idx = prev.findIndex(r => r.day_of_week === dayOfWeek);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], time_slots: newSlots, is_blocked: false };
        return updated;
      }
      return [...prev, {
        therapist_id: therapistId,
        rule_type: "weekly" as const,
        day_of_week: dayOfWeek,
        specific_date: null,
        time_slots: newSlots,
        is_blocked: false,
      }];
    });
  };

  const removeSlotFromDay = (dayOfWeek: number, slotIndex: number) => {
    setWeeklyRules(prev => {
      const idx = prev.findIndex(r => r.day_of_week === dayOfWeek);
      if (idx < 0) return prev;
      const updated = [...prev];
      const newSlots = [...updated[idx].time_slots];
      newSlots.splice(slotIndex, 1);
      updated[idx] = { ...updated[idx], time_slots: newSlots };
      return updated;
    });
  };

  const updateSlot = (dayOfWeek: number, slotIndex: number, field: "start" | "end", value: string) => {
    setWeeklyRules(prev => {
      const idx = prev.findIndex(r => r.day_of_week === dayOfWeek);
      if (idx < 0) return prev;
      const updated = [...prev];
      const newSlots = [...updated[idx].time_slots];
      newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value };
      updated[idx] = { ...updated[idx], time_slots: newSlots };
      return updated;
    });
  };

  const toggleDayBlocked = (dayOfWeek: number) => {
    const currentlyBlocked = isDayBlocked(dayOfWeek);
    setWeeklyRules(prev => {
      const idx = prev.findIndex(r => r.day_of_week === dayOfWeek);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], is_blocked: !currentlyBlocked, time_slots: !currentlyBlocked ? [] : updated[idx].time_slots };
        return updated;
      }
      return [...prev, {
        therapist_id: therapistId,
        rule_type: "weekly" as const,
        day_of_week: dayOfWeek,
        specific_date: null,
        time_slots: [],
        is_blocked: true,
      }];
    });
  };

  // Salvar override de data específica
  const saveOverride = async () => {
    if (!overrideDate) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/therapist/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapist_id: therapistId,
          rule_type: "date_override",
          specific_date: overrideDate,
          time_slots: overrideBlocked ? [] : overrideSlots,
          is_blocked: overrideBlocked,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      await fetchRules();
      setShowOverrideForm(false);
      setOverrideDate("");
      setOverrideBlocked(true);
      setOverrideSlots([]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const deleteOverride = async (ruleId: string) => {
    setSaving(true);
    try {
      await fetch(`/api/therapist/availability?id=${ruleId}`, { method: "DELETE" });
      await fetchRules();
    } catch {
      setError("Erro ao remover bloqueio");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
        <p className="text-slate-400">Carregando configurações de agenda...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-3 px-5 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
          <AlertTriangle size={18} /> {error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-3 px-5 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm animate-in fade-in duration-300">
          <CheckCircle2 size={18} /> Configurações salvas com sucesso!
        </div>
      )}

      {/* ============ SEÇÃO 1: HORÁRIOS SEMANAIS ============ */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <Clock size={20} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Horários Semanais Recorrentes</h3>
            <p className="text-slate-400 text-sm">Defina os horários que você atende em cada dia da semana.</p>
          </div>
        </div>

        <div className="space-y-3">
          {DAYS_OF_WEEK.map((day) => {
            const isActive = activeDay === day.value;
            const blocked = isDayBlocked(day.value);
            const slots = getSlots(day.value);
            const configured = hasConfig(day.value);

            return (
              <div key={day.value} className={`border rounded-2xl transition-all overflow-hidden ${
                blocked ? "bg-red-500/5 border-red-500/15" :
                configured ? "bg-emerald-500/5 border-emerald-500/15" :
                "bg-white/[0.02] border-white/10"
              }`}>
                {/* Day Header */}
                <button
                  onClick={() => setActiveDay(isActive ? null : day.value)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                      blocked ? "bg-red-500/15 text-red-400" :
                      configured ? "bg-emerald-500/15 text-emerald-400" :
                      "bg-white/5 text-slate-500"
                    }`}>
                      {day.short}
                    </span>
                    <div className="text-left">
                      <span className="text-white font-medium block">{day.label}</span>
                      <span className="text-xs text-slate-400">
                        {blocked ? "🔒 Dia bloqueado" :
                         slots.length > 0 ? slots.map(s => `${s.start}–${s.end}`).join(" • ") :
                         "Sem restrição (agenda aberta o dia todo)"}
                      </span>
                    </div>
                  </div>
                  {isActive ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                </button>

                {/* Expanded Content */}
                {isActive && (
                  <div className="px-5 pb-5 pt-2 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
                    {/* Toggle Bloqueado */}
                    <label className="flex items-center gap-3 mb-5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={blocked}
                        onChange={() => toggleDayBlocked(day.value)}
                        className="w-5 h-5 accent-red-500 rounded cursor-pointer"
                      />
                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                        <CalendarOff size={14} className="inline mr-1 text-red-400" />
                        Bloquear dia inteiro (não atendo neste dia)
                      </span>
                    </label>

                    {!blocked && (
                      <>
                        <p className="text-xs text-slate-500 mb-4">
                          Adicione as faixas de horário em que você atende neste dia. Se nenhuma faixa for adicionada, o dia inteiro será considerado disponível (agenda aberta).
                        </p>

                        {/* Slots */}
                        <div className="space-y-3 mb-4">
                          {slots.map((slot, idx) => (
                            <div key={idx} className="flex items-center gap-3 flex-wrap">
                              <span className="text-xs text-slate-400 w-8">De</span>
                              <select
                                value={slot.start}
                                onChange={(e) => updateSlot(day.value, idx, "start", e.target.value)}
                                className="bg-midnight-950 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                              >
                                {HOUR_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                              </select>
                              <span className="text-xs text-slate-400 w-8">Até</span>
                              <select
                                value={slot.end}
                                onChange={(e) => updateSlot(day.value, idx, "end", e.target.value)}
                                className="bg-midnight-950 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                              >
                                {HOUR_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                              </select>
                              <button
                                onClick={() => removeSlotFromDay(day.value, idx)}
                                className="p-2 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => addSlotToDay(day.value)}
                          className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          <Plus size={14} /> Adicionar faixa de horário
                        </button>
                      </>
                    )}

                    {/* Save Button for this day */}
                    <div className="mt-5 pt-4 border-t border-white/5 flex justify-end">
                      <button
                        onClick={() => saveWeeklyRule(day.value, getSlots(day.value), isDayBlocked(day.value))}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] text-sm"
                      >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Salvar {day.label}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ============ SEÇÃO 2: BLOQUEIOS POR DATA ============ */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
              <CalendarOff size={20} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Bloqueios por Data</h3>
              <p className="text-slate-400 text-sm">Bloqueie datas específicas ou altere os horários de um dia.</p>
            </div>
          </div>
          {!showOverrideForm && (
            <button
              onClick={() => setShowOverrideForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/20 font-medium rounded-xl transition-all text-sm"
            >
              <Plus size={16} /> Novo Bloqueio
            </button>
          )}
        </div>

        {/* Form para novo override */}
        {showOverrideForm && (
          <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-6 mb-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-white font-medium">Novo Bloqueio / Horário Especial</h4>
              <button onClick={() => setShowOverrideForm(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Data</label>
                <input
                  type="date"
                  value={overrideDate}
                  min={format(new Date(), "yyyy-MM-dd")}
                  onChange={(e) => setOverrideDate(e.target.value)}
                  className="bg-midnight-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors w-full"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="override_type"
                    checked={overrideBlocked}
                    onChange={() => { setOverrideBlocked(true); setOverrideSlots([]); }}
                    className="w-4 h-4 accent-amber-500"
                  />
                  <span className="text-sm text-slate-300">🔒 Bloquear dia inteiro</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="override_type"
                    checked={!overrideBlocked}
                    onChange={() => setOverrideBlocked(false)}
                    className="w-4 h-4 accent-amber-500"
                  />
                  <span className="text-sm text-slate-300">⏰ Definir horários especiais para este dia</span>
                </label>
              </div>

              {!overrideBlocked && (
                <div className="space-y-3 pl-7">
                  {overrideSlots.map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-slate-400 w-8">De</span>
                      <select
                        value={slot.start}
                        onChange={(e) => {
                          const newSlots = [...overrideSlots];
                          newSlots[idx] = { ...newSlots[idx], start: e.target.value };
                          setOverrideSlots(newSlots);
                        }}
                        className="bg-midnight-950 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                      >
                        {HOUR_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <span className="text-xs text-slate-400 w-8">Até</span>
                      <select
                        value={slot.end}
                        onChange={(e) => {
                          const newSlots = [...overrideSlots];
                          newSlots[idx] = { ...newSlots[idx], end: e.target.value };
                          setOverrideSlots(newSlots);
                        }}
                        className="bg-midnight-950 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                      >
                        {HOUR_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <button
                        onClick={() => setOverrideSlots(overrideSlots.filter((_, i) => i !== idx))}
                        className="p-2 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setOverrideSlots([...overrideSlots, { start: "09:00", end: "12:00" }])}
                    className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <Plus size={14} /> Adicionar faixa
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  onClick={() => setShowOverrideForm(false)}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveOverride}
                  disabled={!overrideDate || saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium rounded-xl transition-all text-sm"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Salvar Bloqueio
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de overrides existentes */}
        {overrides.length === 0 ? (
          <div className="text-center py-10 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
            <CalendarCheck size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Nenhum bloqueio de data ativo.</p>
            <p className="text-slate-600 text-xs mt-1">Use bloqueios para datas com compromissos de última hora.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {overrides
              .sort((a, b) => (a.specific_date || "").localeCompare(b.specific_date || ""))
              .map((rule) => {
                const dateObj = rule.specific_date ? new Date(rule.specific_date + "T12:00:00") : null;
                const isPast = dateObj ? dateObj < startOfDay(new Date()) : false;

                return (
                  <div key={rule.id} className={`flex items-center justify-between px-5 py-4 rounded-2xl border transition-all ${
                    isPast ? "opacity-40 bg-white/[0.01] border-white/5" :
                    rule.is_blocked ? "bg-red-500/5 border-red-500/15" :
                    "bg-amber-500/5 border-amber-500/15"
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        rule.is_blocked ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"
                      }`}>
                        {rule.is_blocked ? <CalendarOff size={18} /> : <Clock size={18} />}
                      </div>
                      <div>
                        <span className="text-white font-medium block">
                          {dateObj ? format(dateObj, "EEEE, dd 'de' MMMM", { locale: ptBR }) : rule.specific_date}
                        </span>
                        <span className="text-xs text-slate-400">
                          {rule.is_blocked ? "Dia inteiro bloqueado" :
                           rule.time_slots.map(s => `${s.start}–${s.end}`).join(" • ")}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => rule.id && deleteOverride(rule.id)}
                      className="p-2 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition-all"
                      title="Remover bloqueio"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
          </div>
        )}
      </section>
    </div>
  );
}
