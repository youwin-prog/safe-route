const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL = (rawBaseUrl && String(rawBaseUrl).trim())
  ? String(rawBaseUrl).replace(/\/$/, "")
  : "http://127.0.0.1:8000";