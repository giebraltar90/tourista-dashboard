
import { useMemo } from "react";
import { calculateCompleteGuideTicketRequirements } from "./services/ticket-calculation";

/**
 * Hook to calculate guide ticket requirements in a consistent, reusable way
 */
export const useGuideTicketRequirements = (
  tour: any,
  guide1Info: any,
  guide2Info: any,
  guide3Info: any
) => {
  // Use the centralized calculation service
  return useMemo(() => {
    return calculateCompleteGuideTicketRequirements(
      tour,
      guide1Info, 
      guide2Info,
      guide3Info
    );
  }, [tour, guide1Info, guide2Info, guide3Info]);
};
