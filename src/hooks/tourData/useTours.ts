
import { useQuery } from "@tanstack/react-query";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { supabase } from "@/integrations/supabase/client";
import { isValidUuid } from "@/services/api/utils/guidesUtils";
import { toast } from "sonner";

// Define the options type for the useTours hook
interface UseToursOptions {
  enabled?: boolean;
}

export const useTours = (options: UseToursOptions = {}) => {
  return useQuery({
    queryKey: ["tours"],
    queryFn: async (): Promise<TourCardProps[]> => {
      try {
        console.log("Fetching tours from Supabase");
        
        // Log the Supabase URL and key (partially masked for security)
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hznwikjmwmskvoqgkvjk.supabase.co';
        const keyPrefix = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').substring(0, 10);
        console.log(`Using Supabase URL: ${supabaseUrl}, Key prefix: ${keyPrefix}...`);
        
        const { data: supabaseTours, error } = await supabase
          .from('tours')
          .select(`
            id, date, location, tour_name, tour_type, start_time, 
            reference_code, guide1_id, guide2_id, guide3_id, 
            num_tickets, is_high_season,
            tour_groups (id, name, size, entry_time, guide_id, child_count,
              participants (id, name, count, booking_ref, child_count)
            )
          `)
          .order('date', { ascending: true });
          
        if (error) {
          console.error("Error fetching tours:", error);
          toast.error(`Error fetching tours: ${error.message}`);
          throw error;
        }
        
        if (!supabaseTours || supabaseTours.length === 0) {
          console.log("No tours found, you may need to create test data");
          return [];
        }
        
        console.log("Successfully fetched tours from Supabase:", supabaseTours);
        
        // Collect all guide IDs to fetch them in a single request
        const guideIds = new Set<string>();
        supabaseTours.forEach(tour => {
          if (tour.guide1_id && isValidUuid(tour.guide1_id)) guideIds.add(tour.guide1_id);
          if (tour.guide2_id && isValidUuid(tour.guide2_id)) guideIds.add(tour.guide2_id);
          if (tour.guide3_id && isValidUuid(tour.guide3_id)) guideIds.add(tour.guide3_id);
          
          // Also collect guide IDs from tour groups
          if (tour.tour_groups && Array.isArray(tour.tour_groups)) {
            tour.tour_groups.forEach(group => {
              if (group.guide_id && isValidUuid(group.guide_id)) {
                guideIds.add(group.guide_id);
              }
            });
          }
        });
        
        // Fetch guide names in a single request
        const guideIdsArray = Array.from(guideIds);
        let guideMap = {};
        
        if (guideIdsArray.length > 0) {
          const { data: guides, error: guidesError } = await supabase
            .from('guides')
            .select('id, name')
            .in('id', guideIdsArray);
            
          if (guidesError) {
            console.error("Error fetching guides:", guidesError);
          } else if (guides) {
            guideMap = guides.reduce((map, guide) => {
              map[guide.id] = guide.name;
              return map;
            }, {});
            console.log("Guide map for resolving names:", guideMap);
          }
        }
        
        // Transform the Supabase data to match our TourCardProps structure
        return supabaseTours.map(tour => {
          // Use guideMap to resolve guide names from IDs
          const guide1 = tour.guide1_id && guideMap[tour.guide1_id] ? guideMap[tour.guide1_id] : tour.guide1_id || "";
          const guide2 = tour.guide2_id && guideMap[tour.guide2_id] ? guideMap[tour.guide2_id] : tour.guide2_id || "";
          const guide3 = tour.guide3_id && guideMap[tour.guide3_id] ? guideMap[tour.guide3_id] : tour.guide3_id || "";
          
          return {
            id: tour.id,
            date: new Date(tour.date),
            location: tour.location,
            tourName: tour.tour_name,
            tourType: tour.tour_type,
            startTime: tour.start_time,
            referenceCode: tour.reference_code,
            guide1,
            guide2,
            guide3,
            guide1Id: tour.guide1_id || "",
            guide2Id: tour.guide2_id || "",
            guide3Id: tour.guide3_id || "",
            tourGroups: Array.isArray(tour.tour_groups) ? tour.tour_groups.map(group => ({
              id: group.id,
              name: group.name,
              size: group.size,
              entryTime: group.entry_time,
              childCount: group.child_count || 0,
              guideId: group.guide_id,
              guideName: group.guide_id && guideMap[group.guide_id] ? guideMap[group.guide_id] : undefined,
              participants: Array.isArray(group.participants) ? group.participants.map(p => ({
                id: p.id,
                name: p.name,
                count: p.count,
                bookingRef: p.booking_ref,
                childCount: p.child_count || 0
              })) : []
            })) : [],
            numTickets: tour.num_tickets || 0,
            isHighSeason: tour.is_high_season === true
          };
        });
      } catch (error) {
        console.error("Error fetching tours:", error);
        toast.error("Failed to load tours. Please try again.");
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    // Pass through any options provided
    ...options,
  });
};
