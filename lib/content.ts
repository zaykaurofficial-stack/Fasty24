// Static marketing copy only. All service/category data comes from the backend API.

export const SITE = {
  tagline: "India's fastest home services platform",
  phone: '+91 99999 99999',
  email: 'hello@fasty24.com',
  cities: ['Delhi NCR', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune'],
};

export const HERO_IMAGE =
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80';

export const WHY_US = [
  {
    title: '15-20 Min Arrival',
    desc: 'Hyper-local staff dispatch - the nearest verified pro accepts your job in seconds.',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80',
  },
  {
    title: 'Verified Professionals',
    desc: 'Every staff member is background-checked, skill-mapped, and rated by real customers.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
  },
  {
    title: 'Transparent Pricing',
    desc: 'See the final price before you book. No hidden charges. Pay only after service.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80',
  },
  {
    title: 'OTP-Secured Service',
    desc: 'Start and finish every job with OTP verification for your safety and peace of mind.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80',
  },
];

export const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    city: 'South Delhi',
    service: 'AC Gas Filling',
    text: "Technician arrived in 18 minutes! AC is cooling like new. Best service I've used in Delhi.",
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    rating: 5,
  },
  {
    name: 'Rahul Mehta',
    city: 'Gurgaon',
    service: 'RO Filter Change',
    text: 'Booked at 9 AM, done by 9:25. Water tastes completely different now. Highly recommend Fasty-24.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    rating: 5,
  },
  {
    name: 'Ananya Reddy',
    city: 'Bangalore',
    service: 'Instant Maid',
    text: 'Maid was professional and thorough. Love the live tracking and OTP when she finished.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    rating: 5,
  },
];

export const FAQ = [
  {
    q: 'How fast can a professional reach my home?',
    a: 'We target 15-20 minutes in active zones. Our H3 geo-dispatch sends your request to the nearest available staff instantly.',
  },
  {
    q: 'Are your service professionals verified?',
    a: 'Yes. Every staff member goes through identity verification, skill assessment, and admin approval before accepting jobs.',
  },
  {
    q: 'What if I need add-ons during the service?',
    a: 'You can add extra services mid-job. Pricing is calculated transparently and you approve before payment.',
  },
  {
    q: 'Which cities do you serve?',
    a: 'We are live in Delhi NCR with expansion to Mumbai, Bangalore, Hyderabad, and Pune coming soon.',
  },
];

export const STATS = [
  { value: '50,000+', label: 'Happy customers' },
  { value: '15-20', label: 'Min avg. arrival' },
  { value: '500+', label: 'Verified staff' },
  { value: '4.8★', label: 'Average rating' },
];

// Subtle per-category accent gradients (used when a category/service has no image yet).
export const CATEGORY_ACCENTS: Record<string, string> = {
  'ac-service': 'from-sky-500/15 to-blue-600/10',
  'ro-service': 'from-cyan-500/15 to-teal-600/10',
  'instant-maid': 'from-fasty-yellow/20 to-amber-500/10',
  chimney: 'from-orange-500/15 to-red-600/10',
  fridge: 'from-indigo-500/15 to-violet-600/10',
  default: 'from-fasty-yellow/15 to-amber-400/10',
};

export function accentFor(slug?: string) {
  if (!slug) return CATEGORY_ACCENTS.default;
  return CATEGORY_ACCENTS[slug] ?? CATEGORY_ACCENTS.default;
}
