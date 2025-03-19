
import { useState } from "react";
import { TourModification, VentrataTour } from "@/types/ventrata";
import { useTourById } from "./useTourData";
import { updateTourModification } from "@/services/ventrataApi";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export const useModifications = (tourId: string) => {
  const { data: tour, refetch } = useTourById(tourId);
  const [isAddingModification, setIsAddingModification] = useState(false);
  
  const addModification = async (description: string, details?: Record<string, any>) => {
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
      
      // Update the tour with new modifications
      const result = await updateTourModification(tourId, updatedModifications);
      
      if (result) {
        // Refetch to update UI
        await refetch();
        toast.success("Modification recorded successfully");
      }
      
      return true;
    } catch (error) {
      console.error("Error adding modification:", error);
      toast.error("Failed to record modification");
      return false;
    } finally {
      setIsAddingModification(false);
    }
  };
  
  return { 
    modifications: tour?.modifications || [],
    addModification,
    isAddingModification
  };
};
