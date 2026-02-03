import { useState } from "react";
import { MapView } from "@/components/map-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Navigation, AlertTriangle, Moon, Sun, MapPin, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [isSearching, setIsSearching] = useState(false);
  const [showRoutes, setShowRoutes] = useState(false);
  const [mapHtml, setMapHtml] = useState<string | null>(null);
  
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [time, setTime] = useState("night");
  const [gender, setGender] = useState("female");

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      // In a real production app, this would be a POST to your FastAPI backend
      // Since I am a frontend design engineer, I am setting up the structure 
      // for you to easily plug in your `POST /api/safe-route`
      
      /* 
      const response = await fetch('/api/safe-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin_lat: 37.7749, // You'd get this from geocoding or geolocation
          origin_lon: -122.4194,
          destination,
          hour: time === 'night' ? 23 : 12,
          gender
        })
      });
      const data = await response.json();
      setMapHtml(data.map_html);
      */
      
      // Simulating the backend response for the mockup
      setTimeout(() => {
        setIsSearching(false);
        setShowRoutes(true);
      }, 1500);
    } catch (error) {
      console.error("Failed to fetch route:", error);
      setIsSearching(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden flex flex-col md:flex-row">
      
      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        {mapHtml ? (
          <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: mapHtml }} />
        ) : (
          <MapView showRoutes={showRoutes} />
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
          <Card className="glass-panel shadow-2xl">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Destination</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="pl-9 bg-black/20 border-white/10" 
                    placeholder="Enter destination address..."
                  />
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
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">The safest route has been calculated based on local crime data and current conditions.</div>
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