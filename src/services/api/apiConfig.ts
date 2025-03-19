
// Base API configuration
export const API_BASE_URL = "https://api.ventrata.com/v1"; // Replace with actual Ventrata API URL
export const API_KEY = "your-ventrata-api-key"; // This should be stored securely in production

// API headers
export const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${API_KEY}`,
};
