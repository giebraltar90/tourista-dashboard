
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Updates the UI with optimistic updates and handles success/failure messaging
 */
export const handleUIUpdates = async (
  tourId: string,
  queryClient: QueryClient,
  actualGuideId: string | undefined,
  guideName: string,
  updateSuccess: boolean
): Promise<void> => {
  // Show success/error messages
  if (updateSuccess) {
    // Show a success message with proper guide name
    if (actualGuideId) {
      toast.success(`Guide ${guideName} assigned to group successfully`);
    } else {
      toast.success("Guide removed from group successfully");
    }
  } else {
    toast.error("Failed to update guide assignment on the server");
    
    // Force a fresh refetch to ensure UI is accurate despite the failed update
    queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
  }
};
