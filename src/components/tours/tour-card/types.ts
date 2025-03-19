
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

// New types for drag and drop functionality
export interface DraggableParticipantProps {
  participant: {
    id: string;
    name: string;
    count: number;
    bookingRef: string;
    childCount?: number;
  };
  groupIndex: number;
  onDragStart: (e: React.DragEvent, participant: any, fromGroupIndex: number) => void;
}

export interface ParticipantDropZoneProps {
  groupIndex: number;
  onDrop: (e: React.DragEvent, toGroupIndex: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  children: React.ReactNode;
}
