
// If this file doesn't exist, add it to define participant and tour group types

export interface VentrataParticipant {
  id: string;
  name: string;
  count: number;
  bookingRef: string;
  childCount: number;
  group_id?: string;
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
}

export type GuideType = "GA Ticket" | "GA Free" | "GC";

export interface GuideInfo {
  name: string;
  birthday: Date;
  guideType: GuideType;
}
