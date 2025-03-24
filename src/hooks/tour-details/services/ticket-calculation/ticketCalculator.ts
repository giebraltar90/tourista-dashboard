
import { GuideInfo } from "@/types/ventrata";
import { logger } from "@/utils/logger";
import { GuideTicketCounts } from "../../utils/guideTicketTypes";
import { calculateBasicGuideTickets, calculateCompleteTicketRequirements } from "./core";

/**
 * Calculate how many tickets are needed for all guides on a tour
 * This is now a thin wrapper around the core calculator functions
 */
export const calculateGuideTicketsNeeded = (
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null,
  location: string = "",
  tourGroups: any[] = []
): { adultTickets: number; childTickets: number; guides: Array<{ guideName: string; guideType: string; ticketType: "adult" | "child" | null }> } => {
  logger.debug(`🎟️ [CalculateTickets] Starting calculation for location "${location}"`);
  
  return calculateBasicGuideTickets(
    guide1Info,
    guide2Info,
    guide3Info,
    location,
    tourGroups
  );
};

/**
 * Calculate complete ticket requirements for guides including counts
 * This is now a thin wrapper around the core calculator functions
 */
export const calculateCompleteGuideTicketRequirements = (
  tour: any,
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null,
  location: string
): GuideTicketCounts => {
  logger.debug(`🎟️ [GuideRequirements] Starting complete calculation for location "${location}"`);
  
  // Extract tour information if tour object is provided
  const tourGroups = tour?.tourGroups || [];
  
  return calculateCompleteTicketRequirements(
    guide1Info,
    guide2Info,
    guide3Info,
    location,
    tourGroups
  );
};
