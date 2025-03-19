
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createAllTestData } from "./createTestData";
import { clearAllTestData } from "./helpers";

/**
 * Hook for managing test data creation and clearing
 */
export const useTestData = () => {
  const queryClient = useQueryClient();

  /**
   * Create all test data
   */
  const createTestTours = async () => {
    const result = await createAllTestData();
    
    if (result) {
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['tours'] });
    }
    
    return result;
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
