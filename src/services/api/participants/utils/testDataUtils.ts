
/**
 * Generate a random participant for testing
 */
export const generateRandomParticipant = (groupId: string) => {
  const firstNames = ['John', 'Mary', 'James', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const count = 1 + Math.floor(Math.random() * 3); // 1-3 people
  const childCount = Math.random() > 0.7 ? Math.floor(Math.random() * count) : 0; // Sometimes have children
  const bookingRef = `BK${Math.floor(10000 + Math.random() * 90000)}`; // BK10000-BK99999
  
  return {
    name: `${firstName} ${lastName}`,
    count,
    child_count: childCount,
    booking_ref: bookingRef,
    group_id: groupId
  };
};
