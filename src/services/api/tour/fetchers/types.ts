
import { TourCardProps } from "@/components/tours/tour-card/types";
import { TourModification } from "@/types/ventrata";

/**
 * Intermediate tour data structure from database
 */
export interface SupabaseTourData {
  id: string;
  date: string;
  location: string;
  tour_name: string;
  tour_type: 'food' | 'private' | 'default';
  start_time: string;
  reference_code: string;
  guide1_id?: string;
  guide2_id?: string;
  guide3_id?: string;
  num_tickets?: number;
  is_high_season?: boolean;
  tour_groups: SupabaseTourGroup[];
}

/**
 * Intermediate tour group data structure from database
 */
export interface SupabaseTourGroup {
  id: string;
  name: string;
  size?: number;
  entry_time?: string;
  guide_id?: string;
  child_count?: number;
}

/**
 * Intermediate participant data structure from database
 */
export interface SupabaseParticipant {
  id: string;
  name: string;
  count: number;
  booking_ref: string;
  child_count?: number;
  group_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Intermediate modification data structure from database
 */
export interface SupabaseModification {
  id: string;
  created_at: string;
  user_id?: string;
  description: string;
  status: 'pending' | 'complete';
  details?: any;
}
