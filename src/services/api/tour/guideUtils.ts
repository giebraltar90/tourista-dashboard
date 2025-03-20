
import { supabase } from "@/integrations/supabase/client";

/**
 * UUID validation helper
 * Used to determine whether a value is a UUID
 */
export const isUuid = (id: string): boolean => {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

/**
 * Get guide names from their IDs
 */
export const getGuideNames = async (guideIds: string[]) => {
  if (!guideIds.length) return {};
  
  const validIds = guideIds.filter(id => id && isUuid(id));
  
  if (!validIds.length) return {};
  
  const { data, error } = await supabase
    .from('guides')
    .select('id, name')
    .in('id', validIds);
    
  if (error || !data) {
    console.error("Error fetching guide names:", error);
    return {};
  }
  
  return data.reduce((map, guide) => {
    map[guide.id] = guide.name;
    return map;
  }, {});
};

/**
 * Enrich tour data with guide names
 */
export const enrichToursWithGuideNames = async (tours) => {
  if (!tours || !tours.length) return tours;
  
  // Collect all guide IDs to fetch their names
  const guideIds = new Set<string>();
  tours.forEach(tour => {
    // Handle standard guide references
    if (tour.guide1 && isUuid(tour.guide1)) guideIds.add(tour.guide1);
    if (tour.guide2 && isUuid(tour.guide2)) guideIds.add(tour.guide2);
    if (tour.guide3 && isUuid(tour.guide3)) guideIds.add(tour.guide3);
    
    // Also collect guide IDs from tour groups
    if (tour.tourGroups && Array.isArray(tour.tourGroups)) {
      tour.tourGroups.forEach(group => {
        if (group.guideId && isUuid(group.guideId)) {
          guideIds.add(group.guideId);
        }
      });
    }
  });
  
  // Get guide names
  const guideNames = await getGuideNames(Array.from(guideIds));
  
  // Replace guide IDs with guide names
  return tours.map(tour => {
    const enrichedTour = {
      ...tour,
      guide1: guideNames[tour.guide1] || tour.guide1,
      guide2: guideNames[tour.guide2] || tour.guide2,
      guide3: guideNames[tour.guide3] || tour.guide3
    };
    
    // Also enrich tour groups if they exist
    if (enrichedTour.tourGroups && Array.isArray(enrichedTour.tourGroups)) {
      enrichedTour.tourGroups = enrichedTour.tourGroups.map(group => {
        if (group.guideId && isUuid(group.guideId) && guideNames[group.guideId]) {
          // Create a new object to avoid mutation
          return {
            ...group,
            guideName: guideNames[group.guideId]
          };
        }
        return group;
      });
    }
    
    return enrichedTour;
  });
};
