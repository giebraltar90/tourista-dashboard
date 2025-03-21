
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
      
      // Check database tables directly first
      const checkDatabaseSchema = async () => {
        console.log("DATABASE DEBUG: Checking database schema...");
        
        // Check tour_groups table
        const { count: groupsCount, error: groupsError } = await supabase
          .from('tour_groups')
          .select('*', { count: 'exact', head: true });
          
        if (groupsError) {
          console.error("DATABASE DEBUG: Error checking tour_groups table:", groupsError);
        } else {
          console.log(`DATABASE DEBUG: tour_groups table has ${groupsCount} total records`);
        }
        
        // Check participants table
        const { count: participantsCount, error: participantsError } = await supabase
          .from('participants')
          .select('*', { count: 'exact', head: true });
          
        if (participantsError) {
          console.error("DATABASE DEBUG: Error checking participants table:", participantsError);
          console.log("DATABASE DEBUG: This could indicate that the participants table doesn't exist!");
        } else {
          console.log(`DATABASE DEBUG: participants table has ${participantsCount} total records`);
        }
        
        // Check tour_groups for this specific tour
        const { data: tourGroups, error: tourGroupsError } = await supabase
          .from('tour_groups')
          .select('id, name, size')
          .eq('tour_id', tourId);
          
        if (tourGroupsError) {
          console.error("DATABASE DEBUG: Error fetching tour groups for this tour:", tourGroupsError);
        } else {
          console.log(`DATABASE DEBUG: Found ${tourGroups?.length || 0} groups for this tour:`, 
            tourGroups?.map(g => ({ id: g.id, name: g.name, size: g.size })));
          
          if (tourGroups && tourGroups.length > 0) {
            // Get all group IDs
            const groupIds = tourGroups.map(g => g.id);
            
            // Check for participants in these groups
            const { data: groupParticipants, error: groupParticipantsError } = await supabase
              .from('participants')
              .select('id, name, group_id, count')
              .in('group_id', groupIds);
              
            if (groupParticipantsError) {
              console.error("DATABASE DEBUG: Error fetching participants for groups:", groupParticipantsError);
            } else {
              console.log(`DATABASE DEBUG: Found ${groupParticipants?.length || 0} participants for this tour's groups`);
              
              // Log each participant by group
              if (groupParticipants) {
                const participantsByGroup = groupIds.map(groupId => {
                  const participants = groupParticipants.filter(p => p.group_id === groupId);
                  const group = tourGroups.find(g => g.id === groupId);
                  return {
                    groupId,
                    groupName: group?.name || 'Unknown Group',
                    participantsCount: participants.length,
                    participants: participants
                  };
                });
                
                console.log("DATABASE DEBUG: Participants by group:", participantsByGroup);
              }
            }
          }
        }
      };
      
      // Run the database schema check
      checkDatabaseSchema();
    }
  }, [tourId, queryClient]);
  
  return null;
};
