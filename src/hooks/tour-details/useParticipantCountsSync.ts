
import { useEffect, useMemo } from 'react';
import { VentrataTourGroup } from '@/types/ventrata';
import { ParticipantCounts, useParticipantCounts } from './useParticipantCounts';

/**
 * Custom hook to calculate participant counts and sync them with UI components
 */
export const useParticipantCountsSync = (tourGroups: VentrataTourGroup[]): ParticipantCounts => {
  // Use the existing participant counts hook
  const basicCounts = useParticipantCounts(tourGroups);
  
  // Log calculations for debugging
  useEffect(() => {
    console.log("PARTICIPANT_COUNTS: useParticipantCountsSync calculations:", {
      tourGroupsCount: tourGroups.length,
      basicCounts
    });
  }, [tourGroups, basicCounts]);
  
  // Return memoized counts to prevent unnecessary renders
  return useMemo(() => {
    return {
      ...basicCounts
    };
  }, [basicCounts]);
};
