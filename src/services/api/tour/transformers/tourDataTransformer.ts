
import { TourCardProps } from "@/components/tours/tour-card/types";
import { SupabaseTourData, SupabaseModification, SupabaseParticipant } from "../fetchers/types";

/**
 * Transform tour data from Supabase into TourCardProps format
 */
export const transformTourData = (
  tour: SupabaseTourData, 
  modifications: SupabaseModification[],
  participants: SupabaseParticipant[] = []
): TourCardProps => {
  // Make sure we have tour_groups before trying to map them
  const tourGroups = tour.tour_groups || [];
  
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
    tourGroups: tourGroups.map(group => {
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
    }),
    numTickets: tour.num_tickets || 0,
    isHighSeason: Boolean(tour.is_high_season),
    modifications: modifications.map(mod => ({
      id: mod.id,
      date: new Date(mod.created_at),
      user: mod.user_id || "System",
      description: mod.description,
      status: mod.status,
      details: mod.details || {}
    }))
  };
};

/**
 * Transform tour data without participants
 */
export const transformTourDataWithoutParticipants = (
  tour: SupabaseTourData, 
  modifications: SupabaseModification[]
): TourCardProps => {
  // Make sure we have tour_groups before trying to map them
  const tourGroups = tour.tour_groups || [];
  
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
    tourGroups: tourGroups.map(group => ({
      id: group.id,
      name: group.name,
      size: group.size || 0,
      entryTime: group.entry_time || "9:00",
      childCount: group.child_count || 0,
      guideId: group.guide_id,
      participants: []
    })),
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
};
