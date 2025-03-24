
import { TourCardProps } from "@/components/tours/tour-card/types";
import { fetchBaseTourData } from "./fetchers/fetchTourBase";
import { fetchModificationsForTour } from "./fetchers/fetchModifications";
import { fetchParticipantsForGroups } from "./fetchers/fetchParticipants";
import { checkParticipantsTable } from "./fetchers/checkParticipantsTable";
import { transformTourData, transformTourDataWithoutParticipants } from "./transformers/tourDataTransformer";

/**
 * Fetch a single tour from Supabase
 */
export const fetchTourFromSupabase = async (tourId: string): Promise<TourCardProps | null> => {
  try {
    // Fetch base tour data
    const tour = await fetchBaseTourData(tourId);
    
    if (!tour) {
      console.log(`DATABASE DEBUG: No tour found with ID: ${tourId}`);
      return null;
    }
    
    // Ensure tour.tour_groups exists
    if (!tour.tour_groups) {
      console.log(`DATABASE DEBUG: Tour ${tourId} exists but has no tour_groups, initializing empty array`);
      tour.tour_groups = [];
    }
    
    // Fetch modifications
    const modifications = await fetchModificationsForTour(tourId);
    
    // Check if the participants table exists
    const participantsTableExists = await checkParticipantsTable();
    
    if (!participantsTableExists) {
      console.log("DATABASE DEBUG: Participants table doesn't exist, returning tour without participants");
      return transformTourDataWithoutParticipants(tour, modifications);
    }
    
    // Fetch participants for each group
    const groupIds = tour.tour_groups ? tour.tour_groups.map(g => g.id) : [];
    const participants = await fetchParticipantsForGroups(groupIds);
    
    // Transform the data and return the final tour object
    const tourWithParticipants = transformTourData(tour, modifications, participants);
    
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
    return null;
  }
};
