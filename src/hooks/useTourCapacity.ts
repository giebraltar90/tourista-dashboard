
import { useTourById } from "./useTourData";
import { updateTourCapacity } from "@/services/ventrataApi";
import { toast } from "sonner";
import { useModifications } from "./useModifications";

/**
 * Hook for managing tour capacity
 */
export const useTourCapacity = (tourId: string) => {
  const { data: tour, refetch } = useTourById(tourId);
  const { addModification } = useModifications(tourId);
  
  /**
   * Update the capacity of a tour
   */
  const updateCapacity = async (newCapacity: number) => {
    try {
      if (!tour) {
        toast.error("Tour not found");
        return false;
      }
      
      if (newCapacity < 0) {
        toast.error("Capacity cannot be negative");
        return false;
      }
      
      // Use numTickets for capacity if capacity property doesn't exist
      const oldCapacity = tour.numTickets || 0;
      
      // Check if there's any actual change
      if (oldCapacity === newCapacity) {
        toast.info("Capacity is already set to this value");
        return true;
      }
      
      // Update the high season flag (which affects capacity)
      // Use a boolean parameter for updateTourCapacity
      await updateTourCapacity(tourId, Boolean(newCapacity > oldCapacity));
      
      // Record the modification
      await addModification({
        description: `Tour capacity changed from ${oldCapacity} to ${newCapacity}`,
        details: {
          type: "capacity_update",
          oldCapacity,
          newCapacity,
          updatedAt: new Date().toISOString()
        }
      });
      
      // Refetch tour data to update UI
      await refetch();
      
      toast.success(`Tour capacity updated to ${newCapacity}`);
      return true;
    } catch (error) {
      console.error("Error updating tour capacity:", error);
      toast.error("Failed to update tour capacity");
      return false;
    }
  };
  
  /**
   * Calculate current capacity usage for a tour
   */
  const calculateCapacityUsage = () => {
    if (!tour || !tour.tourGroups) return { total: 0, percentage: 0 };
    
    const total = tour.tourGroups.reduce((sum, group) => sum + group.size, 0);
    const capacity = tour.numTickets || 0; // Use numTickets instead of capacity
    const percentage = capacity > 0 ? Math.round((total / capacity) * 100) : 0;
    
    return { total, capacity, percentage };
  };
  
  return {
    updateCapacity,
    calculateCapacityUsage,
    tourCapacity: tour?.numTickets || 0 // Use numTickets instead of capacity
  };
};
