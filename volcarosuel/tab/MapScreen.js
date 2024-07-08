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

  const handleSearch = async (searchAddress) => {
    const searchQuery = searchAddress || address;
    if (searchQuery.trim() === '') {
      setMapHtml(DEFAULT_MAP_HTML);
    } else {
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`);
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
          setAddress(''); // Clear the search input field
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
          style={styles.searchInput}
          placeholder="Enter address"
          placeholderTextColor="#fff"
          value={address}
          onChangeText={setAddress}
        />
        <TouchableOpacity onPress={() => handleSearch()} style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#000" />
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
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#000',
    color: '#fff',
    borderColor: '#fff6e7',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: '#fff6e7',
    padding: 10,
    borderRadius: 25,
  },
  webview: {
    flex: 1,
    marginTop: 60, 
    marginLeft:-10,
  },
});

export default MapScreen;
