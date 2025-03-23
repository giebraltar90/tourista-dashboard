
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

/**
 * Creates test ticket buckets and assigns them to tours
 */
export const createTestTicketBuckets = async (tours) => {
  console.log("Creating test ticket buckets for tours...");
  
  const buckets = [];
  const bucketAssignments = [];
  
  // For each tour, create a ticket bucket if it doesn't have one
  for (const tour of tours) {
    // First check if this tour already has a bucket assigned
    const { data: existingBuckets } = await supabase
      .from('ticket_buckets')
      .select('*')
      .contains('assigned_tours', [tour.id]);
      
    if (existingBuckets && existingBuckets.length > 0) {
      console.log(`Tour ${tour.id} already has a bucket assigned`);
      continue;
    }
    
    // Create a bucket for this tour
    const ticketCount = tour.num_tickets || 20;
    const bucketType = ticketCount <= 10 ? 'petit' : 'grande';
    const referenceNumber = `BKT-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    const newBucket = {
      reference_number: referenceNumber,
      date: tour.date,
      tickets_range: `1-${ticketCount}`,
      bucket_type: bucketType,
      max_tickets: ticketCount,
      available_tickets: ticketCount,
      allocated_tickets: ticketCount,
      assigned_tours: [tour.id],
      access_time: tour.start_time,
      tour_allocations: JSON.stringify([
        {
          tour_id: tour.id,
          tickets_required: ticketCount,
          allocation_date: new Date().toISOString()
        }
      ])
    };
    
    buckets.push(newBucket);
  }
  
  // Insert ticket buckets
  if (buckets.length > 0) {
    const { data: bucketData, error: bucketError } = await supabase
      .from('ticket_buckets')
      .insert(buckets)
      .select();
      
    if (bucketError) {
      console.error("Error creating ticket buckets:", bucketError);
      throw bucketError;
    }
    
    console.log(`Created ${bucketData?.length || 0} test ticket buckets`);
    return bucketData || [];
  } else {
    console.log("No new ticket buckets needed");
    
    // Return existing buckets for these tours
    const tourIds = tours.map(tour => tour.id);
    const { data: existingBuckets } = await supabase
      .from('ticket_buckets')
      .select('*')
      .or(tourIds.map(id => `assigned_tours.cs.{${id}}`).join(','));
      
    return existingBuckets || [];
  }
};
