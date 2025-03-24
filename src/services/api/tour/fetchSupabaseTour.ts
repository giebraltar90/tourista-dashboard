
import { TourCardProps } from "@/components/tours/tour-card/types";
import { fetchBaseTourData } from "./fetchers/fetchTourBase";
import { fetchModificationsForTour } from "./fetchers/fetchModifications";
import { fetchParticipantsForGroups } from "./fetchers/fetchParticipants";
import { checkParticipantsTable } from "./fetchers/checkParticipantsTable";
import { transformTourData, transformTourDataWithoutParticipants } from "./transformers/tourDataTransformer";
import { logger } from "@/utils/logger";

/**
 * Fetch a single tour from Supabase
 */
export const fetchTourFromSupabase = async (tourId: string): Promise<TourCardProps | null> => {
  try {
    // Fetch base tour data
    const tour = await fetchBaseTourData(tourId);
    
    if (!tour) {
      logger.error(`DATABASE DEBUG: No tour found with ID: ${tourId}`);
      return null;
    }
    
    // Ensure tour.tour_groups exists
    if (!tour.tour_groups) {
      logger.debug(`DATABASE DEBUG: Tour ${tourId} exists but has no tour_groups, initializing empty array`);
      tour.tour_groups = [];
    }
    
    // Fetch modifications
    const modifications = await fetchModificationsForTour(tourId);
    
    // Check if the participants table exists
    const participantsTableExists = await checkParticipantsTable();
    
    if (!participantsTableExists) {
      logger.debug("DATABASE DEBUG: Participants table doesn't exist, returning tour without participants");
      return transformTourDataWithoutParticipants(tour, modifications);
    }
    
    // Fetch participants for each group
    const groupIds = tour.tour_groups ? tour.tour_groups.map(g => g.id) : [];
    const participants = await fetchParticipantsForGroups(groupIds);
    
    // Log group guide information before transformation
    if (tour.tour_groups && tour.tour_groups.length > 0) {
      logger.debug(`DATABASE DEBUG: Tour ${tourId} has ${tour.tour_groups.length} groups with guides:`, {
        guide1_id: tour.guide1_id || 'none',
        guide2_id: tour.guide2_id || 'none',
        guide3_id: tour.guide3_id || 'none',
        groups: tour.tour_groups.map(g => ({
          id: g.id,
          name: g.name,
          guide_id: g.guide_id || 'none'
        }))
      });
    }
    
    // Transform the data and return the final tour object
    const tourWithParticipants = transformTourData(tour, modifications, participants);
    
    logger.debug("DATABASE DEBUG: Final processed tour data:", {
      id: tourWithParticipants.id,
      name: tourWithParticipants.tourName,
      guide1: tourWithParticipants.guide1 || 'none',
      guide2: tourWithParticipants.guide2 || 'none', 
      guide3: tourWithParticipants.guide3 || 'none',
      groupsCount: tourWithParticipants.tourGroups.length,
      groupDetails: tourWithParticipants.tourGroups.map(g => ({
        id: g.id,
        name: g.name,
        guideId: g.guideId || 'none',
        size: g.size,
        childCount: g.childCount,
        participantsCount: g.participants?.length || 0
      }))
    });
    
    return tourWithParticipants;
  } catch (error) {
    logger.error("DATABASE DEBUG: Error in fetchTourFromSupabase:", error);
    return null;
  }
};
