
import { GuideInfo } from "@/types/ventrata";
import { VentrataTourGroup } from "@/types/ventrata";
import { countTicketsByType, mapGuidesToResultFormat } from "./ticketAggregation";
import { determineGuideTicketNeeds } from "./guideTicketType";

/**
 * Calculate guide tickets needed with more complex scenarios
 * 
 * @param guide1Info First guide info
 * @param guide2Info Second guide info 
 * @param guide3Info Third guide info
 * @param location Tour location to determine ticket requirements
 * @param tourGroups Tour groups data for allocation
 * @returns Object with ticket counts and guide details
 */
export const calculateCompleteGuideTicketRequirements = (
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null,
  location: string,
  tourGroups: VentrataTourGroup[] = []
): {
  adultTickets: number;
  childTickets: number;
  guides: Array<{
    guideName: string;
    guideType: string;
    ticketType: "adult" | "child" | null;
    guideInfo: GuideInfo | null;
    needsTicket?: boolean;
  }>;
} => {
  // Get non-null guides
  const guides = [
    { info: guide1Info, position: 1 },
    { info: guide2Info, position: 2 },
    { info: guide3Info, position: 3 },
  ].filter(g => g.info !== null);
  
  // If no guides, return empty result
  if (guides.length === 0) {
    return {
      adultTickets: 0,
      childTickets: 0,
      guides: []
    };
  }
  
  // Check ticket needs for each guide based on location and guide type
  const guidesWithRequirements = guides.map(({ info, position }) => {
    // This shouldn't happen due to the filter above, but TypeScript needs reassurance
    if (!info) {
      return {
        guideName: `Unknown guide${position}`,
        guideType: "Unknown",
        needsTicket: false,
        ticketType: null as "adult" | "child" | null,
        guideInfo: null
      };
    }
    
    // Determine if the guide needs a ticket and what type
    const { needsTicket, ticketType } = determineGuideTicketNeeds(
      info, 
      location, 
      tourGroups
    );
    
    return {
      guideName: info.name,
      guideType: info.guideType,
      needsTicket,
      ticketType,
      guideInfo: info
    };
  });
  
  // Count tickets by type
  const { adultTickets, childTickets } = countTicketsByType(guidesWithRequirements);
  
  // Map guide data to result format
  const mappedGuides = mapGuidesToResultFormat(guidesWithRequirements);
  
  return {
    adultTickets,
    childTickets,
    guides: mappedGuides
  };
};
