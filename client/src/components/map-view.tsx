import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { SF_CENTER, RISK_ZONES, SHORTEST_ROUTE, SAFEST_ROUTE } from '@/lib/mock-data';

// Fix for default Leaflet icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  showRoutes: boolean;
}

// Component to handle map resizing/centering
function MapController({ showRoutes }: { showRoutes: boolean }) {
  const map = useMap();
  
  useEffect(() => {
    if (showRoutes) {
      // In a real app, we'd fitBounds to the route
      map.flyTo([37.784, -122.413], 14, { duration: 2 });
    }
  }, [showRoutes, map]);

  return null;
}

export function MapView({ showRoutes }: MapViewProps) {
  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={SF_CENTER} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="w-full h-full"
        zoomControl={false} // We'll add custom controls if needed or rely on scroll/pinch
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapController showRoutes={showRoutes} />

        {/* Heatmap / Risk Zones - Always visible or toggleable? Let's show them to indicate data awareness */}
        {RISK_ZONES.map((zone, i) => (
          <Circle
            key={i}
            center={[zone.lat, zone.lng]}
            radius={zone.radius}
            pathOptions={{ 
              fillColor: '#ef4444', // Red-500
              fillOpacity: 0.3 * zone.intensity, 
              color: 'transparent' 
            }}
          />
        ))}

        {/* Routes - Only shown after search */}
        {showRoutes && (
          <>
            {/* Shortest (Risky) Route */}
            <Polyline 
              positions={SHORTEST_ROUTE} 
              pathOptions={{ 
                color: '#ef4444', // Red 
                weight: 4, 
                opacity: 0.7,
                dashArray: '10, 10' // Dashed to indicate "warning" or "alternative"
              }} 
            >
              <Popup>
                <div className="font-bold text-red-500">Shortest Route</div>
                <div className="text-sm">High Risk Area Detected</div>
              </Popup>
            </Polyline>

            {/* Safest Route */}
            <Polyline 
              positions={SAFEST_ROUTE} 
              pathOptions={{ 
                color: '#10b981', // Emerald-500 (Green)
                weight: 6, 
                opacity: 0.9 
              }} 
            >
              <Popup>
                <div className="font-bold text-emerald-500">Recommended Safe Route</div>
                <div className="text-sm">Verified Lighting • Low Crime History</div>
              </Popup>
            </Polyline>

            {/* Start/End Markers */}
            <Marker position={SHORTEST_ROUTE[0]}>
              <Popup>Start: Union Square</Popup>
            </Marker>
            <Marker position={SHORTEST_ROUTE[SHORTEST_ROUTE.length - 1]}>
              <Popup>End: Civic Center</Popup>
            </Marker>
          </>
        )}
      </MapContainer>
      
      {/* Attribution Overlay */}
      <div className="absolute bottom-1 right-1 z-[400] text-[10px] text-white/30 px-2 pointer-events-none">
        SafeRoute Intelligence
      </div>
    </div>
  );
}