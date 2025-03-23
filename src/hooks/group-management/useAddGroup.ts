
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTourGroups } from "@/services/api/tourApi";
import { VentrataTourGroup } from "@/types/ventrata";
import { toast } from "sonner";
import { useModifications } from "@/hooks/useModifications";
import { v4 as uuidv4 } from "uuid";

export const useAddGroup = (tourId: string, existingGroups: VentrataTourGroup[] = []) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { addModification } = useModifications(tourId);

  // Function to generate a new group name based on the sequential group number
  const generateGroupName = () => {
    const groupCount = existingGroups.length;
    return `Group ${groupCount + 1}`;
  };

  // Function to determine default entry time based on other groups
  const determineDefaultEntryTime = () => {
    // Default to 9:00 if no other groups
    if (!existingGroups.length) return "9:00";

    // Use the most common entry time
    const entryTimes = existingGroups.map(g => g.entryTime);
    if (entryTimes.length === 0) return "9:00";

    // Count occurrences of each entry time
    const counts = entryTimes.reduce((acc, time) => {
      acc[time] = (acc[time] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Find the most common entry time
    const mostCommonTime = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0][0];

    return mostCommonTime;
  };

  // Mutation to add a new group
  const addGroupMutation = useMutation({
    mutationFn: async (newGroup: VentrataTourGroup) => {
      setIsLoading(true);
      try {
        // Create the updated groups array
        const updatedGroups = [...existingGroups, newGroup];

        // Call the API to update tour groups
        await updateTourGroups(tourId, updatedGroups);

        // Record this modification
        addModification({
          description: `Added new group: ${newGroup.name}`,
          details: {
            type: "group_management",
            action: "add_group",
            groupName: newGroup.name
          }
        });

        return true;
      } catch (error) {
        console.error("Error adding group:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      // Invalidate tour data queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ["tour", tourId] });
      toast.success("Group added successfully");
    },
    onError: (error) => {
      console.error("Failed to add group:", error);
      toast.error("Failed to add group");
    }
  });

  // Function to add a new group
  const addGroup = async (data: { name?: string; entryTime?: string; guideId?: string }) => {
    const name = data.name || generateGroupName();
    
    // Create a new group with a generated UUID for the id
    const newGroup: VentrataTourGroup = {
      id: uuidv4(), // Generate a UUID for the new group
      name: name,
      entryTime: data.entryTime || determineDefaultEntryTime(),
      size: 0, // No participants initially
      childCount: 0,
      guideId: data.guideId,
      participants: [] // Initialize with empty participants array
    };

    return addGroupMutation.mutate(newGroup);
  };

  return {
    addGroup,
    isLoading: isLoading || addGroupMutation.isPending
  };
};
