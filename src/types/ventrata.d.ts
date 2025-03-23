
// If this file doesn't exist, add it to define participant and tour group types

export interface VentrataParticipant {
  id: string;
  name: string;
  count: number;
  bookingRef: string;
  childCount: number;
  groupId?: string; // CamelCase version
  // The following properties are for database compatibility
  group_id?: string; // Snake_case version
  booking_ref?: string; // Snake_case version
  child_count?: number; // Snake_case version
  created_at?: string; // Added missing property
  updated_at?: string; // Added missing property
}

export interface VentrataTourGroup {
  id: string;
  name: string;
  size: number;
  entryTime: string;
  childCount: number;
  guideId?: string;
  guideName?: string;
  participants: VentrataParticipant[];
  isExpanded?: boolean; // Added this property
  // The following properties are for database compatibility
  child_count?: number; // Snake_case version
  entry_time?: string; // Snake_case version
  guide_id?: string; // Snake_case version
}

export type GuideType = "GA Ticket" | "GA Free" | "GC";

export interface GuideInfo {
  name: string;
  birthday: Date;
  guideType: GuideType;
}

