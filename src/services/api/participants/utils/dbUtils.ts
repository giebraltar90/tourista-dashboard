
import { supabase, supabaseWithRetry } from "@/integrations/supabase/client";

/**
 * Check if the tour exists in the database with retry mechanism
 */
export const checkTourExists = async (tourId: string) => {
  try {
    // Use retry mechanism for more reliable database access
    return await supabaseWithRetry(async () => {
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
    });
  } catch (error) {
    console.error("DATABASE DEBUG: Error in checkTourExists:", error);
    return { exists: false, error: String(error) };
  }
};

/**
 * Debug check participants table using direct SQL with retry mechanism
 */
export const debugCheckParticipantsTable = async (groupIds: string[]) => {
  try {
    // Use retry mechanism for more reliable database access
    return await supabaseWithRetry(async () => {
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
    });
  } catch (error) {
    console.error("DATABASE DEBUG: Error in debugCheckParticipantsTable:", error);
    return { success: false, error: String(error) };
  }
};

/**
 * Utility to handle failures gracefully with fallback data
 */
export const executeWithFallback = async <T>(
  operation: () => Promise<T>,
  fallbackData: T,
  errorMessage: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.error(errorMessage, error);
    return fallbackData;
  }
};
