
import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

// Type aliases for better readability
export type GuideType = Database["public"]["Enums"]["guide_type"];
export type TourType = Database["public"]["Enums"]["tour_type"];
export type ModificationStatus = Database["public"]["Enums"]["modification_status"];

/**
 * Create a mapping of guide names to their IDs
 */
export const createGuideIdMap = (guides: Array<{ name: string, id: string }>) => {
  return Object.fromEntries(
    guides.map(guide => [guide.name, guide.id]) || []
  );
};

/**
 * Clear all test data from the database
 */
export const clearAllTestData = async () => {
  console.log("Clearing all test data...");

  // Delete in reverse order of dependencies
  const tables = ['participants', 'modifications', 'tour_groups', 'tours', 'guides'];
  
  for (const table of tables) {
    const { error } = await supabase
      .from(table as any)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
      
    if (error) {
      console.error(`Error clearing ${table}:`, error);
      throw error;
    }
  }
  
  return true;
};

