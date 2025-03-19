import { TourModification } from "@/types/ventrata";
import { VentrataParticipant, VentrataTourGroup, GuideInfo } from "@/types/ventrata";

export interface TourCardProps {
  id: string;
  date: Date;
  location: string;
  tourName: string;
  tourType: 'food' | 'private' | 'default';
  startTime: string;
  referenceCode: string;
  guide1: string;
  guide2: string;
  guide3: string;
  tourGroups: VentrataTourGroup[];
  numTickets: number;
  isHighSeason: boolean;
  modifications?: TourModification[];
  isCondensed?: boolean;
}

export interface TourCardListProps {
  tours: TourCardProps[];
}

export interface TourCardHeaderProps {
  tourName: string;
  location: string;
  referenceCode: string;
  startTime: string;
  date: Date;
  isHovered: boolean;
}

export interface TourCardDetailsProps {
  guide1: string;
  guide2?: string;
  guide1Info?: GuideInfo;
  guide2Info?: GuideInfo;
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
  isHovered: boolean;
  childCount?: number;
}

export interface TourCardGuideProps {
  guideName: string;
  guideInfo?: GuideInfo;
  isSecondary?: boolean;
}

export interface TourCardCapacityProps {
  totalParticipants: number;
  capacity: number;
}

export interface ParticipantDropZoneProps {
  groupIndex: number;
  onDrop: (e: React.DragEvent, toGroupIndex: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  children: React.ReactNode;
}

export interface DraggableParticipantProps {
  participant: VentrataParticipant;
  groupIndex: number;
  onDragStart: (e: React.DragEvent, participant: VentrataParticipant, fromGroupIndex: number) => void;
}
