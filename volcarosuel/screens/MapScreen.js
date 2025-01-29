import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';

// ★ Use your own Mapbox Access Token
MapboxGL.setAccessToken(
  'sk.eyJ1IjoiYXlhbnNoc2luZ2giLCJhIjoiY201MDN2MDEwMWpzdDJxcHAyMHZ4aGtwOSJ9.D8WgPNxITq3D4a1-AiTpVA'
);

const MapScreen = () => {
  // State
  const [address, setAddress] = useState('');
  const [destination, setDestination] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRouteDetails, setShowRouteDetails] = useState(false);

  // Volunteer addresses (will be geocoded into coords)
  const [volunteerLocations, setVolunteerLocations] = useState([
    {
      id: 1,
      name: 'Community Kitchen',
      address: '123 Main Street, San Francisco, CA',
      coords: null,
    },
    {
      id: 2,
      name: 'Shelter Home',
      address: '789 Oak Avenue, San Francisco, CA',
      coords: null,
    },
    {
      id: 3,
      name: 'Food Bank',
      address: '456 Market Street, San Francisco, CA',
      coords: null,
    },
  ]);

  // Refs
  const cameraRef = useRef(null);
  const animationDuration = 1000;

  useEffect(() => {
    // Disable Mapbox telemetry
    MapboxGL.setTelemetryEnabled(false);

    // iOS location authorization
    Geolocation.requestAuthorization('whenInUse')
      .then(() => {
        getCurrentLocation();
      })
      .catch((error) => {
        Alert.alert(
          'Location Services Disabled',
          'Please enable location services for a better experience.'
        );
        console.error('Location auth error:', error);
      });

    // Fetch volunteer location coordinates on startup
    fetchVolunteerCoordinates();
  }, []);

  // ====== LOCATION & CAMERA ======
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        const coords = [longitude, latitude];
        setUserLocation(coords);
        updateCamera(coords, 14);
      },
      (error) => {
        Alert.alert(
          'Location Unavailable',
          'Please enable location services for a better experience.'
        );
        console.error('Geolocation error:', error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const updateCamera = (coords, zoom = 14) => {
    cameraRef.current?.setCamera({
      centerCoordinate: coords,
      zoomLevel: zoom,
      pitch: 45,
      animationDuration,
      altitude: 2000,
    });
  };

  // ====== VOLUNTEER LOCATION LOOKUP ======
  const fetchVolunteerCoordinates = async () => {
    try {
      const updated = await Promise.all(
        volunteerLocations.map(async (loc) => {
          const coords = await fetchCoordinatesFromAddress(loc.address);
          return { ...loc, coords };
        })
      );
      // Remove any that have no coords
      setVolunteerLocations(updated.filter((loc) => loc.coords !== null));
    } catch (error) {
      console.error('Error fetching volunteer coords:', error);
    }
  };

  const fetchCoordinatesFromAddress = async (addr) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          addr
        )}&format=json&limit=1`
      );
      if (response.data?.length > 0) {
        const { lat, lon } = response.data[0];
        return [parseFloat(lon), parseFloat(lat)];
      }
      console.warn('Address not found:', addr);
      return null;
    } catch (error) {
      console.error('Nominatim error:', error);
      return null;
    }
  };

  // ====== SEARCH & ROUTING ======
  const handleSearch = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter a destination address');
      return;
    }

    setLoading(true);
    try {
      const coords = await fetchCoordinatesFromAddress(address);
      if (coords) {
        setDestination(coords);
        calculateRoute(coords);
        updateCamera(coords, 12);
      } else {
        Alert.alert('Error', 'Address not found');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search address');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRoute = async (destinationCoords) => {
    if (!userLocation) return;

    try {
      const response = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation[0]},${userLocation[1]};${destinationCoords[0]},${destinationCoords[1]}?geometries=geojson&access_token=sk.eyJ1IjoiYXlhbnNoc2luZ2giLCJhIjoiY201MDN2MDEwMWpzdDJxcHAyMHZ4aGtwOSJ9.D8WgPNxITq3D4a1-AiTpVA`
      );
      if (response.data.routes.length > 0) {
        const { geometry, distance, duration } = response.data.routes[0];
        setRoute(geometry);

        // Format trip details
        const miles = (distance / 1609.34).toFixed(1);
        const totalMinutes = Math.ceil(duration / 60);
        const hours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        const eta =
          hours > 0 ? `${hours} hr ${remainingMinutes} min` : `${totalMinutes} min`;

        setTripDetails({ miles, eta });
        setShowRouteDetails(true);
      } else {
        Alert.alert('No routes found');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to calculate route');
      console.error('Routing error:', error);
    }
  };

  // Optionally "fly" camera
  const handleNavigation = () => {
    if (!userLocation || !destination) return;
    cameraRef.current?.flyTo([destination, userLocation], animationDuration);
  };

  // Render route on map
  const renderRoute = () => (
    <MapboxGL.ShapeSource id="routeSource" shape={route}>
      <MapboxGL.LineLayer
        id="routeLayer"
        style={{
          lineColor: '#4066F7',
          lineWidth: 4,
          lineOpacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
    </MapboxGL.ShapeSource>
  );

  // ====== RENDER ======
  return (
    <SafeAreaView style={styles.rootContainer}>
      {/* Header bar with app name & search box */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>NexoLink</Text>
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter address"
            placeholderTextColor="#666"
            value={address}
            onChangeText={setAddress}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity onPress={handleSearch}>
            {loading ? (
              <ActivityIndicator color="#4066F7" />
            ) : (
              <Ionicons name="search" size={24} color="#4066F7" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Map behind everything */}
      <View style={styles.mapContainer}>
        <MapboxGL.MapView style={StyleSheet.absoluteFill} styleURL={MapboxGL.StyleURL.Street}>
          <MapboxGL.Camera ref={cameraRef} />
          <MapboxGL.UserLocation visible={true} />

          {/* 3D Terrain & 3D Buildings */}
          <MapboxGL.RasterDemSource
            id="mapbox-dem"
            url="mapbox://mapbox.mapbox-terrain-dem-v1"
            tileSize={512}
          >
            <MapboxGL.Terrain sourceID="mapbox-dem" style={{ exaggeration: 1.5 }} />
          </MapboxGL.RasterDemSource>

          <MapboxGL.FillExtrusionLayer
            id="3d-buildings"
            sourceID="composite"
            sourceLayerID="building"
            filter={['==', 'extrude', 'true']}
            style={{
              fillExtrusionColor: '#ddd',
              fillExtrusionHeight: ['get', 'height'],
              fillExtrusionBase: ['get', 'min_height'],
              fillExtrusionOpacity: 0.6,
            }}
          />

          {/* Route */}
          {route && renderRoute()}

          {/* Destination Marker */}
          {destination && (
            <MapboxGL.PointAnnotation id="destination" coordinate={destination}>
              <View style={styles.markerContainer}>
                <Ionicons name="location-sharp" size={32} color="#4066F7" />
                <Text style={styles.markerText}>Destination</Text>
              </View>
            </MapboxGL.PointAnnotation>
          )}

          {/* Volunteer Markers */}
          {volunteerLocations.map((v) => {
            if (!v.coords) return null;
            return (
              <MapboxGL.PointAnnotation
                key={v.id}
                id={`vol-${v.id}`}
                coordinate={v.coords}
              >
                <View style={styles.volunteerMarker}>
                  <Ionicons name="people" size={28} color="#2ECC71" />
                  <Text style={styles.volunteerMarkerText}>{v.name}</Text>
                </View>
              </MapboxGL.PointAnnotation>
            );
          })}
        </MapboxGL.MapView>

        {/* Route Details Card */}
        {showRouteDetails && tripDetails && (
          <View style={styles.routeDetailsContainer}>
            <Text style={styles.routeDetailsTitle}>Route Details</Text>
            <View style={styles.detailsRow}>
              <Ionicons name="time" size={20} color="#666" />
              <Text style={styles.detailText}>{tripDetails.eta}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Ionicons name="speedometer" size={20} color="#666" />
              <Text style={styles.detailText}>{tripDetails.miles} miles</Text>
            </View>
            <TouchableOpacity style={styles.navigateButton} onPress={handleNavigation}>
              <Text style={styles.navigateButtonText}>Start Navigation</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom volunteer location list */}
        <ScrollView
          horizontal
          style={styles.volunteerList}
          showsHorizontalScrollIndicator={false}
        >
          {volunteerLocations.map((loc) => {
            if (!loc.coords) return null;
            return (
              <TouchableOpacity
                key={loc.id}
                style={styles.volunteerCard}
                onPress={() => updateCamera(loc.coords)}
              >
                <Ionicons name="location" size={20} color="#2ECC71" />
                <Text style={styles.volunteerCardText}>{loc.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Floating Home Button (example: zoom out or go to a “home” coords if you have them) */}
        <TouchableOpacity
          style={styles.fabHome}
          onPress={() => Alert.alert('Home pressed', 'Go Home logic here!')}
        >
          <Ionicons name="home" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Floating Location Button (re-center on user) */}
        <TouchableOpacity style={styles.fabLocate} onPress={getCurrentLocation}>
          <Ionicons name="locate" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default MapScreen;

/* ---------------- STYLES ------------------ */
const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#fff6e7', // Cream
  },
  headerContainer: {
    backgroundColor: '#fff6e7',
    padding: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  searchWrapper: {
    width: '90%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  /* Markers */
  markerContainer: {
    alignItems: 'center',
  },
  markerText: {
    color: '#4066F7',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  volunteerMarker: {
    alignItems: 'center',
  },
  volunteerMarkerText: {
    color: '#2ECC71',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  /* Route Details Card */
  routeDetailsContainer: {
    position: 'absolute',
    bottom: 100,
    left: 10,
    right: 10,
    backgroundColor: '#ffffffcc',
    borderRadius: 12,
    padding: 16,
  },
  routeDetailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  detailText: {
    fontSize: 15,
    color: '#666',
    marginLeft: 8,
  },
  navigateButton: {
    backgroundColor: '#4066F7',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  navigateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  /* Volunteer List */
  volunteerList: {
    position: 'absolute',
    bottom: 16,
    left: 10,
    right: 10,
  },
  volunteerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  volunteerCardText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  /* Floating Action Buttons */
  fabHome: {
    position: 'absolute',
    right: 20,
    bottom: 140,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabLocate: {
    position: 'absolute',
    right: 20,
    bottom: 70,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4066F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
