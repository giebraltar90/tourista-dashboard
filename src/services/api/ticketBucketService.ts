
import { supabase } from "@/integrations/supabase/client";
import { CSVTicketBucket, TicketBucket, TicketBucketFormValues, TourAllocation } from "@/types/ticketBuckets";
import { toast } from "sonner";

export const fetchTicketBuckets = async () => {
  const { data, error } = await supabase
    .from('ticket_buckets')
    .select('*')
    .order('date', { ascending: true });
  
  if (error) {
    console.error("Error fetching ticket buckets:", error);
    throw error;
  }
  
  console.log("🔍 [fetchTicketBuckets] Raw buckets from DB:", data);
  
  // Convert date strings to Date objects and parse JSON fields
  const buckets = data.map(bucket => {
    // Parse tour_allocations from JSON
    let tourAllocations: TourAllocation[] = [];
    if (bucket.tour_allocations) {
      if (typeof bucket.tour_allocations === 'string') {
        try {
          tourAllocations = JSON.parse(bucket.tour_allocations);
        } catch (e) {
          console.error("Error parsing tour_allocations string:", e);
        }
      } else if (Array.isArray(bucket.tour_allocations)) {
        tourAllocations = bucket.tour_allocations as TourAllocation[];
      } else if (typeof bucket.tour_allocations === 'object') {
        tourAllocations = [bucket.tour_allocations as unknown as TourAllocation];
      }
    }
    
    // Ensure assigned_tours is an array
    const assignedTours = Array.isArray(bucket.assigned_tours) ? bucket.assigned_tours : [];
    
    return {
      ...bucket,
      date: new Date(bucket.date),
      assigned_tours: assignedTours,
      tour_allocations: tourAllocations
    } as TicketBucket;
  });
  
  console.log("🔍 [fetchTicketBuckets] Processed buckets with Date objects:", 
    buckets.map(b => ({
      ...b,
      date: b.date.toISOString(),
      dateObj: {
        year: b.date.getFullYear(),
        month: b.date.getMonth() + 1,
        day: b.date.getDate(),
        fullDate: b.date.toDateString()
      }
    }))
  );
  
  return buckets;
};

export const fetchTicketBucketsByDate = async (date: Date) => {
  // IMPORTANT FIX: Set time to noon to avoid timezone issues
  // Create a new date object to avoid modifying the original
  const localDate = new Date(date);
  localDate.setHours(12, 0, 0, 0);
  
  // Format date to YYYY-MM-DD format to ensure proper comparison
  const formattedDate = localDate.toISOString().split('T')[0];
  
  console.log("🔍 [fetchTicketBucketsByDate] Input date:", date);
  console.log("🔍 [fetchTicketBucketsByDate] Local date with noon time:", localDate);
  console.log("🔍 [fetchTicketBucketsByDate] Formatted date for query:", formattedDate);
  console.log("🔍 [fetchTicketBucketsByDate] Date components:", {
    year: localDate.getFullYear(),
    month: localDate.getMonth() + 1,
    day: localDate.getDate(),
    ISOString: localDate.toISOString(),
    toDateString: localDate.toDateString()
  });
  
  const { data, error } = await supabase
    .from('ticket_buckets')
    .select('*')
    .eq('date', formattedDate)
    .order('access_time', { ascending: true });
  
  if (error) {
    console.error("🔴 [fetchTicketBucketsByDate] Error:", error);
    throw error;
  }
  
  console.log("🔍 [fetchTicketBucketsByDate] Raw response from DB:", data);
  
  // Process the buckets data
  const buckets = data.map(bucket => {
    // Create Date with noon time to avoid timezone issues
    const bucketDate = new Date(bucket.date);
    bucketDate.setHours(12, 0, 0, 0);
    
    // Parse tour_allocations from JSON
    let tourAllocations: TourAllocation[] = [];
    if (bucket.tour_allocations) {
      if (typeof bucket.tour_allocations === 'string') {
        try {
          tourAllocations = JSON.parse(bucket.tour_allocations);
        } catch (e) {
          console.error("Error parsing tour_allocations string:", e);
        }
      } else if (Array.isArray(bucket.tour_allocations)) {
        tourAllocations = bucket.tour_allocations as TourAllocation[];
      } else if (typeof bucket.tour_allocations === 'object') {
        tourAllocations = [bucket.tour_allocations as unknown as TourAllocation];
      }
    }
    
    // Ensure assigned_tours is an array
    const assignedTours = Array.isArray(bucket.assigned_tours) ? bucket.assigned_tours : [];
    
    return {
      ...bucket,
      date: bucketDate,
      assigned_tours: assignedTours,
      tour_allocations: tourAllocations
    } as TicketBucket;
  });
  
  console.log("🔍 [fetchTicketBucketsByDate] Processed buckets:", 
    buckets.map(b => ({
      id: b.id,
      reference_number: b.reference_number,
      date: b.date.toISOString(),
      dateComponents: {
        year: b.date.getFullYear(),
        month: b.date.getMonth() + 1,
        day: b.date.getDate(),
        fullDate: b.date.toDateString()
      }
    }))
  );
  
  return buckets;
};

export const createTicketBucket = async (bucket: TicketBucketFormValues) => {
  // IMPORTANT FIX: Set time to noon to avoid timezone issues
  const localDate = new Date(bucket.date);
  localDate.setHours(12, 0, 0, 0);
  
  // Format date for database
  const formattedDate = localDate.toISOString().split('T')[0];
  
  console.log("🔍 [createTicketBucket] Input date:", bucket.date);
  console.log("🔍 [createTicketBucket] Formatted date for DB:", formattedDate);
  
  const { data, error } = await supabase
    .from('ticket_buckets')
    .insert([
      {
        ...bucket,
        date: formattedDate,
        assigned_tours: [],
        tour_allocations: []
      }
    ])
    .select();
  
  if (error) {
    console.error("🔴 [createTicketBucket] Error:", error);
    throw error;
  }
  
  // Create returned Date with noon time
  const returnDate = new Date(data[0].date);
  returnDate.setHours(12, 0, 0, 0);
  
  // Parse tour_allocations to ensure correct type
  let tourAllocations: TourAllocation[] = [];
  if (data[0].tour_allocations) {
    if (typeof data[0].tour_allocations === 'string') {
      try {
        tourAllocations = JSON.parse(data[0].tour_allocations);
      } catch (e) {
        console.error("Error parsing tour_allocations string:", e);
      }
    } else if (Array.isArray(data[0].tour_allocations)) {
      tourAllocations = data[0].tour_allocations as TourAllocation[];
    } else if (typeof data[0].tour_allocations === 'object') {
      tourAllocations = [data[0].tour_allocations as unknown as TourAllocation];
    }
  }
  
  // Ensure assigned_tours is an array
  const assignedTours = Array.isArray(data[0].assigned_tours) ? data[0].assigned_tours : [];
  
  console.log("🔍 [createTicketBucket] Created bucket:", {
    ...data[0],
    dateCheck: {
      originalDate: returnDate.toISOString(),
      components: {
        year: returnDate.getFullYear(),
        month: returnDate.getMonth() + 1,
        day: returnDate.getDate()
      }
    }
  });
  
  return {
    ...data[0],
    date: returnDate,
    assigned_tours: assignedTours,
    tour_allocations: tourAllocations
  } as TicketBucket;
};

export const updateTicketBucket = async (id: string, updates: Partial<TicketBucketFormValues>) => {
  // IMPORTANT FIX: Set time to noon for the date to avoid timezone issues
  let formattedUpdates: any = { ...updates };
  
  if (updates.date) {
    const localDate = new Date(updates.date);
    localDate.setHours(12, 0, 0, 0);
    
    // Format the date as a string for the database
    formattedUpdates = {
      ...updates,
      date: localDate.toISOString().split('T')[0],
    };
    
    console.log("🔍 [updateTicketBucket] Original date:", updates.date);
    console.log("🔍 [updateTicketBucket] Fixed date with noon time:", localDate);
    console.log("🔍 [updateTicketBucket] Formatted date for DB:", formattedUpdates.date);
  }
  
  console.log("🔍 [updateTicketBucket] Updates to be applied:", formattedUpdates);
  
  const { data, error } = await supabase
    .from('ticket_buckets')
    .update(formattedUpdates)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error("🔴 [updateTicketBucket] Error:", error);
    throw error;
  }
  
  // Create returned Date with noon time
  const returnDate = new Date(data[0].date);
  returnDate.setHours(12, 0, 0, 0);
  
  // Parse tour_allocations to ensure correct type
  let tourAllocations: TourAllocation[] = [];
  if (data[0].tour_allocations) {
    if (typeof data[0].tour_allocations === 'string') {
      try {
        tourAllocations = JSON.parse(data[0].tour_allocations);
      } catch (e) {
        console.error("Error parsing tour_allocations string:", e);
      }
    } else if (Array.isArray(data[0].tour_allocations)) {
      tourAllocations = data[0].tour_allocations as TourAllocation[];
    } else if (typeof data[0].tour_allocations === 'object') {
      tourAllocations = [data[0].tour_allocations as unknown as TourAllocation];
    }
  }
  
  // Ensure assigned_tours is an array
  const assignedTours = Array.isArray(data[0].assigned_tours) ? data[0].assigned_tours : [];
  
  console.log("🔍 [updateTicketBucket] Updated bucket:", {
    ...data[0],
    dateCheck: {
      originalDate: returnDate.toISOString(),
      components: {
        year: returnDate.getFullYear(),
        month: returnDate.getMonth() + 1,
        day: returnDate.getDate()
      }
    }
  });
  
  return {
    ...data[0],
    date: returnDate,
    assigned_tours: assignedTours,
    tour_allocations: tourAllocations
  } as TicketBucket;
};

export const deleteTicketBucket = async (id: string) => {
  const { error } = await supabase
    .from('ticket_buckets')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting ticket bucket:", error);
    throw error;
  }
  
  return true;
};

export const uploadCSVBuckets = async (buckets: CSVTicketBucket[]) => {
  // Process each CSV bucket entry
  const formattedBuckets = buckets.map(bucket => {
    const maxTickets = determineBucketSize(bucket.reference_number);
    const bucketType = determineBucketType(maxTickets);
    const ticketsRange = bucketType === 'petit' ? '3-10' : '11-30';
    
    return {
      reference_number: bucket.reference_number,
      bucket_type: bucketType,
      tickets_range: ticketsRange,
      max_tickets: maxTickets,
      allocated_tickets: 0,
      date: bucket.date,
      access_time: bucket.access_time,
      assigned_tours: [],
      tour_allocations: []
    };
  });
  
  // Insert the processed buckets
  const { data, error } = await supabase
    .from('ticket_buckets')
    .insert(formattedBuckets)
    .select();
  
  if (error) {
    console.error("Error uploading CSV buckets:", error);
    throw error;
  }
  
  // Process returned data
  const processedBuckets = data.map(bucket => {
    // Parse tour_allocations to ensure correct type
    let tourAllocations: TourAllocation[] = [];
    if (bucket.tour_allocations) {
      if (typeof bucket.tour_allocations === 'string') {
        try {
          tourAllocations = JSON.parse(bucket.tour_allocations);
        } catch (e) {
          console.error("Error parsing tour_allocations string:", e);
        }
      } else if (Array.isArray(bucket.tour_allocations)) {
        tourAllocations = bucket.tour_allocations as TourAllocation[];
      } else if (typeof bucket.tour_allocations === 'object') {
        tourAllocations = [bucket.tour_allocations as unknown as TourAllocation];
      }
    }
    
    // Ensure assigned_tours is an array
    const assignedTours = Array.isArray(bucket.assigned_tours) ? bucket.assigned_tours : [];
    
    return {
      ...bucket,
      date: new Date(bucket.date),
      assigned_tours: assignedTours,
      tour_allocations: tourAllocations
    };
  }) as TicketBucket[];
  
  return processedBuckets;
};

// Helper function to determine bucket type based on reference number
function determineBucketSize(referenceNumber: string): number {
  // This is a placeholder implementation
  // In a real scenario, we would parse the reference number to determine the bucket size
  // For now, we'll assume the reference number format indicates the bucket size
  
  // For example, if the reference number ends with "P", it's a petit bucket (max 10)
  // If it ends with "G", it's a grande bucket (max 30)
  if (referenceNumber.toUpperCase().endsWith('P')) {
    return 10;
  } else if (referenceNumber.toUpperCase().endsWith('G')) {
    return 30;
  } else {
    // Default behavior: analyze the reference number length or format
    // This is just a placeholder and should be replaced with actual logic
    return referenceNumber.length > 10 ? 30 : 10;
  }
}

function determineBucketType(maxTickets: number): 'petit' | 'grande' {
  return maxTickets <= 10 ? 'petit' : 'grande';
}
