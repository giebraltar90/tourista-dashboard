
import { supabase } from "@/integrations/supabase/client";

/**
 * Maps guide data to a record of name -> id for easy lookup
 */
export const createGuideIdMap = (
  guides: Array<{id: string; name: string}>
): Record<string, string> => {
  return guides.reduce((acc, guide) => {
    acc[guide.name] = guide.id;
    return acc;
  }, {} as Record<string, string>);
};

/**
 * Clears all test data from the database
 */
export const clearAllTestData = async (): Promise<void> => {
  console.log("Clearing all test data...");
  
  // Delete in order to respect foreign key constraints
  await supabase.from('participants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('tickets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('modifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('tour_groups').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('tours').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('guides').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  console.log("Test data cleared successfully");
};
