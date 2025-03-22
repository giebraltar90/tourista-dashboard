
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if the tour exists in the database
 */
export const checkTourExists = async (tourId: string) => {
  try {
    const { data: tourData, error: tourError } = await supabase
      .from('tours')
      .select('id')
      .eq('id', tourId)
      .single();
      
    if (tourError) {
      console.error("DATABASE DEBUG: Error fetching tour data:", tourError);
      return { exists: false, error: tourError.message };
    }
    
    console.log("DATABASE DEBUG: Found tour with ID:", tourData.id);
    return { exists: true, id: tourData.id };
  } catch (error) {
    console.error("DATABASE DEBUG: Error in checkTourExists:", error);
    return { exists: false, error: String(error) };
  }
};

/**
 * Debug check participants table using direct SQL
 */
export const debugCheckParticipantsTable = async (groupIds: string[]) => {
  try {
    const { data: directCheck, error: directError } = await supabase.rpc(
      'debug_check_participants',
      { group_ids: groupIds }
    ).single();
    
    if (directError) {
      console.error("DATABASE DEBUG: Error in debug_check_participants:", directError);
      return { success: false, error: directError.message };
    } else {
      console.log("DATABASE DEBUG: Direct SQL check result:", directCheck);
      return { success: true, data: directCheck };
    }
  } catch (error) {
    console.error("DATABASE DEBUG: Error in debugCheckParticipantsTable:", error);
    return { success: false, error: String(error) };
  }
};
