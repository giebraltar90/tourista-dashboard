
import { toast } from "sonner";
import { createGuideIdMap } from "./helpers";
import { createTestGuides } from "./createGuides";
import { createTestTours } from "./createTours";
import { createTestTourGroups } from "./createTourGroups";
import { createTestParticipants } from "./createParticipants";
import { createTestModifications } from "./createModifications";
import { createTestTickets } from "./createTickets";
import { clearAllTestData } from "./helpers";
import { isValidUuid } from "@/services/api/utils/guidesUtils";

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
    
    // Validate guide IDs to ensure they are all UUIDs
    const validGuideMap: Record<string, string> = {};
    let hasInvalidGuides = false;
    
    for (const guideName in guideMap) {
      const guideId = guideMap[guideName];
      if (isValidUuid(guideId)) {
        validGuideMap[guideName] = guideId;
      } else {
        console.error(`Invalid guide ID for ${guideName}: ${guideId}`);
        hasInvalidGuides = true;
      }
    }
    
    if (hasInvalidGuides) {
      console.error("Found invalid guide IDs. This may cause issues with guide assignments.");
    }
    
    // Log the validated guide map
    console.log("Validated Guide UUID Map:", validGuideMap);
    
    // Create test tours
    const tourData = await createTestTours(validGuideMap);
    
    // Create test tour groups
    const groupData = await createTestTourGroups(tourData, validGuideMap);
    
    // Create test participants
    await createTestParticipants(groupData);
    
    // Create test tickets for tours
    await createTestTickets(tourData);
    
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
