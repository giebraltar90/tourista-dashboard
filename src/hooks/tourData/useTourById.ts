
import { useQuery } from "@tanstack/react-query";
import { fetchTourById } from "@/services/ventrataApi";
import { supabase } from "@/integrations/supabase/client";
import { isUuid } from "@/types/ventrata";

export const useTourById = (tourId: string) => {
  console.log("useTourById called with ID:", tourId);
  
  return useQuery({
    queryKey: ['tour', tourId],
    queryFn: async () => {
      console.log("Fetching tour data for ID:", tourId);
      
      try {
        // First, validate tourId to avoid unnecessary DB calls
        if (!tourId || tourId.trim() === '') {
          console.log("Invalid tour ID provided");
          return null;
        }
        
        // Try to fetch from Supabase first if it's a UUID
        if (isUuid(tourId)) {
          console.log("Attempting to fetch from Supabase for UUID:", tourId);
          
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
            throw error;
          }
          
          if (tour) {
            console.log("Found tour data in Supabase:", tour);
            console.log("is_high_season value:", tour.is_high_season, "type:", typeof tour.is_high_season);
            
            // Now also fetch guide names for each guide ID
            const guideIds = [tour.guide1_id, tour.guide2_id, tour.guide3_id].filter(Boolean);
            let guideMap = {};
            
            if (guideIds.length > 0) {
              const guidesResult = await supabase
                .from('guides')
                .select('id, name')
                .in('id', guideIds);
              
              console.log("Guides result:", guidesResult);
              
              // Create a map of guide IDs to names
              if (!guidesResult.error && guidesResult.data) {
                guidesResult.data.forEach(guide => {
                  guideMap[guide.id] = guide.name;
                });
              }
            }
            
            // Ensure tour_groups is an array, even if null
            const tourGroups = Array.isArray(tour.tour_groups) 
              ? tour.tour_groups 
              : [];
            
            // Transform to application format with guide names instead of IDs
            return {
              id: tour.id,
              date: new Date(tour.date),
              location: tour.location,
              tourName: tour.tour_name,
              tourType: tour.tour_type,
              startTime: tour.start_time,
              referenceCode: tour.reference_code,
              guide1: guideMap[tour.guide1_id] || tour.guide1_id || "",
              guide2: guideMap[tour.guide2_id] || tour.guide2_id || "",
              guide3: guideMap[tour.guide3_id] || tour.guide3_id || "",
              tourGroups: tourGroups.map(group => ({
                id: group.id,
                name: group.name,
                size: group.size,
                entryTime: group.entry_time,
                childCount: group.child_count || 0,
                guideId: group.guide_id
              })),
              numTickets: tour.num_tickets || 0,
              // Critical fix: normalize the boolean value to ensure consistent behavior
              isHighSeason: Boolean(tour.is_high_season)
            };
          }
        }
        
        // If not found in Supabase or if it's not a UUID, fall back to the API/mock data
        console.log("Falling back to API/mock data");
        const tourData = await fetchTourById(tourId);
        console.log("Found tour data from API/mock:", tourData);
        
        if (!tourData) return null;
        
        // Normalize isHighSeason to ensure consistent behavior
        tourData.isHighSeason = Boolean(tourData.isHighSeason);
        console.log("isHighSeason after conversion:", tourData.isHighSeason);
        
        // Make sure tourGroups exists and is an array
        if (!tourData.tourGroups) {
          tourData.tourGroups = [];
        }
        
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
