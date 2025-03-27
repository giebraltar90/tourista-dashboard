
import { FETCH_TIMEOUT, API_ANON_KEY } from './constants';
import { logger } from '@/utils/logger';

/**
 * Custom fetch implementation with better error handling and CORS support
 */
export const customFetch = (url, options) => {
  // Add headers to avoid CORS issues and ensure auth headers are sent
  const headers = {
    ...(options?.headers || {}),
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'apikey': API_ANON_KEY,
    'Authorization': `Bearer ${API_ANON_KEY}`,
    'Content-Type': 'application/json',
    // Adding these headers might help with some CORS issues
    'Accept': 'application/json',
    'X-Client-Info': 'supabase-js/2.x'
  };
  
  // Log the request URL and headers for debugging
  logger.debug(`Supabase request to ${url}`, { 
    headers: { ...headers, 'Authorization': '[REDACTED]' }
  });
  
  // Use a longer timeout for fetch operations with AbortSignal
  return fetch(url, {
    ...options,
    headers,
    signal: AbortSignal.timeout(FETCH_TIMEOUT),
    cache: 'no-store',
    mode: 'cors',
    credentials: 'omit', // Changed from 'include' to 'omit' to avoid some CORS issues
  }).catch(error => {
    logger.error(`Fetch error for ${url}:`, error);
    throw error;
  });
};
