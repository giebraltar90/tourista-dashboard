
// Define Ventrata API types based on their documentation

export interface VentrataParticipant {
  id: string;
  name: string;
  count: number;
  bookingRef: string;
  childCount?: number; // Number of children in this participant group
}

export interface VentrataTourGroup {
  name: string;
  size: number;
  entryTime: string;
  participants?: VentrataParticipant[];
  childCount?: number; // Total children in this group
  guideId?: string; // Guide ID for this group 
}

export interface VentrataTour {
  id: string;
  date: Date; // Date object
  location: string;
  tourName: string;
  tourType: 'food' | 'private' | 'default';
  startTime: string;
  referenceCode: string;
  guide1: string;
  guide2?: string;
  guide3?: string; // Added third guide for high season
  tourGroups: VentrataTourGroup[];
  numTickets?: number;
  isHighSeason?: boolean; // Flag for high season
}

export interface VentrataBooking {
  id: string;
  tourId: string;
  groupId: string;
  customerName: string;
  participantCount: number;
  bookingReference: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

// API response types
export interface VentrataToursResponse {
  data: VentrataTour[];
  meta: {
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }
}

export interface VentrataBookingsResponse {
  data: VentrataBooking[];
  meta: {
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }
}

// Guide types
export type GuideType = 'GA Ticket' | 'GA Free' | 'GC';

// Guide information
export interface GuideInfo {
  name: string;
  birthday: Date;
  guideType: GuideType;
  id?: string; // Unique ID for the guide
}

// Tour capacity settings
export interface TourCapacitySettings {
  standard: number;
  exception: number;
  highSeason: number;
  standardGroups: number;
  highSeasonGroups: number;
}

export const DEFAULT_CAPACITY_SETTINGS: TourCapacitySettings = {
  standard: 24,
  exception: 29,
  highSeason: 36,
  standardGroups: 2,
  highSeasonGroups: 3
};
