
import { useQuery } from "@tanstack/react-query";
import { fetchTourById } from "@/services/ventrataApi";
import { mockTours } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { isUuid } from "@/types/ventrata";

export const useTourById = (tourId: string) => {
  console.log("useTourById called with ID:", tourId);
  
  return useQuery({
    queryKey: ['tour', tourId],
    queryFn: async () => {
      console.log("Fetching tour data for ID:", tourId);
      
      try {
        // Try to fetch from Supabase first if it's a UUID
        if (isUuid(tourId)) {
          const { data: tour, error } = await supabase
            .from('tours')
            .select(`
              id, date, location, tour_name, tour_type, start_time, 
              reference_code, guide1_id, guide2_id, guide3_id, 
              num_tickets, is_high_season,
              tour_groups (id, name, size, entry_time, guide_id, child_count)
            `)
            .eq('id', tourId)
            .single();
          
          if (error) {
            console.error("Error fetching from Supabase:", error);
          } else if (tour) {
            console.log("Found tour data in Supabase:", tour);
            
            // Transform Supabase data structure to match our app's expected format
            return {
              id: tour.id,
              date: new Date(tour.date),
              location: tour.location,
              tourName: tour.tour_name,
              tourType: tour.tour_type,
              startTime: tour.start_time,
              referenceCode: tour.reference_code,
              guide1: tour.guide1_id || "",
              guide2: tour.guide2_id || "",
              guide3: tour.guide3_id || "",
              tourGroups: tour.tour_groups.map(group => ({
                id: group.id,
                name: group.name,
                size: group.size,
                entryTime: group.entry_time,
                childCount: group.child_count || 0,
                guideId: group.guide_id
              })),
              numTickets: tour.num_tickets || 0,
              isHighSeason: !!tour.is_high_season // Convert to boolean with double negation
            };
          }
        }
        
        // If not found in Supabase or if it's not a UUID, fall back to the API/mock data
        const tourData = await fetchTourById(tourId);
        console.log("Found tour data from API/mock:", tourData);
        
        if (!tourData) return null;
        
        // Ensure isHighSeason is properly converted to boolean using double negation
        tourData.isHighSeason = !!tourData.isHighSeason;
        
        // Ensure guide IDs are properly set on tour groups to maintain guide assignments
        tourData.tourGroups = tourData.tourGroups.map(group => {
          // If group name clearly indicates a guide, ensure guideId is set appropriately
          if (tourData.guide1 && group.name && group.name.includes(tourData.guide1)) {
            console.log(`Setting guide1 for group ${group.name}`);
            group.guideId = group.guideId || "guide1";
          } else if (tourData.guide2 && group.name && group.name.includes(tourData.guide2)) {
            console.log(`Setting guide2 for group ${group.name}`);
            group.guideId = group.guideId || "guide2";
          } else if (tourData.guide3 && group.name && group.name.includes(tourData.guide3)) {
            console.log(`Setting guide3 for group ${group.name}`);
            group.guideId = group.guideId || "guide3";
          }
          return group;
        });
        
        console.log("Cleaned tour data with isHighSeason:", tourData.isHighSeason);
        console.log("Tour groups after cleaning:", tourData.tourGroups);
        
        return tourData;
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
