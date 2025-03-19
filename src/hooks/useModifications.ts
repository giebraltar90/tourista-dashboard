
import { useState, useCallback, useEffect } from "react";
import { TourModification, VentrataTour } from "@/types/ventrata";
import { useTourById } from "./useTourData";
import { updateTourModification } from "@/services/ventrataApi";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
        return {
          ...oldData,
          modifications: updatedModifications
        };
      });
      
      try {
        // Try to store in Supabase if available - handle the fact that tour_id might not be a UUID
        if (tourId.startsWith('tour-')) {
          // This is a mock ID, use API fallback
          console.log("Using API fallback for modification with mock ID:", tourId);
          await updateTourModification(tourId, updatedModifications);
        } else {
          const { error } = await supabase
            .from('modifications')
            .insert({
              tour_id: tourId,
              description: description,
              details: details || {},
              status: 'complete',
            });
          
          if (error) {
            console.warn("Failed to store modification in database:", error);
            // Fall back to API call
            await updateTourModification(tourId, updatedModifications);
          }
        }
      } catch (err) {
        console.warn("Database error, falling back to API:", err);
        // Fall back to API call
        await updateTourModification(tourId, updatedModifications);
      }
      
      toast.success("Modification recorded successfully");
      
      // Force a refetch to ensure we have the latest data, but delay it to avoid flickering
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      }, 500);
      
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
