
import { supabase } from "@/integrations/supabase/client";

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
  
  // Create ticket buckets
  const buckets = [
    {
      name: 'Versailles Adult Tickets - Today',
      location: 'Versailles',
      ticket_type: 'adult',
      date: todayFormatted,
      quantity: 50,
      status: 'available',
      reference: 'BUCKET-V1'
    },
    {
      name: 'Versailles Child Tickets - Today',
      location: 'Versailles',
      ticket_type: 'child',
      date: todayFormatted,
      quantity: 25,
      status: 'available',
      reference: 'BUCKET-V2'
    },
    {
      name: 'Montmartre Adult Tickets - Today',
      location: 'Montmartre',
      ticket_type: 'adult',
      date: todayFormatted,
      quantity: 30,
      status: 'available',
      reference: 'BUCKET-M1'
    },
    {
      name: 'Montmartre Child Tickets - Today',
      location: 'Montmartre',
      ticket_type: 'child',
      date: todayFormatted,
      quantity: 15,
      status: 'available',
      reference: 'BUCKET-M2'
    },
    {
      name: 'Versailles Adult Tickets - Next Week',
      location: 'Versailles',
      ticket_type: 'adult',
      date: nextWeekFormatted,
      quantity: 100,
      status: 'available',
      reference: 'BUCKET-V3'
    },
    {
      name: 'Versailles Child Tickets - Next Week',
      location: 'Versailles',
      ticket_type: 'child',
      date: nextWeekFormatted,
      quantity: 50,
      status: 'available',
      reference: 'BUCKET-V4'
    },
    {
      name: 'Montmartre Adult Tickets - Two Weeks Later',
      location: 'Montmartre',
      ticket_type: 'adult',
      date: twoWeeksLaterFormatted,
      quantity: 60,
      status: 'available',
      reference: 'BUCKET-M3'
    },
    {
      name: 'Montmartre Child Tickets - Two Weeks Later',
      location: 'Montmartre',
      ticket_type: 'child',
      date: twoWeeksLaterFormatted,
      quantity: 30,
      status: 'available',
      reference: 'BUCKET-M4'
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
