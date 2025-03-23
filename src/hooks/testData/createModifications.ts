
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates test modifications in the database
 */
export const createTestModifications = async (tourData: Array<{id: string}>) => {
  console.log("Creating test modifications...");
  
  // Add some modifications
  const modifications = [
    {
      tour_id: tourData[0].id,
      description: "Group sizes adjusted",
      details: { type: "group_size", before: 5, after: 6 },
      status: "complete" as "pending" | "complete"
    },
    {
      tour_id: tourData[0].id,
      description: "Guide Noéma assigned to Group 1",
      details: { type: "guide_assignment", groupName: "Group 1", guideName: "Noéma Weber" },
      status: "complete" as "pending" | "complete"
    },
    {
      tour_id: tourData[2].id,
      description: "Changed entry time from 15:30 to 16:00",
      details: { type: "entry_time", before: "15:30", after: "16:00" },
      status: "complete" as "pending" | "complete"
    }
  ];
  
  const { data: modificationData, error: modificationError } = await supabase
    .from('modifications')
    .insert(modifications)
    .select();
    
  if (modificationError) {
    console.error("Error creating modifications:", modificationError);
    throw modificationError;
  }
  
  console.log("Created test modifications:", modificationData);
  return modificationData || [];
};
