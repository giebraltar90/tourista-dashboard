
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Assigns a ticket bucket to a specific tour
 */
export const assignBucketToTour = async (bucketId: string, tourId: string) => {
  const { data, error } = await supabase
    .from('ticket_buckets')
    .update({ tour_id: tourId })
    .eq('id', bucketId)
    .select();
  
  if (error) {
    console.error("Error assigning bucket to tour:", error);
    throw error;
  }
  
  return data;
};

/**
 * Removes a ticket bucket assignment from a tour
 */
export const removeBucketFromTour = async (bucketId: string) => {
  const { data, error } = await supabase
    .from('ticket_buckets')
    .update({ tour_id: null })
    .eq('id', bucketId)
    .select();
  
  if (error) {
    console.error("Error removing bucket from tour:", error);
    throw error;
  }
  
  return data;
};
