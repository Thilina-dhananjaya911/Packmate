export type TripStatus = 'Upcoming' | 'Ongoing' | 'Completed';

export type TripType =
  | 'Beach Vacation'
  | 'Business Trip'
  | 'Adventure'
  | 'Camping'
  | 'Family Vacation'
  | 'International Travel'
  | 'Weekend Getaway'
  | 'City Exploration';

export type DestinationType =
  | 'Beach'
  | 'Mountain'
  | 'City'
  | 'Nature'
  | 'International'
  | 'Resort'
  | 'General';

export type CategoryName =
  | 'Clothing'
  | 'Toiletries'
  | 'Electronics'
  | 'Documents'
  | 'Accessories'
  | 'Travel Essentials'
  | 'Health & Safety';

export type ScalingRule = 'fixed' | 'daily' | 'half_days' | 'third_days' | 'weekly';

export type ThemeMode = 'light' | 'dark';

export interface ItemCategory {
  id: number;
  name: CategoryName;
  icon_name: string;
  color_hex: string;
  sort_order: number;
}

export interface Trip {
  id: number;
  trip_name: string;
  destination: string;
  destination_type: DestinationType;
  departure_date: string; // ISO YYYY-MM-DD
  return_date: string; // ISO YYYY-MM-DD
  trip_duration: number;
  trip_type: TripType;
  traveller_count: number;
  notes: string;
  status: TripStatus;
  created_at: string;
  updated_at: string;
}

export interface TripWithProgress extends Trip {
  total_items: number;
  packed_items: number;
  remaining_items: number;
  progress_percentage: number;
}

export interface CreateTripInput {
  trip_name: string;
  destination: string;
  destination_type: DestinationType;
  departure_date: string;
  return_date: string;
  trip_duration: number;
  trip_type: TripType;
  traveller_count: number;
  notes: string;
  status?: TripStatus;
}

export interface UpdateTripInput extends Partial<CreateTripInput> {
  status?: TripStatus;
}

export interface PackingItem {
  id: number;
  trip_id: number;
  item_name: string;
  category_id: number;
  category_name: CategoryName;
  category_color: string;
  category_icon: string;
  quantity: number;
  is_packed: number; // 0 | 1
  is_essential: number; // 0 | 1
  notes: string;
  is_custom: number; // 0 | 1
  created_at: string;
}

export interface CreatePackingItemInput {
  trip_id: number;
  item_name: string;
  category_id: number;
  quantity: number;
  is_packed?: number;
  is_essential?: number;
  notes?: string;
  is_custom?: number;
}

export interface UpdatePackingItemInput {
  item_name?: string;
  category_id?: number;
  quantity?: number;
  is_packed?: number;
  is_essential?: number;
  notes?: string;
}

export interface PackingTemplate {
  id: number;
  template_name: string;
  trip_type: TripType;
  destination_type: DestinationType;
  description: string;
  icon_name: string;
  accent_color: string;
  recommended_duration: string;
  item_count: number;
  essential_count: number;
}

export interface TemplateItem {
  id: number;
  template_id: number;
  item_name: string;
  category_id: number;
  category_name: CategoryName;
  category_color: string;
  category_icon: string;
  default_quantity: number;
  is_essential: number; // 0 | 1
  scaling_rule: ScalingRule;
  per_traveller: number; // 0 | 1
}

export interface RecommendedItem {
  key: string;
  item_name: string;
  category_id: number;
  category_name: CategoryName;
  category_color: string;
  quantity: number;
  is_essential: boolean;
  reason: string;
  selected: boolean;
}

export interface RecommendationInput {
  destination: string;
  destinationType: DestinationType;
  tripType: TripType;
  departureDate: string;
  returnDate: string;
  tripDuration: number;
  travellerCount: number;
}

export interface DashboardStats {
  totalTrips: number;
  upcomingTrips: number;
  ongoingTrips: number;
  completedTrips: number;
  totalItemsAllTrips: number;
  totalPackedItems: number;
}

export interface CategoryProgress {
  category_id: number;
  category_name: CategoryName;
  color_hex: string;
  icon_name: string;
  total: number;
  packed: number;
  remaining: number;
  percentage: number;
}

export interface DatabaseInfo {
  databaseName: string;
  tripCount: number;
  completedTripCount: number;
  packingItemCount: number;
  customItemCount: number;
  templateCount: number;
  templateItemCount: number;
  categoryCount: number;
}

export type MainTabParamList = {
  Home: undefined;
  MyTrips: { initialStatus?: TripStatus | 'All' } | undefined;
  Templates: { targetTripId?: number } | undefined;
  History: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: { isReplay?: boolean } | undefined;
  MainTabs:
    | {
        screen?: keyof MainTabParamList;
        params?: MainTabParamList[keyof MainTabParamList];
      }
    | undefined;
  CreateTrip:
    | {
        editTripId?: number;
        preselectedTemplateId?: number;
        reuseFromTripId?: number;
      }
    | undefined;
  TripDetails: { tripId: number };
  PackingChecklist: { tripId: number; openAddModal?: boolean };
  ItemDetails: { itemId: number; tripId: number };
  TemplateDetails: { templateId: number; targetTripId?: number };
  Settings: undefined;
};
