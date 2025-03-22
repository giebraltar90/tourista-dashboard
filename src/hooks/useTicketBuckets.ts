
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
      
      try {
        const { data, error } = await supabase
          .from('ticket_buckets')
          .select('*')
          .eq('tour_id', tourId);
          
        if (error) {
          console.error("🔴 [useTicketBuckets] Error fetching ticket buckets:", error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.log("🔍 [useTicketBuckets] No buckets found for tour:", tourId);
          return [];
        }
        
        console.log("🔍 [useTicketBuckets] Raw buckets from DB:", data);
        
        // Convert date strings to Date objects and calculate available tickets
        const buckets = data.map(bucket => {
          try {
            // Create Date with noon time to avoid timezone issues
            let bucketDate: Date;
            
            if (typeof bucket.date === 'string') {
              bucketDate = new Date(bucket.date);
              bucketDate.setHours(12, 0, 0, 0);
            } else if (bucket.date && typeof bucket.date === 'object') {
              // Fix for TypeScript error - safely convert any object to string
              const dateStr = String(bucket.date);
              bucketDate = new Date(dateStr);
              bucketDate.setHours(12, 0, 0, 0);
            } else {
              console.warn("Unknown date format:", bucket.date);
              bucketDate = new Date(); // Fallback
              bucketDate.setHours(12, 0, 0, 0);
            }
            
            // Calculate available tickets
            const availableTickets = bucket.max_tickets - bucket.allocated_tickets;
            
            // Return processed bucket
            return {
              ...bucket,
              date: bucketDate,
              available_tickets: availableTickets
            };
          } catch (e) {
            console.error("Error processing bucket data:", e, bucket);
            // Return original bucket data with a current date as fallback
            return {
              ...bucket,
              date: new Date(),
              available_tickets: 0
            };
          }
        }) as TicketBucket[];
        
        // Calculate total available tickets across all buckets
        const totalAvailableTickets = buckets.reduce((sum, bucket) => {
          const available = typeof bucket.available_tickets === 'number' 
            ? bucket.available_tickets 
            : 0;
          return sum + available;
        }, 0);
        
        console.log("🔍 [useTicketBuckets] Processed buckets with calculations:", {
          bucketCount: buckets.length,
          totalMaxTickets: buckets.reduce((sum, b) => sum + b.max_tickets, 0),
          totalAllocated: buckets.reduce((sum, b) => sum + b.allocated_tickets, 0),
          totalAvailableTickets
        });
        
        return buckets;
      } catch (error) {
        console.error("🔴 [useTicketBuckets] Critical error processing ticket buckets:", error);
        // Return empty array in case of error to prevent app from crashing
        return [];
      }
    },
    enabled: !!tourId,
    // Better error handling
    meta: {
      onError: (error: Error) => {
        console.error("🔴 [useTicketBuckets] Query error:", error);
      }
    }
  });
}
