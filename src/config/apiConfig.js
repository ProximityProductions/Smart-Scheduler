// src/config/apiConfig.js

// Your Gemini API key
export const GEMINI_API_KEY = "AIzaSyA0c12JXr2F0JfWcf8qEMD1g3fVWi-TVcQ";

export const API_CONFIG = {
  GEMINI_BASE_URL: "https://generativelanguage.googleapis.com/v1beta",
  MODEL: "gemini-1.5-flash",
  MAX_TOKENS: 1000
};

// Validate API key
export const isApiKeyConfigured = () => {
  return GEMINI_API_KEY && 
         GEMINI_API_KEY.length > 20 &&
         GEMINI_API_KEY.startsWith('AIza');
};