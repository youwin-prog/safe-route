import { useState } from "react";
import { MapView } from "@/components/map-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Navigation, AlertTriangle, Moon, Sun, Clock, MapPin, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_CRIME_STATS } from "@/lib/mock-data";

export default function Home() {
  const [isSearching, setIsSearching] = useState(false);
  const [showRoutes, setShowRoutes] = useState(false);
  
  const [origin, setOrigin] = useState("Union Square, San Francisco");
  const [destination, setDestination] = useState("Civic Center, San Francisco");

  const handleSearch = () => {
    setIsSearching(true);
    // Simulate API delay
    setTimeout(() => {
      setIsSearching(false);
      setShowRoutes(true);
    }, 1500);
  };

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden flex flex-col md:flex-row">
      
      {/* Map Layer (Background) */}
      <div className="absolute inset-0 z-0">
        <MapView showRoutes={showRoutes} />
      </div>

      {/* Floating Sidebar / Overlay */}
      <div className="relative z-10 w-full md:w-[400px] h-full pointer-events-none p-4 flex flex-col gap-4">
        
        {/* Header / Brand */}
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

        {/* Search Form */}
        <div className="pointer-events-auto">
          <Card className="glass-panel shadow-2xl">
            <CardContent className="pt-6 space-y-4">
              
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Origin</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-primary" />
                  <Input 
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="pl-9 bg-black/20 border-white/10 focus-visible:ring-primary/50" 
                    placeholder="Current Location"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Destination</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="pl-9 bg-black/20 border-white/10 focus-visible:ring-primary/50" 
                    placeholder="Where to?"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Time</Label>
                  <Select defaultValue="night">
                    <SelectTrigger className="bg-black/20 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="now">Now (Live)</SelectItem>
                      <SelectItem value="day"><span className="flex items-center gap-2"><Sun className="w-3 h-3"/> Day</span></SelectItem>
                      <SelectItem value="night"><span className="flex items-center gap-2"><Moon className="w-3 h-3"/> Night</span></SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Gender</Label>
                  <Select defaultValue="female">
                    <SelectTrigger className="bg-black/20 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleSearch} 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wide uppercase py-6 text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                disabled={isSearching}
              >
                {isSearching ? (
                  <span className="flex items-center gap-2 animate-pulse">Analyzing Crime Data...</span>
                ) : (
                  <span className="flex items-center gap-2">Find Safe Route <Navigation className="w-5 h-5" /></span>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <AnimatePresence>
          {showRoutes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="pointer-events-auto"
            >
              <Card className="glass-panel overflow-hidden border-t-4 border-t-primary">
                <CardHeader className="bg-primary/10 pb-2">
                  <CardTitle className="flex justify-between items-center text-primary">
                    <span className="flex items-center gap-2"><Shield className="w-5 h-5"/> Recommended Route</span>
                    <span className="text-xs font-mono bg-primary/20 px-2 py-1 rounded">SAFEST</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex justify-between items-end border-b border-white/5 pb-4">
                    <div>
                      <div className="text-3xl font-display font-bold">{MOCK_CRIME_STATS.safe.time}</div>
                      <div className="text-sm text-muted-foreground">{MOCK_CRIME_STATS.safe.distance}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-bold flex items-center gap-1 justify-end">
                        Low Risk <Shield className="w-4 h-4"/>
                      </div>
                      <div className="text-xs text-muted-foreground">Score: {MOCK_CRIME_STATS.safe.score}/100</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm opacity-60">
                      <span>Alternate (Fastest)</span>
                      <span className="text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> High Risk</span>
                    </div>
                    <div className="flex justify-between items-center text-sm opacity-60">
                      <span>{MOCK_CRIME_STATS.shortest.time}</span>
                      <span>{MOCK_CRIME_STATS.shortest.distance}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      
      {/* Legend - Bottom Right */}
      <div className="absolute bottom-6 right-6 z-10 pointer-events-none hidden md:block">
        <Card className="glass-panel pointer-events-auto w-48">
          <CardContent className="p-4 space-y-2">
            <div className="text-xs font-bold uppercase text-muted-foreground mb-2">Risk Map</div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              <span>Safe Path</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
              <span>High Risk Path</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/50"></div>
              <span>Crime Hotspot</span>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}