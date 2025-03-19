
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
            .maybeSingle();
          
          if (error) {
            console.error("Error fetching from Supabase:", error);
          } else if (tour) {
            console.log("Found tour data in Supabase:", tour);
            console.log("is_high_season value:", tour.is_high_season, "type:", typeof tour.is_high_season);
            
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
              tourGroups: tour.tour_groups ? tour.tour_groups.map(group => ({
                id: group.id,
                name: group.name,
                size: group.size,
                entryTime: group.entry_time,
                childCount: group.child_count || 0,
                guideId: group.guide_id
              })) : [],
              numTickets: tour.num_tickets || 0,
              isHighSeason: tour.is_high_season === true
            };
          }
        }
        
        // If not found in Supabase or if it's not a UUID, fall back to the API/mock data
        const tourData = await fetchTourById(tourId);
        console.log("Found tour data from API/mock:", tourData);
        
        if (!tourData) return null;
        
        // Ensure isHighSeason is properly converted to boolean 
        tourData.isHighSeason = tourData.isHighSeason === true;
        console.log("isHighSeason after conversion:", tourData.isHighSeason);
        
        return tourData;
      } catch (error) {
        console.error("Error in useTourById:", error);
        throw error;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000,    // 60 minutes cache time
    enabled: !!tourId,         // Only run the query if tourId is provided
  });
};
