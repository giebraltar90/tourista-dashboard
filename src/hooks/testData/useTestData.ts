
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createTestDataForTour } from "./createTestData";
import { clearAllTestData } from "./helpers";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for managing test data creation and clearing
 */
export const useTestData = () => {
  const queryClient = useQueryClient();

  /**
   * Create test tours
   */
  const createTestTours = async () => {
    try {
      // Get the first tour ID to create test data for
      const { data: tours, error } = await supabase
        .from('tours')
        .select('id')
        .limit(1);
        
      if (error || !tours || tours.length === 0) {
        toast.error("No tours found to create test data for");
        return false;
      }
      
      const tourId = tours[0].id;
      const result = await createTestDataForTour(tourId);
      
      if (result) {
        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ['tours'] });
        toast.success("Test data created successfully");
      }
      
      return result;
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
