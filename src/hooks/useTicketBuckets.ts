
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TicketBucket } from "@/types/ticketBuckets";

/**
 * Hook to fetch ticket buckets for a specific tour
 */
export function useTicketBuckets(tourId: string) {
  return useQuery({
    queryKey: ['ticketBuckets', tourId],
    queryFn: async () => {
      console.log("🔍 [useTicketBuckets] Fetching ticket buckets for tour:", tourId);
      
      const { data, error } = await supabase
        .from('ticket_buckets')
        .select('*')
        .eq('tour_id', tourId);
        
      if (error) {
        console.error("🔴 [useTicketBuckets] Error fetching ticket buckets:", error);
        throw error;
      }
      
      console.log("🔍 [useTicketBuckets] Raw buckets from DB:", data);
      
      // Convert date strings to Date objects and calculate available tickets
      const buckets = data.map(bucket => {
        // Create Date with noon time to avoid timezone issues
        const bucketDate = new Date(bucket.date);
        bucketDate.setHours(12, 0, 0, 0);
        
        // Calculate available tickets
        const availableTickets = bucket.max_tickets - bucket.allocated_tickets;
        
        return {
          ...bucket,
          date: bucketDate,
          available_tickets: availableTickets
        };
      }) as TicketBucket[];
      
      // Calculate total available tickets across all buckets
      const totalAvailableTickets = buckets.reduce((sum, bucket) => 
        sum + (bucket.available_tickets || 0), 0);
      
      console.log("🔍 [useTicketBuckets] Processed buckets with calculations:", {
        bucketCount: buckets.length,
        totalMaxTickets: buckets.reduce((sum, b) => sum + b.max_tickets, 0),
        totalAllocated: buckets.reduce((sum, b) => sum + b.allocated_tickets, 0),
        totalAvailableTickets
      });
      
      return buckets;
    },
    enabled: !!tourId,
  });
}
