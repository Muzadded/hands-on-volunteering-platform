import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons under Vite bundling
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const DHAKA = [23.8103, 90.4125];

/**
 * Simple Leaflet map for neighbour-help posts that have coordinates.
 */
export default function HelpMap({ posts = [], selectedId, onSelect, center }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;
    const map = L.map(containerRef.current, {
      scrollWheelZoom: false,
    }).setView(center || DHAKA, 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, [center]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    const withCoords = posts.filter(
      (p) => p.lat != null && p.lng != null && !Number.isNaN(Number(p.lat))
    );

    const bounds = [];
    withCoords.forEach((post) => {
      const latlng = [Number(post.lat), Number(post.lng)];
      bounds.push(latlng);
      const marker = L.marker(latlng);
      marker.bindPopup(
        `<strong>${post.title || "Help post"}</strong><br/>${post.post_type || ""} · ${
          post.category || ""
        }`
      );
      marker.on("click", () => onSelect?.(post.help_post_id));
      if (selectedId === post.help_post_id) {
        marker.openPopup();
      }
      marker.addTo(layer);
    });

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 14 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 13);
    } else if (center) {
      map.setView(center, 12);
    }
  }, [posts, selectedId, onSelect, center]);

  return (
    <div
      ref={containerRef}
      className="h-72 w-full overflow-hidden rounded-2xl border border-[var(--color-mist)] shadow-sm"
      role="img"
      aria-label="Map of nearby help posts"
    />
  );
}
