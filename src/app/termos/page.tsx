import React from 'react';

export const metadata = {
  title: 'Termos de Uso | Academia Espiritual de Lótus',
  description: 'Termos de Uso e Política de Cancelamento da Academia Espiritual de Lótus.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 container mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="space-y-8 text-slate-300 font-light leading-relaxed">
        <h1 className="text-4xl md:text-5xl font-serif text-gold-400 mb-8 tracking-wide">
          Termos de Uso e Cancelamento
        </h1>
        
        <p>
          Bem-vindo(a) à <strong className="text-white">Academia Espiritual de Lótus</strong>. 
          Ao acessar nosso site e utilizar nossos serviços de agendamento de terapias e cursos, 
          você concorda com os termos e condições descritos abaixo. Leia atentamente.
        </p>

        <h2 className="text-2xl font-serif text-gold-300 mt-12 mb-4">1. Agendamentos e Reservas</h2>
        <p>
          Todos os agendamentos terapêuticos e inscrições em cursos estão sujeitos à disponibilidade 
          dos profissionais. A reserva só é confirmada após o processamento da taxa de reserva ou pagamento 
          sinalizado na plataforma.
        </p>

        <h2 className="text-2xl font-serif text-gold-300 mt-12 mb-4">2. Política de Cancelamento e Reembolso</h2>
        <div className="bg-white/5 border border-white/10 p-6 rounded-xl mt-4">
          <p className="font-medium text-white mb-2">Reembolso de Taxas Pagas:</p>
          <p>
            As devoluções das taxas pagas para reservas ou agendamentos serão realizadas 
            <strong> apenas caso o paciente solicite o cancelamento ou avise com, no mínimo, 24 horas de antecedência </strong> 
            ao horário da consulta agendada.
          </p>
          <p className="mt-4 text-sm text-slate-400">
            Cancelamentos feitos com menos de 24 horas de antecedência ou o não comparecimento ("no-show") 
            resultarão na retenção do valor da reserva para cobrir os custos e a hora do terapeuta.
          </p>
        </div>

        <h2 className="text-2xl font-serif text-gold-300 mt-12 mb-4">3. Alterações pelo Terapeuta</h2>
        <p>
          Trabalhamos com energias e processos humanos, podendo ocorrer imprevistos. O terapeuta poderá 
          precisar mudar ou cancelar o horário da consulta sem aviso prévio em casos de força maior ou problemas de saúde. 
          Nesses casos, <strong>a consulta será remarcada</strong> para o horário mais próximo de conveniência mútua, 
          sem nenhum custo adicional, ou o valor será integralmente devolvido, a critério do paciente.
        </p>

        <h2 className="text-2xl font-serif text-gold-300 mt-12 mb-4">4. Conduta no Atendimento</h2>
        <p>
          Espera-se que haja respeito mútuo durante os atendimentos. Os terapeutas da Academia Espiritual de Lótus 
          se reservam o direito de encerrar uma sessão caso o paciente apresente comportamento inadequado, desrespeitoso 
          ou sob efeito de substâncias que impeçam o trabalho terapêutico.
        </p>

        <h2 className="text-2xl font-serif text-gold-300 mt-12 mb-4">5. Natureza das Terapias</h2>
        <p>
          Nossos serviços são de natureza holística, espiritual e integrativa. Nossas terapias não substituem, 
          em hipótese alguma, tratamentos médicos, psiquiátricos ou psicológicos convencionais. 
          Incentivamos todos os clientes a continuarem seus tratamentos médicos regulares e consultarem seus médicos.
        </p>

        <div className="mt-16 pt-8 border-t border-white/10 text-sm text-slate-500">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>
    </div>
  );
}
