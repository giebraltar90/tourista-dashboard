
import { useEffect, useState } from 'react';
import { TourCardProps } from '@/components/tours/tour-card/types';
import { GuideInfo } from '@/types/ventrata';
import { useGuideInfo } from '@/hooks/guides';
import { logger } from '@/utils/logger';
import { processGuideInfo, mapTourGroupGuideIds } from './utils/guideInfoProcessor';
import { fetchGuideById } from '@/services/api/guideApi';
import { isValidUuid } from '@/services/api/utils/guidesUtils';

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
  
  // Get guide info from database - handle both name and UUID lookups
  const rawGuide1Info = useGuideInfo(guide1 || '');
  const rawGuide2Info = useGuideInfo(guide2 || '');
  const rawGuide3Info = useGuideInfo(guide3 || '');
  
  // For direct UUID fetching if needed
  const [guide1DirectInfo, setGuide1DirectInfo] = useState<GuideInfo | null>(null);
  const [guide2DirectInfo, setGuide2DirectInfo] = useState<GuideInfo | null>(null);
  const [guide3DirectInfo, setGuide3DirectInfo] = useState<GuideInfo | null>(null);
  
  // Attempt direct UUID fetching for guides if they're UUIDs but weren't found
  useEffect(() => {
    const fetchMissingGuideInfo = async () => {
      // Only try direct fetch if guide1 is a UUID and we don't have info yet
      if (guide1 && isValidUuid(guide1) && !rawGuide1Info && !guide1DirectInfo) {
        try {
          const info = await fetchGuideById(guide1);
          if (info) {
            setGuide1DirectInfo(info);
            logger.debug(`🔄 [useTourGuideInfo] Directly fetched guide1 info: ${info.name}`);
          }
        } catch (error) {
          logger.debug(`🔄 [useTourGuideInfo] Error directly fetching guide1 info for ${guide1}`);
        }
      }
      
      // Repeat for guide2
      if (guide2 && isValidUuid(guide2) && !rawGuide2Info && !guide2DirectInfo) {
        try {
          const info = await fetchGuideById(guide2);
          if (info) {
            setGuide2DirectInfo(info);
            logger.debug(`🔄 [useTourGuideInfo] Directly fetched guide2 info: ${info.name}`);
          }
        } catch (error) {
          logger.debug(`🔄 [useTourGuideInfo] Error directly fetching guide2 info for ${guide2}`);
        }
      }
      
      // Repeat for guide3
      if (guide3 && isValidUuid(guide3) && !rawGuide3Info && !guide3DirectInfo) {
        try {
          const info = await fetchGuideById(guide3);
          if (info) {
            setGuide3DirectInfo(info);
            logger.debug(`🔄 [useTourGuideInfo] Directly fetched guide3 info: ${info.name}`);
          }
        } catch (error) {
          logger.debug(`🔄 [useTourGuideInfo] Error directly fetching guide3 info for ${guide3}`);
        }
      }
    };
    
    fetchMissingGuideInfo();
  }, [guide1, guide2, guide3, rawGuide1Info, rawGuide2Info, rawGuide3Info]);
  
  // State for processed guide info
  const [guide1Info, setGuide1Info] = useState<GuideInfo | null>(null);
  const [guide2Info, setGuide2Info] = useState<GuideInfo | null>(null);
  const [guide3Info, setGuide3Info] = useState<GuideInfo | null>(null);
  const [tourWithGuideIds, setTourWithGuideIds] = useState<TourCardProps>(safeTour);
  
  // Process guide info
  useEffect(() => {
    // Use either the hooks result or direct fetch result, preferring hooks result
    const effectiveGuide1Info = rawGuide1Info || guide1DirectInfo;
    const effectiveGuide2Info = rawGuide2Info || guide2DirectInfo;
    const effectiveGuide3Info = rawGuide3Info || guide3DirectInfo;
    
    // Process guide1 info
    const processedGuide1 = processGuideInfo(effectiveGuide1Info, guide1, 'guide1');
    setGuide1Info(processedGuide1);
    
    // Process guide2 info
    const processedGuide2 = processGuideInfo(effectiveGuide2Info, guide2, 'guide2');
    setGuide2Info(processedGuide2);
    
    // Process guide3 info
    const processedGuide3 = processGuideInfo(effectiveGuide3Info, guide3, 'guide3');
    setGuide3Info(processedGuide3);
    
    // Map guide IDs in tour groups
    const mappedGroups = mapTourGroupGuideIds(tourGroups, guide1, guide2, guide3);
    
    // Create tour with mapped guide IDs
    setTourWithGuideIds({
      ...safeTour,
      tourGroups: mappedGroups
    });
    
  }, [rawGuide1Info, rawGuide2Info, rawGuide3Info, guide1DirectInfo, guide2DirectInfo, 
      guide3DirectInfo, guide1, guide2, guide3, safeTour, tourGroups]);
  
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
