
import { useQuery } from "@tanstack/react-query";
import { fetchTourById } from "@/services/ventrataApi";
import { mockTours } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";

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
          }
        }
        
        // For mock IDs or fallback, use mock data
        const tourData = mockTours.find(tour => tour.id === tourId);
        console.log("Found tour data:", tourData);
        
        if (!tourData) return null;
        
        // Create a deep copy of the tour data to prevent mutations
        const cleanedTourData = JSON.parse(JSON.stringify(tourData));
        
        // Ensure isHighSeason is properly converted to boolean using double negation
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
        return null;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000,    // 60 minutes cache time
    enabled: !!tourId,         // Only run the query if tourId is provided
  });
};
