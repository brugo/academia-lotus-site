"use client";

import { useState, useEffect } from "react";
import { 
  Users as UsersIcon, 
  Mail, 
  Phone, 
  Calendar, 
  UserCircle, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatWhatsAppLink } from "@/lib/whatsapp";

type UserProfile = {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  last_sign_in_at: string;
  whatsapp: string;
  role: 'Terapeuta' | 'Cliente';
};

export default function UsuariosAdminPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<'Todos' | 'Terapeuta' | 'Cliente'>('Todos');
  const [sortBy, setSortBy] = useState<'created_at_desc' | 'created_at_asc' | 'name_asc' | 'name_desc' | 'last_sign_in_desc'>('created_at_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [avatarErrors, setAvatarErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  // Reseta para a página 1 sempre que um filtro ou ordenação mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, sortBy, itemsPerPage]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error("Erro ao buscar usuários");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      alert("Não foi possível carregar a lista de usuários.");
    } finally {
      setLoading(false);
    }
  };

  // Filtragem e Ordenação dos usuários em memória
  const processedUsers = users
    .filter(u => {
      const matchesSearch = 
        (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRole = filterRole === 'Todos' || u.role === filterRole;
      
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (sortBy === 'created_at_desc') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'created_at_asc') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === 'name_asc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'name_desc') {
        return (b.name || '').localeCompare(a.name || '');
      }
      if (sortBy === 'last_sign_in_desc') {
        const aTime = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0;
        const bTime = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0;
        return bTime - aTime;
      }
      return 0;
    });

  // Estatísticas Rápidas
  const totalUsers = users.length;
  const clientsCount = users.filter(u => u.role === 'Cliente').length;
  const therapistsCount = users.filter(u => u.role === 'Terapeuta').length;

  // Lógica de Paginação
  const totalItems = processedUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = processedUsers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <UsersIcon className="text-gold-500" />
            Usuários Cadastrados
          </h1>
          <p className="text-slate-400 mt-1">
            Gerencie e filtre clientes e terapeutas que se cadastraram no portal.
          </p>
        </div>
        
        {/* Painel de Contagem Rápida */}
        <div className="bg-midnight-950/50 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3 shadow-inner">
          <div className="text-center">
            <span className="block text-2xl font-serif text-gold-400">{totalUsers}</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Total</span>
          </div>
          <div className="w-px h-8 bg-white/10 mx-2" />
          <div className="text-center">
            <span className="block text-2xl font-serif text-white">{clientsCount}</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Clientes</span>
          </div>
          <div className="w-px h-8 bg-white/10 mx-2" />
          <div className="text-center">
            <span className="block text-2xl font-serif text-emerald-400">{therapistsCount}</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Terapeutas</span>
          </div>
        </div>
      </div>

      {/* Controles de Filtros, Busca e Ordenação */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou e-mail..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-midnight-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-gold-500/50 transition-colors"
          />
        </div>
        
        {/* Filtro por Função */}
        <div className="relative min-w-[180px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="w-full bg-midnight-900/50 border border-white/10 rounded-xl pl-12 pr-8 py-3 text-white appearance-none focus:outline-none focus:border-gold-500/50 transition-colors cursor-pointer"
          >
            <option value="Todos">Todos os Tipos</option>
            <option value="Cliente">Apenas Clientes</option>
            <option value="Terapeuta">Apenas Terapeutas</option>
          </select>
        </div>

        {/* Ordenação */}
        <div className="relative min-w-[200px]">
          <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-midnight-900/50 border border-white/10 rounded-xl pl-12 pr-8 py-3 text-white appearance-none focus:outline-none focus:border-gold-500/50 transition-colors cursor-pointer"
          >
            <option value="created_at_desc">Mais Recentes Primeiro</option>
            <option value="created_at_asc">Mais Antigos Primeiro</option>
            <option value="name_asc">Nome (A - Z)</option>
            <option value="name_desc">Nome (Z - A)</option>
            <option value="last_sign_in_desc">Último Acesso</option>
          </select>
        </div>
      </div>

      {/* Tabela de Usuários */}
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
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">Contato</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Cadastro</th>
                  <th className="px-6 py-4">Último Acesso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Nenhum usuário encontrado com os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Usuário (Avatar e Nome) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-midnight-950 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {user.avatar_url && !avatarErrors[user.id] ? (
                              <img 
                                src={user.avatar_url} 
                                alt={user.name} 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                                onError={() => setAvatarErrors(prev => ({ ...prev, [user.id]: true }))}
                              />
                            ) : (
                              <UserCircle size={24} className="text-slate-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-200">{user.name}</p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5" title={user.id}>
                              ID: {user.id.split('-')[0]}...
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contatos */}
                      <td className="px-6 py-4 space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Mail size={14} className="text-slate-500" />
                          <a href={`mailto:${user.email}`} className="hover:text-gold-400 transition-colors">
                            {user.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Phone size={14} className="text-slate-500" />
                          {user.whatsapp && user.whatsapp !== 'Não informado' ? (
                            <a 
                              href={formatWhatsAppLink(user.whatsapp)} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="hover:text-emerald-400 text-emerald-400/90 font-medium transition-colors"
                            >
                              {user.whatsapp}
                            </a>
                          ) : (
                            <span className="text-slate-600 italic">Sem WhatsApp</span>
                          )}
                        </div>
                      </td>

                      {/* Tipo de Usuário (Badge) */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium border ${
                          user.role === 'Terapeuta' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-white/5 text-slate-300 border-white/10'
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Cadastro */}
                      <td className="px-6 py-4 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-500" />
                          {format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </td>

                      {/* Último Acesso */}
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {user.last_sign_in_at ? (
                          format(new Date(user.last_sign_in_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                        ) : (
                          "Nunca"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {processedUsers.length > 0 && (
            <div className="bg-white/5 border-t border-white/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                Exibindo <span className="font-medium text-slate-200">{startIndex + 1}</span> a{" "}
                <span className="font-medium text-slate-200">
                  {Math.min(startIndex + itemsPerPage, totalItems)}
                </span>{" "}
                de <span className="font-medium text-slate-200">{totalItems}</span> usuários.
              </div>

              <div className="flex items-center gap-6">
                {/* Itens por página */}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Itens por página:</span>
                  <select 
                    value={itemsPerPage} 
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="bg-midnight-950 border border-white/10 rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                {/* Controladores */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-slate-200 transition-all"
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
                    className="p-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-slate-200 transition-all"
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
