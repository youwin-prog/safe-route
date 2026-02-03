// Mock data for San Francisco demonstration
export const SF_CENTER: [number, number] = [37.7749, -122.4194];

// Risky zones (Heatmap data) - Tenderloin / Soma areas mocked
export const RISK_ZONES = [
  { lat: 37.783, lng: -122.415, intensity: 0.8, radius: 400 }, // Tenderloin-ish
  { lat: 37.779, lng: -122.408, intensity: 0.6, radius: 300 }, // Mid-Market
  { lat: 37.760, lng: -122.418, intensity: 0.5, radius: 350 }, // Mission
];

// Route 1: The "Shortest" but "Risky" route (cuts through danger zones)
// From Union Square to Civic Center
export const SHORTEST_ROUTE: [number, number][] = [
  [37.7879, -122.4075], // Union Square
  [37.7850, -122.4100], 
  [37.7830, -122.4150], // Through Tenderloin
  [37.7800, -122.4180],
  [37.7790, -122.4190], // Civic Center
];

// Route 2: The "Safest" route (goes around)
export const SAFEST_ROUTE: [number, number][] = [
  [37.7879, -122.4075], // Union Square
  [37.7890, -122.4090], // Go North slightly
  [37.7910, -122.4150], // Van Ness corridor (wider, safer)
  [37.7850, -122.4200],
  [37.7790, -122.4190], // Civic Center
];

export const MOCK_CRIME_STATS = {
  safe: { score: 12, riskLabel: "Low", distance: "1.4 miles", time: "22 min" },
  shortest: { score: 45, riskLabel: "High", distance: "0.9 miles", time: "16 min" }
};