
import { supabase } from '../client';
import { logger } from '@/utils/logger';

/**
 * Helper function to disable WebSocket connections if they're causing issues
 */
export const disableRealtimeSubscriptions = () => {
  try {
    supabase.removeAllChannels();
    logger.debug("All realtime subscriptions have been disabled");
  } catch (error) {
    logger.error("Error disabling realtime subscriptions:", error);
  }
};
