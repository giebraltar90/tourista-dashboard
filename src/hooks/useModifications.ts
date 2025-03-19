
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
        const updatedTour = {
          ...oldData,
          modifications: updatedModifications
        };
        console.log("Optimistically updated tour with new modifications:", updatedTour);
        return updatedTour;
      });
      
      // Try both Supabase and API storage in parallel for maximum reliability
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tourId);
      
      if (isUuid) {
        // For real UUID IDs, use Supabase
        console.log("Storing modification in Supabase for tour:", tourId);
        const { error } = await supabase
          .from('modifications')
          .insert({
            tour_id: tourId,
            description: description,
            details: details || {},
            status: 'complete',
          });
        
        if (error) {
          console.error("Failed to store modification in Supabase:", error);
          // Fall back to API call (even for UUID tours)
          console.log("Falling back to API for modifications");
          // Fix: Pass an object with description and details instead of an array
          await updateTourModification(tourId, {
            description,
            details
          });
        } else {
          console.log("Successfully stored modification in Supabase");
        }
      } else {
        // This is a mock ID, use API fallback
        console.log("Using API fallback for modification with mock ID:", tourId);
        // Fix: Pass an object with description and details instead of an array
        await updateTourModification(tourId, {
          description,
          details
        });
      }
      
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
