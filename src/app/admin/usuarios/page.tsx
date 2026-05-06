"use client";

import { useState, useEffect } from "react";
import { Users as UsersIcon, Mail, Phone, Calendar, UserCircle, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === 'Todos' || u.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-white tracking-tight flex items-center gap-3">
            <UsersIcon className="text-gold-500" />
            Usuários Cadastrados
          </h1>
          <p className="text-slate-400 mt-1">
            Gerencie e visualize clientes e terapeutas que se cadastraram no portal.
          </p>
        </div>
        
        <div className="bg-midnight-950/50 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3 shadow-inner">
          <div className="text-center">
            <span className="block text-2xl font-serif text-gold-400">{users.length}</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Total</span>
          </div>
          <div className="w-px h-8 bg-white/10 mx-2" />
          <div className="text-center">
            <span className="block text-2xl font-serif text-white">{users.filter(u => u.role === 'Cliente').length}</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Clientes</span>
          </div>
          <div className="w-px h-8 bg-white/10 mx-2" />
          <div className="text-center">
            <span className="block text-2xl font-serif text-emerald-400">{users.filter(u => u.role === 'Terapeuta').length}</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Terapeutas</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
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
        
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="w-full bg-midnight-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white appearance-none focus:outline-none focus:border-gold-500/50 transition-colors"
          >
            <option value="Todos">Todos os Tipos</option>
            <option value="Cliente">Apenas Clientes</option>
            <option value="Terapeuta">Apenas Terapeutas</option>
          </select>
        </div>
      </div>

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
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Nenhum usuário encontrado com os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-midnight-950 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
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
                      <td className="px-6 py-4 space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Mail size={14} className="text-slate-500" />
                          <a href={`mailto:${user.email}`} className="hover:text-gold-400 transition-colors">
                            {user.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Phone size={14} className="text-slate-500" />
                          {user.whatsapp !== 'Não informado' ? (
                            <a href={`https://wa.me/${user.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">
                              {user.whatsapp}
                            </a>
                          ) : (
                            <span className="text-slate-600 italic">Sem WhatsApp</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium border ${
                          user.role === 'Terapeuta' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-white/5 text-slate-300 border-white/10'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-500" />
                          {format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </td>
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
        </div>
      )}
    </div>
  );
}
