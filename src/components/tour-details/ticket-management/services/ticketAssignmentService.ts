
import { assignBucketToTour, removeBucketFromTour } from "@/services/api/tourTicketService";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Hook that provides functions to handle ticket bucket assignments
 */
export const useTicketAssignmentService = () => {
  const queryClient = useQueryClient();

  /**
   * Assign a ticket bucket to a tour
   */
  const handleAssignBucket = async (bucketId: string, tourId: string) => {
    try {
      await assignBucketToTour(bucketId, tourId);
      
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['ticketBuckets', tourId] });
      queryClient.invalidateQueries({ queryKey: ['availableBuckets'] });
      
      toast.success("Ticket bucket assigned successfully");
      return true;
    } catch (error) {
      console.error("Error assigning bucket:", error);
      toast.error("Failed to assign ticket bucket");
      return false;
    }
  };

  /**
   * Remove a ticket bucket assignment from a tour
   */
  const handleRemoveBucket = async (bucketId: string, tourId: string) => {
    try {
      await removeBucketFromTour(bucketId);
      
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['ticketBuckets', tourId] });
      queryClient.invalidateQueries({ queryKey: ['availableBuckets'] });
      
      toast.success("Ticket bucket removed from tour");
      return true;
    } catch (error) {
      console.error("Error removing bucket:", error);
      toast.error("Failed to remove ticket bucket");
      return false;
    }
  };

  return {
    handleAssignBucket,
    handleRemoveBucket
  };
};
