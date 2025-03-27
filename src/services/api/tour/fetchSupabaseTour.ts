
import { TourCardProps } from "@/components/tours/tour-card/types";
import { fetchBaseTourData } from "./fetchers/fetchTourBase";
import { fetchModificationsForTour } from "./fetchers/fetchModifications";
import { fetchParticipantsForGroups } from "./fetchers/fetchParticipants";
import { checkParticipantsTable } from "./fetchers/checkParticipantsTable";
import { transformTourData, transformTourDataWithoutParticipants } from "./transformers/tourDataTransformer";
import { mockTours } from "@/data/mockData";
import { logger } from "@/utils/logger";

/**
 * Fetch a single tour from Supabase
 */
export const fetchTourFromSupabase = async (tourId: string): Promise<TourCardProps | null> => {
  try {
    if (!tourId) {
      logger.error("DATABASE DEBUG: Empty tour ID provided to fetchTourFromSupabase");
      return null;
    }
    
    // Fetch base tour data
    const tour = await fetchBaseTourData(tourId);
    
    if (!tour) {
      logger.error(`DATABASE DEBUG: No tour found with ID ${tourId} in database`);
      
      // Try to find in mock data as fallback
      const mockTour = mockTours.find(t => t.id === tourId);
      if (mockTour) {
        logger.debug(`DATABASE DEBUG: Found tour ${tourId} in mock data, using as fallback`);
        return mockTour;
      }
      
      return null;
    }
    
    // Log successful fetch
    logger.debug(`DATABASE DEBUG: Successfully fetched tour ${tourId} from database`);
    
    // Log raw tour data before processing
    logger.info(`DATABASE DEBUG: Using Supabase tour data:`, [tour]);
    
    // Fetch modifications
    const modifications = await fetchModificationsForTour(tourId);
    
    // Check if the participants table exists
    const participantsTableExists = await checkParticipantsTable();
    
    if (!participantsTableExists) {
      logger.debug("DATABASE DEBUG: Participants table doesn't exist, returning tour without participants");
      return transformTourDataWithoutParticipants(tour, modifications);
    }
    
    // We know the tour_groups field is in the database format, but let's be careful
    if (!tour.tour_groups || !Array.isArray(tour.tour_groups)) {
      logger.warn(`DATABASE DEBUG: Tour ${tourId} has no groups or invalid groups data`);
      
      // Initialize as empty array if not present
      tour.tour_groups = [];
    }
    
    // Ensure the database format is valid for all tour_groups
    tour.tour_groups = Array.isArray(tour.tour_groups) ? tour.tour_groups.map(group => ({
      ...group,
      id: group.id || crypto.randomUUID(), // Ensure ID exists
      name: group.name || `Group (DB)`, // Ensure name exists
      size: typeof group.size === 'number' ? group.size : 0, // Ensure size exists
      child_count: typeof group.child_count === 'number' ? group.child_count : 0 // Ensure child_count exists
    })) : [];
    
    // Fetch participants for each group
    const groupIds = tour.tour_groups ? tour.tour_groups.map(g => g.id).filter(Boolean) : [];
    
    if (groupIds.length === 0) {
      logger.debug(`DATABASE DEBUG: No groups found for tour ${tourId}`);
      return transformTourDataWithoutParticipants(tour, modifications);
    }
    
    try {
      const participants = await fetchParticipantsForGroups(groupIds);
      
      // Transform the data and return the final tour object
      const tourWithParticipants = transformTourData(tour, modifications, participants);
      
      logger.debug("DATABASE DEBUG: Final processed tour data:", {
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
    } catch (participantsError) {
      logger.error(`DATABASE DEBUG: Error fetching participants for tour ${tourId}:`, participantsError);
      // Return tour without participants as fallback
      return transformTourDataWithoutParticipants(tour, modifications);
    }
  } catch (error) {
    logger.error("DATABASE DEBUG: Error in fetchTourFromSupabase:", error);
    // Try to use mock data as fallback
    const mockTour = mockTours.find(t => t.id === tourId);
    if (mockTour) {
      logger.debug(`DATABASE DEBUG: Found tour ${tourId} in mock data, using as fallback after error`);
      return mockTour;
    }
    return null;
  }
};
