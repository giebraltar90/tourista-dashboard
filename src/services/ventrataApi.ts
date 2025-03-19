
// Simplified version that only uses mock data for now
import { mockTours } from "@/data/mockData";
import { VentrataTour, VentrataTourGroup, TourModification } from "@/types/ventrata";
import { v4 as uuidv4 } from "uuid";
import { isUuid } from "@/types/ventrata";

// Internal state for modifications in memory until API is implemented
const tourModifications: Record<string, TourModification[]> = {};
const tourHighSeasonSettings: Record<string, boolean> = {};

/**
 * Fetch tours using mock data
 */
export const fetchTours = async () => {
  console.log("Using mock tour data");
  return mockTours;
};

/**
 * Fetch a single tour by ID from mock data
 */
export const fetchTourById = async (tourId: string) => {
  console.log("Fetching mock tour data for ID:", tourId);
  const tourData = mockTours.find(tour => tour.id === tourId);
  
  if (!tourData) return null;
  
  // Create a deep copy to prevent mutations
  const cleanedTourData = JSON.parse(JSON.stringify(tourData));
  
  // Apply any saved high season setting
  if (tourId in tourHighSeasonSettings) {
    cleanedTourData.isHighSeason = tourHighSeasonSettings[tourId];
  } else {
    cleanedTourData.isHighSeason = !!cleanedTourData.isHighSeason;
  }
  
  // Apply any saved modifications
  if (tourId in tourModifications) {
    cleanedTourData.modifications = tourModifications[tourId];
  }
  
  return cleanedTourData;
};

/**
 * Update tour groups (mock implementation)
 */
export const updateTourGroups = async (
  tourId: string, 
  updatedGroups: VentrataTourGroup[]
): Promise<boolean> => {
  console.log(`Mock updating tour groups for tour ${tourId}`, updatedGroups);
  return true;
};

/**
 * Update tour capacity settings (mock implementation)
 */
export const updateTourCapacity = async (
  tourId: string,
  isHighSeason: boolean
): Promise<boolean> => {
  console.log(`Mock updating tour capacity for tour ${tourId} to isHighSeason=${isHighSeason}`);
  
  // Save the high season setting in memory
  tourHighSeasonSettings[tourId] = isHighSeason;
  
  return true;
};

/**
 * Update tour modifications (mock implementation)
 */
export const updateTourModification = async (
  tourId: string,
  modification: {
    description: string,
    details?: Record<string, any>
  }
): Promise<boolean> => {
  console.log(`Mock adding modification for tour ${tourId}`, modification);
  
  // Create a new modification object
  const newModification: TourModification = {
    id: uuidv4(),
    date: new Date(),
    user: "Current User",
    description: modification.description,
    status: "complete",
    details: modification.details
  };
  
  // Initialize the array if it doesn't exist
  if (!tourModifications[tourId]) {
    tourModifications[tourId] = [];
  }
  
  // Add the new modification
  tourModifications[tourId].unshift(newModification);
  
  return true;
};

/**
 * Fetch bookings for a tour (mock implementation)
 */
export const fetchBookingsForTour = async (tourId: string) => {
  console.log(`Mock fetching bookings for tour ${tourId}`);
  return null;
};
