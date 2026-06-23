import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { API_BASE_URL } from "@/lib/api";

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  showRoutes: boolean;
  hour: number;
  gender: string;
}

interface CrimePoint {
  lat: number;
  lon: number;
  risk: number;
}

// Component to keep map centered on the latest user location
function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 1.5 });
    }
  }, [center, map]);

  return null;
}

export function MapView({ showRoutes, hour, gender }: MapViewProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [crimePoints, setCrimePoints] = useState<CrimePoint[]>([]);
  const [areaRisk, setAreaRisk] = useState<{ percent: number; label: string } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by this browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
        setUserLocation(coords);
        setGeoError(null);
      },
      (error) => {
        console.error("Geolocation error", error);
        setGeoError("Unable to access your current location.");
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Fallback center (equator) if we don't have a GPS fix yet
  const initialCenter: [number, number] = userLocation || [0, 0];

  // Whenever location, time, or gender change, (re)fetch crime points and
  // compute an aggregate risk percentage for the surrounding area.
  useEffect(() => {
    if (!userLocation) return;

    const [lat, lon] = userLocation;

    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/crime-points`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            center_lat: lat,
            center_lon: lon,
            // A smaller radius keeps the query fast while
            // still capturing the user's surrounding area.
            radius_km: 25,
            hour,
            gender,
          }),
        });

        if (!response.ok) return;

        const data = await response.json();
        if (Array.isArray(data.points)) {
          const mapped: CrimePoint[] = data.points.map((p: any) => ({
            lat: Number(p.lat),
            lon: Number(p.lon),
            risk: Number(p.risk),
          }));

          setCrimePoints(mapped);

          if (mapped.length > 0) {
            const totalRisk = mapped.reduce((sum, p) => sum + p.risk, 0);
            const avgRisk = totalRisk / mapped.length;

            // Max theoretical risk per point ≈ 9
            const maxPerPoint = 9;
            const percentRaw = (avgRisk / maxPerPoint) * 100;
            const percent = Math.max(0, Math.min(100, Math.round(percentRaw)));

            let label = "Low";
            if (percent >= 70) label = "High";
            else if (percent >= 35) label = "Medium";

            setAreaRisk({ percent, label });
          } else {
            setAreaRisk(null);
          }
        }
      } catch (error) {
        console.error("Failed to fetch crime points", error);
      }
    };

    fetchData();
  }, [userLocation, hour, gender]);

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={initialCenter}
        zoom={userLocation ? 14 : 2}
        scrollWheelZoom={true}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={userLocation} />

        {crimePoints.map((p, idx) => {
          let color = '#2b83ba';
          if (p.risk >= 4 && p.risk < 7) color = '#fdae61';
          if (p.risk >= 7) color = '#d73027';

          return (
            <Circle
              key={idx}
              center={[p.lat, p.lon]}
              radius={400}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.35,
                weight: 0,
              }}
            />
          );
        })}

        {userLocation && (
          <Marker position={userLocation}>
            <Popup>
              <div className="text-sm font-semibold">You are here</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Small overlay for status */}
      <div className="absolute bottom-1 left-1 z-[400] text-[10px] text-white/80 px-2 py-1 rounded bg-black/60 pointer-events-none space-y-0.5">
        <div>
          {geoError
            ? geoError
            : userLocation
            ? "Live GPS + nearby crime intensity"
            : "Requesting your location..."}
        </div>
        {areaRisk && !geoError && (
          <div className="font-semibold">
            Area risk: {areaRisk.label} ({areaRisk.percent}%)
          </div>
        )}
      </div>
    </div>
  );
}