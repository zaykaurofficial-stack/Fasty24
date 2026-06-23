export const SITE = {
  tagline: 'India\'s fastest home services platform',
  phone: '+91 99999 99999',
  email: 'hello@fasty24.com',
  cities: ['Delhi NCR', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune'],
};

export const HERO_IMAGE = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80';

// High-quality image mapping
export const SERVICE_IMAGES: Record<string, string> = {
  '1': 'https://images.unsplash.com/photo-1621905251189-08b45d6a268e?w=800&q=80', // AC Repair
  '2': 'https://images.unsplash.com/photo-1603953535940-276e033e9d89?w=800&q=80', // RO Service
  '3': 'https://images.unsplash.com/photo-1581578731548-c64695be6952?w=800&q=80', // Maid
  '4': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80', // Fridge
  '5': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80', // Bathroom
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
    description: 'Professional household help in minutes.',
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
    name: 'Bathroom Cleaning',
    description: 'Deep cleaning for hygienic bathrooms.',
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