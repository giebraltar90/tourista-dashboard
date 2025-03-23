
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if the participants table exists
 */
export const checkParticipantsTable = async (): Promise<boolean> => {
  try {
    const { error: tableCheck } = await supabase
      .from('participants')
      .select('id')
      .limit(1);
      
    if (tableCheck) {
      console.error("DATABASE DEBUG: Participants table check failed:", tableCheck);
      console.log("DATABASE DEBUG: This might indicate participants table doesn't exist");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("DATABASE DEBUG: Error checking participants table:", error);
    return false;
  }
};
