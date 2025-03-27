
import { fetchToursFromSupabase } from './fetchers/fetchTours';

// Re-export the main function
export { fetchToursFromSupabase };

// For backward compatibility, we also directly export the helper functions
export { testConnection, checkAuthentication } from './utils/connectionUtils';
export { fetchGuideData } from './fetchers/fetchGuideData';
export { transformSupabaseToursData } from './transformers/tourTransformer';
export { isValidUuid } from './utils/guidesUtils';
