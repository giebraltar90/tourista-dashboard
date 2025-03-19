
import { VentrataBookingsResponse } from "@/types/ventrata";
import { API_BASE_URL, headers } from "./apiConfig";

/**
 * Fetch bookings for a specific tour
 */
export const fetchBookingsForTour = async (tourId: string): Promise<VentrataBookingsResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings?tourId=${tourId}`, {
      method: "GET",
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`Ventrata API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching bookings for tour ${tourId}:`, error);
    return null;
  }
};
