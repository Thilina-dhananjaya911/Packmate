import { DestinationType, TripType } from '../types';

export interface TravelImageMeta {
  uri: string;
  thumbnail: string;
  alt: string;
  location: string;
  tag: string;
  accentColor: string;
}

export const DESTINATION_IMAGES: Record<DestinationType, TravelImageMeta> = {
  Beach: {
    uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=60',
    alt: 'Tropical Beach Resort',
    location: 'Mirissa Coastal Bay',
    tag: 'Beach & Coastal',
    accentColor: '#38BDF8',
  },
  Mountain: {
    uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1080&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&auto=format&fit=crop&q=60',
    alt: 'Highland Alpine Peaks',
    location: 'Ella High Peaks',
    tag: 'Mountain Trek',
    accentColor: '#10B981',
  },
  City: {
    uri: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1080&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=60',
    alt: 'Modern Metropolitan Cityscape',
    location: 'Downtown Skyline',
    tag: 'Urban Metro',
    accentColor: '#A855F7',
  },
  Nature: {
    uri: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1080&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&auto=format&fit=crop&q=60',
    alt: 'Lush Forest Wilderness Campsite',
    location: 'Wilderness Sanctuary',
    tag: 'Nature & Safari',
    accentColor: '#059669',
  },
  International: {
    uri: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1080&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&auto=format&fit=crop&q=60',
    alt: 'Airplane Wing in Twilight Sky',
    location: 'Cross-Border Transit',
    tag: 'Long Haul',
    accentColor: '#D4FF00',
  },
  Resort: {
    uri: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1080&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&auto=format&fit=crop&q=60',
    alt: 'Luxury Pool Resort & Spa',
    location: 'Inani Seaside Oasis',
    tag: 'Resort Retreat',
    accentColor: '#EC4899',
  },
  General: {
    uri: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1080&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&auto=format&fit=crop&q=60',
    alt: 'Scenic Travel Road',
    location: 'Wanderlust Highway',
    tag: 'Flexible Journey',
    accentColor: '#8B5CF6',
  },
};

export const TEMPLATE_IMAGES: Record<TripType, TravelImageMeta> = {
  'Beach Vacation': DESTINATION_IMAGES.Beach,
  'Business Trip': DESTINATION_IMAGES.City,
  'Camping': DESTINATION_IMAGES.Nature,
  'Adventure': DESTINATION_IMAGES.Mountain,
  'International Travel': DESTINATION_IMAGES.International,
  'Family Vacation': DESTINATION_IMAGES.Resort,
  'Weekend Getaway': DESTINATION_IMAGES.General,
  'City Exploration': {
    uri: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=1080&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=400&auto=format&fit=crop&q=60',
    alt: 'City Night Lights & Architecture',
    location: 'Metro Cultural Center',
    tag: 'City Tour',
    accentColor: '#F59E0B',
  },
};

export function getDestinationImage(type?: DestinationType): TravelImageMeta {
  if (!type || !DESTINATION_IMAGES[type]) {
    return DESTINATION_IMAGES.General;
  }
  return DESTINATION_IMAGES[type];
}

export function getTemplateImage(type?: TripType): TravelImageMeta {
  if (!type || !TEMPLATE_IMAGES[type]) {
    return DESTINATION_IMAGES.General;
  }
  return TEMPLATE_IMAGES[type];
}
