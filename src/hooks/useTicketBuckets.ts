
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
        // Get all buckets where this tour is in assigned_tours
        const { data, error } = await supabase
          .from('ticket_buckets')
          .select('*')
          .contains('assigned_tours', [tourId]);
          
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
            let bucketDate = new Date();
            
            if (typeof bucket.date === 'string') {
              bucketDate = new Date(bucket.date);
            } else if (bucket.date) {
              // Safely convert any date value to string first
              const dateStr = String(bucket.date);
              bucketDate = new Date(dateStr);
            }
            
            // Set to noon to avoid timezone issues
            bucketDate.setHours(12, 0, 0, 0);
            
            // Ensure assigned_tours and tour_allocations are at least empty arrays
            const assignedTours = bucket.assigned_tours || [];
            const tourAllocations = bucket.tour_allocations || [];
            
            // Calculate total allocated tickets
            const totalAllocated = tourAllocations.reduce(
              (sum, allocation) => sum + allocation.tickets_required, 0
            );
            
            // Calculate available tickets
            const availableTickets = bucket.max_tickets - totalAllocated;
            
            // Return processed bucket
            return {
              ...bucket,
              date: bucketDate,
              assigned_tours: assignedTours,
              tour_allocations: tourAllocations,
              allocated_tickets: totalAllocated,
              available_tickets: availableTickets
            };
          } catch (e) {
            console.error("Error processing bucket data:", e, bucket);
            // Return original bucket data with a current date as fallback
            return {
              ...bucket,
              date: new Date(),
              assigned_tours: [],
              tour_allocations: [],
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
