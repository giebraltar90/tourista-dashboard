
import { VentrataParticipant } from "@/types/ventrata";
import { supabase } from "@/integrations/supabase/client";

/**
 * Create a participant
 */
export const createParticipant = async (
  groupId: string,
  participantData: Partial<VentrataParticipant>
): Promise<{ success: boolean; data?: VentrataParticipant; error?: string }> => {
  try {
    if (!groupId) {
      return { success: false, error: "Group ID is required" };
    }
    
    const newParticipant = {
      group_id: groupId,
      name: participantData.name || "New Participant",
      count: participantData.count || 1,
      child_count: participantData.childCount || 0,
      booking_ref: participantData.booking_ref || participantData.bookingRef || "N/A"
    };
    
    const { data, error } = await supabase
      .from('participants')
      .insert(newParticipant)
      .select()
      .single();
      
    if (error) {
      console.error("Error creating participant:", error);
      return { success: false, error: error.message };
    }
    
    return { 
      success: true, 
      data: {
        id: data.id,
        name: data.name,
        count: data.count,
        childCount: data.child_count,
        bookingRef: data.booking_ref,
        group_id: data.group_id
      } 
    };
  } catch (error) {
    console.error("Unexpected error creating participant:", error);
    return { success: false, error: String(error) };
  }
};

/**
 * Delete a participant
 */
export const deleteParticipant = async (
  participantId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!participantId) {
      return { success: false, error: "Participant ID is required" };
    }
    
    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('id', participantId);
      
    if (error) {
      console.error("Error deleting participant:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Unexpected error deleting participant:", error);
    return { success: false, error: String(error) };
  }
};
