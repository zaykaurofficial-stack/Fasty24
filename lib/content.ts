export const SITE = {
  tagline: 'India\'s fastest home services platform',
  phone: '+91 8368354151',
  email: 'fasty24official@gmail.com',
  cities: ['Delhi NCR', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune'],
};

export const HERO_IMAGE = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80';

// High-quality image mapping
export const SERVICE_IMAGES: Record<string, string> = {
  '1': 'https://images.unsplash.com/photo-1621905251189-08b45d6a268e?w=800&q=80', // AC Repair
  '2': 'https://images.unsplash.com/photo-1603953535940-276e033e9d89?w=800&q=80', // RO Service
  '3': 'https://images.unsplash.com/photo-1581578731548-c64695be6952?w=800&q=80', // Maid
  '4': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80', // Fridge
  '5': 'https://images.unsplash.com/photo-1621905251189-08b45249bd82?w=800&q=80', // Electrician
  '6': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80', // Chimney
};

export const CATEGORIES_RICH = [
  {
    id: '1',
    name: 'AC Repair & Services',
    description: 'Deep clean AC vents for efficient cooling',
    image: SERVICE_IMAGES['1'],
  },
  {
    id: '2',
    name: 'RO Repair & Servicing',
    description: 'Filter replacement, membrane change, & health check.',
    image: SERVICE_IMAGES['2'],
  },
  {
    id: '3',
    name: 'Instant Maid',
    description: 'A verified maid by the hour — from 30 minutes to 2 hours.',
    image: SERVICE_IMAGES['3'],
  },
  {
    id: '4',
    name: 'Fridge Services',
    description: 'Professional cooling solutions.',
    image: SERVICE_IMAGES['4'],
  },
  {
    id: '5',
    name: 'Electrician',
    description: 'Fan fitting, switch repairs and electrical work.',
    image: SERVICE_IMAGES['5'],
  },
  {
    id: '6',
    name: 'Chimney Cleaning',
    description: 'Grease removal and deep cleaning.',
    image: SERVICE_IMAGES['6'],
  }
];

export const WHY_US = [
  { title: '15-20 Min Arrival', desc: 'Hyper-local staff dispatch.', image: 'https://images.unsplash.com/photo-1600880292203-757aa50b3b48?w=400&q=80' },
  { title: 'Verified Professionals', desc: 'Background checked & skilled.', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80' },
  { title: 'Transparent Pricing', desc: 'No hidden charges.', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80' },
  { title: 'OTP-Secured Service', desc: 'Safe start and finish.', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80' },
];

export const TESTIMONIALS = [
  { name: 'Priya Sharma', text: 'Technician arrived in 18 minutes!', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
  { name: 'Rahul Mehla', text: 'Highly recommend fasty-24.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7728f2d?w=100&q=80' },
  { name: 'Ananya Reddy', text: 'Maid was professional and thorough.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80' },
];

export const FAQ = [
  { q: 'How fast can a professional reach my home?', a: 'We target 15-20 minutes in active zones.' },
  { q: 'Are your service professionals verified?', a: 'Yes. Every staff member goes through identity verification.' },
];

export const STATS = [
  { value: '50,000+', label: 'Happy customers' },
  { value: '15-20', label: 'Min avg. arrival' },
  { value: '500+', label: 'Verified staff' },
  { value: '4.8★', label: 'Average rating' },
];

export const TRUST_ITEMS = [
  'Background verified staff',
  'OTP-secured jobs',
  'Transparent pricing',
  'UPI & card payments',
  'Live job tracking',
];

export const HERO_DEFAULT = {
  pill: 'Live in Delhi NCR • 15–20 min guarantee',
  titleLine1: 'Premium home',
  titleLine2: 'services,',
  titleHighlight: 'delivered fast.',
  subtitle:
    "India's fastest home services platform. AC repair, RO servicing, instant maid, appliance repair & deep cleaning — verified pros at your door in minutes, not hours.",
  socialProofRating: '4.8★',
  socialProofText: 'from 50,000+ happy homes',
  cards: [
    { icon: '❄️', title: 'AC Repair', priceLabel: 'From ₹499' },
    { icon: '💧', title: 'RO Service', priceLabel: 'From ₹399' },
    { icon: '🧹', title: 'Instant Maid', priceLabel: 'From ₹299' },
    { icon: '🧊', title: 'Fridge Repair', priceLabel: 'From ₹449' },
  ],
};

export const CTA_DEFAULT = {
  title: 'Ready for lightning-fast home service?',
  subtitle: 'Join 50,000+ customers who trust Fasty-24 for repairs, cleaning & more.',
};

export const WHY_US_DEFAULT = WHY_US.map((item) => ({
  title: item.title,
  desc: item.desc,
  icon: '✨',
}));

function nonempty(value?: string | null) {
  return Boolean(value && String(value).trim());
}

function pickStr(value: string | undefined, fallback: string) {
  return nonempty(value) ? String(value).trim() : fallback;
}

function pickList<T>(value: T[] | undefined, fallback: T[]) {
  return Array.isArray(value) && value.length > 0 ? value : fallback;
}

/** Merge CMS payload with hardcoded defaults. Empty admin fields never blank the live site. */
export function withHomepageFallbacks(cms?: Partial<{
  site: { tagline?: string; phone?: string; email?: string; cities?: string[] };
  hero: Partial<typeof HERO_DEFAULT> & { cards?: typeof HERO_DEFAULT.cards };
  stats: typeof STATS;
  trustItems: string[];
  whyUs: { title: string; desc: string; icon?: string }[];
  testimonials: { name: string; text: string; avatar?: string; rating?: number }[];
  faq: typeof FAQ;
  cta: { title?: string; subtitle?: string };
}> | null) {
  const hero = cms?.hero;
  return {
    site: {
      tagline: pickStr(cms?.site?.tagline, SITE.tagline),
      phone: pickStr(cms?.site?.phone, SITE.phone),
      email: pickStr(cms?.site?.email, SITE.email),
      cities: pickList(cms?.site?.cities?.filter((c) => nonempty(c)), SITE.cities),
    },
    hero: {
      pill: pickStr(hero?.pill, HERO_DEFAULT.pill),
      titleLine1: pickStr(hero?.titleLine1, HERO_DEFAULT.titleLine1),
      titleLine2: pickStr(hero?.titleLine2, HERO_DEFAULT.titleLine2),
      titleHighlight: pickStr(hero?.titleHighlight, HERO_DEFAULT.titleHighlight),
      subtitle: pickStr(hero?.subtitle, HERO_DEFAULT.subtitle),
      socialProofRating: pickStr(hero?.socialProofRating, HERO_DEFAULT.socialProofRating),
      socialProofText: pickStr(hero?.socialProofText, HERO_DEFAULT.socialProofText),
      cards: pickList(
        hero?.cards?.filter((c) => nonempty(c?.title)),
        HERO_DEFAULT.cards,
      ),
    },
    stats: pickList(cms?.stats?.filter((s) => nonempty(s?.value) || nonempty(s?.label)), STATS),
    trustItems: pickList(cms?.trustItems?.filter((t) => nonempty(t)), TRUST_ITEMS),
    whyUs: pickList(
      cms?.whyUs?.filter((w) => nonempty(w?.title)),
      WHY_US_DEFAULT,
    ),
    testimonials: pickList(
      cms?.testimonials?.filter((t) => nonempty(t?.name) && nonempty(t?.text)),
      TESTIMONIALS,
    ),
    faq: pickList(cms?.faq?.filter((f) => nonempty(f?.q) && nonempty(f?.a)), FAQ),
    cta: {
      title: pickStr(cms?.cta?.title, CTA_DEFAULT.title),
      subtitle: pickStr(cms?.cta?.subtitle, CTA_DEFAULT.subtitle),
    },
  };
}

const ACCENT_MAP: Record<string, string> = {
  'ac-service': 'from-blue-400/40 to-cyan-500/40',
  'ro-service': 'from-cyan-400/40 to-teal-500/40',
  'instant-maid': 'from-emerald-400/40 to-green-500/40',
  fridge: 'from-blue-500/40 to-indigo-500/40',
  chimney: 'from-gray-500/40 to-slate-600/40',
  electrician: 'from-amber-400/40 to-orange-500/40',
  plumber: 'from-teal-400/40 to-cyan-600/40',
};

export function accentFor(slug?: string): string {
  if (slug && ACCENT_MAP[slug]) return ACCENT_MAP[slug];
  return 'from-fasty-yellow/30 to-amber-400/30';
}

export const SERVICE_ICONS: Record<string, string> = {
  'ac-service': '❄️',
  'ro-service': '💧',
  'instant-maid': '🧹',
  fridge: '🧊',
  chimney: '🔥',
  electrician: '⚡',
  plumber: '🔧',
};