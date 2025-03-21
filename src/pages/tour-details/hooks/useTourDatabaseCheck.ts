
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for performing database checks on tour load
 */
export const useTourDatabaseCheck = (tourId: string) => {
  const queryClient = useQueryClient();
  const initialCheckCompleted = useRef(false);
  
  // Force data refresh when component mounts and load participants
  useEffect(() => {
    if (tourId && !initialCheckCompleted.current) {
      console.log("DATABASE DEBUG: Initial tour data load for:", tourId);
      initialCheckCompleted.current = true;
      
      // Invalidate tour query to force fresh data
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      
      // Check database tables directly first - just log results, don't show UI messages
      const checkDatabaseSchema = async () => {
        console.log("DATABASE DEBUG: Checking database schema...");
        
        try {
          // Check tour_groups table
          const { count: groupsCount, error: groupsError } = await supabase
            .from('tour_groups')
            .select('*', { count: 'exact', head: true });
            
          if (groupsError) {
            console.error("DATABASE DEBUG: Error checking tour_groups table:", groupsError);
          } else {
            console.log(`DATABASE DEBUG: tour_groups table has ${groupsCount} total records`);
          }
          
          // Check participants table - no UI messages
          const { count: participantsCount, error: participantsError } = await supabase
            .from('participants')
            .select('*', { count: 'exact', head: true });
            
          if (participantsError) {
            console.error("DATABASE DEBUG: Error checking participants table:", participantsError);
            console.log("DATABASE DEBUG: This could indicate that the participants table doesn't exist!");
          } else {
            console.log(`DATABASE DEBUG: participants table has ${participantsCount} total records`);
          }
        } catch (error) {
          console.error("DATABASE DEBUG: Error in database check:", error);
        }
      };
      
      // Run the database schema check
      checkDatabaseSchema();
    }
  }, [tourId, queryClient]);
  
  return null;
};
