
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { checkGuideAvailability } from "./utils/guideAssignmentValidation";

export const useAssignGuide = (tour: TourCardProps, onSuccess?: () => void) => {
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  const assignGuide = async (groupId: string, guideId: string) => {
    if (!tour || !tour.id || !groupId) {
      setAssignmentError("Missing required data");
      return false;
    }

    setIsAssigning(true);
    setAssignmentError(null);

    try {
      // First, check if the guide is available for this tour's date and time
      const { available, conflictingTour } = await checkGuideAvailability(
        tour.id,
        tour.date,
        tour.startTime, // Use startTime, not start_time
        guideId
      );

      if (!available && conflictingTour) {
        const errorMsg = `This guide is already assigned to another tour on ${
          new Date(tour.date).toLocaleDateString()
        } at ${tour.startTime}`;
        
        setAssignmentError(errorMsg);
        toast({
          title: "Guide unavailable",
          description: errorMsg,
          variant: "destructive",
        });
        setIsAssigning(false);
        return false;
      }

      // Update the group with the new guide
      const { error } = await supabase
        .from("tour_groups")
        .update({ guide_id: guideId === "_none" ? null : guideId })
        .eq("id", groupId);

      if (error) {
        console.error("Error assigning guide:", error);
        setAssignmentError(error.message);
        toast({
          title: "Error assigning guide",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      if (onSuccess) {
        onSuccess();
      }

      toast({
        title: "Guide assigned",
        description: guideId === "_none" 
          ? "Guide has been removed from this group"
          : "Guide has been assigned to this group",
      });

      return true;
    } catch (err) {
      const error = err as Error;
      console.error("Error in guide assignment:", error);
      setAssignmentError(error.message);
      toast({
        title: "Error assigning guide",
        description: error.message,
        variant: "destructive",
      });
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
