
import { TourCardProps } from '@/components/tours/tour-card/types';

/**
 * Helper function to normalize tour data ensuring all properties exist
 */
export const normalizeTourData = (tourData: any, tourId: string): TourCardProps | null => {
  if (!tourData) return null;
  
  return {
    id: tourData.id || tourId,
    date: tourData.date instanceof Date ? tourData.date : new Date(),
    location: tourData.location || "",
    tourName: tourData.tourName || "",
    tourType: tourData.tourType || "default",
    startTime: tourData.startTime || "",
    referenceCode: tourData.referenceCode || "",
    guide1: tourData.guide1 || "",
    guide2: tourData.guide2 || "",
    guide3: tourData.guide3 || "",
    tourGroups: Array.isArray(tourData.tourGroups) ? tourData.tourGroups.map(group => ({
      id: group.id || "",
      name: group.name || "",
      size: group.size || 0,
      entryTime: group.entryTime || "",
      guideId: group.guideId,
      childCount: group.childCount || 0,
      participants: Array.isArray(group.participants) ? group.participants : []
    })) : [],
    numTickets: tourData.numTickets || 0,
    isHighSeason: Boolean(tourData.isHighSeason),
    modifications: Array.isArray(tourData.modifications) ? tourData.modifications : []
  };
};
