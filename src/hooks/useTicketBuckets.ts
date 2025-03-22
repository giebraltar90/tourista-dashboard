
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TicketBucket, TourAllocation } from "@/types/ticketBuckets";

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
            
            // Create empty arrays if needed for assigned_tours and tour_allocations
            const assignedTours = Array.isArray(bucket.assigned_tours) ? bucket.assigned_tours : [];
            
            // Parse tour_allocations to ensure it's in the correct format
            let tourAllocations: TourAllocation[] = [];
            if (bucket.tour_allocations) {
              // Handle both array and JSON string formats
              if (typeof bucket.tour_allocations === 'string') {
                try {
                  tourAllocations = JSON.parse(bucket.tour_allocations);
                } catch (e) {
                  console.error("Error parsing tour_allocations string:", e);
                  tourAllocations = [];
                }
              } else if (Array.isArray(bucket.tour_allocations)) {
                tourAllocations = bucket.tour_allocations as TourAllocation[];
              } else if (typeof bucket.tour_allocations === 'object') {
                // If it's already an object but not an array, wrap it
                tourAllocations = [bucket.tour_allocations as unknown as TourAllocation];
              }
            }
            
            // Calculate total allocated tickets
            const totalAllocated = tourAllocations.reduce(
              (sum, allocation) => {
                // Ensure tickets_required is a number
                const ticketsRequired = typeof allocation.tickets_required === 'number' 
                  ? allocation.tickets_required 
                  : parseInt(allocation.tickets_required as unknown as string) || 0;
                return sum + ticketsRequired;
              }, 0
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
            } as TicketBucket;
          } catch (e) {
            console.error("Error processing bucket data:", e, bucket);
            // Return original bucket data with a current date as fallback
            return {
              ...bucket,
              date: new Date(),
              assigned_tours: [],
              tour_allocations: [],
              available_tickets: 0
            } as TicketBucket;
          }
        });
        
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
