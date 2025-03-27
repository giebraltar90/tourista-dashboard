
import { TourCardProps } from "@/components/tours/tour-card/types";
import { SupabaseTourData, SupabaseModification, SupabaseParticipant } from "../fetchers/types";
import { logger } from "@/utils/logger";

/**
 * Transform tour data from Supabase into TourCardProps format
 */
export const transformTourData = (
  tour: SupabaseTourData, 
  modifications: SupabaseModification[] = [],
  participants: SupabaseParticipant[] = []
): TourCardProps => {
  // Safeguard against undefined tour data
  if (!tour) {
    console.error("Null or undefined tour data provided to transformTourData");
    throw new Error("Invalid tour data");
  }

  try {
    // Safely create a date
    let tourDate: Date;
    try {
      if (tour.date) {
        // Force noon UTC to avoid timezone issues
        tourDate = new Date(`${tour.date}T12:00:00Z`);
        
        // Check if the date is valid
        if (isNaN(tourDate.getTime())) {
          logger.warn(`Invalid date from database: ${tour.date}, using current date as fallback`);
          tourDate = new Date();
        }
      } else {
        logger.warn("Tour date is missing in database, using current date as fallback");
        tourDate = new Date();
      }
    } catch (dateError) {
      logger.error("Error processing tour date:", dateError);
      tourDate = new Date(); // Fallback to current date
    }

    // Ensure tour_groups is always an array
    const tourGroups = Array.isArray(tour.tour_groups) ? tour.tour_groups : [];
    logger.debug("DATABASE DEBUG: Processing tour groups:", tourGroups);

    const result: TourCardProps = {
      id: tour.id,
      date: tourDate,
      location: tour.location || "Unknown location",
      tourName: tour.tour_name || "Unknown Tour",
      tourType: tour.tour_type || "default",
      startTime: tour.start_time || "00:00",
      referenceCode: tour.reference_code || "Unknown",
      guide1: tour.guide1_id || "",
      guide2: tour.guide2_id || "",
      guide3: tour.guide3_id || "",
      tourGroups: tourGroups.map(group => {
        // Ensure group is not null
        if (!group) {
          logger.warn("Null group found in tour data");
          return {
            id: "unknown",
            name: "Unknown Group",
            size: 0,
            entryTime: "9:00",
            childCount: 0,
            guideId: null,
            participants: []
          };
        }

        // Find participants for this group
        const groupParticipants = participants
          .filter(p => p && p.group_id === group.id)
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
        
        return {
          id: group.id || crypto.randomUUID(),
          name: group.name || `Group`,
          size: groupParticipants.length > 0 ? participantSize : (group.size || 0),
          entryTime: group.entry_time || "9:00", // Default if not provided
          childCount: groupParticipants.length > 0 ? participantChildCount : (group.child_count || 0),
          guideId: group.guide_id,
          participants: groupParticipants
        };
      }),
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
    
    return result;
  } catch (error) {
    logger.error("Error in transformTourData:", error);
    
    // Fallback transformation with minimal processing
    return {
      id: tour.id,
      date: new Date(),
      location: tour.location || "Unknown location",
      tourName: tour.tour_name || "Unknown Tour",
      tourType: tour.tour_type || "default",
      startTime: tour.start_time || "00:00",
      referenceCode: tour.reference_code || "Unknown",
      guide1: tour.guide1_id || "",
      guide2: tour.guide2_id || "",
      guide3: tour.guide3_id || "",
      tourGroups: [],
      numTickets: tour.num_tickets || 0,
      isHighSeason: Boolean(tour.is_high_season),
      modifications: []
    };
  }
};

/**
 * Transform tour data without participants - simplified safe version
 */
export const transformTourDataWithoutParticipants = (
  tour: SupabaseTourData, 
  modifications: SupabaseModification[] = []
): TourCardProps => {
  // Safeguard against undefined tour data
  if (!tour) {
    logger.error("Null or undefined tour data provided to transformTourDataWithoutParticipants");
    throw new Error("Invalid tour data");
  }

  try {
    // Create a safe date object
    let tourDate: Date;
    try {
      if (tour.date) {
        // Force noon UTC to avoid timezone issues
        tourDate = new Date(`${tour.date}T12:00:00Z`);
        
        // Check if the date is valid
        if (isNaN(tourDate.getTime())) {
          logger.warn(`Invalid date from database: ${tour.date}, using current date as fallback`);
          tourDate = new Date();
        }
      } else {
        logger.warn("Tour date is missing in database, using current date as fallback");
        tourDate = new Date();
      }
    } catch (dateError) {
      logger.error("Error processing tour date:", dateError);
      tourDate = new Date(); // Fallback to current date
    }

    // Ensure tour_groups is always an array
    const tourGroups = Array.isArray(tour.tour_groups) ? tour.tour_groups : [];

    return {
      id: tour.id,
      date: tourDate,
      location: tour.location || "Unknown",
      tourName: tour.tour_name || "Unknown Tour",
      tourType: tour.tour_type || "default",
      startTime: tour.start_time || "00:00",
      referenceCode: tour.reference_code || "Unknown",
      guide1: tour.guide1_id || "",
      guide2: tour.guide2_id || "",
      guide3: tour.guide3_id || "",
      tourGroups: tourGroups.map(group => {
        if (!group) {
          return {
            id: "unknown",
            name: "Unknown Group",
            size: 0,
            entryTime: "9:00",
            childCount: 0,
            guideId: null,
            participants: []
          };
        }
        
        return {
          id: group.id || "unknown",
          name: group.name || "Unknown Group",
          size: group.size || 0,
          entryTime: group.entry_time || "9:00",
          childCount: group.child_count || 0,
          guideId: group.guide_id || null,
          participants: []
        };
      }),
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
  } catch (error) {
    logger.error("Error in transformTourDataWithoutParticipants:", error);
    
    // Ultra-fallback with minimal data
    return {
      id: tour.id,
      date: new Date(),
      location: "Unknown location",
      tourName: "Error loading tour",
      tourType: "default",
      startTime: "00:00",
      referenceCode: tour.id.slice(0, 8),
      tourGroups: [],
      guide1: "",
      guide2: "",
      guide3: "",
      numTickets: 0,
      isHighSeason: false,
      modifications: []
    };
  }
};
