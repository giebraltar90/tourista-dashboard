import { GuideInfo } from "@/types/ventrata";
import { GuideWithTicket } from "@/components/tour-details/overview/tickets/types";
import { TourCardProps } from "@/components/tours/tour-card/types";

export interface TicketRequirements {
  participantAdultCount: number;
  participantChildCount: number;
  guideAdultTickets: number;
  guideChildTickets: number;
  totalTicketsRequired: number;
}

export function doesLocationRequireGuideTickets(location: string): boolean {
  const locationsRequiringTickets = ["Versailles"];
  return locationsRequiringTickets.includes(location);
}

export function needsTicketForGuideType(guideType: string): boolean {
  return guideType === 'staff' || guideType === 'contractor';
}

export function determineTicketType(guide: GuideInfo | null | undefined): "adult" | "child" | null {
  if (!guide) return null;
  
  if (needsTicketForGuideType(guide.guideType)) {
    return "adult"; // Default to adult tickets for guides
  }
  
  return null;
}

export function calculateGuideTicketsNeeded(
  guides: (GuideInfo | null | undefined)[]
): { adultTickets: number; childTickets: number } {
  let adultTickets = 0;
  let childTickets = 0;
  
  for (const guide of guides) {
    if (!guide) continue;
    
    const ticketType = determineTicketType(guide);
    
    if (ticketType === "adult") {
      adultTickets++;
    } else if (ticketType === "child") {
      childTickets++;
    }
  }
  
  return { adultTickets, childTickets };
}

export function processGuideTickets(
  tour: TourCardProps | undefined,
  guide1Info: GuideInfo | null | undefined,
  guide2Info: GuideInfo | null | undefined,
  guide3Info: GuideInfo | null | undefined
): GuideWithTicket[] {
  if (!tour) return [];
  
  const guides = [
    { guide: guide1Info, guideId: tour.guide1 },
    { guide: guide2Info, guideId: tour.guide2 },
    { guide: guide3Info, guideId: tour.guide3 },
  ];
  
  return guides.map(({ guide, guideId }) => {
    const ticketType = determineTicketType(guide);
    
    return {
      guideName: guide?.name || guideId || "Unknown Guide",
      guideType: guide?.guideType || "unknown",
      ticketType: ticketType
    };
  });
}

export function findAssignedGuidesForTour(tour: TourCardProps | undefined): string[] {
  if (!tour) return [];
  
  const assignedGuides: string[] = [];
  
  if (tour.guide1) {
    assignedGuides.push(tour.guide1);
  }
  if (tour.guide2) {
    assignedGuides.push(tour.guide2);
  }
  if (tour.guide3) {
    assignedGuides.push(tour.guide3);
  }
  
  return assignedGuides;
}

export function getGuideTicketRequirement(guide: GuideInfo | null | undefined): "adult" | "child" | "none" | null {
  if (!guide) return "none";
  
  if (needsTicketForGuideType(guide.guideType)) {
    return "adult";
  }
  
  return "none";
}

export function calculateCompleteTicketRequirements(
  participantAdultCount: number,
  participantChildCount: number,
  guideAdultTickets: number,
  guideChildTickets: number
): TicketRequirements {
  const totalTicketsRequired = participantAdultCount + participantChildCount + guideAdultTickets + guideChildTickets;
  
  return {
    participantAdultCount,
    participantChildCount,
    guideAdultTickets,
    guideChildTickets,
    totalTicketsRequired
  };
}
