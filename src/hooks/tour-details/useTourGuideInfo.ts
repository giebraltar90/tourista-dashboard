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

export const useTourGuideInfo = (tour: TourCardProps): UseTourGuideInfoResult => {
  // Extract relevant data from tour
  const { id, guide1, guide2, guide3, tourGroups = [] } = tour || {};
  
  // Direct hook calls to get guide info
  const rawGuide1Info = useGuideInfo(guide1);
  const rawGuide2Info = useGuideInfo(guide2);
  const rawGuide3Info = useGuideInfo(guide3);
  
  // Keep track of processed guide info
  const [guide1Info, setGuide1Info] = useState<GuideInfo | null>(null);
  const [guide2Info, setGuide2Info] = useState<GuideInfo | null>(null);
  const [guide3Info, setGuide3Info] = useState<GuideInfo | null>(null);
  const [tourWithGuideIds, setTourWithGuideIds] = useState<TourCardProps>(tour);
  
  // Helper to check if a guide is Sophie Miller
  const isSophieMiller = (name: string = ''): boolean => {
    return name?.toLowerCase().includes('sophie miller');
  };
  
  // Process guide info and map guide IDs
  useEffect(() => {
    console.log("🔍 [useTourGuideInfo] Processing guide info for tour:", id);
    
    // Process guide1Info
    let processedGuide1Info = rawGuide1Info;
    if (rawGuide1Info && isSophieMiller(rawGuide1Info.name)) {
      // Ensure Sophie Miller is always GC
      processedGuide1Info = {
        ...rawGuide1Info,
        guideType: 'GC'
      };
      console.log("🔍 [useTourGuideInfo] Set Sophie Miller (guide1) as GC");
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
      console.log("🔍 [useTourGuideInfo] Set Sophie Miller (guide2) as GC");
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
      console.log("🔍 [useTourGuideInfo] Set Sophie Miller (guide3) as GC");
    }
    setGuide3Info(processedGuide3Info);
    
    // Map guide UUIDs to guide1, guide2, guide3 in tourGroups for easier reference
    if (tourGroups?.length) {
      const updatedGroups = tourGroups.map(group => {
        let mappedGuideId = group.guideId;
        
        // Log the original guide ID for debugging
        console.log(`🔍 [useTourGuideInfo] Group ${group.id} has guide: ${group.guideId}`);
        
        // Map DB UUIDs to guide1, guide2, guide3 if they match
        if (tour.guide1_id && group.guideId === tour.guide1_id) {
          mappedGuideId = 'guide1';
          console.log(`🔍 [useTourGuideInfo] Mapped ${group.guideId} to guide1`);
        } else if (tour.guide2_id && group.guideId === tour.guide2_id) {
          mappedGuideId = 'guide2';
          console.log(`🔍 [useTourGuideInfo] Mapped ${group.guideId} to guide2`);
        } else if (tour.guide3_id && group.guideId === tour.guide3_id) {
          mappedGuideId = 'guide3';
          console.log(`🔍 [useTourGuideInfo] Mapped ${group.guideId} to guide3`);
        }
        
        return {
          ...group,
          guideId: mappedGuideId
        };
      });
      
      setTourWithGuideIds({
        ...tour,
        tourGroups: updatedGroups
      });
    } else {
      setTourWithGuideIds(tour);
    }
  }, [id, rawGuide1Info, rawGuide2Info, rawGuide3Info, guide1, guide2, guide3, tour, tourGroups]);
  
  return {
    guide1Info,
    guide2Info,
    guide3Info,
    tourWithGuideIds
  };
};
