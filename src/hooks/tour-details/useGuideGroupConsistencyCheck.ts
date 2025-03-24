
import { useEffect } from 'react';
import { syncGroupNamesWithGuides } from '@/services/api/tour/groupGuideService';
import { logger } from '@/utils/logger';

/**
 * Hook to ensure guide assignments and group names are consistent
 * This helps prevent UI bugs where guides appear in the wrong groups
 */
export const useGuideGroupConsistencyCheck = (tourId: string) => {
  useEffect(() => {
    if (!tourId) return;
    
    const checkConsistency = async () => {
      logger.debug(`Running guide-group consistency check for tour ${tourId}`);
      
      try {
        const synced = await syncGroupNamesWithGuides(tourId);
        
        if (synced) {
          logger.debug(`Successfully synchronized group names with guides for tour ${tourId}`);
        } else {
          logger.error(`Failed to synchronize group names with guides for tour ${tourId}`);
        }
      } catch (error) {
        logger.error(`Error in guide-group consistency check for tour ${tourId}:`, error);
      }
    };
    
    // Run the check when the component mounts
    checkConsistency();
    
    // Set up listener for guide change events
    const handleGuideChange = () => {
      logger.debug(`Guide change detected for tour ${tourId}, checking consistency`);
      checkConsistency();
    };
    
    // Listen for relevant events
    window.addEventListener(`guide-change:${tourId}`, handleGuideChange);
    window.addEventListener(`guide-assignment-updated:${tourId}`, handleGuideChange);
    
    return () => {
      // Cleanup
      window.removeEventListener(`guide-change:${tourId}`, handleGuideChange);
      window.removeEventListener(`guide-assignment-updated:${tourId}`, handleGuideChange);
    };
  }, [tourId]);
  
  return null; // This hook doesn't return anything
};
