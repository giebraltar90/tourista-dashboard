
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

/**
 * Creates test tickets in the database
 */
export const createTestTickets = async (tourData: Array<{id: string}>) => {
  console.log("Creating test tickets...");
  
  // Create tickets for the tours
  const tickets = [];
  
  // First tour with standard tickets
  const firstTourTickets = [
    {
      tour_id: tourData[0].id,
      ticket_type: 'adult',
      quantity: 6,
      status: 'purchased',
      reference: 'TKT-001'
    },
    {
      tour_id: tourData[0].id,
      ticket_type: 'child',
      quantity: 2,
      status: 'purchased',
      reference: 'TKT-002'
    },
    {
      tour_id: tourData[0].id,
      ticket_type: 'guide',
      quantity: 1,
      status: 'purchased',
      reference: 'TKT-G01'
    }
  ];
  
  tickets.push(...firstTourTickets);
  
  // Second tour with a mix of purchased and pending tickets
  const secondTourTickets = [
    {
      tour_id: tourData[1].id,
      ticket_type: 'adult',
      quantity: 8,
      status: 'purchased',
      reference: 'TKT-003'
    },
    {
      tour_id: tourData[1].id,
      ticket_type: 'child',
      quantity: 3,
      status: 'pending',
      reference: 'TKT-004'
    },
    {
      tour_id: tourData[1].id,
      ticket_type: 'guide',
      quantity: 2,
      status: 'purchased',
      reference: 'TKT-G02'
    }
  ];
  
  tickets.push(...secondTourTickets);
  
  // Create tickets for the third tour if it exists
  if (tourData.length > 2) {
    const thirdTourTickets = [
      {
        tour_id: tourData[2].id,
        ticket_type: 'adult',
        quantity: 10,
        status: 'purchased',
        reference: 'TKT-005'
      },
      {
        tour_id: tourData[2].id,
        ticket_type: 'child',
        quantity: 5,
        status: 'purchased',
        reference: 'TKT-006'
      }
    ];
    
    tickets.push(...thirdTourTickets);
  }
  
  // Insert tickets into the tickets table
  const { data: ticketData, error: ticketError } = await supabase
    .from('tickets')
    .insert(tickets)
    .select();
    
  if (ticketError) {
    console.error("Error creating tickets:", ticketError);
    console.log("Continuing without tickets");
    return [];
  }
  
  console.log("Created test tickets:", ticketData);
  
  // Now create ticket buckets
  await createTestTicketBuckets();
  
  return ticketData || [];
};

/**
 * Creates test ticket buckets in the database
 */
const createTestTicketBuckets = async () => {
  console.log("Creating test ticket buckets...");
  
  // Get current year
  const currentYear = 2025;
  
  // Generate dates for the buckets
  const today = new Date();
  today.setFullYear(currentYear);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const twoWeeksLater = new Date(today);
  twoWeeksLater.setDate(today.getDate() + 14);
  
  // Format dates
  const todayFormatted = today.toISOString().split('T')[0];
  const nextWeekFormatted = nextWeek.toISOString().split('T')[0];
  const twoWeeksLaterFormatted = twoWeeksLater.toISOString().split('T')[0];
  
  // Create ticket buckets properly formatted for the ticket_buckets table
  const buckets = [
    {
      reference_number: 'BUCKET-V1',
      bucket_type: 'petit',
      tickets_range: '10-50',
      max_tickets: 50,
      date: todayFormatted,
      access_time: '09:00',
      location: 'Versailles',
      ticket_type: 'adult',
      available_tickets: 50,
      allocated_tickets: 0,
      status: 'available',
      assigned_tours: [],
      tour_allocations: [] as Json
    },
    {
      reference_number: 'BUCKET-V2',
      bucket_type: 'petit',
      tickets_range: '5-25',
      max_tickets: 25,
      date: todayFormatted,
      access_time: '09:00',
      location: 'Versailles',
      ticket_type: 'child',
      available_tickets: 25,
      allocated_tickets: 0,
      status: 'available',
      assigned_tours: [],
      tour_allocations: [] as Json
    },
    {
      reference_number: 'BUCKET-M1',
      bucket_type: 'petit',
      tickets_range: '10-30',
      max_tickets: 30,
      date: todayFormatted,
      access_time: '14:00',
      location: 'Montmartre',
      ticket_type: 'adult',
      available_tickets: 30,
      allocated_tickets: 0,
      status: 'available',
      assigned_tours: [],
      tour_allocations: [] as Json
    },
    {
      reference_number: 'BUCKET-M2',
      bucket_type: 'petit',
      tickets_range: '5-15',
      max_tickets: 15,
      date: todayFormatted,
      access_time: '14:00',
      location: 'Montmartre',
      ticket_type: 'child',
      available_tickets: 15,
      allocated_tickets: 0,
      status: 'available',
      assigned_tours: [],
      tour_allocations: [] as Json
    },
    {
      reference_number: 'BUCKET-V3',
      bucket_type: 'grande',
      tickets_range: '25-100',
      max_tickets: 100,
      date: nextWeekFormatted,
      access_time: '09:00',
      location: 'Versailles',
      ticket_type: 'adult',
      available_tickets: 100,
      allocated_tickets: 0,
      status: 'available',
      assigned_tours: [],
      tour_allocations: [] as Json
    },
    {
      reference_number: 'BUCKET-V4',
      bucket_type: 'grande',
      tickets_range: '10-50',
      max_tickets: 50,
      date: nextWeekFormatted,
      access_time: '09:00',
      location: 'Versailles',
      ticket_type: 'child',
      available_tickets: 50,
      allocated_tickets: 0,
      status: 'available',
      assigned_tours: [],
      tour_allocations: [] as Json
    },
    {
      reference_number: 'BUCKET-M3',
      bucket_type: 'grande',
      tickets_range: '15-60',
      max_tickets: 60,
      date: twoWeeksLaterFormatted,
      access_time: '14:00',
      location: 'Montmartre',
      ticket_type: 'adult',
      available_tickets: 60,
      allocated_tickets: 0,
      status: 'available',
      assigned_tours: [],
      tour_allocations: [] as Json
    },
    {
      reference_number: 'BUCKET-M4',
      bucket_type: 'petit',
      tickets_range: '10-30',
      max_tickets: 30,
      date: twoWeeksLaterFormatted,
      access_time: '14:00',
      location: 'Montmartre',
      ticket_type: 'child',
      available_tickets: 30,
      allocated_tickets: 0,
      status: 'available',
      assigned_tours: [],
      tour_allocations: [] as Json
    }
  ];
  
  // Insert buckets into the ticket_buckets table
  const { data: bucketData, error: bucketError } = await supabase
    .from('ticket_buckets')
    .insert(buckets)
    .select();
    
  if (bucketError) {
    console.error("Error creating ticket buckets:", bucketError);
    console.log("Continuing without ticket buckets");
    return [];
  }
  
  console.log("Created test ticket buckets:", bucketData);
  return bucketData || [];
};
