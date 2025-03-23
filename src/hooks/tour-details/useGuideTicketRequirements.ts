
import { TourCardProps } from "@/components/tours/tour-card/types";
import { GuideInfo } from "@/types/ventrata";
import { useEffect, useMemo } from "react";
import { logger } from "@/utils/logger";
import { locationRequiresGuideTickets } from "./services/ticket-calculation/locationUtils";
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
  // Check if the tour location requires guide tickets
  const locationNeedsGuideTickets = useMemo(() => {
    return locationRequiresGuideTickets(tour.location);
  }, [tour.location]);
  
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
    
    // Process each assigned guide
    assignedGuidePositions.forEach(guidePosition => {
      // Get ticket requirement for this guide
      const { ticketType, guideInfo } = getGuideTicketRequirement(
        guidePosition,
        guide1Info,
        guide2Info,
        guide3Info
      );
      
      // Skip if no guide info found
      if (!guideInfo) return;
      
      // Add guide to the list
      guides.push({
        guideName: guideInfo.name || "Unknown Guide",
        guideType: guideInfo.guideType || "Unknown Type",
        ticketType: ticketType
      });
    });
    
    return guides;
  }, [assignedGuidePositions, guide1Info, guide2Info, guide3Info]);
  
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
      location: tour.location,
      locationNeedsGuideTickets,
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
    tour.id, tour.location, locationNeedsGuideTickets, 
    assignedGuidePositions, adultTickets, childTickets, guidesWithTickets
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
