
import { useEffect, useState } from 'react';
import { TourCardProps } from '@/components/tours/tour-card/types';
import { GuideInfo, GuideType } from '@/types/ventrata';
import { useGuideInfo } from '@/hooks/guides';
import { logger } from '@/utils/logger';

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
  
  logger.debug("🔄 [useTourGuideInfo] Starting with tour:", {
    id,
    tourRef: safeTour.referenceCode || 'none',
    guide1: guide1 || 'none',
    guide2: guide2 || 'none',
    guide3: guide3 || 'none',
    groupCount: tourGroups?.length || 0
  });
  
  // Direct hook calls to get guide info
  const rawGuide1Info = useGuideInfo(guide1 || '');
  const rawGuide2Info = useGuideInfo(guide2 || '');
  const rawGuide3Info = useGuideInfo(guide3 || '');
  
  // Debug raw guide info
  useEffect(() => {
    logger.debug("🔄 [useTourGuideInfo] Raw guide info:", {
      tourId: id,
      tourRef: safeTour.referenceCode || 'none',
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
  }, [id, rawGuide1Info, rawGuide2Info, rawGuide3Info, safeTour.referenceCode]);
  
  // Keep track of processed guide info
  const [guide1Info, setGuide1Info] = useState<GuideInfo | null>(null);
  const [guide2Info, setGuide2Info] = useState<GuideInfo | null>(null);
  const [guide3Info, setGuide3Info] = useState<GuideInfo | null>(null);
  const [tourWithGuideIds, setTourWithGuideIds] = useState<TourCardProps>(safeTour);
  
  // Process guide info and map guide IDs
  useEffect(() => {
    logger.debug("🔄 [useTourGuideInfo] Processing guide info for tour:", id);
    
    // Process guide1Info
    if (guide1 && rawGuide1Info) {
      const updatedInfo = { ...rawGuide1Info };
      
      // Special case: Sophie Miller is always a GC guide
      if (updatedInfo.name && updatedInfo.name.toLowerCase().includes('sophie miller')) {
        updatedInfo.guideType = 'GC' as GuideType;
      }
      
      setGuide1Info(updatedInfo);
      logger.debug(`🔄 [useTourGuideInfo] Processed guide1: ${updatedInfo.name} (${updatedInfo.guideType})`);
    } else if (guide1) {
      // Create a fallback guide info
      const isSophieMiller = guide1.toLowerCase().includes('sophie miller');
      const fallbackInfo: GuideInfo = {
        id: "guide1",
        name: guide1,
        birthday: new Date(),
        guideType: (isSophieMiller ? 'GC' : 'GA Ticket') as GuideType
      };
      setGuide1Info(fallbackInfo);
      logger.debug(`🔄 [useTourGuideInfo] Created fallback guide1: ${guide1} (${fallbackInfo.guideType})`);
    } else {
      setGuide1Info(null);
      logger.debug(`🔄 [useTourGuideInfo] No guide1 for tour: ${id}`);
    }
    
    // Process guide2Info
    if (guide2 && rawGuide2Info) {
      const updatedInfo = { ...rawGuide2Info };
      
      // Special case: Sophie Miller is always a GC guide
      if (updatedInfo.name && updatedInfo.name.toLowerCase().includes('sophie miller')) {
        updatedInfo.guideType = 'GC' as GuideType;
      }
      
      setGuide2Info(updatedInfo);
      logger.debug(`🔄 [useTourGuideInfo] Processed guide2: ${updatedInfo.name} (${updatedInfo.guideType})`);
    } else if (guide2) {
      // Create a fallback guide info
      const isSophieMiller = guide2.toLowerCase().includes('sophie miller');
      const fallbackInfo: GuideInfo = {
        id: "guide2",
        name: guide2,
        birthday: new Date(),
        guideType: (isSophieMiller ? 'GC' : 'GA Free') as GuideType
      };
      setGuide2Info(fallbackInfo);
      logger.debug(`🔄 [useTourGuideInfo] Created fallback guide2: ${guide2} (${fallbackInfo.guideType})`);
    } else {
      setGuide2Info(null);
      logger.debug(`🔄 [useTourGuideInfo] No guide2 for tour: ${id}`);
    }
    
    // Process guide3Info
    if (guide3 && rawGuide3Info) {
      const updatedInfo = { ...rawGuide3Info };
      
      // Special case: Sophie Miller is always a GC guide
      if (updatedInfo.name && updatedInfo.name.toLowerCase().includes('sophie miller')) {
        updatedInfo.guideType = 'GC' as GuideType;
      }
      
      setGuide3Info(updatedInfo);
      logger.debug(`🔄 [useTourGuideInfo] Processed guide3: ${updatedInfo.name} (${updatedInfo.guideType})`);
    } else if (guide3) {
      // Create a fallback guide info
      const isSophieMiller = guide3.toLowerCase().includes('sophie miller');
      const fallbackInfo: GuideInfo = {
        id: "guide3",
        name: guide3,
        birthday: new Date(),
        guideType: (isSophieMiller ? 'GC' : 'GA Ticket') as GuideType
      };
      setGuide3Info(fallbackInfo);
      logger.debug(`🔄 [useTourGuideInfo] Created fallback guide3: ${guide3} (${fallbackInfo.guideType})`);
    } else {
      setGuide3Info(null);
      logger.debug(`🔄 [useTourGuideInfo] No guide3 for tour: ${id}`);
    }
    
    // Map guide UUIDs to guide1, guide2, guide3 in tourGroups for easier reference
    if (Array.isArray(tourGroups) && tourGroups.length > 0) {
      const updatedGroups = tourGroups.map(group => {
        let mappedGuideId = group.guideId;
        
        // Log the original guide ID for debugging
        logger.debug(`🔄 [useTourGuideInfo] Group ${group.id} has guide: ${group.guideId}`);
        
        // Map guide IDs based on direct comparison with guide1, guide2, guide3
        if (group.guideId && guide1 && group.guideId === guide1) {
          mappedGuideId = 'guide1';
          logger.debug(`🔄 [useTourGuideInfo] Mapped ${group.guideId} to guide1`);
        } else if (group.guideId && guide2 && group.guideId === guide2) {
          mappedGuideId = 'guide2';
          logger.debug(`🔄 [useTourGuideInfo] Mapped ${group.guideId} to guide2`);
        } else if (group.guideId && guide3 && group.guideId === guide3) {
          mappedGuideId = 'guide3';
          logger.debug(`🔄 [useTourGuideInfo] Mapped ${group.guideId} to guide3`);
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
  
  // Log final guide info for debugging
  useEffect(() => {
    logger.debug("🔄 [useTourGuideInfo] Final guide info for tour:", {
      id,
      referenceCode: safeTour.referenceCode,
      guide1Info: guide1Info ? {
        name: guide1Info.name,
        type: guide1Info.guideType,
        id: guide1Info.id
      } : 'none',
      guide2Info: guide2Info ? {
        name: guide2Info.name,
        type: guide2Info.guideType,
        id: guide2Info.id
      } : 'none',
      guide3Info: guide3Info ? {
        name: guide3Info.name,
        type: guide3Info.guideType,
        id: guide3Info.id
      } : 'none',
    });
  }, [id, guide1Info, guide2Info, guide3Info, safeTour.referenceCode]);
  
  return {
    guide1Info,
    guide2Info,
    guide3Info,
    tourWithGuideIds
  };
};
