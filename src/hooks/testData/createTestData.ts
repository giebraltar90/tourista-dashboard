
import { toast } from "sonner";
import { createGuideIdMap } from "./helpers";
import { createTestGuides } from "./createGuides";
import { createTestTours } from "./createTours";
import { createTestTourGroups } from "./createTourGroups";
import { createTestParticipants } from "./createParticipants";
import { createTestModifications } from "./createModifications";
import { clearAllTestData } from "./helpers";

/**
 * Main function to create all test data
 */
export const createAllTestData = async (): Promise<boolean> => {
  try {
    console.log("Creating test tour data...");
    
    // First, clear any existing test data
    await clearAllTestData();
    
    // Create test guides
    const guideData = await createTestGuides();
    
    // Map guide names to their IDs
    const guideMap = createGuideIdMap(guideData);
    
    // Create test tours
    const tourData = await createTestTours(guideMap);
    
    // Create test tour groups
    const groupData = await createTestTourGroups(tourData, guideMap);
    
    // Create test participants
    await createTestParticipants(groupData);
    
    // Create test modifications
    await createTestModifications(tourData);
    
    toast.success("Test data created successfully");
    return true;
  } catch (error) {
    console.error("Error creating test data:", error);
    toast.error("Failed to create test data");
    return false;
  }
};
