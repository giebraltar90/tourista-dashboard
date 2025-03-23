
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
  // Skip if guide info is missing or guide is not assigned
  if (!guideInfo || !assignedGuideIds.has(guideKey)) {
    return { 
      needsTicket: false, 
      ticketType: null, 
      guideName: guideInfo?.name || "",
      guideInfo: null
    };
  }
  
  logger.debug(`🎟️ [ProcessGuide] Processing assigned ${guideKey} (${guideInfo.name})`);
  
  const { needsTicket, ticketType } = getGuideTicketRequirement(guideInfo, location);
  
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
  
  guideRequirements.forEach(guide => {
    if (guide.needsTicket) {
      if (guide.ticketType === "adult") adultTickets++;
      if (guide.ticketType === "child") childTickets++;
      
      if (guide.guideInfo) {
        guides.push({
          guideName: guide.guideName,
          guideType: String(guide.guideInfo.guideType) || "Unknown",
          ticketType: guide.ticketType
        });
      }
    }
  });
  
  return { adultTickets, childTickets, guides };
};
