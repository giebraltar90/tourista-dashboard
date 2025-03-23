
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { isValidUuid } from "@/services/api/utils/guidesUtils";

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
    
    // Reset state
    setIsAssigning(true);
    setAssignmentError(null);
    
    try {
      console.log("Assigning guide to group:", {
        tourId,
        groupIdOrIndex,
        guideId
      });
      
      // If we're dealing with a numerical index, we need to find the actual group ID
      // This assumes that tourGroups[groupIdOrIndex] exists
      let actualGroupId: string;
      
      if (typeof groupIdOrIndex === 'number') {
        // Fetch the current tour groups to find the correct ID from the index
        const { data: tourData, error: tourError } = await supabase
          .from("tours")
          .select("tour_groups(id)")
          .eq("id", tourId)
          .single();
          
        if (tourError) {
          console.error("Error fetching tour groups:", tourError);
          setAssignmentError("Failed to fetch tour groups: " + tourError.message);
          toast.error("Error fetching tour groups");
          return false;
        }
        
        if (!tourData?.tour_groups || !Array.isArray(tourData.tour_groups) || !tourData.tour_groups[groupIdOrIndex]) {
          console.error("Group index out of bounds or no tour groups found:", groupIdOrIndex);
          setAssignmentError("Invalid group index");
          toast.error("Invalid group index");
          return false;
        }
        
        actualGroupId = tourData.tour_groups[groupIdOrIndex].id;
        console.log(`Resolved group index ${groupIdOrIndex} to group ID ${actualGroupId}`);
      } else {
        // If we already have a string ID, use it directly
        actualGroupId = groupIdOrIndex;
      }
      
      // Process the guide ID - special handling for the "unassign" case
      const finalGuideId = guideId === "_none" ? null : guideId;
      
      console.log("Making Supabase update with:", {
        tourId,
        groupId: actualGroupId,
        guideId: finalGuideId
      });
      
      // Update the guide assignment in the database
      const { error } = await supabase
        .from("tour_groups")
        .update({ 
          guide_id: finalGuideId
        })
        .eq("id", actualGroupId)
        .eq("tour_id", tourId);
        
      if (error) {
        console.error("Error assigning guide:", error);
        setAssignmentError(error.message);
        toast.error("Error assigning guide: " + error.message);
        return false;
      }
      
      // Update the group name to reflect the guide assignment
      if (finalGuideId) {
        // If we're assigning a guide, try to find the guide's name
        const { data: guideData } = await supabase
          .from("guides")
          .select("name")
          .eq("id", finalGuideId)
          .maybeSingle();
          
        if (guideData?.name) {
          // If we found the guide's name, update the group name
          const groupName = `Group ${(groupIdOrIndex as number) + 1} (${guideData.name})`;
          await supabase
            .from("tour_groups")
            .update({ name: groupName })
            .eq("id", actualGroupId);
        }
      } else {
        // If we're removing a guide, update the group name to the default
        const groupName = `Group ${(groupIdOrIndex as number) + 1}`;
        await supabase
          .from("tour_groups")
          .update({ name: groupName })
          .eq("id", actualGroupId);
      }

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Show success toast
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
