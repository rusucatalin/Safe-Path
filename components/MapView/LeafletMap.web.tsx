/**
 * Variantă hartă pentru Expo Web (browser).
 * Pe native se folosește LeafletMap.tsx cu WebView.
 */
import { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import 'leaflet/dist/leaflet.css';
import { CHISINAU_CENTER, CHISINAU_DEFAULT_ZOOM } from '@/constants/chisinau';

export interface LeafletMarker {
  lat?: number;
  lng?: number;
  location?: { lat: number; lng: number };
  title?: string;
}

interface LeafletMapProps {
  markers?: LeafletMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onMapClick?: (lat: number, lng: number) => void;
}

export function LeafletMap({
  markers = [],
  center = CHISINAU_CENTER,
  zoom = CHISINAU_DEFAULT_ZOOM,
  onMapClick,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<ReturnType<typeof import('leaflet').map> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let mounted = true;
    import('leaflet').then((L) => {
      if (!mounted || !containerRef.current) return;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      const map = L.default.map(containerRef.current!).setView([center.lat, center.lng], zoom);
      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);
      if (onMapClick) {
        map.on('click', (e: { latlng: { lat: number; lng: number } }) =>
          onMapClick(e.latlng.lat, e.latlng.lng)
        );
      }
      mapRef.current = map;
      return () => {
        map.remove();
        mapRef.current = null;
      };
    });
    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center.lat, center.lng, zoom, onMapClick]);

  useEffect(() => {
    if (!mapRef.current || !markers.length) return;
    import('leaflet').then((L) => {
      const map = mapRef.current!;
      map.eachLayer((layer) => {
        if (layer instanceof L.default.Marker) map.removeLayer(layer);
      });
      markers.forEach((m) => {
        const lat = m.lat ?? m.location?.lat;
        const lng = m.lng ?? m.location?.lng;
        if (lat != null && lng != null) {
          const marker = L.default.marker([lat, lng]).addTo(map);
          if (m.title) marker.bindPopup(m.title);
        }
      });
    });
  }, [markers]);

  return (
    <View style={styles.container}>
      <div
        ref={(el) => {
          containerRef.current = el;
        }}
        style={{ width: '100%', height: '100%', minHeight: 400 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 400 },
});
