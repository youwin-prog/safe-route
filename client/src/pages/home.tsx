import { useEffect, useRef, useState } from "react";
import { MapView } from "@/components/map-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Navigation, AlertTriangle, Moon, Sun, MapPin, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/lib/api";

type DestinationSuggestion = {
  name: string;
  lat: number;
  lon: number;
};

export default function Home() {
  const [isSearching, setIsSearching] = useState(false);
  const [showRoutes, setShowRoutes] = useState(false);
  const [mapHtml, setMapHtml] = useState<string | null>(null);
  const [routeRisk, setRouteRisk] = useState<{ percent: number; label: string } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [destinationSuggestions, setDestinationSuggestions] = useState<DestinationSuggestion[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);
  const [time, setTime] = useState("night");
  const [gender, setGender] = useState("female");

  // Inject the backend-generated map HTML only when mapHtml changes,
  // so typing in the form doesn't keep reloading the iframe and
  // causing a flicker.
  useEffect(() => {
    if (mapContainerRef.current && mapHtml) {
      mapContainerRef.current.innerHTML = mapHtml;
    }
  }, [mapHtml]);

  // Get user's location once to bias autocomplete around their area
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.error("Geolocation error for autocomplete", error);
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 10000 }
    );
  }, []);

  // Fetch destination suggestions as the user types (simple debounce)
  useEffect(() => {
    const query = destination.trim();

    // Clear suggestions for very short queries
    if (query.length < 1) {
      setDestinationSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsFetchingSuggestions(true);

        // If we know the user's location, restrict search to a small box around them
        let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&addressdetails=1&limit=5`;

        if (userLocation) {
          const [lat, lon] = userLocation;
          const delta = 0.15; // ~15km box around user
          const left = lon - delta;
          const bottom = lat - delta;
          const right = lon + delta;
          const top = lat + delta;
          url += `&viewbox=${left},${top},${right},${bottom}&bounded=1`;
        }

        const response = await fetch(url, {
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          setDestinationSuggestions([]);
          return;
        }

        const results: any[] = await response.json();
        const places: DestinationSuggestion[] = results
          .filter((p) => p && p.display_name && p.lat && p.lon)
          .map((p) => ({
            name: String(p.display_name),
            lat: parseFloat(p.lat),
            lon: parseFloat(p.lon),
          }));

        setDestinationSuggestions(places);
      } catch (error) {
        if ((error as any)?.name !== "AbortError") {
          console.error("Failed to fetch destination suggestions", error);
        }
      } finally {
        setIsFetchingSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [destination, userLocation]);

  const handleSearch = async () => {
    if (!destination.trim()) {
      // Simple guard to prevent empty requests
      return;
    }

    const getCurrentPosition = () =>
      new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by this browser."));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

    setIsSearching(true);
    setShowRoutes(false);
    setRouteRisk(null);

    try {
      const position = await getCurrentPosition();
      const originLat = position.coords.latitude;
      const originLon = position.coords.longitude;

      const response = await fetch(`${API_BASE_URL}/api/safe-route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin_lat: originLat,
          origin_lon: originLon,
          destination,
          dest_lat: destinationCoords ? destinationCoords[0] : null,
          dest_lon: destinationCoords ? destinationCoords[1] : null,
          hour: time === "night" ? 23 : 12,
          gender,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data.map_html) {
        setMapHtml(data.map_html);
        setShowRoutes(true);

        if (data.risk && data.risk.safest_route) {
          const safest = data.risk.safest_route as { risk_percent?: number; label?: string };
          const percent = typeof safest.risk_percent === "number" ? safest.risk_percent : undefined;
          const label = typeof safest.label === "string" ? safest.label : undefined;

          if (percent !== undefined && label) {
            setRouteRisk({ percent, label });
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch route:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden flex flex-col md:flex-row">
      
      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        {mapHtml ? (
          <div ref={mapContainerRef} className="w-full h-full" />
        ) : (
          <MapView
            showRoutes={showRoutes}
            hour={time === "night" ? 23 : 12}
            gender={gender}
          />
        )}
      </div>

      {/* UI Controls */}
      <div className="relative z-10 w-full md:w-[400px] h-full pointer-events-none p-4 flex flex-col gap-4">
        
        <div className="pointer-events-auto">
          <Card className="glass-panel border-l-4 border-l-primary shadow-2xl">
            <CardHeader className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-full">
                  <Shield className="w-6 h-6 text-primary animate-pulse" />
                </div>
                <div>
                  <CardTitle className="font-display text-2xl tracking-wide uppercase">SafeRoute</CardTitle>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Crime-Aware Navigation</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="pointer-events-auto">
          <Card className="glass-panel shadow-2xl overflow-visible">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Destination</Label>
                <div className="relative z-50">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      setDestinationCoords(null);
                    }}
                    className="pl-9 bg-black/20 border-white/10" 
                    placeholder="Enter destination address..."
                  />

                  {destinationSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-black/80 border border-white/10 rounded-md max-h-56 overflow-y-auto z-50">
                      {destinationSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full text-left px-3 py-2 text-xs text-white hover:bg-white/10"
                          onClick={() => {
                            setDestination(suggestion.name);
                            setDestinationCoords([suggestion.lat, suggestion.lon]);
                            setDestinationSuggestions([]);
                          }}
                        >
                          {suggestion.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Time</Label>
                  <Select value={time} onValueChange={setTime}>
                    <SelectTrigger className="bg-black/20 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day"><span className="flex items-center gap-2"><Sun className="w-3 h-3"/> Day</span></SelectItem>
                      <SelectItem value="night"><span className="flex items-center gap-2"><Moon className="w-3 h-3"/> Night</span></SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="bg-black/20 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleSearch} 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wide uppercase py-6 text-lg shadow-lg"
                disabled={isSearching}
              >
                {isSearching ? "Analyzing Risk..." : "Find Safe Route"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <AnimatePresence>
          {showRoutes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pointer-events-auto"
            >
              <Card className="glass-panel border-t-4 border-t-primary">
                <CardHeader className="bg-primary/10 pb-2">
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Shield className="w-5 h-5"/> Optimized Safe Path
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      The safest route has been calculated based on local crime data and your selected time and gender.
                    </div>
                    {routeRisk && (
                      <div className="text-sm font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-primary" />
                        <span>
                          Route risk: <span className="text-primary">{routeRisk.label}</span> ({routeRisk.percent}%)
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}