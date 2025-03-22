
import { supabase } from "@/integrations/supabase/client";
import { TourAllocation } from "@/types/ticketBuckets";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

/**
 * Helper function to safely parse tour allocations from database
 */
function parseTourAllocations(allocationsData: Json | null): TourAllocation[] {
  if (!allocationsData) return [];
  
  try {
    // Handle string format (JSON string)
    if (typeof allocationsData === 'string') {
      try {
        return JSON.parse(allocationsData) as TourAllocation[];
      } catch (e) {
        console.error("Error parsing tour_allocations string:", e);
        return [];
      }
    }
    
    // Handle array format
    if (Array.isArray(allocationsData)) {
      return allocationsData.map(item => {
        // Ensure each item has the required properties
        if (typeof item === 'object' && item !== null) {
          return {
            tour_id: String((item as any).tour_id || ''),
            tickets_required: Number((item as any).tickets_required || 0),
            assigned_at: String((item as any).assigned_at || new Date().toISOString())
          };
        }
        return {
          tour_id: '',
          tickets_required: 0,
          assigned_at: new Date().toISOString()
        };
      });
    }
    
    // Handle single object format
    if (typeof allocationsData === 'object' && allocationsData !== null) {
      return [{
        tour_id: String((allocationsData as any).tour_id || ''),
        tickets_required: Number((allocationsData as any).tickets_required || 0),
        assigned_at: String((allocationsData as any).assigned_at || new Date().toISOString())
      }];
    }
  } catch (e) {
    console.error("Error processing tour allocations:", e);
  }
  
  return [];
}

/**
 * Helper function to safely parse assigned tours from database
 */
function parseAssignedTours(assignedToursData: Json | null): string[] {
  if (!assignedToursData) return [];
  
  // If it's already an array, make sure it contains only strings
  if (Array.isArray(assignedToursData)) {
    return assignedToursData.map(item => String(item || ''));
  }
  
  // If it's a string, try to parse it as JSON
  if (typeof assignedToursData === 'string') {
    try {
      const parsed = JSON.parse(assignedToursData);
      if (Array.isArray(parsed)) {
        return parsed.map(item => String(item || ''));
      }
    } catch (e) {
      console.error("Error parsing assigned_tours string:", e);
    }
  }
  
  return [];
}

/**
 * Assigns a ticket bucket to a specific tour
 */
export const assignBucketToTour = async (bucketId: string, tourId: string, requiredTickets: number = 0) => {
  try {
    // First, get the current bucket data
    const { data: bucketData, error: fetchError } = await supabase
      .from('ticket_buckets')
      .select('*')
      .eq('id', bucketId)
      .single();
      
    if (fetchError) {
      console.error("Error fetching bucket data:", fetchError);
      throw fetchError;
    }
    
    // Parse assigned_tours to ensure it's in the correct format
    const assignedTours = parseAssignedTours(bucketData.assigned_tours);
    
    // Parse tour_allocations to ensure it's in the correct format
    const tourAllocations = parseTourAllocations(bucketData.tour_allocations);
    
    // Check if tour is already assigned
    if (!assignedTours.includes(tourId)) {
      assignedTours.push(tourId);
    }
    
    // Update or add the tour allocation
    const existingAllocationIndex = tourAllocations.findIndex(
      (allocation) => allocation.tour_id === tourId
    );
    
    if (existingAllocationIndex >= 0) {
      // Update existing allocation
      tourAllocations[existingAllocationIndex].tickets_required = requiredTickets;
    } else {
      // Add new allocation
      tourAllocations.push({
        tour_id: tourId,
        tickets_required: requiredTickets,
        assigned_at: new Date().toISOString()
      });
    }
    
    // Calculate total allocated tickets
    const totalAllocated = tourAllocations.reduce(
      (sum, allocation) => sum + allocation.tickets_required, 0
    );
    
    // Update the bucket
    const { data, error } = await supabase
      .from('ticket_buckets')
      .update({ 
        assigned_tours: assignedTours,
        tour_allocations: tourAllocations as unknown as Json,
        allocated_tickets: totalAllocated
      })
      .eq('id', bucketId)
      .select();
    
    if (error) {
      console.error("Error assigning bucket to tour:", error);
      throw error;
    }
    
    console.log("Successfully assigned bucket to tour:", {
      bucketId,
      tourId,
      requiredTickets,
      totalAllocated,
      assignedTours,
      tourAllocations
    });
    
    return data;
  } catch (error) {
    console.error("Critical error in assignBucketToTour:", error);
    throw error;
  }
};

/**
 * Removes a ticket bucket assignment from a tour
 */
export const removeBucketFromTour = async (bucketId: string, tourId: string) => {
  try {
    // First, get the current bucket data
    const { data: bucketData, error: fetchError } = await supabase
      .from('ticket_buckets')
      .select('*')
      .eq('id', bucketId)
      .single();
      
    if (fetchError) {
      console.error("Error fetching bucket data:", fetchError);
      throw fetchError;
    }
    
    // Parse assigned_tours to ensure it's in the correct format
    const assignedTours = parseAssignedTours(bucketData.assigned_tours);
    
    // Parse tour_allocations to ensure it's in the correct format
    const tourAllocations = parseTourAllocations(bucketData.tour_allocations);
    
    // Remove the tour from assigned_tours
    const updatedAssignedTours = assignedTours.filter((id) => id !== tourId);
    
    // Remove the tour from tour_allocations
    const updatedTourAllocations = tourAllocations.filter(
      (allocation) => allocation.tour_id !== tourId
    );
    
    // Calculate total allocated tickets
    const totalAllocated = updatedTourAllocations.reduce(
      (sum, allocation) => sum + allocation.tickets_required, 0
    );
    
    // Update the bucket
    const { data, error } = await supabase
      .from('ticket_buckets')
      .update({ 
        assigned_tours: updatedAssignedTours,
        tour_allocations: updatedTourAllocations as unknown as Json,
        allocated_tickets: totalAllocated
      })
      .eq('id', bucketId)
      .select();
    
    if (error) {
      console.error("Error removing bucket from tour:", error);
      throw error;
    }
    
    console.log("Successfully removed bucket from tour:", {
      bucketId,
      tourId,
      totalAllocated,
      assignedTours: updatedAssignedTours,
      tourAllocations: updatedTourAllocations
    });
    
    return data;
  } catch (error) {
    console.error("Critical error in removeBucketFromTour:", error);
    throw error;
  }
};
