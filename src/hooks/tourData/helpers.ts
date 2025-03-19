
import { VentrataToursResponse } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";

// Helper function to convert API response to our app's data structure
export const transformTours = (response: VentrataToursResponse): TourCardProps[] => {
  return response.data.map(tour => ({
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
  }));
};

// UUID validation helper
export const isUuid = (id: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};
