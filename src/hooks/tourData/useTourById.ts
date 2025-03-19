
import { useQuery } from "@tanstack/react-query";
import { fetchTourById } from "@/services/api/tourApi";
import { supabase } from "@/integrations/supabase/client";
import { isUuid } from "@/services/api/tour/guideUtils";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { TourModification } from "@/types/ventrata";

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
          
          try {
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
                try {
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
                } catch (guidesError) {
                  console.error("Error fetching guides:", guidesError);
                  // Continue with empty guideMap
                }
              }
              
              // Fetch modifications for this tour
              let modifications = [];
              try {
                const { data: mods, error: modError } = await supabase
                  .from('modifications')
                  .select('*')
                  .eq('tour_id', tourId)
                  .order('created_at', { ascending: false });
                  
                if (!modError && mods) {
                  modifications = mods;
                } else {
                  console.error("Error fetching modifications:", modError);
                }
              } catch (modFetchError) {
                console.error("Error fetching modifications:", modFetchError);
              }
              
              // Ensure tour_groups is an array, even if null
              const tourGroups = Array.isArray(tour.tour_groups) 
                ? tour.tour_groups 
                : [];
              
              // Also fetch guide IDs for each group
              const groupGuideIds = tourGroups
                .map(group => group.guide_id)
                .filter(Boolean);
                
              // Add these to the guide IDs to fetch
              if (groupGuideIds.length > 0) {
                try {
                  const uniqueGuideIds = [...new Set([...guideIds, ...groupGuideIds])];
                  
                  if (uniqueGuideIds.length > guideIds.length) {
                    const additionalGuidesResult = await supabase
                      .from('guides')
                      .select('id, name')
                      .in('id', uniqueGuideIds);
                      
                    if (!additionalGuidesResult.error && additionalGuidesResult.data) {
                      additionalGuidesResult.data.forEach(guide => {
                        guideMap[guide.id] = guide.name;
                      });
                    }
                  }
                } catch (additionalGuidesError) {
                  console.error("Error fetching additional guides:", additionalGuidesError);
                }
              }
              
              // Get participants for each group
              const groupIds = tourGroups.map(group => group.id);
              let participantsMap: {[key: string]: any[]} = {};
              
              if (groupIds.length > 0) {
                try {
                  const { data: participants, error: partError } = await supabase
                    .from('participants')
                    .select('*')
                    .in('group_id', groupIds);
                    
                  if (!partError && participants) {
                    // Group participants by group_id
                    participants.forEach(participant => {
                      const groupId = participant.group_id;
                      if (!participantsMap[groupId]) {
                        participantsMap[groupId] = [];
                      }
                      participantsMap[groupId].push(participant);
                    });
                  } else {
                    console.warn("No participants found or error:", partError);
                  }
                } catch (partFetchError) {
                  console.error("Error fetching participants:", partFetchError);
                }
              }
              
              // Transform to application format with guide names instead of IDs
              const result: TourCardProps = {
                id: tour.id,
                date: new Date(tour.date),
                location: tour.location,
                tourName: tour.tour_name,
                tourType: tour.tour_type || "default",
                startTime: tour.start_time,
                referenceCode: tour.reference_code,
                guide1: guideMap[tour.guide1_id] || tour.guide1_id || "",
                guide2: guideMap[tour.guide2_id] || tour.guide2_id || "",
                guide3: guideMap[tour.guide3_id] || tour.guide3_id || "",
                tourGroups: tourGroups.map(group => ({
                  id: group.id,
                  name: group.name,
                  size: group.size || 0,
                  entryTime: group.entry_time,
                  childCount: group.child_count || 0,
                  guideId: group.guide_id,
                  participants: participantsMap[group.id] || []
                })),
                numTickets: tour.num_tickets || 0,
                // Critical fix: normalize the boolean value to ensure consistent behavior
                isHighSeason: Boolean(tour.is_high_season),
                // Add the modifications array (transforming from Supabase format to our app format)
                modifications: modifications ? modifications.map(mod => ({
                  id: mod.id,
                  date: new Date(mod.created_at),
                  user: mod.user_id || "System",
                  description: mod.description,
                  status: mod.status || "complete",
                  details: mod.details || {}
                })) : []
              };
              
              return result;
            }
          } catch (supabaseError) {
            console.error("Error in Supabase data flow:", supabaseError);
            // Continue to fallback
          }
        }
        
        // If not found in Supabase or if it's not a UUID, fall back to the API/mock data
        console.log("Falling back to API/mock data");
        
        try {
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
          
          // Make sure modifications exists and is an array
          if (!tourData.modifications) {
            tourData.modifications = [];
          }
          
          // Ensure each group has a participants array
          tourData.tourGroups = tourData.tourGroups.map(group => ({
            ...group,
            participants: Array.isArray(group.participants) ? group.participants : []
          }));
          
          return tourData;
        } catch (apiError) {
          console.error("Error fetching from API:", apiError);
          throw apiError;
        }
      } catch (error) {
        console.error("Error in useTourById:", error);
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds - reduce to get more frequent refreshes
    gcTime: 5 * 60 * 1000,   // 5 minutes cache time
    enabled: Boolean(tourId), // Only run the query if tourId is provided
    retry: 3,                // Retry failed requests up to 3 times
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff with max 10s
  });
};
