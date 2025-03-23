
import { GuideInfo } from "@/types/ventrata";
import { logger } from "@/utils/logger";
import { GuideTicketRequirement } from "../../utils/guideTicketTypes";
import { getGuideTicketRequirement } from "./guideRequirementUtils";

/**
 * Process a single guide's ticket requirements
 */
export const processGuideTicketRequirement = (
  guideInfo: GuideInfo | null,
  location: string,
  assignedGuideIds: Set<string>,
  guideKey: string
): GuideTicketRequirement & { needsTicket: boolean; ticketType: "adult" | "child" | null } => {
  // Skip if guide info is missing
  if (!guideInfo) {
    logger.debug(`🎟️ [ProcessGuide] ${guideKey} has no guide info, skipping`);
    return { 
      needsTicket: false, 
      ticketType: null, 
      guideName: "",
      guideInfo: null
    };
  }
  
  // Skip if guide is not assigned to any group
  if (!assignedGuideIds.has(guideKey)) {
    logger.debug(`🎟️ [ProcessGuide] ${guideKey} (${guideInfo.name}) is not assigned to any group, skipping`);
    return { 
      needsTicket: false, 
      ticketType: null, 
      guideName: guideInfo.name || "",
      guideInfo: null
    };
  }
  
  logger.debug(`🎟️ [ProcessGuide] Processing assigned ${guideKey} (${guideInfo.name}) with type ${guideInfo.guideType}`);
  
  const { needsTicket, ticketType } = getGuideTicketRequirement(guideInfo, location);
  
  logger.debug(`🎟️ [ProcessGuide] ${guideKey} (${guideInfo.name}): ` + 
    (needsTicket ? `Needs ${ticketType} ticket` : `Doesn't need a ticket`));
  
  return { 
    needsTicket, 
    ticketType,
    guideName: guideInfo.name || `Guide ${guideKey.replace('guide', '')}`,
    guideInfo,
  };
};

/**
 * Calculate total tickets needed for assigned guides
 */
export const calculateGuideTickets = (
  guideRequirements: Array<GuideTicketRequirement & { needsTicket: boolean; ticketType: "adult" | "child" | null }>
): { adultTickets: number; childTickets: number; guides: Array<{ guideName: string; guideType: string; ticketType: string | null }> } => {
  let adultTickets = 0;
  let childTickets = 0;
  const guides: Array<{ guideName: string; guideType: string; ticketType: string | null }> = [];
  
  logger.debug(`🎟️ [CalculateGuideTickets] Processing ${guideRequirements.length} guide requirements`);
  
  guideRequirements.forEach(guide => {
    if (guide.needsTicket) {
      if (guide.ticketType === "adult") {
        adultTickets++;
        logger.debug(`🎟️ [CalculateGuideTickets] Adding adult ticket for ${guide.guideName}`);
      }
      if (guide.ticketType === "child") {
        childTickets++;
        logger.debug(`🎟️ [CalculateGuideTickets] Adding child ticket for ${guide.guideName}`);
      }
      
      if (guide.guideInfo) {
        guides.push({
          guideName: guide.guideName,
          guideType: String(guide.guideInfo.guideType) || "Unknown",
          ticketType: guide.ticketType
        });
      }
    } else {
      logger.debug(`🎟️ [CalculateGuideTickets] No ticket needed for ${guide.guideName}`);
    }
  });
  
  logger.debug(`🎟️ [CalculateGuideTickets] Final count: ${adultTickets} adult, ${childTickets} child tickets`);
  
  return { adultTickets, childTickets, guides };
};
