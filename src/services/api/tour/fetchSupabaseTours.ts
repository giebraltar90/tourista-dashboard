
import { TourCardProps } from "@/components/tours/tour-card/types";
import { supabase } from "@/integrations/supabase/client";
import { isValidUuid } from "@/services/api/utils/guidesUtils";

/**
 * Fetch tours from Supabase
 */
export const fetchToursFromSupabase = async (params?: {
  startDate?: string;
  endDate?: string;
  location?: string;
}): Promise<TourCardProps[]> => {
  // Build query
  let query = supabase
    .from('tours')
    .select(`
      id, date, location, tour_name, tour_type, start_time, 
      reference_code, guide1_id, guide2_id, guide3_id, 
      num_tickets, is_high_season,
      tour_groups (id, name, size, entry_time, guide_id, child_count)
    `)
    .order('date', { ascending: true });

  // Add filters if provided
  if (params?.location) {
    query = query.eq('location', params.location);
  }
  
  if (params?.startDate) {
    query = query.gte('date', params.startDate);
  }
  
  if (params?.endDate) {
    query = query.lte('date', params.endDate);
  }
    
  const { data: supabaseTours, error } = await query;
    
  if (error) {
    console.error("Error fetching tours from Supabase:", error);
    throw error;
  }
  
  if (!supabaseTours || supabaseTours.length === 0) {
    console.log("No tours found in Supabase");
    return [];
  }
  
  console.log("Raw Supabase tours data:", supabaseTours);
  
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
  
  // Create a mapping of guide IDs to guide names
  let guideMap: Record<string, string> = {};
  
  if (guideIds.size > 0) {
    const guideIdsArray = Array.from(guideIds);
    const { data: guides, error: guidesError } = await supabase
      .from('guides')
      .select('id, name')
      .in('id', guideIdsArray);
      
    if (guidesError) {
      console.error("Error fetching guides:", guidesError);
    } else if (guides && guides.length > 0) {
      guideMap = guides.reduce((map, guide) => {
        map[guide.id] = guide.name;
        return map;
      }, {} as Record<string, string>);
      
      console.log("Guide map for resolving names:", guideMap);
    }
  }
  
  // Transform the Supabase data to match our TourCardProps structure
  const transformedTours = supabaseTours.map(tour => {
    // Use guideMap to resolve guide names from IDs
    const guide1 = tour.guide1_id && guideMap[tour.guide1_id] ? guideMap[tour.guide1_id] : tour.guide1_id || "";
    const guide2 = tour.guide2_id && guideMap[tour.guide2_id] ? guideMap[tour.guide2_id] : tour.guide2_id || "";
    const guide3 = tour.guide3_id && guideMap[tour.guide3_id] ? guideMap[tour.guide3_id] : tour.guide3_id || "";
    
    // Transform tour groups
    const tourGroups = Array.isArray(tour.tour_groups) ? tour.tour_groups.map(group => {
      const guideName = group.guide_id && guideMap[group.guide_id] ? guideMap[group.guide_id] : undefined;
      
      return {
        id: group.id,
        name: group.name || "",
        size: group.size || 0,
        entryTime: group.entry_time || "",
        childCount: group.child_count || 0,
        guideId: group.guide_id || undefined,
        guideName,
        participants: []  // Initialize with empty array; participants are fetched separately
      };
    }) : [];
    
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
      tourGroups,
      numTickets: tour.num_tickets || 0,
      isHighSeason: tour.is_high_season === true
    };
  });
  
  console.log("Transformed tours with guide names:", transformedTours);
  return transformedTours;
};
