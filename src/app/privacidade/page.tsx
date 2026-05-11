import React from 'react';

export const metadata = {
  title: 'Privacidade | Academia Espiritual de Lótus',
  description: 'Política de Privacidade da Academia Espiritual de Lótus. Saiba como cuidamos dos seus dados.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 container mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="space-y-8 text-slate-300 font-light leading-relaxed">
        <h1 className="text-4xl md:text-5xl font-serif text-gold-400 mb-8 tracking-wide">
          Política de Privacidade
        </h1>
        
        <p>
          A <strong className="text-white">Academia Espiritual de Lótus</strong> está comprometida em proteger a sua privacidade. 
          Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações 
          quando você visita nosso site ou utiliza nossos serviços e terapias.
        </p>

        <h2 className="text-2xl font-serif text-gold-300 mt-12 mb-4">1. Coleta de Informações</h2>
        <p>
          Coletamos informações pessoais que você nos fornece voluntariamente ao se registrar no site, 
          agendar uma consulta, assinar nossa newsletter ou entrar em contato conosco. Isso pode incluir: 
          nome completo, endereço de e-mail, número de telefone e histórico de agendamentos.
        </p>

        <h2 className="text-2xl font-serif text-gold-300 mt-12 mb-4">2. Uso das Informações</h2>
        <p>
          Utilizamos as informações coletadas para os seguintes fins:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Facilitar e gerenciar seus agendamentos e atendimentos terapêuticos.</li>
          <li>Fornecer suporte ao cliente e responder às suas dúvidas.</li>
          <li>Enviar comunicações administrativas, como confirmações de consulta e lembretes.</li>
          <li>Melhorar continuamente a experiência em nossa plataforma.</li>
        </ul>

        <h2 className="text-2xl font-serif text-gold-300 mt-12 mb-4">3. Proteção e Segurança</h2>
        <p>
          Adotamos medidas de segurança rígidas e tecnologias de criptografia para proteger seus dados 
          pessoais contra acesso, uso ou divulgação não autorizados. No entanto, é importante lembrar que 
          nenhum método de transmissão pela internet é 100% seguro.
        </p>

        <h2 className="text-2xl font-serif text-gold-300 mt-12 mb-4">4. Compartilhamento de Dados</h2>
        <p>
          Nós <strong className="text-white">nunca</strong> vendemos ou alugamos suas informações pessoais para terceiros. 
          Seus dados só poderão ser compartilhados com os profissionais (terapeutas) que irão lhe atender, 
          e apenas no escopo necessário para a realização da terapia.
        </p>

        <h2 className="text-2xl font-serif text-gold-300 mt-12 mb-4">5. Direitos do Usuário</h2>
        <p>
          Você tem o direito de solicitar o acesso, correção ou exclusão dos seus dados pessoais em nosso 
          sistema a qualquer momento. Para isso, basta entrar em contato através dos nossos canais oficiais.
        </p>

        <div className="mt-16 pt-8 border-t border-white/10 text-sm text-slate-500">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>
    </div>
  );
}
