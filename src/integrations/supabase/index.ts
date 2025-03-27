
import { supabase } from './client';
import { testSupabaseConnection } from './connectionTest';
import { checkDatabaseConnection } from './connectivity/databaseCheck';
import { logger } from '@/utils/logger';

// Export all functionality
export { supabase };
export * from './client';
export * from './connectivity';
export * from './retry';
export * from './cache';
export * from './constants';
export * from './connectionTest';
export * from './helpers';

// Run a connection test on module import
logger.setDebugMode(true);
logger.debug("Supabase integration module loaded, testing connection...");

// Run connection tests in background
setTimeout(async () => {
  try {
    logger.debug("Running Supabase connection tests...");
    
    // Check database connection
    const connectionStatus = await checkDatabaseConnection();
    logger.debug("Database connection status:", connectionStatus);
    
    // Test fetching data
    const testResult = await testSupabaseConnection();
    logger.debug("Test connection result:", testResult);
    
    if (connectionStatus.connected && testResult.success) {
      logger.info("✅ Supabase connection is working properly");
    } else {
      logger.error("❌ Supabase connection has issues:", {
        connectionStatus,
        testResult
      });
    }
  } catch (error) {
    logger.error("Error during Supabase connection tests:", error);
  }
}, 1000);
