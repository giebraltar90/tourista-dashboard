
import { useMemo } from 'react';
import { TourCardProps } from '@/components/tours/tour-card/types';
import { GuideInfo } from '@/types/ventrata';
import { useGuideInfo } from '@/hooks/guides/useGuideInfo';

/**
 * Custom hook to load guide information for a tour
 */
export function useTourGuideInfo(tour: TourCardProps | undefined | null) {
  // Safely extract guide IDs from tour
  const guide1Id = useMemo(() => tour?.guide1 || '', [tour]);
  const guide2Id = useMemo(() => tour?.guide2 || '', [tour]);
  const guide3Id = useMemo(() => tour?.guide3 || '', [tour]);

  // Use the useGuideInfo hook to get guide information
  const { data: guide1Info } = useGuideInfo(guide1Id);
  const { data: guide2Info } = useGuideInfo(guide2Id);
  const { data: guide3Info } = useGuideInfo(guide3Id);

  // Return the guide information
  return {
    guide1Info,
    guide2Info,
    guide3Info
  };
}
