
import { GuideInfo } from "@/types/ventrata";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Fetch all guides from the database
 */
export const fetchAllGuides = async (): Promise<GuideInfo[]> => {
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('id, name, guide_type')
      .order('name');
      
    if (error) {
      console.error("Error fetching guides:", error);
      return [];
    }
    
    return data ? data.map(guide => ({
      id: guide.id,
      name: guide.name,
      guideType: guide.guide_type
    })) : [];
  } catch (error) {
    console.error("Exception in fetchAllGuides:", error);
    return [];
  }
};

/**
 * Fetch a specific guide by ID
 */
export const fetchGuideById = async (guideId: string): Promise<GuideInfo | null> => {
  if (!guideId) return null;
  
  try {
    const { data, error } = await supabase
      .from('guides')
      .select('id, name, guide_type')
      .eq('id', guideId)
      .single();
      
    if (error) {
      logger.warn(`Guide not found with ID ${guideId}:`, error);
      return null;
    }
    
    return {
      id: data.id,
      name: data.name,
      guideType: data.guide_type
    };
  } catch (error) {
    logger.error(`Error fetching guide with ID ${guideId}:`, error);
    return null;
  }
};

/**
 * Create a new guide in the database
 */
export const createGuide = async (
  name: string, 
  guideType: string
): Promise<GuideInfo | null> => {
  try {
    const { data, error } = await supabase
      .from('guides')
      .insert([
        { name, guide_type: guideType }
      ])
      .select()
      .single();
      
    if (error) {
      console.error("Error creating guide:", error);
      return null;
    }
    
    return {
      id: data.id,
      name: data.name,
      guideType: data.guide_type
    };
  } catch (error) {
    console.error("Exception in createGuide:", error);
    return null;
  }
};

/**
 * Update an existing guide
 */
export const updateGuide = async (
  guideId: string, 
  updates: Partial<GuideInfo>
): Promise<boolean> => {
  try {
    // Convert to database column naming
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.guideType !== undefined) dbUpdates.guide_type = updates.guideType;
    
    const { error } = await supabase
      .from('guides')
      .update(dbUpdates)
      .eq('id', guideId);
      
    if (error) {
      console.error("Error updating guide:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception in updateGuide:", error);
    return false;
  }
};

/**
 * Delete a guide by ID
 */
export const deleteGuide = async (guideId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('guides')
      .delete()
      .eq('id', guideId);
      
    if (error) {
      console.error("Error deleting guide:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception in deleteGuide:", error);
    return false;
  }
};
