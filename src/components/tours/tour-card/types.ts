import { VentrataTour } from "@/types/ventrata";

export interface TourCardProps extends VentrataTour {
}

export interface TourCardListProps {
  tours: TourCardProps[];
}

export interface ParticipantDropZoneProps {
  groupIndex: number;
  onDrop: (e: React.DragEvent, toGroupIndex: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  children: React.ReactNode;
}

export interface DraggableParticipantProps {
  participant: import('@/types/ventrata').VentrataParticipant;
  groupIndex: number;
  onDragStart: (e: React.DragEvent, participant: import('@/types/ventrata').VentrataParticipant, fromGroupIndex: number) => void;
}
