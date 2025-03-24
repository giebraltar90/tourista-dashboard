
import { GuideInfo } from "@/types/ventrata";
import { TicketRequirements, GuideTicketCounts } from "../types";
import { GuideWithTicket } from "@/components/tour-details/overview/tickets/types"; 
import { doesLocationRequireGuideTickets, determineTicketType, needsTicketForGuideType } from "./ticketCalculationService";

// Helper function to count guide tickets by type
export function countGuideTickets(guides: GuideWithTicket[]): GuideTicketCounts {
  let adultTickets = 0;
  let childTickets = 0;
  
  for (const guide of guides) {
    if (guide.ticketType === "adult") {
      adultTickets++;
    } else if (guide.ticketType === "child") {
      childTickets++;
    }
  }
  
  return { adultTickets, childTickets };
}

// Function to check if a location requires tickets for guides
export function locationRequiresGuideTickets(location: string): boolean {
  return doesLocationRequireGuideTickets(location);
}

// Function to check if a guide type needs a ticket
export function guideTypeNeedsTicket(guideType: string): boolean {
  return needsTicketForGuideType(guideType);
}

// Function to determine ticket type for a guide
export function determineTicketTypeForGuide(guide: GuideInfo | null | undefined): "adult" | "child" | null {
  return determineTicketType(guide);
}

// Function to process guide ticket requirement
export function processGuideTicketRequirement(guide: GuideInfo | null | undefined): "adult" | "child" | "none" {
  if (!guide) return "none";
  
  if (needsTicketForGuideType(guide.guideType)) {
    return "adult";
  }
  
  return "none";
}

// Placeholder for finding assigned guides (would be implemented based on tour data)
export function findAssignedGuides(tour: any): string[] {
  const assignedGuides: string[] = [];
  
  if (tour?.guide1) assignedGuides.push(tour.guide1);
  if (tour?.guide2) assignedGuides.push(tour.guide2);
  if (tour?.guide3) assignedGuides.push(tour.guide3);
  
  return assignedGuides;
}

// Function to calculate complete ticket requirements
export function calculateCompleteGuideTicketRequirements(
  participantAdultCount: number,
  participantChildCount: number,
  guideAdultTickets: number,
  guideChildTickets: number
): TicketRequirements {
  return {
    participantAdultCount,
    participantChildCount,
    guideAdultTickets,
    guideChildTickets,
    totalTicketsRequired: participantAdultCount + participantChildCount + guideAdultTickets + guideChildTickets
  };
}
