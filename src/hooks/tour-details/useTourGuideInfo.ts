
import { useEffect, useState } from 'react';
import { TourCardProps } from '@/components/tours/tour-card/types';
import { GuideInfo } from '@/types/ventrata';
import { useGuideInfo } from '@/hooks/guides';
import { logger } from '@/utils/logger';
import { processGuideInfo, mapTourGroupGuideIds } from './utils/guideInfoProcessor';

interface UseTourGuideInfoResult {
  guide1Info: GuideInfo | null;
  guide2Info: GuideInfo | null;
  guide3Info: GuideInfo | null;
  tourWithGuideIds: TourCardProps;
}

export const useTourGuideInfo = (tour: TourCardProps | null): UseTourGuideInfoResult => {
  // Provide fallback tour if null
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
  const { id, guide1, guide2, guide3, tourGroups = [], location = '' } = safeTour;
  
  // Log initial tour info
  useEffect(() => {
    logger.debug("🔄 [useTourGuideInfo] Starting with tour:", {
      id,
      tourRef: safeTour.referenceCode || 'none',
      guide1: guide1 || 'none',
      guide2: guide2 || 'none',
      guide3: guide3 || 'none',
      location: location || 'none',
      groupCount: tourGroups?.length || 0
    });
  }, [id, guide1, guide2, guide3, safeTour.referenceCode, location, tourGroups?.length]);
  
  // Get guide info from database
  const rawGuide1Info = useGuideInfo(guide1 || '');
  const rawGuide2Info = useGuideInfo(guide2 || '');
  const rawGuide3Info = useGuideInfo(guide3 || '');
  
  // State for processed guide info
  const [guide1Info, setGuide1Info] = useState<GuideInfo | null>(null);
  const [guide2Info, setGuide2Info] = useState<GuideInfo | null>(null);
  const [guide3Info, setGuide3Info] = useState<GuideInfo | null>(null);
  const [tourWithGuideIds, setTourWithGuideIds] = useState<TourCardProps>(safeTour);
  
  // Process guide info
  useEffect(() => {
    // Process guide1 info
    const processedGuide1 = processGuideInfo(rawGuide1Info, guide1, 'guide1');
    setGuide1Info(processedGuide1);
    
    // Process guide2 info
    const processedGuide2 = processGuideInfo(rawGuide2Info, guide2, 'guide2');
    setGuide2Info(processedGuide2);
    
    // Process guide3 info
    const processedGuide3 = processGuideInfo(rawGuide3Info, guide3, 'guide3');
    setGuide3Info(processedGuide3);
    
    // Map guide IDs in tour groups
    const mappedGroups = mapTourGroupGuideIds(tourGroups, guide1, guide2, guide3);
    
    // Create tour with mapped guide IDs
    setTourWithGuideIds({
      ...safeTour,
      tourGroups: mappedGroups
    });
    
  }, [rawGuide1Info, rawGuide2Info, rawGuide3Info, guide1, guide2, guide3, safeTour, tourGroups]);
  
  // Log final guide info for debugging
  useEffect(() => {
    logger.debug("🔄 [useTourGuideInfo] Final guide info for tour:", {
      id,
      referenceCode: safeTour.referenceCode,
      location: location || 'none',
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
  }, [id, guide1Info, guide2Info, guide3Info, safeTour.referenceCode, location]);
  
  return {
    guide1Info,
    guide2Info,
    guide3Info,
    tourWithGuideIds
  };
};
