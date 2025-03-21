
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
      const { data, error } = await supabase
        .from('ticket_buckets')
        .select('*')
        .eq('tour_id', tourId);
        
      if (error) {
        console.error("Error fetching ticket buckets:", error);
        throw error;
      }
      
      // Convert date strings to Date objects
      return data.map(bucket => ({
        ...bucket,
        date: new Date(bucket.date)
      })) as TicketBucket[];
    },
    enabled: !!tourId,
  });
}
