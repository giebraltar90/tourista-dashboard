
import { useQuery } from "@tanstack/react-query";
import { getTicketRequirements } from "./services/ticket-requirements-service";
import { useTicketRecalculation } from "./useTicketRecalculation";

/**
 * Hook to access ticket requirements with real-time updates
 */
export const useTicketRequirements = (tourId: string) => {
  // Make sure recalculation is running
  const { statistics, guideTickets } = useTicketRecalculation(tourId);
  
  // Query for stored ticket requirements
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ticketRequirements', tourId],
    queryFn: () => getTicketRequirements(tourId),
    enabled: !!tourId,
    staleTime: 30000, // 30 seconds
  });
  
  // Calculate derived values even if database query fails
  const derivedRequirements = {
    participantAdultCount: statistics?.total_adult_count || 0,
    participantChildCount: statistics?.total_child_count || 0,
    guideAdultTickets: guideTickets?.adultTickets || 0,
    guideChildTickets: guideTickets?.childTickets || 0,
    totalTicketsRequired: (statistics?.total_participants || 0) + 
                         (guideTickets?.adultTickets || 0) + 
                         (guideTickets?.childTickets || 0)
  };
  
  // Return stored requirements or calculated values
  return {
    requirements: data || derivedRequirements,
    derivedRequirements,
    isLoading,
    error,
    refetch
  };
};
