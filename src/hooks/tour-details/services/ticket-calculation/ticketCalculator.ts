
import { GuideInfo } from "@/types/ventrata";
import { logger } from "@/utils/logger";
import { GuideTicketCounts } from "../../utils/guideTicketTypes";
import { calculateCompleteTicketRequirements } from "./core/completeCalculator";

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
  
  const result = calculateCompleteTicketRequirements(
    guide1Info,
    guide2Info,
    guide3Info,
    location,
    tourGroups
  );
  
  return result.guideTickets;
};

/**
 * Calculate complete ticket requirements for guides including counts
 * This is now a thin wrapper around the core calculator functions
 */
export const calculateCompleteGuideTicketRequirements = (
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null,
  location: string,
  tourGroups: any[]
): GuideTicketCounts => {
  logger.debug(`🎟️ [GuideRequirements] Starting complete calculation for location "${location}"`);
  
  return calculateCompleteTicketRequirements(
    guide1Info,
    guide2Info,
    guide3Info,
    location,
    tourGroups
  );
};
