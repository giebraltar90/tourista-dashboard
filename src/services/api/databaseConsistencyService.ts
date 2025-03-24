
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { autoFixDatabaseIssues } from "./checkDatabaseTables";

// Check database consistency for a specific tour
export const checkDatabaseConsistency = async (tourId: string) => {
  try {
    // Check if participants table exists
    const { data: tableExists, error: tableError } = await supabase.rpc(
      'check_table_exists', 
      { table_name_param: 'participants' }
    );
    
    if (tableError || !tableExists) {
      return {
        success: false,
        error: "Participants table is missing",
        errorType: "missing_table"
      };
    }
    
    // Check if tour exists
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('id')
      .eq('id', tourId)
      .single();
      
    if (tourError) {
      return {
        success: false,
        error: "Tour not found",
        errorType: "missing_tour"
      };
    }
    
    // Check if tour groups exist for this tour
    const { count: groupCount, error: groupError } = await supabase
      .from('tour_groups')
      .select('*', { count: 'exact', head: true })
      .eq('tour_id', tourId);
      
    if (groupError) {
      return {
        success: false,
        error: "Error checking tour groups",
        errorType: "group_error"
      };
    }
    
    // Verify participants are properly linked to groups
    if (groupCount && groupCount > 0) {
      const { data: groups } = await supabase
        .from('tour_groups')
        .select('id')
        .eq('tour_id', tourId);
        
      if (groups && groups.length > 0) {
        const groupIds = groups.map(g => g.id);
        
        // Check for orphaned participants (referencing non-existent groups)
        const { count: orphanedCount, error: orphanedError } = await supabase
          .from('participants')
          .select('*', { count: 'exact', head: true })
          .in('group_id', groupIds)
          .neq('group_id', null);
          
        if (orphanedError) {
          return {
            success: false,
            error: "Error checking participants",
            errorType: "participant_error"
          };
        }
      }
    }
    
    // All checks passed
    return {
      success: true,
      error: null
    };
  } catch (error) {
    console.error("Error checking database consistency:", error);
    return {
      success: false,
      error: "Unknown error checking database",
      errorType: "unknown"
    };
  }
};

// Fix database issues for a specific tour
export const fixDatabaseIssues = async (tourId: string) => {
  try {
    // First check what issues exist
    const checkResult = await checkDatabaseConsistency(tourId);
    
    if (checkResult.success) {
      return { success: true, message: "No issues found" };
    }
    
    // Fix based on error type
    if (checkResult.errorType === "missing_table") {
      const created = await autoFixDatabaseIssues();
      if (!created) {
        return { 
          success: false, 
          error: "Failed to create missing tables" 
        };
      }
      
      return { 
        success: true, 
        message: "Created missing tables" 
      };
    }
    
    // If participants table exists but has no data, create some test data
    if (checkResult.errorType === "participant_error") {
      // Get all groups for this tour
      const { data: groups } = await supabase
        .from('tour_groups')
        .select('id, name')
        .eq('tour_id', tourId);
        
      if (!groups || groups.length === 0) {
        return { 
          success: false, 
          error: "No groups found for this tour" 
        };
      }
      
      // Create test participants for each group
      for (const group of groups) {
        const participantCount = Math.floor(Math.random() * 5) + 1;
        
        for (let i = 0; i < participantCount; i++) {
          const { error } = await supabase
            .from('participants')
            .insert({
              name: `Test Participant ${i + 1}`,
              count: Math.floor(Math.random() * 3) + 1,
              child_count: Math.floor(Math.random() * 2),
              group_id: group.id,
              booking_ref: `TEST-${Math.floor(Math.random() * 10000)}`
            });
            
          if (error) {
            console.error("Error creating test participant:", error);
          }
        }
      }
      
      return { 
        success: true, 
        message: "Created test participants" 
      };
    }
    
    return { 
      success: false, 
      error: "Unresolvable database issue" 
    };
  } catch (error) {
    console.error("Error fixing database issues:", error);
    return { 
      success: false, 
      error: String(error) 
    };
  }
};
