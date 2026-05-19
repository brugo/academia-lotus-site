"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { ArrowLeft, CheckCircle2, Lock, Loader2, Video, CreditCard, QrCode, Copy } from "lucide-react";

export function ConfirmationStep({ therapist, date, onBack, requestedService, user, reservationFee = 50 }: { therapist: any, date: Date, onBack: () => void, requestedService?: string, user?: any, reservationFee?: number }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [meetLink, setMeetLink] = useState("");
  const [step, setStep] = useState<'details' | 'payment' | 'pix' | 'success'>('details');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD'>('PIX');

  // Ref para o topo do componente — auto-scroll no mobile
  const topRef = useRef<HTMLDivElement>(null);
  
  // Detecta se é mobile (apenas client-side)
  const isMobile = useCallback(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }, []);
  
  // Função para scroll ao topo no mobile
  const scrollToTop = useCallback(() => {
    if (isMobile()) {
      setTimeout(() => {
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [isMobile]);
  
  const [pixData, setPixData] = useState<{ encodedImage: string, payload: string, referenceId: string } | null>(null);
  const [currentReferenceId, setCurrentReferenceId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  
  const formatPhone = (phone: string) => {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, '');
    let res = digits.substring(0, 11);
    if (res.length > 2) res = `(${res.substring(0, 2)}) ${res.substring(2)}`;
    if (digits.length > 10) {
      res = `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7, 11)}`;
    } else if (digits.length > 6) {
      res = `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6, 10)}`;
    }
    return res;
  };

  const formatCpf = (cpf: string) => {
    if (!cpf) return "";
    const digits = cpf.replace(/\D/g, '');
    let res = digits.substring(0, 11);
    if (digits.length > 9) {
      res = `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6, 9)}-${digits.substring(9, 11)}`;
    } else if (digits.length > 6) {
      res = `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6, 9)}`;
    } else if (digits.length > 3) {
      res = `${digits.substring(0, 3)}.${digits.substring(3, 6)}`;
    }
    return res;
  };

  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: formatPhone(user?.user_metadata?.whatsapp || ""),
    cpf: formatCpf(user?.user_metadata?.cpf || "")
  });

  const [ccData, setCcData] = useState({
    holderName: "",
    number: "",
    expiry: "", // MM/YY ou MM/YYYY
    ccv: "",
    postalCode: "",
    addressNumber: ""
  });

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isPolling && currentReferenceId) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`/api/checkout/status?ref=${currentReferenceId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'completed') {
              setIsPolling(false);
              window.location.href = `/agendamento/sucesso?ref=${currentReferenceId}`;
            }
          }
        } catch (error) {
          console.error("Erro ao verificar status:", error);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPolling, currentReferenceId]);

  const handleContinueToPayment = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.cpf) {
      alert("Por favor, preencha todos os campos, incluindo o CPF.");
      return;
    }
    if (formData.cpf.length < 14) {
      alert("CPF inválido.");
      return;
    }
    setStep('payment');
    scrollToTop();
  };

  const handlePaymentSubmit = async () => {
    setLoading(true);

    try {
      let creditCard, creditCardHolderInfo;

      if (paymentMethod === 'CREDIT_CARD') {
        if (!ccData.holderName || !ccData.number || !ccData.expiry || !ccData.ccv || !ccData.postalCode || !ccData.addressNumber) {
          alert("Por favor, preencha todos os dados do cartão e endereço.");
          setLoading(false);
          return;
        }

        const [month, yearRaw] = ccData.expiry.split('/');
        const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw;

        creditCard = {
          holderName: ccData.holderName,
          number: ccData.number.replace(/\D/g, ''),
          expiryMonth: month,
          expiryYear: year,
          ccv: ccData.ccv
        };

        creditCardHolderInfo = {
          name: formData.name,
          email: formData.email,
          cpfCnpj: formData.cpf.replace(/\D/g, ''),
          postalCode: ccData.postalCode.replace(/\D/g, ''),
          addressNumber: ccData.addressNumber,
          phone: formData.phone.replace(/\D/g, '')
        };
      }

      const res = await fetch("/api/checkout/transparent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapistId: therapist.id,
          therapistEmail: therapist.google_calendar_id || therapist.email,
          therapistName: therapist.name,
          clientName: formData.name,
          clientEmail: formData.email,
          clientWhatsapp: formData.phone,
          clientCpf: formData.cpf.replace(/\D/g, ''),
          startTime: date.toISOString(),
          requestedService: requestedService,
          paymentMethod,
          creditCard,
          creditCardHolderInfo
        })
      });

      const result = await res.json();
      
      if (result.success) {
        setCurrentReferenceId(result.referenceId);
        
        if (paymentMethod === 'PIX' && result.pix) {
          setPixData({
            encodedImage: result.pix.encodedImage,
            payload: result.pix.payload,
            referenceId: result.referenceId
          });
          setStep('pix');
          setIsPolling(true);
          scrollToTop();
        } else {
          // Cartão de Crédito com sucesso na API, agora aguardamos o webhook
          setStep('pix'); // Usamos a mesma tela de aguardando (podemos customizar abaixo)
          setIsPolling(true);
          scrollToTop();
        }
      } else {
        alert("Erro no pagamento: " + (result.error || "Verifique os dados e tente novamente."));
      }
    } catch (error: any) {
      console.error(error);
      alert("Houve um erro de comunicação com o servidor de pagamento.");
    } finally {
      setLoading(false);
    }
  };

  const copyPixPayload = () => {
    if (pixData?.payload) {
      navigator.clipboard.writeText(pixData.payload);
      alert("Código PIX copiado com sucesso!");
    }
  };

  if (step === 'success' || success) {
    return (
      <div className="w-full max-w-xl mx-auto pb-32 pt-10 text-center">
        <div ref={topRef} className="scroll-mt-24" />
        <Loader2 className="animate-spin text-gold-400 mx-auto mb-4" size={32} />
        <h2 className="text-xl font-serif text-white">Redirecionando...</h2>
      </div>
    );
  }

  if (step === 'pix' && (pixData || paymentMethod === 'CREDIT_CARD')) {
    return (
      <div className="w-full max-w-xl mx-auto pb-32 pt-10">
        <div ref={topRef} className="scroll-mt-24" />
        <div className="bg-gradient-to-b from-midnight-900 to-midnight-950 border border-gold-500/30 rounded-3xl p-10 text-center shadow-[0_0_50px_rgba(212,175,55,0.15)] relative overflow-hidden">
          
          {paymentMethod === 'PIX' && pixData ? (
            <>
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                 <QrCode size={32} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-serif text-white mb-2">Finalize seu Pagamento</h2>
              <p className="text-slate-300 text-sm mb-6 font-light">
                Escaneie o QR Code abaixo com o aplicativo do seu banco ou use a opção Copia e Cola.
              </p>
              
              <div className="bg-white p-4 rounded-2xl inline-block mb-6">
                 <img src={`data:image/jpeg;base64,${pixData.encodedImage}`} alt="QR Code PIX" className="w-48 h-48" />
              </div>

              <div className="bg-black/30 rounded-xl p-4 border border-white/5 mb-6 text-left flex items-center justify-between gap-4">
                <div className="overflow-hidden">
                  <p className="text-xs text-slate-400 mb-1">PIX Copia e Cola</p>
                  <p className="text-sm text-white font-mono truncate">{pixData.payload}</p>
                </div>
                <button onClick={copyPixPayload} className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors shrink-0" title="Copiar código PIX">
                  <Copy size={18} className="text-gold-400" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-gold-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                 <CreditCard size={32} className="text-gold-400" />
              </div>
              <h2 className="text-2xl font-serif text-white mb-2">Processando Cartão...</h2>
              <p className="text-slate-300 text-sm mb-6 font-light">
                Estamos autorizando seu pagamento com a operadora do cartão.
              </p>
            </>
          )}

          <div className="mt-4 p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl text-left mb-8 flex items-start gap-3">
            <Loader2 className="animate-spin text-blue-400 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-blue-200 leading-relaxed">
              <strong className="text-blue-400 font-semibold block mb-1">Aguardando confirmação...</strong> 
              Assim que o pagamento for detectado, sua sessão será confirmada automaticamente e você receberá um e-mail com os detalhes.
            </p>
          </div>
          
          <button 
            onClick={() => window.location.href = "/"}
            className="w-full px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all border border-white/10"
          >
            Voltar para o Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto pb-32">
      <div ref={topRef} className="scroll-mt-24" />
      <button 
        onClick={() => step === 'payment' ? setStep('details') : onBack()}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        {step === 'payment' ? 'Voltar para Meus Dados' : 'Voltar para a Agenda'}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Formulário ou Pagamento */}
        <div className="md:col-span-3 bg-midnight-900 border border-white/5 rounded-3xl p-8 shadow-2xl relative">
          
          {step === 'details' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-serif text-white mb-2">Seus Dados</h2>
              <p className="text-slate-400 text-sm mb-8">Nós usaremos o seu WhatsApp para lhe enviar as confirmações e o contato do seu terapeuta.</p>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Nome Completo</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-midnight-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-gold-500 transition-colors" 
                    placeholder="Ex: Clara Luz" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">E-mail Principal</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-midnight-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-gold-500 transition-colors" 
                    placeholder="clara@email.com" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">WhatsApp <span className="text-gold-500">*</span></label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: formatPhone(e.target.value)})}
                      className="w-full bg-midnight-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-gold-500 transition-colors" 
                      placeholder="(11) 99999-9999"
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">CPF <span className="text-gold-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.cpf}
                      onChange={e => setFormData({...formData, cpf: formatCpf(e.target.value)})}
                      className="w-full bg-midnight-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-gold-500 transition-colors" 
                      placeholder="000.000.000-00"
                      required 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-serif text-white mb-2">Forma de Pagamento</h2>
              <p className="text-slate-400 text-sm mb-6">Escolha como deseja pagar a taxa de reserva.</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                  onClick={() => setPaymentMethod('PIX')}
                  className={`flex items-center justify-center gap-2 p-4 rounded-xl border transition-all ${paymentMethod === 'PIX' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-midnight-950/50 border-white/10 text-slate-400 hover:border-white/30 hover:text-white'}`}
                >
                  <QrCode size={20} />
                  <span className="font-medium">PIX</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('CREDIT_CARD')}
                  className={`flex items-center justify-center gap-2 p-4 rounded-xl border transition-all ${paymentMethod === 'CREDIT_CARD' ? 'bg-gold-500/10 border-gold-500 text-gold-400' : 'bg-midnight-950/50 border-white/10 text-slate-400 hover:border-white/30 hover:text-white'}`}
                >
                  <CreditCard size={20} />
                  <span className="font-medium">Cartão</span>
                </button>
              </div>

              {paymentMethod === 'PIX' && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 text-center animate-in fade-in">
                  <QrCode size={40} className="text-emerald-500/50 mx-auto mb-4" />
                  <p className="text-slate-300">Ao prosseguir, você receberá o QR Code e o código Copia e Cola para realizar o pagamento no seu banco.</p>
                </div>
              )}

              {paymentMethod === 'CREDIT_CARD' && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Número do Cartão</label>
                    <div className="relative">
                      <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input 
                        type="text" 
                        value={ccData.number}
                        onChange={e => {
                          let val = e.target.value.replace(/\D/g, '');
                          val = val.match(/.{1,4}/g)?.join(' ') || '';
                          setCcData({...ccData, number: val.substring(0, 19)});
                        }}
                        className="w-full bg-midnight-950/50 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white focus:outline-none focus:border-gold-500 transition-colors" 
                        placeholder="0000 0000 0000 0000" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Nome no Cartão</label>
                    <input 
                      type="text" 
                      value={ccData.holderName}
                      onChange={e => setCcData({...ccData, holderName: e.target.value.toUpperCase()})}
                      className="w-full bg-midnight-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-gold-500 transition-colors" 
                      placeholder="NOME COMO ESTÁ IMPRESSO" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Validade</label>
                      <input 
                        type="text" 
                        value={ccData.expiry}
                        onChange={e => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.length > 2) val = `${val.substring(0,2)}/${val.substring(2,6)}`;
                          setCcData({...ccData, expiry: val});
                        }}
                        className="w-full bg-midnight-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-gold-500 transition-colors text-center" 
                        placeholder="MM/AA" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">CVV</label>
                      <input 
                        type="text" 
                        value={ccData.ccv}
                        onChange={e => setCcData({...ccData, ccv: e.target.value.replace(/\D/g, '').substring(0,4)})}
                        className="w-full bg-midnight-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-gold-500 transition-colors text-center" 
                        placeholder="123" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 mt-4">
                    <div className="col-span-2 space-y-2">
                      <label className="text-sm font-medium text-slate-300">CEP do Endereço</label>
                      <input 
                        type="text" 
                        value={ccData.postalCode}
                        onChange={e => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.length > 5) val = `${val.substring(0,5)}-${val.substring(5,8)}`;
                          setCcData({...ccData, postalCode: val});
                        }}
                        className="w-full bg-midnight-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-gold-500 transition-colors" 
                        placeholder="00000-000" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Número</label>
                      <input 
                        type="text" 
                        value={ccData.addressNumber}
                        onChange={e => setCcData({...ccData, addressNumber: e.target.value})}
                        className="w-full bg-midnight-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-gold-500 transition-colors" 
                        placeholder="123" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Resumo e Pagamento */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-gold-900/10 border border-gold-500/20 rounded-3xl p-6 relative overflow-hidden backdrop-blur-sm">
            <h3 className="text-white font-medium mb-6 flex items-center gap-2">
              Resumo do Encontro
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <img src={therapist.photo_url} className="w-12 h-12 rounded-full object-cover" alt="" />
                <div>
                  <p className="text-white font-medium">{therapist.name}</p>
                  <p className="text-gold-400 text-sm">{requestedService || therapist.specialty}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-slate-400 mb-1">Horário</p>
                <p className="text-white font-medium capitalize text-sm">
                  {format(date, "EEEE, dd/MM 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <p className="text-slate-300">Taxa de Reserva</p>
                <p className="text-gold-400 font-serif text-xl border-b border-gold-500/30">
                  R$ {reservationFee.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl">
              <p className="text-xs text-blue-200 leading-relaxed">
                <strong className="text-blue-400 font-semibold block mb-1">Importante:</strong> 
                Este valor garante a exclusividade do seu horário. Ele <strong className="text-white">não é uma taxa extra</strong>: o valor será abatido do total da consulta no dia do atendimento.
              </p>
            </div>
          </div>

          {step === 'details' ? (
            <button 
              disabled={!formData.name || !formData.email || !formData.phone || formData.cpf.replace(/\D/g, '').length < 11}
              onClick={handleContinueToPayment}
              className="w-full px-6 py-4 bg-gold-600 hover:bg-gold-500 disabled:bg-slate-800 disabled:text-slate-500 text-midnight-950 font-medium rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3"
            >
              Prosseguir para Pagamento
            </button>
          ) : (
            <button 
              disabled={loading || (paymentMethod === 'CREDIT_CARD' && (!ccData.number || !ccData.holderName || !ccData.expiry || !ccData.ccv || !ccData.postalCode || !ccData.addressNumber))}
              onClick={handlePaymentSubmit}
              className="w-full px-6 py-4 bg-gold-600 hover:bg-gold-500 disabled:bg-slate-800 disabled:text-slate-500 text-midnight-950 font-medium rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Lock size={18} />}
              {loading ? "Processando..." : (paymentMethod === 'PIX' ? "Gerar PIX" : "Pagar Agora")}
            </button>
          )}
          <div className="flex flex-col items-center gap-3 mt-4">
            <p className="text-center text-xs text-slate-500 flex justify-center gap-1">
              Pagamento Seguro com Asaas.
            </p>
            <a href="/termos#politica-de-cancelamento" target="_blank" rel="noopener noreferrer" className="text-xs text-gold-500 hover:text-gold-400 underline transition-colors">
              Confira nossa política de devolução
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
