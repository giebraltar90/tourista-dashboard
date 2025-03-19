
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VentrataToursResponse, VentrataTourGroup } from "@/types/ventrata";
import { fetchTours, fetchTourById, updateTourGroups } from "@/services/ventrataApi";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { mockTours } from "@/data/mockData";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Define the options type for the useTours hook
interface UseToursOptions {
  enabled?: boolean;
}

export const useTours = (options: UseToursOptions = {}) => {
  return useQuery({
    queryKey: ["tours"],
    queryFn: async (): Promise<TourCardProps[]> => {
      try {
        // First try to fetch from Supabase
        const { data, error } = await supabase
          .from('tours')
          .select(`
            id, date, location, tour_name, reference_code, start_time, num_tickets, is_high_season,
            tour_type, guide1_id, guide2_id, guide3_id,
            tour_groups (
              id, name, size, entry_time, child_count, guide_id
            )
          `)
          .order('date', { ascending: true });
        
        if (error) {
          console.error("Supabase query error:", error);
          console.log("Falling back to mock data");
          return mockTours;
        }
        
        if (data && data.length > 0) {
          console.log("Received tours from Supabase:", data);
          // Transform Supabase response to our app format
          // Here we would need to transform from snake_case to camelCase
          // For now, just return mock data as placeholder
        }
        
        // If no data or we want to use mock data regardless for development
        console.log("Using mock tour data");
        return mockTours;
      } catch (error) {
        console.error("Error fetching tours:", error);
        return mockTours;
      }
    },
    // Pass through any options provided
    ...options,
  });
};

// Hook for fetching a single tour by ID
export const useTourById = (tourId: string) => {
  console.log("useTourById called with ID:", tourId);
  
  return useQuery({
    queryKey: ['tour', tourId],
    queryFn: async () => {
      console.log("Fetching tour data for ID:", tourId);
      
      try {
        // Check if this is a UUID format ID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tourId);
        
        if (isUuid) {
          // Try to fetch from Supabase for real UUID tour IDs
          const { data, error } = await supabase
            .from('tours')
            .select(`
              id, date, location, tour_name, reference_code, start_time, num_tickets, is_high_season,
              tour_type, guide1_id, guide2_id, guide3_id,
              tour_groups (
                id, name, size, entry_time, child_count, guide_id
              ),
              modifications (
                id, description, details, created_at, status
              )
            `)
            .eq('id', tourId)
            .single();
          
          if (error) {
            console.error("Supabase query error:", error);
            console.log("Falling back to mock data");
          } else if (data) {
            console.log("Received tour from Supabase:", data);
            // Here we would transform from Supabase format to our app format
            // For now, continue to mock data
          }
        }
        
        // For mock IDs or fallback, use mock data
        const tourData = mockTours.find(tour => tour.id === tourId);
        console.log("Found tour data:", tourData);
        
        if (!tourData) return null;
        
        // Create a deep copy of the tour data to prevent mutations
        const cleanedTourData = JSON.parse(JSON.stringify(tourData));
        
        // CRITICAL FIX: Ensure isHighSeason is properly converted to boolean using double negation
        cleanedTourData.isHighSeason = !!cleanedTourData.isHighSeason;
        
        // Ensure guide IDs are properly set on tour groups to maintain guide assignments
        cleanedTourData.tourGroups = cleanedTourData.tourGroups.map(group => {
          // If group name clearly indicates a guide, ensure guideId is set appropriately
          if (cleanedTourData.guide1 && group.name && group.name.includes(cleanedTourData.guide1)) {
            console.log(`Setting guide1 for group ${group.name}`);
            group.guideId = group.guideId || "guide1";
          } else if (cleanedTourData.guide2 && group.name && group.name.includes(cleanedTourData.guide2)) {
            console.log(`Setting guide2 for group ${group.name}`);
            group.guideId = group.guideId || "guide2";
          } else if (cleanedTourData.guide3 && group.name && group.name.includes(cleanedTourData.guide3)) {
            console.log(`Setting guide3 for group ${group.name}`);
            group.guideId = group.guideId || "guide3";
          }
          return group;
        });
        
        console.log("Cleaned tour data with isHighSeason:", cleanedTourData.isHighSeason);
        console.log("Tour groups after cleaning:", cleanedTourData.tourGroups);
        
        return cleanedTourData;
      } catch (error) {
        console.error("Error in useTourById:", error);
        // For critical errors, return null to show an error state
        return null;
      }
    },
    // CRITICAL FIX: Increase staleTime and cacheTime dramatically to reduce unnecessary refetches
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000,    // 60 minutes cache time
    enabled: !!tourId,         // Only run the query if tourId is provided
  });
};

// Hook for updating tour groups
export const useUpdateTourGroups = (tourId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updatedGroups: VentrataTourGroup[]) => {
      console.log("Updating tour groups for:", tourId, updatedGroups);
      try {
        // Check if this is a UUID format ID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tourId);
        
        if (isUuid) {
          // For real UUID IDs, try Supabase
          // This would involve more complex logic to update tour_groups in Supabase
          // For now, just log the attempt
          console.log("Would update tour groups in Supabase here");
        }
        
        // For all cases, still use the API function for now
        return await updateTourGroups(tourId, updatedGroups);
      } catch (error) {
        console.error("Error updating tour groups:", error);
        throw error;
      }
    },
    onMutate: async (updatedGroups) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['tour', tourId] });
      
      // Snapshot previous value
      const previousTour = queryClient.getQueryData(['tour', tourId]);
      
      // Optimistically update with deep clone to avoid mutation issues
      queryClient.setQueryData(['tour', tourId], (oldData: any) => {
        if (!oldData) return null;
        
        // Create a deep copy to avoid mutation issues
        const newData = JSON.parse(JSON.stringify(oldData));
        newData.tourGroups = updatedGroups;
        
        // Ensure guide IDs are preserved
        newData.tourGroups.forEach((group: any) => {
          // Preserve existing guideId if it exists
          if (group.guideId) {
            console.log(`Preserving guide assignment for ${group.name}: ${group.guideId}`);
          }
        });
        
        return newData;
      });
      
      return { previousTour };
    },
    onSuccess: () => {
      // Delay the invalidation to prevent race conditions
      setTimeout(() => {
        // Use setQueryData instead of invalidating to maintain stable references
        queryClient.setQueryData(['tour', tourId], (oldData: any) => {
          if (!oldData) return null;
          const updatedData = JSON.parse(JSON.stringify(oldData));
          console.log("Successfully updated tour groups", updatedData);
          return updatedData;
        });
        
        // Only then schedule a background refetch
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['tours'] });
        }, 5000);
      }, 1000);
      
      toast.success("Tour groups updated successfully");
    },
    onError: (error, _, context) => {
      console.error("Error updating tour groups:", error);
      toast.error("Failed to update tour groups on the server.");
      
      // Revert to previous state on error
      if (context?.previousTour) {
        queryClient.setQueryData(['tour', tourId], context.previousTour);
      }
    },
  });
};

// Function to convert API response to our app's data structure
const transformTours = (response: VentrataToursResponse): TourCardProps[] => {
  return response.data.map(tour => ({
    id: tour.id,
    date: new Date(tour.date), // Convert string to Date if coming from API
    location: tour.location,
    tourName: tour.tourName,
    tourType: tour.tourType,
    startTime: tour.startTime,
    referenceCode: tour.referenceCode,
    guide1: tour.guide1,
    guide2: tour.guide2,
    guide3: tour.guide3,
    tourGroups: tour.tourGroups,
    numTickets: tour.numTickets,
    isHighSeason: Boolean(tour.isHighSeason) // Ensure boolean type with explicit conversion
  }));
};
