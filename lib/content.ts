export const SITE = {
  tagline: 'India\'s fastest home services platform',
  phone: '+91 99999 99999',
  email: 'hello@fasty24.com',
  cities: ['Delhi NCR', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune'],
};

export const HERO_IMAGE =
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80';

export const SERVICE_IMAGES: Record<string, string> = {
  '1': 'https://images.unsplash.com/photo-1631540595908-1c3f0a6d0c8f?w=600&q=80',
  '2': 'https://images.unsplash.com/photo-1585771724684-38269d823ae?w=600&q=80',
  '3': 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600&q=80',
  '4': 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&q=80',
  '5': 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&q=80',
  '6': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&q=80',
};

export const CATEGORIES_RICH = [
  {
    id: '1',
    name: 'AC Repair & Services',
    icon: '❄️',
    description: 'Gas filling, deep servicing, installation & cooling issues fixed by certified technicians.',
    image: SERVICE_IMAGES['1'],
    priceFrom: 499,
    rating: 4.9,
    bookings: '12k+',
    tags: ['Same-day', 'Gas refill', 'AMC available'],
  },
  {
    id: '2',
    name: 'RO Repair & Servicing',
    icon: '💧',
    description: 'Filter replacement, membrane change, UV lamp & complete RO health check at home.',
    image: SERVICE_IMAGES['2'],
    priceFrom: 399,
    rating: 4.8,
    bookings: '8k+',
    tags: ['Pure water', 'All brands', '30 min service'],
  },
  {
    id: '3',
    name: 'Instant Maid',
    icon: '🧹',
    description: 'Background-verified maids for hourly cleaning, deep clean & move-in sparkle.',
    image: SERVICE_IMAGES['3'],
    priceFrom: 299,
    rating: 4.9,
    bookings: '20k+',
    tags: ['15 min arrival', 'Trusted staff'],
  },
  {
    id: '4',
    name: 'Fridge Services',
    icon: '🧊',
    description: 'Cooling failure, gas refill, compressor check & general refrigerator repair.',
    image: SERVICE_IMAGES['4'],
    priceFrom: 449,
    rating: 4.7,
    bookings: '5k+',
    tags: ['All brands', 'Gas refill', 'Warranty'],
  },
  {
    id: '5',
    name: 'Bathroom Cleaning',
    icon: '🚿',
    description: 'Anti-bacterial deep clean, tile scrubbing, fixture polish & odor treatment.',
    image: SERVICE_IMAGES['5'],
    priceFrom: 599,
    rating: 4.8,
    bookings: '9k+',
    tags: ['Deep clean', 'Eco products', '2 hr service'],
  },
  {
    id: '6',
    name: 'Chimney Cleaning',
    icon: '🏠',
    description: 'Degreasing, filter wash, motor check & kitchen chimney maintenance.',
    image: SERVICE_IMAGES['6'],
    priceFrom: 499,
    rating: 4.8,
    bookings: '4k+',
    tags: ['Degreasing', 'All types', 'Same day'],
  },
];

export const WHY_US = [
  {
    title: '15–20 Min Arrival',
    desc: 'Hyper-local staff dispatch — the nearest verified pro accepts your job in seconds.',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80',
  },
  {
    title: 'Verified Professionals',
    desc: 'Every staff member is background-checked, skilled-mapped, and rated by real customers.',
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
    text: 'Technician arrived in 18 minutes! AC is cooling like new. Best service I\'ve used in Delhi.',
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
    a: 'We target 15–20 minutes in active zones. Our H3 geo-dispatch sends your request to the nearest available staff instantly.',
  },
  {
    q: 'Are your service professionals verified?',
    a: 'Yes. Every staff member goes through identity verification, skill assessment, and admin approval before accepting jobs.',
  },
  {
    q: 'What if I need add-ons during the service?',
    a: 'You can add extra services mid-job from the app. Pricing is calculated transparently and you approve before payment.',
  },
  {
    q: 'Which cities do you serve?',
    a: 'We are live in Delhi NCR with expansion to Mumbai, Bangalore, Hyderabad, and Pune coming soon.',
  },
];

export const STATS = [
  { value: '50,000+', label: 'Happy customers' },
  { value: '15–20', label: 'Min avg. arrival' },
  { value: '500+', label: 'Verified staff' },
  { value: '4.8★', label: 'Average rating' },
];
