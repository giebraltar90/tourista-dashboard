
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TourCardProps } from "@/components/tours/tour-card/types";

export const useAssignGuide = (tourOrId: TourCardProps | string, onSuccess?: () => void) => {
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  // Function to get tour ID based on the input
  const getTourId = () => {
    if (typeof tourOrId === 'string') {
      return tourOrId;
    }
    return tourOrId.id;
  };

  const assignGuide = async (groupIdOrIndex: string | number, guideId: string) => {
    const tourId = getTourId();
    
    // Convert groupIndex to string for database operations if needed
    const groupId = typeof groupIdOrIndex === 'number' 
      ? String(groupIdOrIndex) // This is for backward compatibility
      : groupIdOrIndex;
    
    if (!tourId || !groupId) {
      setAssignmentError("Missing required data");
      return false;
    }

    setIsAssigning(true);
    setAssignmentError(null);

    try {
      console.log("Assigning guide to group:", {
        tourId,
        groupId,
        guideId: guideId === "_none" ? null : guideId
      });

      // Update the group with the new guide
      const { error } = await supabase
        .from("tour_groups")
        .update({ guide_id: guideId === "_none" ? null : guideId })
        .eq("id", groupId);

      if (error) {
        console.error("Error assigning guide:", error);
        setAssignmentError(error.message);
        toast.error("Error assigning guide: " + error.message);
        return false;
      }

      if (onSuccess) {
        onSuccess();
      }

      toast.success(
        guideId === "_none" 
          ? "Guide has been removed from this group"
          : "Guide has been assigned to this group"
      );

      return true;
    } catch (err) {
      const error = err as Error;
      console.error("Error in guide assignment:", error);
      setAssignmentError(error.message);
      toast.error("Error assigning guide: " + error.message);
      return false;
    } finally {
      setIsAssigning(false);
    }
  };

  return {
    assignGuide,
    isAssigning,
    assignmentError,
  };
};
