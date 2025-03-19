
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
}
