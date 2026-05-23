"use client";

import { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  UserCircle, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Sparkles, 
  RefreshCw,
  ExternalLink,
  X,
  ArrowUpDown
} from "lucide-react";
import { format, isThisMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatWhatsAppLink } from "@/lib/whatsapp";

type Appointment = {
  id: string;
  therapist_id: string;
  client_name: string;
  client_email: string;
  client_whatsapp: string;
  client_avatar_url: string | null;
  service_name: string;
  start_time: string;
  end_time: string;
  google_event_id: string | null;
  meet_link: string | null;
  created_at: string;
  therapist_name: string;
  therapist_email: string;
  therapist_whatsapp: string;
  therapist_photo_url: string | null;
};

export default function AgendamentosAdminPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTherapist, setSelectedTherapist] = useState("Todos");
  const [selectedDate, setSelectedDate] = useState(""); // Data da Consulta
  const [selectedCriacaoDate, setSelectedCriacaoDate] = useState(""); // Data do Agendamento (Reserva)
  
  // Ordenação (Padrão: Reservas mais recentes primeiro)
  const [sortBy, setSortBy] = useState<'agendamento_desc' | 'agendamento_asc' | 'consulta_asc' | 'consulta_desc' | 'client_name_asc' | 'client_name_desc'>('agendamento_desc');
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Rastreamento de Erros de Imagem
  const [clientAvatarErrors, setClientAvatarErrors] = useState<Record<string, boolean>>({});
  const [therapistAvatarErrors, setTherapistAvatarErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Quando qualquer filtro, ordenação ou limite muda, reseta para a primeira página
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTherapist, selectedDate, selectedCriacaoDate, sortBy, itemsPerPage]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/appointments');
      if (!res.ok) throw new Error("Erro ao buscar agendamentos");
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error(err);
      alert("Não foi possível carregar a lista de agendamentos.");
    } finally {
      setLoading(false);
    }
  };

  // Extrair a lista de terapeutas únicos presentes nos agendamentos para preencher o filtro
  const therapistsList = Array.from(
    new Map((appointments || []).map(a => [a.therapist_id, { id: a.therapist_id, name: a.therapist_name }])).values()
  );

  // Lógica de Filtros
  const filteredAppointments = appointments.filter(appt => {
    // 1. Busca por texto (Cliente, Email ou Nome da Técnica)
    const matchesSearch = 
      (appt.client_name && appt.client_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (appt.client_email && appt.client_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (appt.service_name && appt.service_name.toLowerCase().includes(searchTerm.toLowerCase()));

    // 2. Filtro por Terapeuta
    const matchesTherapist = selectedTherapist === 'Todos' || appt.therapist_id === selectedTherapist;

    // 3. Filtro por Data da Consulta (Compara YYYY-MM-DD contra start_time)
    const apptDateStr = appt.start_time ? appt.start_time.split('T')[0] : '';
    const matchesDate = !selectedDate || apptDateStr === selectedDate;

    // 4. Filtro por Data do Agendamento (Compara YYYY-MM-DD contra created_at)
    const apptCreatedStr = appt.created_at ? appt.created_at.split('T')[0] : '';
    const matchesCreatedDate = !selectedCriacaoDate || apptCreatedStr === selectedCriacaoDate;

    return matchesSearch && matchesTherapist && matchesDate && matchesCreatedDate;
  });

  // Lógica de Ordenação
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (sortBy === 'agendamento_desc') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === 'agendamento_asc') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    if (sortBy === 'consulta_asc') {
      return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    }
    if (sortBy === 'consulta_desc') {
      return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
    }
    if (sortBy === 'client_name_asc') {
      return (a.client_name || '').localeCompare(b.client_name || '');
    }
    if (sortBy === 'client_name_desc') {
      return (b.client_name || '').localeCompare(a.client_name || '');
    }
    return 0;
  });

  // Estatísticas Rápidas
  const totalBookings = appointments.length;
  const uniqueClientsCount = new Set(appointments.map(a => a.client_email)).size;
  const bookingsThisMonth = appointments.filter(a => isThisMonth(new Date(a.start_time))).length;

  // Lógica de Paginação
  const totalItems = sortedAppointments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAppointments = sortedAppointments.slice(startIndex, startIndex + itemsPerPage);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedTherapist("Todos");
    setSelectedDate("");
    setSelectedCriacaoDate("");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Cabeçalho */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="text-gold-500" />
            Controle de Agendamentos
          </h1>
          <p className="text-slate-400 mt-1">
            Monitore, filtre e ordene todos os agendamentos confirmados e pagos no sistema.
          </p>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="flex flex-wrap gap-4">
          <div className="bg-midnight-950/50 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3 shadow-inner">
            <div className="text-center">
              <span className="block text-2xl font-serif text-gold-400">{totalBookings}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Total</span>
            </div>
            <div className="w-px h-8 bg-white/10 mx-2" />
            <div className="text-center">
              <span className="block text-2xl font-serif text-white">{uniqueClientsCount}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Clientes Únicos</span>
            </div>
            <div className="w-px h-8 bg-white/10 mx-2" />
            <div className="text-center">
              <span className="block text-2xl font-serif text-emerald-400">{bookingsThisMonth}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Este Mês</span>
            </div>
          </div>
          
          <button 
            onClick={fetchAppointments}
            className="p-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl border border-white/10 transition-all flex items-center justify-center self-center"
            title="Atualizar dados"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Painel de Filtros e Ordenação */}
      <div className="bg-midnight-900/20 border border-white/5 p-5 rounded-2xl space-y-4 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Busca Textual */}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1.5 ml-1">Busca Geral</span>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Buscar por cliente, e-mail ou técnica..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-midnight-950/60 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-gold-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Filtro de Terapeuta */}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1.5 ml-1">Terapeuta</span>
            <div className="relative flex-1">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <select 
                value={selectedTherapist}
                onChange={(e) => setSelectedTherapist(e.target.value)}
                className="w-full bg-midnight-950/60 border border-white/10 rounded-xl pl-11 pr-8 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-gold-500/50 transition-colors cursor-pointer"
              >
                <option value="Todos">Todos os Terapeutas</option>
                {therapistsList.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtro de Data da Consulta */}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1.5 ml-1">Data da Consulta</span>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-midnight-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-colors cursor-pointer"
            />
          </div>

          {/* Filtro de Data do Agendamento */}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1.5 ml-1">Data do Agendamento</span>
            <input 
              type="date" 
              value={selectedCriacaoDate}
              onChange={(e) => setSelectedCriacaoDate(e.target.value)}
              className="w-full bg-midnight-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold-500/50 transition-colors cursor-pointer"
            />
          </div>
        </div>

        {/* Linha Inferior com Ordenação e Botão de Limpar */}
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-t border-white/5 pt-4">
          {/* Ordenação dropdown */}
          <div className="flex flex-col w-full sm:w-auto">
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-1.5 ml-1">Ordenar por</span>
            <div className="relative min-w-[260px]">
              <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-midnight-950/60 border border-white/10 rounded-xl pl-11 pr-8 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-gold-500/50 transition-colors cursor-pointer"
              >
                <option value="agendamento_desc">Agendamento (Mais Recentes)</option>
                <option value="agendamento_asc">Agendamento (Mais Antigos)</option>
                <option value="consulta_asc">Consulta (Próximas Primeiro)</option>
                <option value="consulta_desc">Consulta (Distantes Primeiro)</option>
                <option value="client_name_asc">Nome do Cliente (A - Z)</option>
                <option value="client_name_desc">Nome do Cliente (Z - A)</option>
              </select>
            </div>
          </div>

          {/* Botão de Limpar Filtros */}
          {(searchTerm || selectedTherapist !== "Todos" || selectedDate || selectedCriacaoDate || sortBy !== 'agendamento_desc') && (
            <button 
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/10"
            >
              <X size={14} /> Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Agendamentos */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1,2,3,4].map(n => (
            <div key={n} className="h-20 bg-white/5 rounded-2xl border border-white/5" />
          ))}
        </div>
      ) : (
        <div className="bg-midnight-900/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-slate-400 font-medium">
                  <th className="px-6 py-4">Paciente / Cliente</th>
                  <th className="px-6 py-4">Sessão / Técnica</th>
                  <th className="px-6 py-4">Mentor / Terapeuta</th>
                  <th className="px-6 py-4">Data e Hora</th>
                  <th className="px-6 py-4 text-center">Contato Direct</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-500 text-sm">
                      Nenhum agendamento bem-sucedido encontrado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  paginatedAppointments.map((appt) => {
                    const dateObj = new Date(appt.start_time);
                    const formattedDate = format(dateObj, "dd/MM/yyyy", { locale: ptBR });
                    const weekday = format(dateObj, "EEEE", { locale: ptBR });
                    const formattedHour = format(dateObj, "HH:mm", { locale: ptBR });
                    
                    const createdDateObj = new Date(appt.created_at);
                    const formattedCreatedDate = format(createdDateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
                    
                    return (
                      <tr key={appt.id} className="hover:bg-white/[0.02] transition-colors group">
                        {/* Paciente */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-midnight-950 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                              {appt.client_avatar_url && !clientAvatarErrors[appt.id] ? (
                                <img 
                                  src={appt.client_avatar_url} 
                                  alt={appt.client_name} 
                                  className="w-full h-full object-cover" 
                                  referrerPolicy="no-referrer"
                                  onError={() => setClientAvatarErrors(prev => ({ ...prev, [appt.id]: true }))}
                                />
                              ) : (
                                <UserCircle size={24} className="text-slate-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-slate-200 text-sm">{appt.client_name}</p>
                              <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                <Mail size={12} className="text-slate-600" />
                                <span>{appt.client_email}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Técnica / Serviço */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-gold-500/10 text-gold-400 border-gold-500/20">
                            <Sparkles size={12} />
                            {appt.service_name}
                          </span>
                        </td>

                        {/* Terapeuta */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-midnight-950 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                              {appt.therapist_photo_url && appt.therapist_photo_url !== '/user-placeholder.png' && !therapistAvatarErrors[appt.id] ? (
                                <img 
                                  src={appt.therapist_photo_url} 
                                  alt={appt.therapist_name} 
                                  className="w-full h-full object-cover" 
                                  referrerPolicy="no-referrer"
                                  onError={() => setTherapistAvatarErrors(prev => ({ ...prev, [appt.id]: true }))}
                                />
                              ) : (
                                <UserCircle size={24} className="text-slate-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-slate-300 text-sm">{appt.therapist_name}</p>
                              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[180px]" title={appt.therapist_email}>
                                {appt.therapist_email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Data e Hora */}
                        <td className="px-6 py-4">
                          <div className="space-y-0.5 text-sm text-slate-300">
                            <div className="flex items-center gap-2">
                              <CalendarIcon size={14} className="text-gold-500/60" />
                              <span className="font-medium">{formattedDate}</span>
                              <span className="text-xs text-slate-500 capitalize">({weekday})</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Clock size={12} />
                              <span>{formattedHour} - {format(new Date(appt.end_time), "HH:mm")}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1">
                              <span className="text-slate-600 font-medium">Reservado em:</span>
                              <span>{formattedCreatedDate}</span>
                            </div>
                          </div>
                        </td>

                        {/* WhatsApp / Links */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {appt.client_whatsapp && appt.client_whatsapp !== 'Não informado' ? (
                              <a 
                                href={formatWhatsAppLink(appt.client_whatsapp)}
                                target="_blank" 
                                rel="noreferrer" 
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-medium hover:bg-emerald-500/20 transition-all"
                                title="Conversar no WhatsApp"
                              >
                                <Phone size={14} />
                                <span className="hidden sm:inline">WhatsApp</span>
                              </a>
                            ) : (
                              <span className="text-xs text-slate-600 italic">Sem contato</span>
                            )}
                            
                            {appt.meet_link && (
                              <a 
                                href={appt.meet_link}
                                target="_blank" 
                                rel="noreferrer" 
                                className="p-1.5 bg-white/5 text-slate-400 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                                title="Entrar na sala do Meet"
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Rodapé da Tabela com Paginação */}
          {sortedAppointments.length > 0 && (
            <div className="bg-white/5 border-t border-white/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                Exibindo <span className="font-medium text-slate-200">{startIndex + 1}</span> a{" "}
                <span className="font-medium text-slate-200">
                  {Math.min(startIndex + itemsPerPage, totalItems)}
                </span>{" "}
                de <span className="font-medium text-slate-200">{totalItems}</span> agendamentos.
              </div>

              <div className="flex items-center gap-6">
                {/* Seletor de registros por página */}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Itens por página:</span>
                  <select 
                    value={itemsPerPage} 
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="bg-midnight-950 border border-white/10 rounded-lg px-2 py-1 text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                {/* Controles de Voltar/Avançar página */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-slate-200 transition-all cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs text-slate-300">
                    Página <span className="font-medium text-white">{currentPage}</span> de{" "}
                    <span className="font-medium text-white">{totalPages}</span>
                  </span>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-slate-200 transition-all cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
