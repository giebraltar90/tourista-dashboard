
import { VentrataTourGroup } from "@/types/ventrata";

export interface TourCardProps {
  id: string;
  date: Date;
  location: string;
  tourName: string;
  tourType: 'food' | 'private' | 'default';
  startTime: string;
  referenceCode: string;
  guide1: string;
  guide2?: string;
  tourGroups: VentrataTourGroup[];
  numTickets?: number;
  isCondensed?: boolean;
}

export interface TourCardHeaderProps {
  tourName: string;
  location: string;
  referenceCode: string;
  startTime: string;
  date: Date;
  isHovered?: boolean;
}

export interface TourCardCapacityProps {
  totalParticipants: number;
  capacity: number;
}

export interface TourCardGuideProps {
  guideName: string;
  guideInfo?: any;
  isSecondary?: boolean;
}

export interface TourCardDetailsProps {
  guide1: string;
  guide2?: string;
  guide1Info?: any;
  guide2Info?: any;
  location: string;
  tourGroups: VentrataTourGroup[];
  totalParticipants: number;
  isHighSeason: boolean;
}

export interface TourCardFooterProps {
  id: string;
  totalParticipants: number;
  numTickets?: number;
  isBelowMinimum: boolean;
  isHighSeason: boolean;
  isHovered?: boolean;
  childCount?: number;
}
