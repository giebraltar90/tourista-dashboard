
import { supabase } from "@/integrations/supabase/client";
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
    
    // Initialize or update arrays
    let assignedTours = bucketData.assigned_tours || [];
    let tourAllocations = bucketData.tour_allocations || [];
    
    // Check if tour is already assigned
    if (!assignedTours.includes(tourId)) {
      assignedTours.push(tourId);
    }
    
    // Update or add the tour allocation
    const existingAllocationIndex = tourAllocations.findIndex(
      (allocation: any) => allocation.tour_id === tourId
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
      (sum: number, allocation: any) => sum + allocation.tickets_required, 0
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
    
    // Initialize or get arrays
    let assignedTours = bucketData.assigned_tours || [];
    let tourAllocations = bucketData.tour_allocations || [];
    
    // Remove the tour from assigned_tours
    assignedTours = assignedTours.filter((id: string) => id !== tourId);
    
    // Remove the tour from tour_allocations
    tourAllocations = tourAllocations.filter(
      (allocation: any) => allocation.tour_id !== tourId
    );
    
    // Calculate total allocated tickets
    const totalAllocated = tourAllocations.reduce(
      (sum: number, allocation: any) => sum + allocation.tickets_required, 0
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
      console.error("Error removing bucket from tour:", error);
      throw error;
    }
    
    console.log("Successfully removed bucket from tour:", {
      bucketId,
      tourId,
      totalAllocated,
      assignedTours,
      tourAllocations
    });
    
    return data;
  } catch (error) {
    console.error("Critical error in removeBucketFromTour:", error);
    throw error;
  }
};
