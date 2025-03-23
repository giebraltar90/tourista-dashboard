import { useEffect, useState } from 'react';
import { TourCardProps } from '@/components/tours/tour-card/types';
import { GuideInfo } from '@/types/ventrata';
import { useGuideInfo } from '@/hooks/guides';

interface UseTourGuideInfoResult {
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
  tourWithGuideIds: TourCardProps;
}

export const useTourGuideInfo = (tour: TourCardProps | null): UseTourGuideInfoResult => {
  // Ensure tour is not null and provide fallback values
  const safeTour = tour || {
    id: '',
    date: new Date(),
    location: '',
    tourName: '',
    tourType: 'default',
    startTime: '',
    referenceCode: '',
    guide1: '',
    guide2: '',
    guide3: '',
    tourGroups: [],
    numTickets: 0,
    isHighSeason: false
  };
  
  // Extract relevant data from tour with null safety
  const { id, guide1, guide2, guide3, tourGroups = [] } = safeTour;
  
  console.log("🔄 [useTourGuideInfo] Starting with tour:", {
    id,
    guide1: guide1 || 'none',
    guide2: guide2 || 'none',
    guide3: guide3 || 'none',
    groupCount: tourGroups?.length || 0
  });
  
  // Direct hook calls to get guide info
  const rawGuide1Info = useGuideInfo(guide1 || '');
  const rawGuide2Info = useGuideInfo(guide2 || '');
  const rawGuide3Info = useGuideInfo(guide3 || '');
  
  // Keep track of processed guide info
  const [guide1Info, setGuide1Info] = useState<GuideInfo | null>(null);
  const [guide2Info, setGuide2Info] = useState<GuideInfo | null>(null);
  const [guide3Info, setGuide3Info] = useState<GuideInfo | null>(null);
  const [tourWithGuideIds, setTourWithGuideIds] = useState<TourCardProps>(safeTour);
  
  // Helper to check if a guide is Sophie Miller
  const isSophieMiller = (name: string = ''): boolean => {
    return name?.toLowerCase().includes('sophie miller');
  };
  
  // Process guide info and map guide IDs
  useEffect(() => {
    console.log("🔄 [useTourGuideInfo] Processing guide info for tour:", id);
    console.log("🔄 [useTourGuideInfo] Raw guide info:", {
      guide1: rawGuide1Info ? {
        name: rawGuide1Info.name,
        type: rawGuide1Info.guideType
      } : 'none',
      guide2: rawGuide2Info ? {
        name: rawGuide2Info.name,
        type: rawGuide2Info.guideType
      } : 'none',
      guide3: rawGuide3Info ? {
        name: rawGuide3Info.name,
        type: rawGuide3Info.guideType
      } : 'none'
    });
    
    // Process guide1Info
    let processedGuide1Info = rawGuide1Info;
    if (rawGuide1Info && isSophieMiller(rawGuide1Info.name)) {
      // Ensure Sophie Miller is always GC
      processedGuide1Info = {
        ...rawGuide1Info,
        guideType: 'GC'
      };
      console.log("🔄 [useTourGuideInfo] Set Sophie Miller (guide1) as GC");
    }
    setGuide1Info(processedGuide1Info);
    
    // Process guide2Info
    let processedGuide2Info = rawGuide2Info;
    if (rawGuide2Info && isSophieMiller(rawGuide2Info.name)) {
      // Ensure Sophie Miller is always GC
      processedGuide2Info = {
        ...rawGuide2Info,
        guideType: 'GC'
      };
      console.log("🔄 [useTourGuideInfo] Set Sophie Miller (guide2) as GC");
    }
    setGuide2Info(processedGuide2Info);
    
    // Process guide3Info
    let processedGuide3Info = rawGuide3Info;
    if (rawGuide3Info && isSophieMiller(rawGuide3Info.name)) {
      // Ensure Sophie Miller is always GC
      processedGuide3Info = {
        ...rawGuide3Info,
        guideType: 'GC'
      };
      console.log("🔄 [useTourGuideInfo] Set Sophie Miller (guide3) as GC");
    }
    setGuide3Info(processedGuide3Info);
    
    // Map guide UUIDs to guide1, guide2, guide3 in tourGroups for easier reference
    if (Array.isArray(tourGroups) && tourGroups.length > 0) {
      const updatedGroups = tourGroups.map(group => {
        let mappedGuideId = group.guideId;
        
        // Log the original guide ID for debugging
        console.log(`🔄 [useTourGuideInfo] Group ${group.id} has guide: ${group.guideId}`);
        
        // Map guide IDs based on direct comparison with guide1, guide2, guide3
        if (group.guideId && guide1 && group.guideId === guide1) {
          mappedGuideId = 'guide1';
          console.log(`🔄 [useTourGuideInfo] Mapped ${group.guideId} to guide1`);
        } else if (group.guideId && guide2 && group.guideId === guide2) {
          mappedGuideId = 'guide2';
          console.log(`🔄 [useTourGuideInfo] Mapped ${group.guideId} to guide2`);
        } else if (group.guideId && guide3 && group.guideId === guide3) {
          mappedGuideId = 'guide3';
          console.log(`🔄 [useTourGuideInfo] Mapped ${group.guideId} to guide3`);
        }
        
        return {
          ...group,
          guideId: mappedGuideId
        };
      });
      
      setTourWithGuideIds({
        ...safeTour,
        tourGroups: updatedGroups
      });
    } else {
      setTourWithGuideIds(safeTour);
    }
  }, [id, rawGuide1Info, rawGuide2Info, rawGuide3Info, guide1, guide2, guide3, safeTour, tourGroups]);
  
  console.log("🔄 [useTourGuideInfo] Returning processed guide info:", {
    guide1Info: guide1Info ? {
      name: guide1Info.name,
      type: guide1Info.guideType
    } : 'none',
    guide2Info: guide2Info ? {
      name: guide2Info.name,
      type: guide2Info.guideType
    } : 'none',
    guide3Info: guide3Info ? {
      name: guide3Info.name,
      type: guide3Info.guideType
    } : 'none',
    groupCount: tourWithGuideIds.tourGroups?.length || 0
  });
  
  return {
    guide1Info,
    guide2Info,
    guide3Info,
    tourWithGuideIds
  };
};
