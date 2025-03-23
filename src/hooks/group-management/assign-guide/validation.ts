
import { logger } from "@/utils/logger";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Validates inputs for guide assignment
 */
export const validateAssignGuideInputs = (
  tourId: string | undefined,
  groupIdOrIndex: string | number | undefined
): { isValid: boolean; errorMessage?: string } => {
  // Validate tour ID
  if (!tourId) {
    logger.error("🔄 [AssignGuide] Missing tour ID");
    return { isValid: false, errorMessage: "Missing tour ID" };
  }

  // Validate group ID/index
  if (groupIdOrIndex === undefined || groupIdOrIndex === null) {
    logger.error("🔄 [AssignGuide] Missing group ID/index");
    return { isValid: false, errorMessage: "Missing group information" };
  }

  return { isValid: true };
};

/**
 * Verifies the group exists in the database
 */
export const verifyGroupExists = async (
  actualGroupId: string,
  tourId: string
): Promise<boolean> => {
  // Verify that the group ID exists before proceeding
  const { data: groupCheck, error: groupCheckError } = await supabase
    .from("tour_groups")
    .select("id")
    .eq("id", actualGroupId)
    .eq("tour_id", tourId)
    .single();
    
  if (groupCheckError || !groupCheck) {
    logger.error("🔄 [AssignGuide] Invalid group ID:", groupCheckError || "Group not found");
    return false;
  }
  
  return true;
};
