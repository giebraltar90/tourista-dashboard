
import { GuideInfo } from "@/types/ventrata";
import { calculateBasicGuideTickets as coreCalculateBasicGuideTickets } from "./core/basicCalculator";

/**
 * Basic calculation of guide tickets needed for a tour
 * This is a thin wrapper around the core implementation
 */
export const calculateBasicGuideTickets = (
  guide1Info: GuideInfo | null,
  guide2Info: GuideInfo | null,
  guide3Info: GuideInfo | null,
  location: string = "",
  tourGroups: any[] = []
): { 
  adultTickets: number; 
  childTickets: number; 
  guides: Array<{ 
    guideName: string; 
    guideType: string; 
    ticketType: "adult" | "child" | null 
  }> 
} => {
  // Delegate to the core implementation
  return coreCalculateBasicGuideTickets(
    guide1Info,
    guide2Info,
    guide3Info,
    location,
    tourGroups
  );
};
