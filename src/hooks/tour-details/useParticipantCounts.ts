
import { useMemo } from 'react';
import { VentrataTourGroup } from '@/types/ventrata';
import { useTourStatistics } from './useTourStatistics';

export interface ParticipantCounts {
  totalParticipants: number;
  totalChildCount: number;
  adultTickets: number;
  childTickets: number;
  totalTickets: number;
  // Add the missing properties to fix TypeScript errors
  adultCount: number;
  childCount: number;
  totalTicketsNeeded: number;
}

/**
 * Hook to calculate participant counts
 */
export const useParticipantCounts = (
  tourGroups: VentrataTourGroup[],
  tourId?: string
): ParticipantCounts => {
  // Try to use the materialized view if a tourId is provided
  const { data: statistics } = useTourStatistics(tourId);
  
  return useMemo(() => {
    // If we have statistics from the materialized view, use those
    if (statistics) {
      return {
        totalParticipants: statistics.total_participants,
        totalChildCount: statistics.total_child_count,
        adultTickets: statistics.total_adult_count,
        childTickets: statistics.total_child_count,
        totalTickets: statistics.total_participants,
        // Add the missing properties with appropriate values
        adultCount: statistics.total_adult_count,
        childCount: statistics.total_child_count,
        totalTicketsNeeded: statistics.total_participants
      };
    }
    
    // Otherwise calculate from the tour groups
    let totalParticipants = 0;
    let totalChildCount = 0;
    
    if (Array.isArray(tourGroups)) {
      for (const group of tourGroups) {
        if (group.size) {
          totalParticipants += group.size;
        }
        if (group.childCount) {
          totalChildCount += group.childCount;
        }
      }
    }
    
    const adultTickets = totalParticipants - totalChildCount;
    
    // Return the complete object with all required properties
    return {
      totalParticipants,
      totalChildCount,
      adultTickets,
      childTickets: totalChildCount,
      totalTickets: totalParticipants,
      // Add the missing properties with appropriate values
      adultCount: adultTickets,
      childCount: totalChildCount,
      totalTicketsNeeded: totalParticipants
    };
  }, [tourGroups, statistics]);
};
