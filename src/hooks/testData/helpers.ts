
export type GuideType = 'GA Free' | 'GA Ticket' | 'GC' | 'GI' | 'GT';
export type TourType = 'food' | 'private' | 'default';
export type ModificationStatus = 'pending' | 'complete' | 'cancelled';

/**
 * Helper function to generate a random ID
 */
export const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 15);
};

/**
 * Helper function to generate a random date in the near future
 */
export const generateFutureDate = (daysAhead = 30) => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead));
  return date;
};

/**
 * Helper function to generate random names for test data
 */
export const generateRandomName = () => {
  const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'William', 'Sophia', 'James', 'Isabella', 'Logan'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${firstName} ${lastName}`;
};
