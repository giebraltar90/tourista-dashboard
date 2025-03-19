import { TourModification } from "@/types/ventrata";

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
  tourGroups: {
    id?: string;
    name: string;
    size: number;
    entryTime: string;
    childCount?: number;
    guideId?: string;
  }[];
  numTickets: number;
  isHighSeason: boolean;
  modifications?: TourModification[];
}
