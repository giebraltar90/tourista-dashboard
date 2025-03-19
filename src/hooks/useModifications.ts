
import { useState, useCallback } from "react";
import { TourModification, VentrataTour } from "@/types/ventrata";
import { useTourById } from "./useTourData";
import { updateTourModification } from "@/services/ventrataApi";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useQueryClient } from "@tanstack/react-query";

export const useModifications = (tourId: string) => {
  const { data: tour } = useTourById(tourId);
  const [isAddingModification, setIsAddingModification] = useState(false);
  const queryClient = useQueryClient();
  
  const addModification = useCallback(async (description: string, details?: Record<string, any>) => {
    try {
      if (!tour) {
        throw new Error("Tour not found");
      }
      
      setIsAddingModification(true);
      
      // Create the new modification
      const newModification: TourModification = {
        id: uuidv4(),
        date: new Date(),
        user: "Current User", // In a real app, get this from auth
        description,
        status: "complete",
        details
      };
      
      // Get existing modifications or initialize empty array
      const existingModifications = tour.modifications || [];
      
      // Add new modification to the list
      const updatedModifications = [newModification, ...existingModifications];
      
      // Optimistically update the tour in the query cache immediately
      queryClient.setQueryData(['tour', tourId], (oldData: any) => {
        if (!oldData) return null;
        return {
          ...oldData,
          modifications: updatedModifications
        };
      });
      
      // Update the tour with new modifications
      const result = await updateTourModification(tourId, updatedModifications);
      
      if (result) {
        toast.success("Modification recorded successfully");
      }
      
      return true;
    } catch (error) {
      console.error("Error adding modification:", error);
      toast.error("Failed to record modification");
      
      // Revert optimistic update in case of error
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      
      return false;
    } finally {
      setIsAddingModification(false);
    }
  }, [tour, tourId, queryClient]);
  
  return { 
    modifications: tour?.modifications || [],
    addModification,
    isAddingModification
  };
};
