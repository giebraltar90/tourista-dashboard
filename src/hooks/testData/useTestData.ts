
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { clearAllTestData } from "./helpers";
import { supabase } from "@/integrations/supabase/client";
import { createTestGuides } from "./createGuides";
import { createTestTours as createTestToursFunc } from "./createTours";
import { createTestTourGroups } from "./createTourGroups";
import { createTestModifications } from "./createModifications";
import { createTestTickets } from "./createTickets";
import { createTestParticipants } from "./createParticipants";

/**
 * Hook for managing test data creation and clearing
 */
export const useTestData = () => {
  const queryClient = useQueryClient();

  /**
   * Create comprehensive test data
   */
  const createTestTours = async () => {
    try {
      toast.info("Creating comprehensive test data...");
      
      // Step 1: Create test guides
      const guides = await createTestGuides();
      
      if (!guides || guides.length === 0) {
        toast.error("Failed to create test guides");
        return false;
      }
      
      // Create a map of guide names to IDs for easier reference
      const guideMap = guides.reduce((map, guide) => {
        map[guide.name] = guide.id;
        return map;
      }, {});
      
      // Step 2: Create test tours
      const tours = await createTestToursFunc(guideMap);
      
      if (!tours || tours.length === 0) {
        toast.error("Failed to create test tours");
        return false;
      }
      
      // Step 3: Create test tour groups
      const groups = await createTestTourGroups(tours, guideMap);
      
      if (!groups || groups.length === 0) {
        toast.error("Failed to create test tour groups");
        return false;
      }
      
      // Step 4: Create test participants for the groups
      const participants = await createTestParticipants(groups);
      
      if (!participants || participants.length === 0) {
        toast.warning("Failed to create test participants");
        // Continue anyway, this is not critical
      } else {
        console.log(`Created ${participants.length} test participants`);
      }
      
      // Step 5: Create test tickets for the tours
      const tickets = await createTestTickets(tours);
      
      // Step 6: Create test modifications
      const modifications = await createTestModifications(tours);
      
      // Invalidate queries to refresh all data
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['guides'] });
      queryClient.invalidateQueries({ queryKey: ['participants'] });
      
      toast.success(`Test data created successfully: ${tours.length} tours, ${groups.length} groups, ${participants?.length || 0} participants`);
      return true;
    } catch (error) {
      console.error("Error creating test data:", error);
      toast.error("Failed to create test data");
      return false;
    }
  };
  
  /**
   * Clear all test data
   */
  const clearTestData = async () => {
    try {
      await clearAllTestData();
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['guides'] });
      queryClient.invalidateQueries({ queryKey: ['participants'] });
      
      toast.success("Test data cleared successfully");
      return true;
    } catch (error) {
      console.error("Error clearing test data:", error);
      toast.error("Failed to clear test data");
      return false;
    }
  };
  
  return {
    createTestTours,
    clearTestData
  };
};
