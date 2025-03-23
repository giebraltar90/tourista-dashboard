
import { updateTourGroups } from "@/services/ventrataApi";
import { useModifications } from "./useModifications";
import { useTourById } from "./useTourData";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook for restoring a tour to its initial state
 */
export const useRestoreTour = (tourId: string) => {
  const { data: tour, refetch } = useTourById(tourId);
  const { addModification } = useModifications(tourId);
  const queryClient = useQueryClient();

  /**
   * Restore the tour to its initial default state
   */
  const restoreToInitial = async () => {
    try {
      if (!tour) throw new Error("Tour not found");

      // Create initial tour groups with no assigned guides
      const initialTourGroups = tour.tourGroups.map(group => ({
        ...group,
        guideId: undefined,
        name: group.name.replace(/^.+'s Group$/, 'Group')
      }));

      // Update the tour groups
      await updateTourGroups(tourId, initialTourGroups);

      // Record this modification
      addModification({
        description: "Tour restored to initial version",
        details: {
          type: "tour_restore",
          action: "restore_initial"
        }
      });

      // Force invalidate all tour-related queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });

      // Immediately refetch tour data with fresh data from server
      await refetch();
      
      // Add a small delay before refresh to ensure the UI updates
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['tours'] });
        queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      }, 300);

      toast.success("Tour restored to initial state");
      return true;
    } catch (error) {
      console.error("Error restoring tour:", error);
      toast.error("Failed to restore tour to initial state");
      throw error;
    }
  };

  return { restoreToInitial };
};
