/* ========================================
   Page Block Types — CMS Block System
   ======================================== */

export type BlockType =
  | 'hero'
  | 'card_simples'
  | 'banner_promocional'
  | 'cupom'
  | 'video_banner'
  | 'cta_section'
  | 'lista_terapeutas';

export interface PageBlock {
  id: string;
  type: BlockType;
  content: Record<string, unknown>;
  image_url: string | null;
  order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/* ---- Content shapes per block type ---- */

export interface DatabaseService {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_subtitle: string;
  duration: string;
  benefits: string[];
  icon: string;
  image_url?: string;
  is_active: boolean;
  is_featured: boolean;
  order_index: number;
  created_at?: string;
}

export interface DatabaseTherapist {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  photo_url: string;
  email: string;
  google_calendar_id: string;
  base_price: number;
  is_active: boolean;
  supported_services: string[]; // Array of service slugs or titles
}


export interface HeroContent {
  title_part1: string;
  highlight: string;
  title_part2: string;
  subtitle: string;
  badge: string;
  button_text: string;
  button_link: string;
}

export interface CardItem {
  icon: string;   // lucide icon name
  title: string;
  description: string;
  link: string;   // destination page path e.g. "/atendimentos"
  image_url?: string; // optional background image
}

export interface CardSimplesContent {
  title: string;
  subtitle: string;
  items: CardItem[];
}

export interface BannerPromocionalContent {
  title: string;
  description: string;
  button_text: string;
  button_link: string;
}

export interface CupomContent {
  title: string;
  description: string;
  coupon_code: string;
  discount: string;
  expiry: string;
  button_text?: string;
  button_link?: string;
}

export interface VideoBannerContent {
  title: string;
  description: string;
  video_url: string;
}

export interface CtaSectionContent {
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
}

export interface TerapeutaItem {
  name: string;
  specialty: string;
  image_url: string;
  link: string;
}

export interface ListaTerapeutasContent {
  title: string;
  subtitle: string;
  therapist_ids: string[];  // IDs of selected therapists from DB
}

/* ---- Block templates for the admin (default content) ---- */

export const BLOCK_TEMPLATES: Record<BlockType, { label: string; icon: string; defaultContent: Record<string, unknown> }> = {
  hero: {
    label: 'Hero Principal',
    icon: 'Sparkles',
    defaultContent: {
      title_part1: 'Liberte-se das ',
      highlight: 'Amarras',
      title_part2: ' e Encontre a Paz',
      subtitle: 'Transforme sua jornada com práticas de cura e autoconhecimento.',
      badge: 'A essência pura',
      button_text: 'Iniciar Jornada',
      button_link: '/atendimentos',
    },
  },
  card_simples: {
    label: 'Cards Simples',
    icon: 'LayoutGrid',
    defaultContent: {
      title: 'Nossos Pilares',
      subtitle: 'Conheça os caminhos da cura',
      items: [
        { icon: 'Moon', title: 'Título do Card', description: 'Descrição do serviço ou conteúdo.', link: '/atendimentos' },
        { icon: 'Leaf', title: 'Título do Card', description: 'Descrição do serviço ou conteúdo.', link: '/cursos' },
        { icon: 'Sun', title: 'Título do Card', description: 'Descrição do serviço ou conteúdo.', link: '/terapeutas' },
      ],
    },
  },
  banner_promocional: {
    label: 'Banner Promocional',
    icon: 'Image',
    defaultContent: {
      title: 'Promoção Especial',
      description: 'Aproveite esta oportunidade única de transformação.',
      button_text: 'Saiba Mais',
      button_link: '/atendimentos',
    },
  },
  cupom: {
    label: 'Painel de Cupom',
    icon: 'Ticket',
    defaultContent: {
      title: 'Cupom de Desconto',
      description: 'Use o código abaixo e ganhe um desconto exclusivo.',
      coupon_code: 'LOTUS2026',
      discount: '20% OFF',
      expiry: '2026-12-31',
      button_text: 'Confira',
      button_link: '',
    },
  },
  video_banner: {
    label: 'Banner de Vídeo',
    icon: 'Play',
    defaultContent: {
      title: 'Assista e Desperte',
      description: 'Uma mensagem especial para sua jornada.',
      video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
  },
  cta_section: {
    label: 'Chamada para Ação',
    icon: 'ArrowRight',
    defaultContent: {
      title: 'Sua alma já conhece o caminho.',
      subtitle: 'Dê apenas o primeiro passo. Nós te acompanhamos.',
      button_text: 'Descubra sua Lótus',
      button_link: '/atendimentos',
    },
  },
  lista_terapeutas: {
    label: 'Lista de Terapeutas',
    icon: 'Users',
    defaultContent: {
      title: 'Nossos Terapeutas',
      subtitle: 'Profissionais dedicados à sua cura',
      therapist_ids: [],
    },
  },
};
