
import { useState, useCallback, useEffect } from "react";
import { TourModification } from "@/types/ventrata";
import { useTourById } from "./useTourData";
import { updateTourModification } from "@/services/ventrataApi";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useQueryClient } from "@tanstack/react-query";

export const useModifications = (tourId: string) => {
  const { data: tour } = useTourById(tourId);
  const [isAddingModification, setIsAddingModification] = useState(false);
  const queryClient = useQueryClient();
  
  // For debugging - log modifications whenever tour data changes
  useEffect(() => {
    if (tour) {
      console.log("Tour data in useModifications:", tour);
      console.log("Modifications from tour data:", tour.modifications || []);
    }
  }, [tour]);
  
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
      
      console.log("Adding modification:", newModification);
      console.log("Existing modifications:", existingModifications);
      console.log("Updated modifications:", updatedModifications);
      
      // Optimistically update the tour in the query cache immediately
      queryClient.setQueryData(['tour', tourId], (oldData: any) => {
        if (!oldData) return null;
        const updatedTour = {
          ...oldData,
          modifications: updatedModifications
        };
        console.log("Optimistically updated tour with new modifications:", updatedTour);
        return updatedTour;
      });
      
      // Store the modification using the API
      await updateTourModification(tourId, {
        description,
        details
      });
      
      toast.success("Modification recorded successfully");
      
      // Schedule a delayed refetch to ensure we have the latest data
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      }, 1000);
      
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
