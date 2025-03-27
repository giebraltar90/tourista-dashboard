import { TourCardProps } from "@/components/tours/tour-card/types";
import { VentrataTour } from "@/types/ventrata";
import { logger } from "@/utils/logger";

/**
 * Ensures tour data is in a consistent format
 */
export const normalizeTourData = (tourData: any, tourId: string): TourCardProps => {
  if (!tourData) {
    logger.error("Normalize tour data called with null data for tour ID:", tourId);
    throw new Error(`No tour data found for tour ID: ${tourId}`);
  }
  
  try {
    // First, copy the raw tourData to avoid mutations
    const result: Partial<TourCardProps> = { ...tourData };
    
    // Ensure tourGroups is an array
    if (!Array.isArray(result.tourGroups)) {
      logger.warn(`Tour ${tourId} has invalid or missing tour groups, initializing empty array`);
      result.tourGroups = tourData.tour_groups ? [...tourData.tour_groups] : [];
    }
    
    // Convert snake_case to camelCase if needed
    if (!result.tourGroups.length && Array.isArray(tourData.tour_groups)) {
      result.tourGroups = tourData.tour_groups.map((group: any) => ({
        id: group.id,
        name: group.name || `Group`,
        size: group.size || 0,
        childCount: group.child_count || 0,
        guideId: group.guide_id || null,
        entryTime: group.entry_time || "00:00",
        participants: group.participants || []
      }));
    }
    
    // Ensure ID is set
    result.id = tourId;
    
    // Fix date formatting issues - specifically handle the date safely
    if (result.date) {
      try {
        // Process date based on its current type
        if (typeof result.date === 'string') {
          // For string dates, check if it has time component
          const dateStr = result.date as string;
          if (!dateStr.includes('T')) {
            // Force noon UTC to avoid timezone issues
            result.date = new Date(`${dateStr}T12:00:00Z`);
          } else {
            // It's already in ISO format, convert to Date
            result.date = new Date(dateStr);
          }
        } 
        // If it's already a Date object, keep it as is
        else if (result.date instanceof Date) {
          // No conversion needed
        }
        // Otherwise try to convert to a Date object
        else {
          result.date = new Date(result.date);
        }
        
        // Check if the date is valid
        if (!(result.date instanceof Date) || isNaN(result.date.getTime())) {
          logger.warn(`Tour ${tourId} has invalid date, using current date as fallback`);
          result.date = new Date();
        }
      } catch (dateError) {
        logger.error(`Error processing date for tour ${tourId}:`, dateError);
        // Fallback to current date
        result.date = new Date();
      }
    } else {
      logger.warn(`Tour ${tourId} has no date, using current date as fallback`);
      result.date = new Date();
    }
    
    // Fix property mappings from database fields
    if (tourData.tour_name && !result.tourName) result.tourName = tourData.tour_name;
    if (tourData.tour_type && !result.tourType) result.tourType = tourData.tour_type;
    if (tourData.location && !result.location) result.location = tourData.location;
    if (tourData.start_time && !result.startTime) result.startTime = tourData.start_time;
    if (tourData.reference_code && !result.referenceCode) result.referenceCode = tourData.reference_code;
    if (tourData.guide1_id && !result.guide1) result.guide1 = tourData.guide1_id;
    if (tourData.guide2_id && !result.guide2) result.guide2 = tourData.guide2_id;
    if (tourData.guide3_id && !result.guide3) result.guide3 = tourData.guide3_id;
    
    // Ensure other essential properties have default values
    result.tourName = result.tourName || `Tour ${tourId.slice(0, 8)}`;
    result.tourType = result.tourType || "default";
    result.location = result.location || "Unknown location";
    result.startTime = result.startTime || "00:00";
    result.referenceCode = result.referenceCode || tourId.slice(0, 8);
    result.guide1 = result.guide1 || "";
    result.guide2 = result.guide2 || "";
    result.guide3 = result.guide3 || "";
    
    logger.debug(`Successfully normalized tour ${tourId} data`);
    return result as TourCardProps;
  } catch (error) {
    logger.error(`Error in normalizeTourData for tour ${tourId}:`, error);
    throw new Error(`Failed to normalize tour data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
