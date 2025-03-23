
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { useEffect, useMemo } from "react";
import { logger } from "@/utils/logger";
import { findAssignedGuides, getGuideTicketRequirement } from "./services/ticket-calculation/guideAssignmentUtils";

/**
 * Hook to determine guide ticket requirements for a tour
 */
export const useGuideTicketRequirements = (
  tour: TourCardProps,
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null
) => {
  // Always handle the case of location requiring guide tickets (simplified requirement)
  const locationNeedsGuideTickets = true;
  
  // Find assigned guides from tour groups
  const assignedGuidePositions = useMemo(() => {
    return findAssignedGuides(tour.tourGroups, guide1Info, guide2Info, guide3Info);
  }, [tour.tourGroups, guide1Info, guide2Info, guide3Info]);
  
  // Calculate guide tickets needed
  const guidesWithTickets = useMemo(() => {
    const guides: Array<{
      guideName: string;
      guideType: string;
      ticketType: "adult" | "child" | null;
    }> = [];
    
    // Always check guide1 (primary guide) even if not assigned to a group
    if (guide1Info && guide1Info.name) {
      const guide1Result = getGuideTicketRequirement(
        "guide1", guide1Info, guide2Info, guide3Info
      );
      
      guides.push({
        guideName: guide1Info.name || "Unknown Guide",
        guideType: guide1Info.guideType || "Unknown Type",
        ticketType: guide1Result.ticketType
      });
    }
    
    // Check guide2 if present
    if (guide2Info && guide2Info.name) {
      const guide2Result = getGuideTicketRequirement(
        "guide2", guide1Info, guide2Info, guide3Info
      );
      
      guides.push({
        guideName: guide2Info.name || "Unknown Guide",
        guideType: guide2Info.guideType || "Unknown Type",
        ticketType: guide2Result.ticketType
      });
    }
    
    // Check guide3 if present
    if (guide3Info && guide3Info.name) {
      const guide3Result = getGuideTicketRequirement(
        "guide3", guide1Info, guide2Info, guide3Info
      );
      
      guides.push({
        guideName: guide3Info.name || "Unknown Guide",
        guideType: guide3Info.guideType || "Unknown Type",
        ticketType: guide3Result.ticketType
      });
    }
    
    return guides;
  }, [guide1Info, guide2Info, guide3Info]);
  
  // Count adult and child tickets
  const { adultTickets, childTickets } = useMemo(() => {
    let adultCount = 0;
    let childCount = 0;
    
    guidesWithTickets.forEach(guide => {
      if (guide.ticketType === "adult") {
        adultCount++;
      } else if (guide.ticketType === "child") {
        childCount++;
      }
    });
    
    return { adultTickets: adultCount, childTickets: childCount };
  }, [guidesWithTickets]);
  
  // Log detailed debug information
  useEffect(() => {
    logger.debug(`🎟️ [useGuideTicketRequirements] Guide ticket requirements for tour ${tour.id}:`, {
      hasAssignedGuides: assignedGuidePositions.size > 0,
      assignedGuidePositions: Array.from(assignedGuidePositions),
      guideAdultTickets: adultTickets,
      guideChildTickets: childTickets,
      guidesWithTickets: guidesWithTickets.map(g => ({
        name: g.guideName,
        type: g.guideType,
        ticketType: g.ticketType
      }))
    });
  }, [
    tour.id, assignedGuidePositions, adultTickets, childTickets, guidesWithTickets
  ]);
  
  return {
    locationNeedsGuideTickets,
    hasAssignedGuides: assignedGuidePositions.size > 0,
    guideTickets: {
      adultTickets,
      childTickets,
      guides: guidesWithTickets
    }
  };
};
