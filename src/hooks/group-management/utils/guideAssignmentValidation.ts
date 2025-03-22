
import { supabase } from "@/integrations/supabase/client";

/**
 * Validates all parameters before performing a guide assignment
 */
export const validateGuideAssignment = (
  tour: any, 
  groupIndex: number, 
  guideId?: string | null
): { valid: boolean; errorMessage?: string } => {
  // Check for valid tour data
  if (!tour) {
    return { valid: false, errorMessage: "Tour data is missing" };
  }
  
  // Check for valid tour groups
  if (!tour.tourGroups || !Array.isArray(tour.tourGroups)) {
    return { valid: false, errorMessage: "Tour groups data is invalid" };
  }
  
  // Check for valid group index
  if (groupIndex < 0 || groupIndex >= tour.tourGroups.length) {
    return { 
      valid: false, 
      errorMessage: `Invalid group index: ${groupIndex}. Tour has ${tour.tourGroups.length} groups.` 
    };
  }
  
  // Special case for "_none" which means removing a guide
  if (guideId === "_none") {
    return { valid: true }; // Valid for removing a guide
  }
  
  // If a guide ID is provided, ensure it's not empty or just whitespace
  if (guideId && guideId.trim() === "") {
    return { valid: false, errorMessage: "Guide ID cannot be empty" };
  }
  
  return { valid: true };
};

/**
 * Checks if a guide is already assigned to another tour on the same day and time
 */
export const checkGuideAvailability = async (
  tourId: string,
  date: string | Date,
  startTime: string,
  guideId: string
): Promise<{ available: boolean; conflictingTour?: any }> => {
  if (!guideId || guideId === "_none") {
    return { available: true };
  }
  
  try {
    // Format date to ISO string if it's a Date object
    const formattedDate = date instanceof Date 
      ? date.toISOString().split('T')[0] 
      : date;
    
    console.log(`Checking guide ${guideId} availability for date ${formattedDate} and time ${startTime}`);
    
    // Query for tours on the same day with the same guide assigned
    const { data: conflictingTours, error } = await supabase
      .from('tours')
      .select('*, tour_groups(*)')
      .eq('date', formattedDate)
      .eq('start_time', startTime)
      .neq('id', tourId) // Exclude the current tour
      .or(`guide1_id.eq.${guideId},guide2_id.eq.${guideId},guide3_id.eq.${guideId}`);
    
    if (error) {
      console.error("Error checking guide availability:", error);
      // In case of error, we assume the guide is available to prevent blocking UI
      return { available: true };
    }
    
    // Also check tour_groups for guide_id
    const { data: conflictingGroups, error: groupsError } = await supabase
      .from('tour_groups')
      .select('*, tours!inner(*)')
      .eq('guide_id', guideId)
      .eq('tours.date', formattedDate)
      .eq('tours.start_time', startTime)
      .neq('tours.id', tourId);
    
    if (groupsError) {
      console.error("Error checking guide group assignments:", groupsError);
      // In case of error, we assume the guide is available
      return { available: true };
    }
    
    const hasConflict = 
      (conflictingTours && conflictingTours.length > 0) || 
      (conflictingGroups && conflictingGroups.length > 0);
    
    if (hasConflict) {
      const conflictingTour = conflictingTours?.[0] || (conflictingGroups?.[0]?.tours);
      console.log(`Guide ${guideId} has a conflict with tour ${conflictingTour?.id} on ${formattedDate} at ${startTime}`);
      return { 
        available: false, 
        conflictingTour
      };
    }
    
    return { available: true };
  } catch (error) {
    console.error("Error checking guide availability:", error);
    // In case of error, we assume the guide is available to prevent blocking UI
    return { available: true };
  }
};
