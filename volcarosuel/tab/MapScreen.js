import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';

const DEFAULT_MAP_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Leaflet Map</title>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
  <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
  <style>
    #map {
      height: 100vh;
      width: 100vw;
    }
    .leaflet-control-container {
      display: none;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
  <script>
    var map = L.map('map').setView([37.7749, -122.4194], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: ''
    }).addTo(map);

    map.on('touchstart', function() {
      map.scrollWheelZoom.enable();
    });

    map.on('touchend', function() {
      map.scrollWheelZoom.disable();
    });

    map.scrollWheelZoom.disable();
  </script>
</body>
</html>
`;

const MapScreen = () => {
  const route = useRoute();
  const initialAddress = route.params?.address || '';
  const [address, setAddress] = useState(initialAddress);
  const [mapHtml, setMapHtml] = useState(DEFAULT_MAP_HTML);

  useEffect(() => {
    if (initialAddress) {
      handleSearch(initialAddress);
    }
  }, [initialAddress]);

  const handleSearch = async (searchAddress = address) => {
    if (searchAddress.trim() === '') {
      setMapHtml(DEFAULT_MAP_HTML);
    } else {
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchAddress)}&format=json&limit=1`);
        if (response.data.length > 0) {
          const { lat, lon } = response.data[0];
          const updatedMapHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Leaflet Map</title>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
              <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
              <style>
                #map {
                  height: 100vh;
                  width: 100vw;
                }
                .leaflet-control-container {
                  display: none;
                }
              </style>
            </head>
            <body>
              <div id="map"></div>
              <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
              <script>
                var map = L.map('map').setView([${lat}, ${lon}], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  attribution: ''
                }).addTo(map);
                var marker = L.marker([${lat}, ${lon}]).addTo(map);

                map.on('touchstart', function() {
                  map.scrollWheelZoom.enable();
                });

                map.on('touchend', function() {
                  map.scrollWheelZoom.disable();
                });

                map.scrollWheelZoom.disable();
              </script>
            </body>
            </html>
          `;
          setMapHtml(updatedMapHtml);
        } else {
          alert('Location not found');
        }
      } catch (error) {
        console.error('Error fetching location:', error);
        alert('Error fetching location');
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Enter address"
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Ionicons name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <WebView
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#1A73E8',
    padding: 10,
    borderRadius: 5,
  },
  webview: {
    flex: 1,
    marginTop: 10,
  },
});

export default MapScreen;
