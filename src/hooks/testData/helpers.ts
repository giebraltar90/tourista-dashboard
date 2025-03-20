
import { supabase } from "@/integrations/supabase/client";
import { isValidUuid } from "@/services/api/utils/guidesUtils";

export type GuideType = "GA Free" | "GA Ticket" | "GC";
export type TourType = "default" | "food" | "private" | "custom";

/**
 * Creates a map of guide names to their IDs
 */
export const createGuideIdMap = (guides: Array<{ id: string; name: string }>) => {
  console.log("Creating guide ID map from guides:", guides);
  
  // Validate that all guide IDs are valid UUIDs
  const validGuides = guides.filter(guide => isValidUuid(guide.id));
  const invalidGuides = guides.filter(guide => !isValidUuid(guide.id));
  
  if (invalidGuides.length > 0) {
    console.error("Found invalid guide IDs:", invalidGuides.map(g => ({name: g.name, id: g.id})));
  }
  
  // Create map of guide names to their UUIDs
  const guideMap = validGuides.reduce((map, guide) => {
    map[guide.name] = guide.id;
    return map;
  }, {} as Record<string, string>);
  
  console.log("Created guide ID map:", guideMap);
  return guideMap;
};

/**
 * Clear all test data from the database
 */
export const clearAllTestData = async () => {
  console.log("Clearing all test data...");
  
  // Delete all data in this specific order to avoid foreign key constraints
  await supabase.from('participants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('tour_groups').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('tickets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('modifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('tours').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('guides').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  console.log("All test data cleared");
};
