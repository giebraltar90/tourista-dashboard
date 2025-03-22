
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { updateTicketBucket } from "@/services/api/ticketBucketService";
import { toast } from "sonner";

export interface UpdateBucketParams {
  reference_number: string;
  bucket_type: 'petit' | 'grande';
  max_tickets: number;
  tickets_range: string;
  access_time: string | null;
}

export function useTicketBucketService() {
  const queryClient = useQueryClient();
  
  const handleUpdateBucket = async (bucketId: string, updateParams: UpdateBucketParams) => {
    try {
      await updateTicketBucket(bucketId, updateParams);
      
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['ticketBuckets'] });
      queryClient.invalidateQueries({ queryKey: ['availableBuckets'] });
      
      toast.success("Ticket bucket updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating bucket:", error);
      toast.error("Failed to update ticket bucket");
      return false;
    }
  };
  
  return {
    handleUpdateBucket
  };
}
