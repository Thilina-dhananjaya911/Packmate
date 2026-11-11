import { CategoryName, DestinationType, TripStatus, TripType } from '../types';

export const APP_INFO = {
  NAME: 'PACKMATE',
  FULL_TITLE: 'PACKMATE – Intelligent Packing Planner',
  SUBTITLE: 'Intelligent Packing Planner',
  TAGLINE: 'Pack Smart. Travel Easy.',
  VISION: 'Make every journey stress-free, organized, and unforgettable.',
  VERSION: '1.0.0',
  DATABASE_NAME: 'packmate.db',
  SEED_VERSION: '1.0.0',
} as const;

export const TRIP_TYPES: {
  value: TripType;
  label: string;
  icon: string;
  accentColor: string;
  defaultDestinationType: DestinationType;
  shortDesc: string;
}[] = [
  {
    value: 'Beach Vacation',
    label: 'Beach Vacation',
    icon: 'Sun',
    accentColor: '#0EA5E9',
    defaultDestinationType: 'Beach',
    shortDesc: 'Coastal relaxation, sun & swim essentials',
  },
  {
    value: 'Business Trip',
    label: 'Business Trip',
    icon: 'Briefcase',
    accentColor: '#172B4D',
    defaultDestinationType: 'City',
    shortDesc: 'Formal attire, tech gear & work documents',
  },
  {
    value: 'Adventure',
    label: 'Adventure',
    icon: 'Mountain',
    accentColor: '#10B981',
    defaultDestinationType: 'Mountain',
    shortDesc: 'Highland treks, layered gear & trail safety',
  },
  {
    value: 'Camping',
    label: 'Camping',
    icon: 'Tent',
    accentColor: '#059669',
    defaultDestinationType: 'Nature',
    shortDesc: 'Outdoor shelter, camp lighting & wilderness kit',
  },
  {
    value: 'Family Vacation',
    label: 'Family Vacation',
    icon: 'Users',
    accentColor: '#8B5CF6',
    defaultDestinationType: 'Resort',
    shortDesc: 'Multi-traveller comfort, snacks & shared care',
  },
  {
    value: 'International Travel',
    label: 'International Travel',
    icon: 'Globe',
    accentColor: '#4C9AFF',
    defaultDestinationType: 'International',
    shortDesc: 'Passports, universal adapters & transit security',
  },
  {
    value: 'Weekend Getaway',
    label: 'Weekend Getaway',
    icon: 'Compass',
    accentColor: '#F59E0B',
    defaultDestinationType: 'General',
    shortDesc: 'Light carry-on essentials for short 2–3 day breaks',
  },
  {
    value: 'City Exploration',
    label: 'City Exploration',
    icon: 'Building2',
    accentColor: '#EC4899',
    defaultDestinationType: 'City',
    shortDesc: 'Urban walking comfort, daypack & sightseeing gear',
  },
];

export const DESTINATION_TYPES: {
  value: DestinationType;
  label: string;
  icon: string;
}[] = [
  { value: 'Beach', label: 'Beach & Coastal', icon: 'Waves' },
  { value: 'Mountain', label: 'Mountain & Highland', icon: 'Mountain' },
  { value: 'City', label: 'Urban & Metro', icon: 'Building2' },
  { value: 'Nature', label: 'Forest & Wilderness', icon: 'Trees' },
  { value: 'International', label: 'International Hub', icon: 'Globe' },
  { value: 'Resort', label: 'Resort & Retreat', icon: 'Sparkles' },
  { value: 'General', label: 'General Destination', icon: 'MapPin' },
];

export const TRIP_STATUSES: TripStatus[] = ['Upcoming', 'Ongoing', 'Completed'];

export const ITEM_CATEGORIES_META: {
  name: CategoryName;
  icon_name: string;
  color_hex: string;
  sort_order: number;
}[] = [
  { name: 'Clothing', icon_name: 'Shirt', color_hex: '#4C9AFF', sort_order: 1 },
  { name: 'Toiletries', icon_name: 'Droplets', color_hex: '#36C9A5', sort_order: 2 },
  { name: 'Electronics', icon_name: 'Laptop', color_hex: '#6366F1', sort_order: 3 },
  { name: 'Documents', icon_name: 'FileText', color_hex: '#F59E0B', sort_order: 4 },
  { name: 'Accessories', icon_name: 'Watch', color_hex: '#EC4899', sort_order: 5 },
  { name: 'Travel Essentials', icon_name: 'Luggage', color_hex: '#172B4D', sort_order: 6 },
  { name: 'Health & Safety', icon_name: 'HeartPulse', color_hex: '#EF4444', sort_order: 7 },
];

export const DESTINATION_KEYWORDS: Record<DestinationType, string[]> = {
  Beach: [
    'bali',
    'maldives',
    'mirissa',
    'unawatuna',
    'bentota',
    'trincomalee',
    'arugam',
    'hikkaduwa',
    'phuket',
    'krabi',
    'goa',
    'hawaii',
    'cancun',
    'miami',
    'santorini',
    'beach',
    'island',
    'coast',
    'bay',
    'reef',
    'ocean',
    'sea',
    'gold coast',
    'seychelles',
    'fiji',
    'boracay',
  ],
  Mountain: [
    'ella',
    'nuwara eliya',
    'haputale',
    'knuckles',
    'horton',
    'alps',
    'swiss',
    'nepal',
    'kathmandu',
    'pokhara',
    'everest',
    'himalaya',
    'banff',
    'rockies',
    'dolomites',
    'mountain',
    'peak',
    'hill',
    'highland',
    'valley',
    'ridge',
    'trek',
    'manali',
    'shimla',
    'patagonia',
  ],
  Nature: [
    'yala',
    'wilpattu',
    'udawalawe',
    'sinharaja',
    'minneriya',
    'yellowstone',
    'yosemite',
    'safari',
    'forest',
    'camp',
    'national park',
    'jungle',
    'lake',
    'woods',
    'canyon',
    'reserve',
  ],
  City: [
    'colombo',
    'kandy',
    'galle',
    'tokyo',
    'singapore',
    'london',
    'paris',
    'new york',
    'dubai',
    'bangkok',
    'seoul',
    'sydney',
    'melbourne',
    'berlin',
    'rome',
    'barcelona',
    'toronto',
    'city',
    'downtown',
    'metro',
  ],
  International: [
    'uk',
    'usa',
    'japan',
    'france',
    'italy',
    'germany',
    'australia',
    'canada',
    'europe',
    'asia',
    'uae',
    'thailand',
    'malaysia',
    'vietnam',
    'switzerland',
    'abroad',
    'overseas',
  ],
  Resort: ['resort', 'spa', 'villa', 'retreat', 'lodge', 'sanctuary'],
  General: [],
};

export const ONBOARDING_SLIDES = [
  {
    id: 'plan',
    step: '01',
    badge: 'SMART TRIP ORGANIZATION',
    title: 'Plan your trips with effortless clarity',
    description:
      'Organize destinations, departure dates, traveller counts, and trip styles in one calm, intelligent travel workspace—100% offline.',
    accentColor: '#4C9AFF',
    secondaryColor: '#36C9A5',
    variant: 'plan' as const,
  },
  {
    id: 'pack',
    step: '02',
    badge: 'INTELLIGENT TEMPLATES',
    title: 'Pack everything you actually need',
    description:
      'Generate tailored checklists instantly from 8 curated destination templates that automatically scale quantities for trip duration and travellers.',
    accentColor: '#36C9A5',
    secondaryColor: '#4C9AFF',
    variant: 'pack' as const,
  },
  {
    id: 'track',
    step: '03',
    badge: 'LIVE PROGRESS & HISTORY',
    title: 'Track your packing progress to 100%',
    description:
      'Check off items by category with smooth live progress rings, and reuse proven packing lists from your completed journeys anytime.',
    accentColor: '#4C9AFF',
    secondaryColor: '#172B4D',
    variant: 'track' as const,
  },
];
