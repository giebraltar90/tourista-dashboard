
import { TourCardProps } from "@/components/tours/tour-card/types";
import { supabase } from "@/integrations/supabase/client";
import { isValidUuid } from "@/services/api/utils/guidesUtils";
import { TourModification } from "@/types/ventrata";

/**
 * Fetch a single tour from Supabase
 */
export const fetchTourFromSupabase = async (tourId: string): Promise<TourCardProps | null> => {
  try {
    console.log(`DATABASE DEBUG: Fetching tour data for ID: ${tourId}`);
    
    const { data: tour, error } = await supabase
      .from('tours')
      .select(`
        id, date, location, tour_name, tour_type, start_time, 
        reference_code, guide1_id, guide2_id, guide3_id, 
        num_tickets, is_high_season,
        tour_groups (id, name, size, entry_time, guide_id, child_count)
      `)
      .eq('id', tourId)
      .single();
      
    if (error) {
      console.error("DATABASE DEBUG: Error fetching tour:", error);
      return null;
    }
    
    // Get modifications
    const { data: modifications, error: modError } = await supabase
      .from('modifications')
      .select('*')
      .eq('tour_id', tourId)
      .order('created_at', { ascending: false });
      
    if (modError) {
      console.error("DATABASE DEBUG: Error fetching modifications:", modError);
    }
    
    if (!tour) {
      console.error("DATABASE DEBUG: No tour found for ID:", tourId);
      return null;
    }
    
    // Check if the participants table exists
    const { error: tableCheck } = await supabase
      .from('participants')
      .select('id')
      .limit(1);
      
    if (tableCheck) {
      console.error("DATABASE DEBUG: Participants table check failed:", tableCheck);
      console.log("DATABASE DEBUG: This might indicate participants table doesn't exist");
      
      // Return the tour without attempting to fetch participants
      return {
        id: tour.id,
        date: new Date(tour.date),
        location: tour.location,
        tourName: tour.tour_name,
        tourType: tour.tour_type,
        startTime: tour.start_time,
        referenceCode: tour.reference_code,
        guide1: tour.guide1_id || "",
        guide2: tour.guide2_id || "",
        guide3: tour.guide3_id || "",
        tourGroups: tour.tour_groups ? tour.tour_groups.map(group => ({
          id: group.id,
          name: group.name,
          size: group.size || 0,
          entryTime: group.entry_time || "9:00",
          childCount: group.child_count || 0,
          guideId: group.guide_id,
          participants: []
        })) : [],
        numTickets: tour.num_tickets || 0,
        isHighSeason: Boolean(tour.is_high_season),
        modifications: modifications ? modifications.map(mod => ({
          id: mod.id,
          date: new Date(mod.created_at),
          user: mod.user_id || "System",
          description: mod.description,
          status: mod.status,
          details: mod.details || {}
        })) : []
      };
    }
    
    // Fetch participants for each group
    const groupIds = tour.tour_groups ? tour.tour_groups.map(g => g.id) : [];
    console.log(`DATABASE DEBUG: Fetching participants for ${groupIds.length} groups:`, groupIds);
    
    let participants = [];
    
    if (groupIds.length > 0) {
      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .in('group_id', groupIds);
        
      if (participantsError) {
        console.error("DATABASE DEBUG: Error fetching participants:", participantsError);
      } else {
        participants = participantsData || [];
        console.log(`DATABASE DEBUG: Fetched ${participants.length} participants for ${groupIds.length} groups`);
        
        // Log distribution of participants across groups
        const participantsByGroup = {};
        for (const p of participants) {
          if (!participantsByGroup[p.group_id]) {
            participantsByGroup[p.group_id] = [];
          }
          participantsByGroup[p.group_id].push(p);
        }
        
        for (const groupId in participantsByGroup) {
          console.log(`DATABASE DEBUG: Group ${groupId} has ${participantsByGroup[groupId].length} participants`);
        }
      }
    }
    
    console.log("DATABASE DEBUG: Using Supabase tour data:", tour);
    
    // Transform the Supabase data to match our TourCardProps structure
    const tourWithParticipants: TourCardProps = {
      id: tour.id,
      date: new Date(tour.date),
      location: tour.location,
      tourName: tour.tour_name,
      tourType: tour.tour_type,
      startTime: tour.start_time,
      referenceCode: tour.reference_code,
      guide1: tour.guide1_id || "",
      guide2: tour.guide2_id || "",
      guide3: tour.guide3_id || "",
      tourGroups: tour.tour_groups ? tour.tour_groups.map(group => {
        // Find participants for this group
        const groupParticipants = participants
          .filter(p => p.group_id === group.id)
          .map(p => ({
            id: p.id,
            name: p.name,
            count: p.count || 1,
            bookingRef: p.booking_ref,
            childCount: p.child_count || 0,
            group_id: p.group_id,
            created_at: p.created_at,
            updated_at: p.updated_at
          }));
          
        // Calculate sizes from participants if available
        const participantSize = groupParticipants.reduce((total, p) => total + (p.count || 1), 0);
        const participantChildCount = groupParticipants.reduce((total, p) => total + (p.childCount || 0), 0);
        
        console.log(`DATABASE DEBUG: Group ${group.id} participant data:`, {
          groupName: group.name,
          dbSize: group.size,
          dbChildCount: group.child_count,
          participantsCount: groupParticipants.length,
          calculatedSize: participantSize,
          calculatedChildCount: participantChildCount
        });
        
        return {
          id: group.id,
          name: group.name,
          size: groupParticipants.length > 0 ? participantSize : (group.size || 0),
          entryTime: group.entry_time || "9:00", // Default if not provided
          childCount: groupParticipants.length > 0 ? participantChildCount : (group.child_count || 0),
          guideId: group.guide_id,
          participants: groupParticipants
        };
      }) : [],
      numTickets: tour.num_tickets || 0,
      isHighSeason: Boolean(tour.is_high_season),
      modifications: modifications ? modifications.map(mod => ({
        id: mod.id,
        date: new Date(mod.created_at),
        user: mod.user_id || "System",
        description: mod.description,
        status: mod.status,
        details: mod.details || {}
      })) : []
    };
    
    console.log("DATABASE DEBUG: Final processed tour data:", {
      id: tourWithParticipants.id,
      name: tourWithParticipants.tourName,
      groupsCount: tourWithParticipants.tourGroups.length,
      groupDetails: tourWithParticipants.tourGroups.map(g => ({
        id: g.id,
        name: g.name,
        size: g.size,
        childCount: g.childCount,
        participantsCount: g.participants?.length || 0
      }))
    });
    
    return tourWithParticipants;
  } catch (error) {
    console.error("DATABASE DEBUG: Error in fetchTourFromSupabase:", error);
  }
  
  return null;
};
