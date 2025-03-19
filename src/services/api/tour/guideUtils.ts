
import { isUuid } from "@/types/ventrata";
import { supabase } from "@/integrations/supabase/client";

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
  
  // Collect guide IDs to fetch their names
  const guideIds = new Set<string>();
  tours.forEach(tour => {
    if (tour.guide1 && isUuid(tour.guide1)) guideIds.add(tour.guide1);
    if (tour.guide2 && isUuid(tour.guide2)) guideIds.add(tour.guide2);
    if (tour.guide3 && isUuid(tour.guide3)) guideIds.add(tour.guide3);
  });
  
  // Get guide names
  const guideNames = await getGuideNames(Array.from(guideIds));
  
  // Replace guide IDs with guide names
  return tours.map(tour => ({
    ...tour,
    guide1: guideNames[tour.guide1] || tour.guide1,
    guide2: guideNames[tour.guide2] || tour.guide2,
    guide3: guideNames[tour.guide3] || tour.guide3
  }));
};
