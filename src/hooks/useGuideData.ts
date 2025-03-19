
import { useMemo } from "react";
import { useTours } from "./useTourData";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";
import { GuideInfo, GuideType } from "@/types/ventrata";

// Mock guide data
export const guideData: Record<string, GuideInfo> = {
  "Maria Garcia": {
    name: "Maria Garcia",
    birthday: new Date(1995, 6, 15), // July 15, 1995
    guideType: "GA Free",
    id: "guide1"
  },
  "Jean Dupont": {
    name: "Jean Dupont",
    birthday: new Date(1985, 2, 22), // March 22, 1985
    guideType: "GA Ticket",
    id: "guide2"
  },
  "Sophie Miller": {
    name: "Sophie Miller",
    birthday: new Date(1990, 9, 5), // October 5, 1990
    guideType: "GC",
    id: "guide3"
  },
  "Carlos Martinez": {
    name: "Carlos Martinez",
    birthday: new Date(1988, 4, 18), // May 18, 1988
    guideType: "GA Ticket",
    id: "guide4"
  },
  "Noema Weber": {
    name: "Noema Weber",
    birthday: new Date(1998, 11, 3), // December 3, 1998
    guideType: "GA Free",
    id: "guide5"
  },
  "Tobias Schmidt": {
    name: "Tobias Schmidt",
    birthday: new Date(1982, 7, 27), // August 27, 1982
    guideType: "GC",
    id: "guide6"
  }
};

export function useGuideInfo(guideName: string): GuideInfo | null {
  return guideData[guideName] || null;
}

export function useGuideData() {
  const guides = useMemo(() => {
    return Object.values(guideData);
  }, []);
  
  return { guides };
}

export function useGuideTours() {
  const { data: allTours, isLoading, error } = useTours();
  const { guideView } = useRole();
  
  const guideName = guideView?.guideName || "";
  
  const guideTours = useMemo(() => {
    if (!allTours) return [];
    
    // Filter tours where the guide is either guide1 or guide2
    return allTours.filter(tour => 
      tour.guide1 === guideName || tour.guide2 === guideName || tour.guide3 === guideName
    );
  }, [allTours, guideName]);
  
  // If we're in guide view but there are no tours, show a notification
  useMemo(() => {
    if (guideView && allTours && !isLoading && guideTours.length === 0) {
      toast.info(`No tours found for guide: ${guideName}`);
    }
  }, [guideView, allTours, isLoading, guideTours.length, guideName]);
  
  return {
    data: guideTours,
    isLoading,
    error,
    guideName,
    guideInfo: useGuideInfo(guideName)
  };
}

// Helper function to determine if a guide needs a ticket based on tour location and guide type
export function doesGuideNeedTicket(guide: GuideInfo, tourLocation: string): boolean {
  // Only Versailles tours require special ticket handling for guides
  if (!tourLocation.toLowerCase().includes('versailles')) {
    return false;
  }
  
  // Based on guide type
  switch (guide.guideType) {
    case 'GA Ticket':
      return true; // Needs an adult ticket
    case 'GA Free':
      return true; // Needs a child ticket
    case 'GC':
      return false; // No ticket needed
    default:
      return false;
  }
}

// Helper function to get the type of ticket needed for a guide
export function getGuideTicketType(guide: GuideInfo): 'adult' | 'child' | null {
  switch (guide.guideType) {
    case 'GA Ticket':
      return 'adult'; // Needs an adult ticket
    case 'GA Free':
      return 'child'; // Needs a child ticket
    case 'GC':
    default:
      return null; // No ticket needed
  }
}
