
import { supabase } from "@/integrations/supabase/client";
import { TourAllocation } from "@/types/ticketBuckets";
import { toast } from "sonner";

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
    
    // Initialize or update arrays with proper type safety
    const assignedTours = Array.isArray(bucketData.assigned_tours) ? [...bucketData.assigned_tours] : [];
    
    // Parse tour_allocations to ensure it's in the correct format
    let tourAllocations: TourAllocation[] = [];
    if (bucketData.tour_allocations) {
      // Handle both array and JSON string formats
      if (typeof bucketData.tour_allocations === 'string') {
        try {
          tourAllocations = JSON.parse(bucketData.tour_allocations);
        } catch (e) {
          console.error("Error parsing tour_allocations string:", e);
          tourAllocations = [];
        }
      } else if (Array.isArray(bucketData.tour_allocations)) {
        tourAllocations = bucketData.tour_allocations as TourAllocation[];
      } else if (typeof bucketData.tour_allocations === 'object') {
        // If it's already an object but not an array, wrap it
        tourAllocations = [bucketData.tour_allocations as unknown as TourAllocation];
      }
    }
    
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
      (sum, allocation) => sum + (typeof allocation.tickets_required === 'number' 
        ? allocation.tickets_required 
        : parseInt(String(allocation.tickets_required)) || 0), 
      0
    );
    
    // Update the bucket
    const { data, error } = await supabase
      .from('ticket_buckets')
      .update({ 
        assigned_tours: assignedTours,
        tour_allocations: tourAllocations,
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
    
    // Initialize or get arrays with proper type safety
    const assignedTours = Array.isArray(bucketData.assigned_tours) ? [...bucketData.assigned_tours] : [];
    
    // Parse tour_allocations to ensure it's in the correct format
    let tourAllocations: TourAllocation[] = [];
    if (bucketData.tour_allocations) {
      // Handle both array and JSON string formats
      if (typeof bucketData.tour_allocations === 'string') {
        try {
          tourAllocations = JSON.parse(bucketData.tour_allocations);
        } catch (e) {
          console.error("Error parsing tour_allocations string:", e);
          tourAllocations = [];
        }
      } else if (Array.isArray(bucketData.tour_allocations)) {
        tourAllocations = bucketData.tour_allocations as TourAllocation[];
      } else if (typeof bucketData.tour_allocations === 'object') {
        // If it's already an object but not an array, wrap it
        tourAllocations = [bucketData.tour_allocations as unknown as TourAllocation];
      }
    }
    
    // Remove the tour from assigned_tours
    const updatedAssignedTours = assignedTours.filter((id) => id !== tourId);
    
    // Remove the tour from tour_allocations
    const updatedTourAllocations = tourAllocations.filter(
      (allocation) => allocation.tour_id !== tourId
    );
    
    // Calculate total allocated tickets
    const totalAllocated = updatedTourAllocations.reduce(
      (sum, allocation) => sum + (typeof allocation.tickets_required === 'number' 
        ? allocation.tickets_required 
        : parseInt(String(allocation.tickets_required)) || 0), 
      0
    );
    
    // Update the bucket
    const { data, error } = await supabase
      .from('ticket_buckets')
      .update({ 
        assigned_tours: updatedAssignedTours,
        tour_allocations: updatedTourAllocations,
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
