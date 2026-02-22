/**
 * HTML pentru Leaflet în WebView. Încarcă Leaflet și OSM din CDN.
 * Pentru offline, poți înlocui cu build care încorporează leaflet.min.js/css.
 */
export const LEAFLET_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    (function() {
      var CHISINAU = [47.0105, 28.8638];
      var ZOOM = 13;
      var map = L.map('map', { zoomControl: true }).setView(CHISINAU, ZOOM);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      function send(message) {
        if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
          window.ReactNativeWebView.postMessage(JSON.stringify(message));
        }
      }

      window.setMarkers = function(markers) {
        if (window.markerLayer) map.removeLayer(window.markerLayer);
        window.markerLayer = L.layerGroup();
        (markers || []).forEach(function(m) {
          var lat = m.lat != null ? m.lat : (m.location && m.location.lat);
          var lng = m.lng != null ? m.lng : (m.location && m.location.lng);
          if (lat == null || lng == null) return;
          var marker = L.marker([lat, lng]).addTo(window.markerLayer);
          if (m.title) marker.bindPopup(m.title);
        });
        window.markerLayer.addTo(map);
      };

      window.setCenter = function(lat, lng, zoom) {
        map.setView([lat, lng], zoom != null ? zoom : ZOOM);
      };

      map.on('click', function(e) {
        send({ type: 'mapClick', lat: e.latlng.lat, lng: e.latlng.lng });
      });
    })();
  </script>
</body>
</html>
`;
