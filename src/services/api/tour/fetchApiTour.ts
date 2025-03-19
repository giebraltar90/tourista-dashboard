
import { VentrataTour } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { mockTours } from "@/data/mockData";
import { API_BASE_URL, headers } from "../apiConfig";

/**
 * Fetch a single tour from API
 */
export const fetchTourFromAPI = async (tourId: string): Promise<TourCardProps | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tours/${tourId}`, {
      method: "GET",
      headers,
    });
    
    if (!response.ok) {
      console.log(`API error for tour ${tourId}, using mock data instead`);
      return mockTours.find(tour => tour.id === tourId) || null;
    }
    
    const tour: VentrataTour = await response.json();
    
    return {
      id: tour.id,
      date: new Date(tour.date),
      location: tour.location,
      tourName: tour.tourName,
      tourType: tour.tourType,
      startTime: tour.startTime,
      referenceCode: tour.referenceCode,
      guide1: tour.guide1,
      guide2: tour.guide2,
      guide3: tour.guide3,
      tourGroups: tour.tourGroups,
      numTickets: tour.numTickets,
      isHighSeason: Boolean(tour.isHighSeason)
    };
  } catch (error) {
    console.error(`Error fetching tour ${tourId} from API:`, error);
    // Return mock data as fallback
    return mockTours.find(tour => tour.id === tourId) || null;
  }
};
