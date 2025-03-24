
import { useCallback } from 'react';
import { VentrataParticipant } from '@/types/ventrata';

/**
 * Hook for drag and drop operations
 */
export const useDragHandlers = (isMovePending: boolean) => {
  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, participant: VentrataParticipant, fromGroupIndex: number) => {
    if (isMovePending) return;
    
    e.dataTransfer.setData('application/json', JSON.stringify({
      participant,
      fromGroupIndex
    }));
    
    e.dataTransfer.effectAllowed = 'move';
  }, [isMovePending]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);
  
  const handleDragEnd = useCallback(() => {
    // Reset any drag state if needed
  }, []);

  return {
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDragEnd
  };
};
