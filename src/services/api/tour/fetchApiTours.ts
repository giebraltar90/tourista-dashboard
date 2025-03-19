
import { TourCardProps } from "@/components/tours/tour-card/types";
import { mockTours } from "@/data/mockData";
import { API_BASE_URL, headers } from "../apiConfig";
import { transformTours } from "@/hooks/tourData/helpers";

/**
 * Fetch tours from API
 */
export const fetchToursFromAPI = async (params?: {
  startDate?: string;
  endDate?: string;
  location?: string;
}): Promise<TourCardProps[]> => {
  // Build query parameters
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  if (params?.location) queryParams.append("location", params.location);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
  
  try {
    const response = await fetch(`${API_BASE_URL}/tours${queryString}`, {
      method: "GET",
      headers,
    });
    
    if (!response.ok) {
      console.log("API error, using mock data instead");
      return mockTours;
    }
    
    const data = await response.json();
    
    // Transform the API response to match our TourCardProps structure
    return transformTours(data);
  } catch (error) {
    console.error("Error fetching tours from API:", error);
    // In case of API failure, return mock data as fallback
    return mockTours;
  }
};
