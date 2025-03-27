
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
      result.tourGroups = [];
    }
    
    // Ensure ID is set
    result.id = tourId;
    
    // Fix date formatting issues - specifically handle the date safely
    if (result.date) {
      try {
        // If it's a string that's not an ISO date, convert to a safe date format
        if (typeof result.date === 'string' && !result.date.includes('T')) {
          // Force noon UTC to avoid timezone issues
          result.date = new Date(`${result.date}T12:00:00Z`);
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
    
    // Ensure other essential properties have default values
    result.tourName = result.tourName || `Tour ${tourId.slice(0, 8)}`;
    result.tourType = result.tourType || "default";
    result.location = result.location || "Unknown location";
    result.startTime = result.startTime || "00:00";
    result.referenceCode = result.referenceCode || tourId.slice(0, 8);
    
    // Handle snake_case to camelCase conversion for database properties
    // The issue is that the database returns snake_case but our frontend uses camelCase
    const dbData = tourData as Record<string, any>;
    if (dbData.tour_name && !result.tourName) result.tourName = dbData.tour_name;
    if (dbData.tour_type && !result.tourType) result.tourType = dbData.tour_type;
    if (dbData.start_time && !result.startTime) result.startTime = dbData.start_time;
    if (dbData.reference_code && !result.referenceCode) result.referenceCode = dbData.reference_code;
    
    // Fix tour groups data if present from database
    if (dbData.tour_groups && Array.isArray(dbData.tour_groups) && !result.tourGroups.length) {
      logger.debug(`Converting tour_groups to tourGroups format for tour ${tourId}`);
      
      // Transform tour_groups (database format) to tourGroups (frontend format)
      result.tourGroups = dbData.tour_groups.map((group: any) => ({
        id: group.id,
        name: group.name || `Group ${group.id.slice(0, 6)}`,
        size: group.size || 0,
        childCount: group.child_count || 0,
        guideId: group.guide_id || null,
        entryTime: group.entry_time || result.startTime || "00:00",
        participants: group.participants || []
      }));
    }
    
    // Ensure guides are properly set using camelCase
    result.guide1 = result.guide1 || "";
    result.guide2 = result.guide2 || "";
    result.guide3 = result.guide3 || "";
    
    // Handle guide ID conversions from snake_case to camelCase
    if (!result.guide1Id) result.guide1Id = dbData.guide1_id || "";
    if (!result.guide2Id) result.guide2Id = dbData.guide2_id || "";
    if (!result.guide3Id) result.guide3Id = dbData.guide3_id || "";
    
    logger.debug(`Successfully normalized tour ${tourId} data`);
    return result as TourCardProps;
  } catch (error) {
    logger.error(`Error in normalizeTourData for tour ${tourId}:`, error);
    throw new Error(`Failed to normalize tour data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
