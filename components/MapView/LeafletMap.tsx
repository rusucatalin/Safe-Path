import { useRef, useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { CHISINAU_CENTER, CHISINAU_DEFAULT_ZOOM } from '@/constants/chisinau';
import { LEAFLET_HTML } from './leafletHtml';

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
  const webViewRef = useRef<WebView>(null);

  const inject = useCallback((script: string) => {
    webViewRef.current?.injectJavaScript(script);
  }, []);

  useEffect(() => {
    if (markers.length === 0) return;
    const payload = JSON.stringify(markers).replace(/</g, '\\u003c');
    const t = setTimeout(() => {
      inject(`(function(){ window.setMarkers && window.setMarkers(${payload}); })(); true;`);
    }, 800);
    return () => clearTimeout(t);
  }, [markers, inject]);

  useEffect(() => {
    const t = setTimeout(() => {
      inject(`(function(){ window.setCenter && window.setCenter(${center.lat}, ${center.lng}, ${zoom}); })(); true;`);
    }, 500);
    return () => clearTimeout(t);
  }, [center.lat, center.lng, zoom, inject]);

  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'mapClick' && onMapClick) {
          onMapClick(data.lat, data.lng);
        }
      } catch (_) {}
    },
    [onMapClick]
  );

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: LEAFLET_HTML }}
        style={styles.webview}
        originWhitelist={['*']}
        javaScriptEnabled
        onMessage={handleMessage}
        mixedContentMode="compatibility"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1, backgroundColor: '#202020' },
});
