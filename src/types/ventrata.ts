
// Define Ventrata API types based on their documentation

export interface VentrataParticipant {
  id: string;
  name: string;
  count: number;
  bookingRef: string;
}

export interface VentrataTourGroup {
  name: string;
  size: number;
  entryTime: string;
  participants?: VentrataParticipant[];
}

export interface VentrataTour {
  id: string;
  date: string; // ISO string
  location: string;
  tourName: string;
  tourType: 'food' | 'private' | 'default';
  startTime: string;
  referenceCode: string;
  guide1: string;
  guide2?: string;
  tourGroups: VentrataTourGroup[];
  numTickets?: number;
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
