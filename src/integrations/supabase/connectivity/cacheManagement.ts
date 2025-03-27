
import { queryCache } from '../cache';
import { logger } from '@/utils/logger';

/**
 * Invalidate cache for a specific tour
 */
export const invalidateTourCache = (tourId: string) => {
  logger.debug(`Invalidating cache for tour ${tourId}`);
  queryCache.invalidate(`tour_${tourId}`);
  queryCache.invalidate(`tour_statistics_${tourId}`);
};
