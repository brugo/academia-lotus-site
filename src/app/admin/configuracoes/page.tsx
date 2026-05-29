"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Save, 
  CheckCircle2, 
  MessageCircle, 
  Settings, 
  AlertTriangle, 
  ShieldCheck, 
  DollarSign, 
  MessageSquare,
  Sparkles,
  Phone,
  Clock
} from "lucide-react";

export default function SettingsAdminPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  // WhatsApp States
  const [whatsappPhone, setWhatsappPhone] = useState("(11) 95658-9429");
  const [bubbleMessage, setBubbleMessage] = useState("Olá! Se precisar de ajuda, estou aqui. ✨");
  const [defaultMessage, setDefaultMessage] = useState("Olá! Vim através do site e gostaria de obter mais informações sobre os atendimentos e cursos. ✨");
  const [bubbleEnabled, setBubbleEnabled] = useState(true);
  const [bubbleDelay, setBubbleDelay] = useState(2);
  const [bubbleDuration, setBubbleDuration] = useState(6);
  const [isSavingWhatsapp, setIsSavingWhatsapp] = useState(false);

  // Maintenance States
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isSavingMaintenance, setIsSavingMaintenance] = useState(false);

  // Reservation Fee States
  const [reservationFee, setReservationFee] = useState<number>(50);
  const [isSavingFee, setIsSavingFee] = useState(false);

  const formatPhoneMask = (val: string) => {
    const numbers = val.replace(/\D/g, "");
    const truncated = numbers.slice(0, 11);
    
    if (truncated.length <= 2) {
      return truncated ? `(${truncated}` : "";
    }
    if (truncated.length <= 6) {
      return `(${truncated.slice(0, 2)}) ${truncated.slice(2)}`;
    }
    if (truncated.length <= 10) {
      return `(${truncated.slice(0, 2)}) ${truncated.slice(2, 6)}-${truncated.slice(6)}`;
    }
    return `(${truncated.slice(0, 2)}) ${truncated.slice(2, 7)}-${truncated.slice(7)}`;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [feeRes, maintenanceRes, whatsappRes] = await Promise.all([
      supabase.from("system_settings").select("value").eq("id", "reservation_fee").single(),
      supabase.from("system_settings").select("value").eq("id", "maintenance_mode").single(),
      supabase.from("system_settings").select("value").eq("id", "whatsapp_settings").single()
    ]);
    
    if (feeRes.data && feeRes.data.value) {
      setReservationFee(feeRes.data.value.amount || 50);
    }
    if (maintenanceRes.data && maintenanceRes.data.value) {
      setIsMaintenanceMode(maintenanceRes.data.value.enabled === true);
    }
    if (whatsappRes.data && whatsappRes.data.value) {
      const val = whatsappRes.data.value as any;
      if (val.phone) {
        setWhatsappPhone(formatPhoneMask(val.phone));
      } else {
        setWhatsappPhone(formatPhoneMask("11956589429"));
      }
      if (val.bubble_message) {
        setBubbleMessage(val.bubble_message);
      }
      if (val.default_message) {
        setDefaultMessage(val.default_message);
      }
      setBubbleEnabled(val.bubble_enabled !== false);
      setBubbleDelay(val.bubble_delay !== undefined ? Number(val.bubble_delay) : 2);
      setBubbleDuration(val.bubble_duration !== undefined ? Number(val.bubble_duration) : 6);
    } else {
      setWhatsappPhone(formatPhoneMask("11956589429"));
      setBubbleEnabled(true);
      setBubbleDelay(2);
      setBubbleDuration(6);
    }
    
    setLoading(false);
  };

  const handleSaveWhatsapp = async () => {
    setIsSavingWhatsapp(true);
    const cleanPhone = whatsappPhone.replace(/\D/g, "");
    if (cleanPhone.length > 0 && cleanPhone.length < 10) {
      alert("Por favor, digite um número de WhatsApp válido com DDD.");
      setIsSavingWhatsapp(false);
      return;
    }
    const { error } = await supabase.from('system_settings').upsert({
      id: 'whatsapp_settings',
      value: { 
        phone: cleanPhone,
        bubble_message: bubbleMessage,
        default_message: defaultMessage,
        bubble_enabled: bubbleEnabled,
        bubble_delay: Number(bubbleDelay),
        bubble_duration: Number(bubbleDuration)
      }
    });
    
    setIsSavingWhatsapp(false);
    if (!error) {
      alert('Configurações do WhatsApp atualizadas com sucesso!');
    } else {
      alert('Erro ao salvar as configurações do WhatsApp: ' + error.message);
    }
  };

  const handleToggleMaintenance = async () => {
    setIsSavingMaintenance(true);
    const newValue = !isMaintenanceMode;
    const { error } = await supabase.from('system_settings').upsert({ id: 'maintenance_mode', value: { enabled: newValue } });
    if (!error) {
      setIsMaintenanceMode(newValue);
    } else {
      alert('Erro ao alterar o status do site.');
    }
    setIsSavingMaintenance(false);
  };

  const handleSaveFee = async () => {
    setIsSavingFee(true);
    const { error } = await supabase.from('system_settings').upsert({ id: 'reservation_fee', value: { amount: reservationFee } });
    setIsSavingFee(false);
    if (!error) {
      alert('Taxa de agendamento salva com sucesso!');
    } else {
      alert('Erro ao salvar a taxa: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="border-b border-white/5 pb-6">
          <div className="h-9 w-64 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-4 w-96 bg-white/5 rounded-xl mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-white/5 rounded-2xl border border-white/5 animate-pulse" />
          <div className="space-y-8">
            <div className="h-48 bg-white/5 rounded-2xl border border-white/5 animate-pulse" />
            <div className="h-48 bg-white/5 rounded-2xl border border-white/5 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-serif text-white tracking-tight flex items-center gap-3">
          <Settings className="text-gold-400" size={30} />
          Configurações Globais
        </h1>
        <p className="text-slate-400 mt-1">Gerencie os ajustes estruturais, widget do WhatsApp e regras gerais do site.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Coluna 1: WhatsApp (Esquerda - Maior destaque) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-midnight-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            {/* Glow decorativo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full pointer-events-none transition-all duration-300 group-hover:bg-emerald-500/10" />
            
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <MessageCircle size={22} />
              </div>
              <div>
                <h2 className="text-xl font-serif text-white">Botão Flutuante do WhatsApp</h2>
                <p className="text-slate-400 text-xs mt-0.5">Configure os textos e comportamento do widget fixo.</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Telefone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Phone size={14} className="text-gold-400" />
                  Número do WhatsApp de Atendimento
                </label>
                <input 
                  type="text" 
                  value={whatsappPhone} 
                  onChange={e => setWhatsappPhone(formatPhoneMask(e.target.value))} 
                  className="w-full bg-midnight-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors" 
                  placeholder="(11) 95658-9429"
                />
                <p className="text-[11px] text-slate-500">Este número receberá os contatos dos clientes que clicarem no botão.</p>
              </div>

              {/* Mensagem do Balão (Typewriter) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Sparkles size={14} className="text-gold-400" />
                  Mensagem do Balão Flutuante (Efeito Máquina de Escrever)
                </label>
                <textarea 
                  value={bubbleMessage} 
                  onChange={e => setBubbleMessage(e.target.value)} 
                  className="w-full bg-midnight-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors min-h-[80px]" 
                  placeholder="Ex: Olá! Se precisar de ajuda, estou aqui. ✨"
                />
                <p className="text-[11px] text-slate-500">Aparece temporariamente por cima do botão flutuante para chamar atenção de forma sutil.</p>
              </div>

              {/* Ativação do Balão de Conversa */}
              <div className="flex items-center justify-between p-4 bg-midnight-950 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <MessageSquare className={bubbleEnabled ? "text-gold-400" : "text-slate-500"} size={20} />
                  <div>
                    <span className={`text-sm font-medium ${bubbleEnabled ? 'text-gold-400' : 'text-slate-300'}`}>
                      {bubbleEnabled ? 'Balão de Conversa Ativo' : 'Balão de Conversa Desativado'}
                    </span>
                    <p className="text-[11px] text-slate-500">Ativa o balão flutuante temporário com efeito máquina de escrever.</p>
                  </div>
                </div>
                
                <button 
                  type="button"
                  onClick={() => setBubbleEnabled(!bubbleEnabled)} 
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${bubbleEnabled ? 'bg-gold-500' : 'bg-slate-700'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${bubbleEnabled ? 'translate-x-8' : 'translate-x-1'}`} />
                </button>
              </div>

              {bubbleEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 animate-in fade-in duration-300">
                  {/* Atraso de Exibição */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-2">
                      <Clock size={12} className="text-gold-400" />
                      Atraso para Exibir (segundos)
                    </label>
                    <input 
                      type="number" 
                      min="0"
                      max="120"
                      value={bubbleDelay} 
                      onChange={e => setBubbleDelay(Math.max(0, Number(e.target.value)))} 
                      className="w-full bg-midnight-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors" 
                      placeholder="Ex: 20"
                    />
                    <p className="text-[10px] text-slate-500">Tempo após o carregamento da página para o balão surgir.</p>
                  </div>

                  {/* Duração da Exibição */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300 flex items-center gap-2">
                      <Clock size={12} className="text-gold-400" />
                      Tempo de Exibição (segundos)
                    </label>
                    <input 
                      type="number" 
                      min="1"
                      max="120"
                      value={bubbleDuration} 
                      onChange={e => setBubbleDuration(Math.max(1, Number(e.target.value)))} 
                      className="w-full bg-midnight-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors" 
                      placeholder="Ex: 6"
                    />
                    <p className="text-[10px] text-slate-500">Por quanto tempo o balão permanece visível antes do fade.</p>
                  </div>
                </div>
              )}

              {/* Mensagem Inicial Padrão no App do WhatsApp */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <MessageSquare size={14} className="text-gold-400" />
                  Mensagem Inicial Pré-digitada da Conversa
                </label>
                <textarea 
                  value={defaultMessage} 
                  onChange={e => setDefaultMessage(e.target.value)} 
                  className="w-full bg-midnight-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors min-h-[100px]" 
                  placeholder="Ex: Olá! Vim através do site e gostaria de obter mais informações..."
                />
                <p className="text-[11px] text-slate-500">Esta mensagem já virá preenchida na caixa de texto do cliente ao iniciar a conversa no WhatsApp.</p>
              </div>

              {/* Botão de Salvar WhatsApp */}
              <button 
                onClick={handleSaveWhatsapp} 
                disabled={isSavingWhatsapp}
                className="w-full py-3.5 bg-gold-600 hover:bg-gold-500 text-midnight-950 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSavingWhatsapp ? 'Salvando...' : (
                  <>
                    <Save size={18} />
                    Salvar Ajustes do WhatsApp
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Coluna 2: Manutenção e Taxas (Direita - Menores) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Bloco 1: Taxa de Reserva */}
          <div className="bg-midnight-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-[40px] rounded-full pointer-events-none transition-all duration-300 group-hover:bg-gold-500/10" />

            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 text-gold-400 flex items-center justify-center border border-gold-500/20">
                <DollarSign size={22} />
              </div>
              <div>
                <h2 className="text-xl font-serif text-white">Taxa de Reserva Global</h2>
                <p className="text-slate-400 text-xs mt-0.5">Sinal cobrado para confirmar agendamentos.</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-slate-400 text-sm">Este é o valor cobrado via Asaas no ato do agendamento para garantir o horário, independente do valor total da técnica escolhida.</p>
              
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-3.5 text-slate-400">R$</span>
                  <input 
                    type="number" 
                    value={reservationFee} 
                    onChange={e => setReservationFee(Number(e.target.value))} 
                    className="w-full bg-midnight-950 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors" 
                  />
                </div>
                <button 
                  onClick={handleSaveFee} 
                  disabled={isSavingFee} 
                  className="px-6 bg-gold-600 hover:bg-gold-500 text-midnight-950 font-bold rounded-xl whitespace-nowrap transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={16} />
                  {isSavingFee ? 'Salvando...' : 'Salvar Taxa'}
                </button>
              </div>
            </div>
          </div>

          {/* Bloco 2: Modo de Manutenção */}
          <div className="bg-midnight-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[40px] rounded-full pointer-events-none transition-all duration-300 group-hover:bg-amber-500/10" />

            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h2 className="text-xl font-serif text-white">Modo Em Construção</h2>
                <p className="text-slate-400 text-xs mt-0.5">Controle de acesso público ao site.</p>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-slate-400 text-sm">
                Quando ativado, todo o tráfego geral do site será redirecionado para uma bela página de manutenção. 
                <span className="text-gold-400 font-medium ml-1">Administradores e terapeutas</span> logados continuarão acessando o sistema normalmente.
              </p>

              <div className="flex items-center justify-between p-4 bg-midnight-950 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className={isMaintenanceMode ? "text-amber-500" : "text-emerald-500"} size={20} />
                  <span className={`text-sm font-medium ${isMaintenanceMode ? 'text-amber-400' : 'text-slate-300'}`}>
                    {isMaintenanceMode ? 'Modo Manutenção Ativo' : 'Site Aberto ao Público'}
                  </span>
                </div>
                
                <button 
                  onClick={handleToggleMaintenance} 
                  disabled={isSavingMaintenance}
                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${isMaintenanceMode ? 'bg-amber-500' : 'bg-slate-700'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isMaintenanceMode ? 'translate-x-8' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
