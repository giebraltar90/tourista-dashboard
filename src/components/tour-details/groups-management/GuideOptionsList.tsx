
import { GuideInfo } from "@/types/ventrata";
import { TourCardProps } from "@/components/tours/tour-card/types";
import { isValidUuid } from "@/services/api/utils/guidesUtils";

interface GuideOptionsListProps {
  tour: TourCardProps;
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
  guides: Array<{
    id: string;
    name: string;
    info?: GuideInfo | null;
  }> | undefined;
}

export const getValidGuides = ({ 
  tour, 
  guide1Info, 
  guide2Info, 
  guide3Info,
  guides = []
}: GuideOptionsListProps) => {
  const options = [];
  
  // Primary guides - use consistent IDs
  if (tour.guide1) {
    options.push({ 
      id: "guide1", 
      name: tour.guide1, 
      info: guide1Info 
    });
  }
  
  if (tour.guide2) {
    options.push({ 
      id: "guide2", 
      name: tour.guide2, 
      info: guide2Info 
    });
  }
  
  if (tour.guide3) {
    options.push({ 
      id: "guide3", 
      name: tour.guide3, 
      info: guide3Info 
    });
  }
  
  // Add other guides from the database
  if (guides && Array.isArray(guides)) {
    guides.forEach(guide => {
      // Skip if this guide is already in the options by name
      if (!options.some(g => g.name === guide.name)) {
        options.push({ 
          id: guide.id, 
          name: guide.name, 
          info: guide.info || guide 
        });
      }
    });
  }
  
  return options.filter(guide => guide.name && guide.id);
};

// Helper to find guide name from ID
export const getGuideName = (guideId: string | undefined, tour: TourCardProps, guides: any[] = []) => {
  if (!guideId) return "Unassigned";
  
  if (isValidUuid(guideId)) {
    const guideMatch = guides.find(g => g.id === guideId);
    if (guideMatch) return guideMatch.name;
    
    // Check if it matches one of the primary guides
    if (tour.guide1 && tour.guide1 === guideId) return tour.guide1;
    if (tour.guide2 && tour.guide2 === guideId) return tour.guide2;
    if (tour.guide3 && tour.guide3 === guideId) return tour.guide3;
    
    // If we can't find a name, show a truncated version of the UUID
    return `Guide (${guideId.substring(0, 6)}...)`;
  }
  
  // Standard guide references
  if (guideId === "guide1") return tour.guide1 || "Primary Guide";
  if (guideId === "guide2") return tour.guide2 || "Secondary Guide";
  if (guideId === "guide3") return tour.guide3 || "Assistant Guide";
  
  return guideId;
};
