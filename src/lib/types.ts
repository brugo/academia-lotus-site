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
  | 'destaque'
  | 'lista_terapeutas'
  | 'duplo_card'
  | 'texto_narrativa'
  | 'page_header';

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

export interface DestaqueContent {
  tag: string;
  title: string;
  description: string;
  show_button1: boolean;
  button1_text: string;
  button1_link: string;
  show_button2: boolean;
  button2_text: string;
  button2_link: string;
  button2_action?: 'link' | 'lightbox';
  lightbox_type?: 'text' | 'image_text' | 'video';
  lightbox_title?: string;
  lightbox_text?: string;
  lightbox_image_url?: string;
  lightbox_video_url?: string;
}

export interface DuploCardItem {
  image_url: string | null;
  title: string;
  description: string;
  button_text: string;
  button_link: string;
}

export interface DuploCardContent {
  card1: DuploCardItem;
  card2: DuploCardItem;
}

export interface TextoNarrativaContent {
  pre_title: string;
  title: string;
  body: string;
}

export interface PageHeaderContent {
  badge: string;
  title1: string;
  title2: string;
  description: string;
  padding_top: string;
  padding_bottom: string;
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
  destaque: {
    label: 'Destaque (Livro/Curso)',
    icon: 'BookOpen',
    defaultContent: {
      tag: 'Lançamento Oficial',
      title: 'A Jornada Kármica da Alma',
      description: '"A Jornada Kármica da Alma" desvenda o esplendor e a profundidade da jornada espiritual da alma através das vastidões do cosmos e das múltiplas vidas.',
      show_button1: true,
      button1_text: 'Adquirir Livro',
      button1_link: '/cursos',
      show_button2: true,
      button2_text: 'Ler Primeiro Capítulo',
      button2_link: '/cursos',
      button2_action: 'link',
      lightbox_type: 'text',
      lightbox_title: 'O Primeiro Capítulo',
      lightbox_text: 'O texto livre para exibição dentro do seu modal, contando um pouco sobre os princípios desta jornada e porquê este momento é perfeito para iniciá-la...',
      lightbox_image_url: '',
      lightbox_video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
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
      page: 'home',
      title: 'Nossos Terapeutas',
      subtitle: 'Profissionais dedicados à sua cura',
      therapist_ids: [],
    },
  },
  duplo_card: {
    label: 'Duplo Card',
    icon: 'Columns2',
    defaultContent: {
      page: 'cursos',
      card1: {
        image_url: null,
        title: 'Mesa Radiônica de Lótus',
        description: 'A formação completa para você se tornar um facilitador desta egrégora.',
        button_text: 'Ver Ementa',
        button_link: '/cursos',
      },
      card2: {
        image_url: null,
        title: 'Saberes da Terra',
        description: 'Cursos de Fitoterapia e Ervas Guiadas para a limpeza espiritual.',
        button_text: 'Explorar Saberes',
        button_link: '/cursos',
      }
    }
  },
  texto_narrativa: {
    label: 'Texto Narrativa',
    icon: 'AlignLeft',
    defaultContent: {
      page: 'cursos',
      pre_title: 'Expansão da Consciência',
      title: 'Cursos & Livros',
      body: 'Adentre o conhecimento profundo dos mistérios cósmicos. Formações canalizadas para despertar o mestre que habita em você.',
    }
  },
  page_header: {
    label: 'Cabeçalho da Página',
    icon: 'Heading',
    defaultContent: {
      badge: 'Caminho do Despertar',
      title1: 'Nossos',
      title2: 'Cursos',
      description: 'Aprofunde seu contato com as forças universais através de nossos conhecimentos guiados. Uma jornada real de transformação.',
      padding_top: 'large',
      padding_bottom: 'medium',
    }
  }
};
