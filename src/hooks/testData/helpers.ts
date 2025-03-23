
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/utils/logger";

// Types for guide and tour tables
export type GuideType = 'GA Ticket' | 'GA Free' | 'GC';
export type TourType = 'food' | 'private' | 'default';
export type ModificationStatus = 'pending' | 'complete';

/**
 * Clear all test data from the database
 */
export const clearAllTestData = async () => {
  try {
    logger.info("Clearing all test data...");
    
    // First check for any foreign key dependencies by trying a no-op delete
    const { error: checkError } = await supabase
      .from('tours')
      .delete()
      .eq('id', '00000000-0000-0000-0000-000000000000'); // Non-existent ID
      
    if (checkError && checkError.message.includes('violates foreign key constraint')) {
      logger.error("Foreign key constraint detected:", checkError);
      // Additional tables may have dependencies on our main tables
      await deleteOtherDependentTables();
    }
    
    // Delete records in the correct order to respect foreign key constraints
    // 1. First delete participants as they depend on tour_groups
    try {
      const { error: participantsError } = await supabase
        .from('participants')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all participants
        
      if (participantsError) {
        logger.error("Error deleting participants:", participantsError);
        toast.error("Failed to delete participants");
      } else {
        logger.info("Successfully deleted all participants");
      }
    } catch (err) {
      logger.error("Exception deleting participants:", err);
    }
    
    // 2. Delete tickets as they depend on tours
    try {
      const { error: ticketsError } = await supabase
        .from('tickets')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all tickets
        
      if (ticketsError) {
        logger.error("Error deleting tickets:", ticketsError);
        toast.error("Failed to delete tickets");
      } else {
        logger.info("Successfully deleted all tickets");
      }
    } catch (err) {
      logger.error("Exception deleting tickets:", err);
    }
    
    // 3. Delete ticket buckets which may reference tours
    try {
      const { error: ticketBucketsError } = await supabase
        .from('ticket_buckets')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      if (ticketBucketsError) {
        logger.error("Error deleting ticket buckets:", ticketBucketsError);
        toast.error("Failed to delete ticket buckets");
      } else {
        logger.info("Successfully deleted all ticket buckets");
      }
    } catch (err) {
      logger.error("Exception deleting ticket buckets:", err);
    }
    
    // 4. Delete modifications as they depend on tours
    try {
      const { error: modificationsError } = await supabase
        .from('modifications')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all modifications
        
      if (modificationsError) {
        logger.error("Error deleting modifications:", modificationsError);
        toast.error("Failed to delete modifications");
      } else {
        logger.info("Successfully deleted all modifications");
      }
    } catch (err) {
      logger.error("Exception deleting modifications:", err);
    }
    
    // 5. Delete tour_groups as they depend on tours and guides
    try {
      const { error: groupsError } = await supabase
        .from('tour_groups')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all groups
        
      if (groupsError) {
        logger.error("Error deleting tour groups:", groupsError);
        toast.error("Failed to delete tour groups");
      } else {
        logger.info("Successfully deleted all tour groups");
      }
    } catch (err) {
      logger.error("Exception deleting tour groups:", err);
    }
    
    // 6. Delete tours
    try {
      const { error: toursError } = await supabase
        .from('tours')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all tours
        
      if (toursError) {
        logger.error("Error deleting tours:", toursError);
        toast.error("Failed to delete tours");
        
        // If we get foreign key errors, let's try to find the dependencies
        if (toursError.message.includes('violates foreign key constraint')) {
          await checkTourDependencies();
        }
      } else {
        logger.info("Successfully deleted all tours");
      }
    } catch (err) {
      logger.error("Exception deleting tours:", err);
    }
    
    // 7. Finally delete guides
    try {
      const { error: guidesError } = await supabase
        .from('guides')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all guides
        
      if (guidesError) {
        logger.error("Error deleting guides:", guidesError);
        toast.error("Failed to delete guides");
      } else {
        logger.info("Successfully deleted all guides");
      }
    } catch (err) {
      logger.error("Exception deleting guides:", err);
    }
    
    logger.info("Successfully cleared all test data");
    return true;
  } catch (error) {
    logger.error("Error clearing test data:", error);
    toast.error("Error clearing test data, check console for details");
    return false;
  }
};

/**
 * Check for other tables that might depend on tours
 */
const deleteOtherDependentTables = async () => {
  // Delete ticket buckets which may reference tours
  try {
    const { error: ticketBucketsError } = await supabase
      .from('ticket_buckets')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
      
    if (ticketBucketsError) {
      logger.error("Error deleting ticket buckets:", ticketBucketsError);
    } else {
      logger.info("Successfully deleted all ticket buckets");
    }
  } catch (err) {
    logger.error("Exception deleting ticket buckets:", err);
  }
};

/**
 * Check which tables might still be referencing tours
 */
const checkTourDependencies = async () => {
  logger.warn("Checking for tour dependencies...");
  
  try {
    // Check ticket_buckets table
    const { data: ticketBuckets, error: ticketBucketsError } = await supabase
      .from('ticket_buckets')
      .select('id, tour_id')
      .limit(5);
      
    if (ticketBucketsError) {
      logger.error("Error checking ticket buckets:", ticketBucketsError);
    } else if (ticketBuckets && ticketBuckets.length > 0) {
      logger.warn(`Found ${ticketBuckets.length} ticket buckets still referencing tours`);
    }
  } catch (err) {
    logger.error("Exception checking ticket buckets:", err);
  }
  
  // You can add more checks here for other tables that might reference tours
};

/**
 * Generate a unique ID for test data
 */
export const generateTestId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
