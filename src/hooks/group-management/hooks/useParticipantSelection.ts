
import { useState } from 'react';
import { VentrataParticipant } from '@/types/ventrata';

/**
 * Hook to manage participant selection for moving between groups
 */
export const useParticipantSelection = () => {
  const [selectedParticipant, setSelectedParticipant] = useState<{ 
    participant: VentrataParticipant; 
    fromGroupIndex: number 
  } | null>(null);
  
  const [isMovePending, setIsMovePending] = useState(false);
  
  return {
    selectedParticipant,
    setSelectedParticipant,
    isMovePending,
    setIsMovePending
  };
};
