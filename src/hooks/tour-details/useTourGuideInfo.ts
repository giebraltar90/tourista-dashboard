
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
  const guide1Query = useGuideInfo(guide1Id);
  const guide2Query = useGuideInfo(guide2Id);
  const guide3Query = useGuideInfo(guide3Id);

  // Return the guide information
  return {
    guide1Info: guide1Query.data,
    guide2Info: guide2Query.data,
    guide3Info: guide3Query.data,
    guide1Loading: guide1Query.isLoading,
    guide2Loading: guide2Query.isLoading,
    guide3Loading: guide3Query.isLoading
  };
}
