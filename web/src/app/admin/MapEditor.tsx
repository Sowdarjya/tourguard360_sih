import { useRef, useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

function polygonToWKT(coords: [number, number][]): string {
  if (!coords.length) return "";
  const ring = [...coords, coords[0]]
    .map(([lng, lat]) => `${lng} ${lat}`)
    .join(", ");
  return `POLYGON((${ring}))`;
}

export default function MapEditor({ token }: { token: string }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [polygon, setPolygon] = useState<[number, number][]>([]);
  const [drawing, setDrawing] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mapContainer.current && !map) {
      const m = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [78.6569, 22.9734],
        zoom: 4,
      });
      setMap(m);
    }
  }, [mapContainer, map]);

  useEffect(() => {
    if (!map) return;
    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      if (!drawing) return;
      const { lng, lat } = e.lngLat;
      setPolygon(prev => [...prev, [lng, lat]]);
    };
    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, drawing]);

  useEffect(() => {
    if (!map) return;
    const id = "geofence-polygon";
    if (polygon.length < 3) {
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(id)) map.removeSource(id);
      return;
    }
    if (map.getSource(id)) {
      (map.getSource(id) as mapboxgl.GeoJSONSource).setData({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[...polygon, polygon[0]]],
        },
        properties: {},
      });
    } else {
      map.addSource(id, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [[...polygon, polygon[0]]],
          },
          properties: {},
        },
      });
      map.addLayer({
        id,
        type: "fill",
        source: id,
        paint: {
          "fill-color": "#f00",
          "fill-opacity": 0.4,
        },
      });
    }
  }, [map, polygon]);

  const handleSubmit = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const wkt = polygonToWKT(polygon);
      if (!name || !wkt) {
        setStatus("Please enter a name and draw a polygon.");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/geofence-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ name, wktPolygon: wkt }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("Geofence created successfully!");
        setPolygon([]);
        setName("");
      } else {
        setStatus(data.error || "Failed to create geofence.");
      }
    } catch (err) {
      let msg = "Unknown error";
      if (err && typeof err === "object" && "message" in err) {
        msg = (err as { message?: string }).message || msg;
      }
      setStatus("Error: " + msg);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div ref={mapContainer} className="w-[600px] h-[400px] mb-4 rounded shadow" />
      <button
        className={`px-4 py-2 rounded ${drawing ? "bg-red-600" : "bg-blue-600"} text-white mb-2`}
        onClick={() => setDrawing(d => !d)}
      >
        {drawing ? "Finish Drawing" : "Start Drawing"}
      </button>
      {polygon.length > 2 && (
        <div className="bg-white p-4 rounded shadow w-full max-w-md mb-4">
          <h3 className="font-bold mb-2">Polygon Coordinates</h3>
          <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(polygon, null, 2)}</pre>
          <div className="mt-2">
            <input
              type="text"
              className="border p-2 rounded w-full mb-2"
              placeholder="Geofence Name"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading}
            />
            <button
              className="bg-green-600 text-white px-4 py-2 rounded w-full"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Geofence"}
            </button>
            {status && (
              <div className="mt-2 text-center text-sm text-gray-700">{status}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
