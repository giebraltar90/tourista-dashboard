
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates tour groups with proper guide assignments
 */
export const createTestTourGroups = async (
  tours, 
  guideMap: Record<string, string>
) => {
  console.log("Creating test tour groups with assigned guides...");
  
  const tourGroups = [];
  const allGuideIds = Object.values(guideMap);
  
  // For each tour, create the appropriate number of groups
  for (const tour of tours) {
    // Get existing groups for this tour
    const { data: existingGroups } = await supabase
      .from('tour_groups')
      .select('*')
      .eq('tour_id', tour.id);
      
    // If groups already exist, delete them to start fresh
    if (existingGroups && existingGroups.length > 0) {
      // First, delete any participants in these groups
      for (const group of existingGroups) {
        await supabase
          .from('participants')
          .delete()
          .eq('group_id', group.id);
      }
      
      // Then delete the groups
      await supabase
        .from('tour_groups')
        .delete()
        .eq('tour_id', tour.id);
    }
    
    // Determine number of groups based on whether it's high season
    const groupCount = tour.is_high_season ? 3 : 2;
    
    // Create groups for this tour
    for (let i = 0; i < groupCount; i++) {
      // Distribute guides evenly - first group gets guide1_id, second gets guide2_id, etc.
      // For the third group, use guide3_id if available, otherwise use a random guide
      let guideId = null;
      
      if (i === 0) {
        guideId = tour.guide1_id;
      } else if (i === 1) {
        guideId = tour.guide2_id;
      } else if (i === 2) {
        guideId = tour.guide3_id || allGuideIds[Math.floor(Math.random() * allGuideIds.length)];
      }
      
      // Create an entry time spaced 15 minutes apart
      const baseHour = parseInt(tour.start_time.split(':')[0]);
      const entryTime = `${baseHour + Math.floor(i/2)}:${i % 2 === 0 ? '00' : '30'}`;
      
      tourGroups.push({
        tour_id: tour.id,
        name: `Group ${i + 1}`,
        size: Math.floor(Math.random() * 5) + 5, // 5-9 participants per group
        entry_time: entryTime,
        guide_id: guideId,
        child_count: Math.floor(Math.random() * 3) // 0-2 children per group
      });
    }
  }
  
  // Insert all tour groups
  const { data: groupData, error: groupError } = await supabase
    .from('tour_groups')
    .insert(tourGroups)
    .select();
    
  if (groupError) {
    console.error("Error creating tour groups:", groupError);
    throw groupError;
  }
  
  console.log(`Created ${groupData?.length || 0} test tour groups with guides`);
  return groupData || [];
};
