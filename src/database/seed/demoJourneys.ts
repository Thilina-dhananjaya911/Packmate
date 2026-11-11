import { CategoryName, DestinationType, TripStatus, TripType } from '../../types';
import { addDaysISO, calculateTripDuration, getTodayISO } from '../../utils/dateUtils';

export interface DemoJourneyDef {
  trip_name: string;
  destination: string;
  destination_type: DestinationType;
  departureOffsetDays: number;
  returnOffsetDays: number;
  trip_type: TripType;
  traveller_count: number;
  notes: string;
  status: TripStatus;
  items: {
    item_name: string;
    category: CategoryName;
    quantity: number;
    is_packed: number;
    is_essential: number;
    notes?: string;
  }[];
}

export function buildDemoJourneys(): Array<{
  trip_name: string;
  destination: string;
  destination_type: DestinationType;
  departure_date: string;
  return_date: string;
  trip_duration: number;
  trip_type: TripType;
  traveller_count: number;
  notes: string;
  status: TripStatus;
  items: DemoJourneyDef['items'];
}> {
  const today = getTodayISO();

  const raw: DemoJourneyDef[] = [
    {
      trip_name: 'Bali Coastal Escape',
      destination: 'Bali, Indonesia',
      destination_type: 'Beach',
      departureOffsetDays: 5,
      returnOffsetDays: 10,
      trip_type: 'Beach Vacation',
      traveller_count: 2,
      notes: 'Uluwatu cliff resort & Seminyak beach days. Carry reef-safe sunscreen in checked bag.',
      status: 'Upcoming',
      items: [
        { item_name: 'Breathable Cotton T-Shirts', category: 'Clothing', quantity: 8, is_packed: 1, is_essential: 1 },
        { item_name: 'Swimwear / Swim Trunks', category: 'Clothing', quantity: 4, is_packed: 1, is_essential: 1 },
        { item_name: 'Casual Linen Shorts', category: 'Clothing', quantity: 6, is_packed: 1, is_essential: 1 },
        { item_name: 'Reef-Safe Sunscreen SPF 50+', category: 'Toiletries', quantity: 2, is_packed: 1, is_essential: 1, notes: '100ml + 200ml bottles' },
        { item_name: 'Toothbrush & Toothpaste', category: 'Toiletries', quantity: 2, is_packed: 0, is_essential: 1 },
        { item_name: 'Polarized Sunglasses', category: 'Accessories', quantity: 2, is_packed: 1, is_essential: 1 },
        { item_name: 'Flip-Flops / Beach Sandals', category: 'Accessories', quantity: 2, is_packed: 1, is_essential: 1 },
        { item_name: 'Phone Charger & Power Bank', category: 'Electronics', quantity: 2, is_packed: 0, is_essential: 1 },
        { item_name: 'Valid Passport (6+ Months Validity)', category: 'Documents', quantity: 2, is_packed: 1, is_essential: 1, notes: 'Stored in zip folio' },
        { item_name: 'Wallet, Cards & Local Cash', category: 'Travel Essentials', quantity: 2, is_packed: 0, is_essential: 1 },
        { item_name: 'Mosquito Repellent & Plasters', category: 'Health & Safety', quantity: 1, is_packed: 0, is_essential: 1 },
      ],
    },
    {
      trip_name: 'Ella Highland Trail',
      destination: 'Ella & Nuwara Eliya',
      destination_type: 'Mountain',
      departureOffsetDays: -1,
      returnOffsetDays: 3,
      trip_type: 'Adventure',
      traveller_count: 1,
      notes: 'Early morning Ella Rock hike and scenic hill-country rail ride.',
      status: 'Ongoing',
      items: [
        { item_name: 'Insulated Warm Down / Windproof Jacket', category: 'Clothing', quantity: 1, is_packed: 1, is_essential: 1 },
        { item_name: 'Convertible / Stretch Hiking Trousers', category: 'Clothing', quantity: 2, is_packed: 1, is_essential: 1 },
        { item_name: 'Merino Wool Hiking Socks (Extra Pairs)', category: 'Clothing', quantity: 5, is_packed: 1, is_essential: 1 },
        { item_name: 'Ankle-Support Hiking Shoes / Boots', category: 'Accessories', quantity: 1, is_packed: 1, is_essential: 1 },
        { item_name: 'Ergonomic 30L Hiking Daypack', category: 'Accessories', quantity: 1, is_packed: 1, is_essential: 1 },
        { item_name: 'Insulated Stainless Water Bottle', category: 'Travel Essentials', quantity: 1, is_packed: 1, is_essential: 1 },
        { item_name: 'Compact LED Torch / Headlamp', category: 'Electronics', quantity: 1, is_packed: 1, is_essential: 1 },
        { item_name: 'First-Aid Kit, Blister Plasters & Muscle Rub', category: 'Health & Safety', quantity: 1, is_packed: 0, is_essential: 1 },
      ],
    },
    {
      trip_name: 'Singapore FinTech Summit',
      destination: 'Singapore',
      destination_type: 'City',
      departureOffsetDays: -28,
      returnOffsetDays: -24,
      trip_type: 'Business Trip',
      traveller_count: 1,
      notes: 'Keynote deck on USB-C drive + Marina Bay conference badge pickup.',
      status: 'Completed',
      items: [
        { item_name: 'Formal Button-Down Shirts / Blouses', category: 'Clothing', quantity: 4, is_packed: 1, is_essential: 1 },
        { item_name: 'Structured Blazer / Business Suit', category: 'Clothing', quantity: 1, is_packed: 1, is_essential: 1 },
        { item_name: 'Formal Leather Shoes', category: 'Accessories', quantity: 1, is_packed: 1, is_essential: 1 },
        { item_name: 'Work Laptop', category: 'Electronics', quantity: 1, is_packed: 1, is_essential: 1 },
        { item_name: 'Laptop Charger & USB-C Hub', category: 'Electronics', quantity: 1, is_packed: 1, is_essential: 1 },
        { item_name: 'Valid Passport (6+ Months Validity)', category: 'Documents', quantity: 1, is_packed: 1, is_essential: 1 },
        { item_name: 'Business Documents & Meeting Agenda', category: 'Documents', quantity: 1, is_packed: 1, is_essential: 1 },
        { item_name: 'Grooming Kit, Deodorant & Toothbrush', category: 'Toiletries', quantity: 1, is_packed: 1, is_essential: 1 },
      ],
    },
    {
      trip_name: 'Tokyo Autumn Discovery',
      destination: 'Tokyo, Japan',
      destination_type: 'International',
      departureOffsetDays: -65,
      returnOffsetDays: -58,
      trip_type: 'International Travel',
      traveller_count: 2,
      notes: 'Shibuya, Kyoto day bullet train, Suica IC transit cards.',
      status: 'Completed',
      items: [
        { item_name: 'Valid Passport (6+ Months Validity)', category: 'Documents', quantity: 2, is_packed: 1, is_essential: 1 },
        { item_name: 'International Travel Insurance Certificate', category: 'Documents', quantity: 2, is_packed: 1, is_essential: 1 },
        { item_name: 'Universal Multi-Country Power Adapter', category: 'Electronics', quantity: 1, is_packed: 1, is_essential: 1 },
        { item_name: 'Versatile Day-to-Night Tops', category: 'Clothing', quantity: 10, is_packed: 1, is_essential: 1 },
        { item_name: 'Comfortable All-Day Walking Shoes', category: 'Accessories', quantity: 2, is_packed: 1, is_essential: 1 },
        { item_name: 'Multi-Currency Travel Card & Emergency Cash', category: 'Travel Essentials', quantity: 2, is_packed: 1, is_essential: 1 },
        { item_name: '100ml Cabin-Compliant Toiletries Kit', category: 'Toiletries', quantity: 2, is_packed: 1, is_essential: 1 },
        { item_name: 'Memory Foam Neck Pillow & Sleep Eye Mask', category: 'Travel Essentials', quantity: 2, is_packed: 0, is_essential: 0 },
      ],
    },
  ];

  return raw.map((entry) => {
    const departure_date = addDaysISO(today, entry.departureOffsetDays);
    const return_date = addDaysISO(today, entry.returnOffsetDays);
    const trip_duration = Math.max(1, calculateTripDuration(departure_date, return_date));
    return {
      trip_name: entry.trip_name,
      destination: entry.destination,
      destination_type: entry.destination_type,
      departure_date,
      return_date,
      trip_duration,
      trip_type: entry.trip_type,
      traveller_count: entry.traveller_count,
      notes: entry.notes,
      status: entry.status,
      items: entry.items,
    };
  });
}
