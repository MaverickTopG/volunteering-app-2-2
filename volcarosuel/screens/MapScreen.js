import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Alert,
  SafeAreaView,
  Animated,
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';

MapboxGL.setAccessToken(
  'sk.eyJ1IjoiYXlhbnNoc2luZ2giLCJhIjoiY201MDN2MDEwMWpzdDJxcHAyMHZ4aGtwOSJ9.D8WgPNxITq3D4a1-AiTpVA'
);

// Example volunteer sites without coordinates initially.
const VOLUNTEER_SITES = [
  { id: '1', name: 'Community Kitchen', address: '123 Market Street, San Francisco, CA' },
  { id: '2', name: 'Food Bank', address: '501 Mission Street, San Francisco, CA' },
  { id: '3', name: 'Shelter Home', address: '9th St & Mission St, San Francisco, CA' },
];

const MapScreen = () => {
  // ====== State ======
  const [address, setAddress] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [geoLocationFailed, setGeoLocationFailed] = useState(false);
  const [alertShown, setAlertShown] = useState(false);

  // Destination & route
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);

  // Navigation steps and mode
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [navigationMode, setNavigationMode] = useState(false);

  // Volunteer sites stored in state.
  const [volunteerSites, setVolunteerSites] = useState(VOLUNTEER_SITES);

  // Animations
  const instructionAnim = useRef(new Animated.Value(0)).current;
  const searchBarAnim = useRef(new Animated.Value(0)).current;

  // Refs
  const cameraRef = useRef(null);
  const watchId = useRef(null);

  // ====== Effects ======
  useEffect(() => {
    // Request live location permission on mount.
    Geolocation.requestAuthorization('whenInUse').then((status) => {
      if (status === 'granted') {
        getCurrentLocation();
      } else {
        setGeoLocationFailed(true);
      }
    });
  }, []);

  // Show an alert once if live location is not yet obtained.
  useEffect(() => {
    if (!userLocation && !geoLocationFailed && !alertShown) {
      Alert.alert(
        'Location Permission',
        "We need to access your live location for location services. We don't store or share your location.",
        [{ text: 'OK', onPress: () => setAlertShown(true) }]
      );
    }
  }, [userLocation, geoLocationFailed, alertShown]);

  // Geocode volunteer sites on startup and update state with coordinates.
  useEffect(() => {
    const fetchVolunteerCoordinates = async () => {
      const updated = await Promise.all(
        VOLUNTEER_SITES.map(async (site) => {
          const coords = await fetchCoordsForAddress(site.address);
          return { ...site, coords };
        })
      );
      setVolunteerSites(updated.filter((site) => site.coords));
    };
    fetchVolunteerCoordinates();
  }, []);

  // Animate search bar and instruction bar when navigation mode changes.
  useEffect(() => {
    Animated.timing(searchBarAnim, {
      toValue: navigationMode ? 50 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(instructionAnim, {
      toValue: navigationMode ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (navigationMode) {
      startLocationWatch();
    } else {
      stopLocationWatch();
      setCurrentStepIndex(0);
    }
  }, [navigationMode]);

  // ====== GEOLOCATION ======
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        const coords = [longitude, latitude];
        setUserLocation(coords);
        setGeoLocationFailed(false);
        cameraRef.current?.setCamera({
          centerCoordinate: coords,
          zoomLevel: 14,
          animationDuration: 1000,
        });
      },
      (error) => {
        console.warn('getCurrentPosition error:', error);
        setGeoLocationFailed(true);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const startLocationWatch = () => {
    watchId.current = Geolocation.watchPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        handleUserProgress([longitude, latitude]);
      },
      (err) => console.warn('watchPosition error:', err),
      { enableHighAccuracy: true, distanceFilter: 5 }
    );
  };

  const stopLocationWatch = () => {
    if (watchId.current) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  };

  // ====== Helper: Geocode an address ======
  const fetchCoordsForAddress = async (addr) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        addr
      )}&format=json&limit=1`;
      const resp = await axios.get(url);
      if (resp.data.length > 0) {
        const { lat, lon } = resp.data[0];
        return [parseFloat(lon), parseFloat(lat)];
      }
      return null;
    } catch (err) {
      console.warn('fetchCoordsForAddress error:', err);
      return null;
    }
  };

  // ====== NAVIGATION STEPS ======
  const handleUserProgress = (coords) => {
    setUserLocation(coords);
    if (!steps.length || currentStepIndex >= steps.length) return;

    const step = steps[currentStepIndex];
    const stepEnd = step.maneuver.location;
    const dist = distanceBetweenCoords(coords, stepEnd);

    if (dist < 30) {
      if (currentStepIndex === steps.length - 1) {
        Alert.alert('Arrived', 'You have reached your destination!');
        stopNavigation();
      } else {
        setCurrentStepIndex((prev) => prev + 1);
      }
    }
  };

  const distanceBetweenCoords = ([lon1, lat1], [lon2, lat2]) => {
    const R = 6371000;
    const toRad = (val) => (val * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // ====== SEARCH & ROUTE ======
  const handleSearch = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter a destination address.');
      return;
    }
    try {
      const coords = await fetchCoordsForAddress(address);
      if (coords) {
        setDestination(coords);
        await calculateRoute(coords);
        cameraRef.current?.flyTo(coords, 1200);
      } else {
        Alert.alert('Not Found', 'Address not found.');
      }
    } catch (err) {
      console.warn('handleSearch error:', err);
      Alert.alert('Error', 'Failed to search address.');
    }
  };

  const calculateRoute = async (destCoords) => {
    if (!userLocation) {
      Alert.alert('Location Missing', 'We do not have your live location yet.');
      return;
    }
    try {
      const [userLon, userLat] = userLocation;
      const [destLon, destLat] = destCoords;

      const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLon},${userLat};${destLon},${destLat}?geometries=geojson&steps=true&access_token=sk.eyJ1IjoiYXlhbnNoc2luZ2giLCJhIjoiY201MDN2MDEwMWpzdDJxcHAyMHZ4aGtwOSJ9.D8WgPNxITq3D4a1-AiTpVA`;
      const resp = await axios.get(directionsUrl);

      if (resp.data.routes?.length) {
        const routeObj = resp.data.routes[0];
        const { geometry, distance, duration, legs } = routeObj;

        setSteps(legs?.[0]?.steps || []);
        setCurrentStepIndex(0);

        const totalMin = Math.ceil(duration / 60);
        const hours = Math.floor(totalMin / 60);
        const minutes = totalMin % 60;
        const etaStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}min`;

        setRoute({
          coordinates: geometry.coordinates,
          distance: (distance / 1609.34).toFixed(2),
          duration: totalMin,
        });
        setTripDetails({ eta: etaStr, distance: (distance / 1609.34).toFixed(2) });

        // Fit route to map bounds.
        cameraRef.current?.fitBounds(
          geometry.coordinates[0],
          geometry.coordinates[geometry.coordinates.length - 1],
          50
        );
      } else {
        Alert.alert('No Route', 'No driving route found.');
      }
    } catch (err) {
      console.warn('calculateRoute error:', err);
      Alert.alert('Error', 'Could not calculate route.');
    }
  };

  const startNavigation = () => {
    if (!route || !steps.length) {
      Alert.alert('No Route', 'Please search for a route first!');
      return;
    }
    setNavigationMode(true);
  };

  const stopNavigation = () => {
    setNavigationMode(false);
    setCurrentStepIndex(0);
    setSteps([]);
    setRoute(null);
    setTripDetails(null);
    setDestination(null);
  };

  // ====== Volunteer Markers ======
  const renderVolunteerMarkers = () =>
    volunteerSites.map((site) =>
      site.coords ? (
        <MapboxGL.PointAnnotation
          key={site.id}
          id={`volunteer-${site.id}`}
          coordinate={site.coords}
          onSelected={() =>
            Alert.alert('Volunteer Site', `${site.name}\n${site.address}`)
          }
        >
          <View style={styles.blackMarker}>
            <Ionicons name="location" size={26} color="black" />
          </View>
        </MapboxGL.PointAnnotation>
      ) : null
    );

  // ====== Custom User Location Dot ======
  const renderUserLocationDot = () => {
    if (!userLocation) return null;
    return (
      <MapboxGL.PointAnnotation id="userLocationDot" coordinate={userLocation}>
        <View style={styles.blueDot} />
      </MapboxGL.PointAnnotation>
    );
  };

  // ====== Conditional Render ======
  // Until a live location is obtained (and if permission hasn't failed), render a loading view.
  if (!userLocation && !geoLocationFailed) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Requesting live location access...</Text>
      </SafeAreaView>
    );
  }

  // ====== Render ======
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter address"
          placeholderTextColor="black"
          value={address}
          onChangeText={setAddress}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Map with 3D terrain and buildings */}
      <MapboxGL.MapView style={styles.map} styleURL={MapboxGL.StyleURL.Street}>
        <MapboxGL.Camera ref={cameraRef} />
        <MapboxGL.UserLocation visible={true} />

        {/* 3D Terrain */}
        <MapboxGL.RasterDemSource id="mapbox-dem" url="mapbox://mapbox.mapbox-terrain-dem-v1" tileSize={512}>
          <MapboxGL.Terrain sourceID="mapbox-dem" style={{ exaggeration: 1.5 }} />
        </MapboxGL.RasterDemSource>

        {/* 3D Buildings */}
        <MapboxGL.FillExtrusionLayer
          id="3d-buildings"
          sourceID="composite"
          sourceLayerID="building"
          filter={['==', 'extrude', 'true']}
          style={{
            fillExtrusionColor: '#f5f5f5',
            fillExtrusionHeight: ['get', 'height'],
            fillExtrusionBase: ['get', 'min_height'],
            fillExtrusionOpacity: 0.8,
          }}
        />

        {/* Render Volunteer Markers */}
        {renderVolunteerMarkers()}

        {/* Render Custom User Location Dot */}
        {renderUserLocationDot()}

        {/* Destination marker (red) */}
        {destination && (
          <MapboxGL.PointAnnotation id="destination" coordinate={destination}>
            <View style={styles.redMarker}>
              <Ionicons name="pin" size={30} color="#FF0000" />
            </View>
          </MapboxGL.PointAnnotation>
        )}

        {/* Route Line */}
        {route && (
          <MapboxGL.ShapeSource
            id="routeSource"
            shape={{
              type: 'Feature',
              geometry: { type: 'LineString', coordinates: route.coordinates },
            }}
          >
            <MapboxGL.LineLayer
              id="routeLayer"
              style={{
                lineColor: '#4285F4',
                lineWidth: 6,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </MapboxGL.ShapeSource>
        )}
      </MapboxGL.MapView>

      {/* Bottom Route Details (if available and not in navigation mode) */}
      {tripDetails && !navigationMode && (
        <View style={styles.routeDetailsContainer}>
          <Text style={styles.routeHeader}>Route Details</Text>
          <Text style={styles.routeText}>ETA: {tripDetails.eta}</Text>
          <Text style={styles.routeText}>Distance: {tripDetails.distance} mi</Text>
          <TouchableOpacity style={styles.startNavBtn} onPress={startNavigation}>
            <Text style={styles.startNavBtnText}>Start Navigation</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating “Locate Me” Button */}
      <TouchableOpacity
        style={styles.locateButton}
        onPress={() => {
          if (!userLocation) {
            Alert.alert('No Location', 'User location is not available yet.');
            return;
          }
          cameraRef.current?.flyTo(userLocation, 1200);
        }}
      >
        <Ionicons name="locate" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
  },
  // Search bar (at the top) with cream background and rounded bottom corners
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff6e7',
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#fff6e7',
    color: '#333',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  searchButton: {
    marginLeft: 10,
    padding: 10,
  },
  // Marker Styles
  blackMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  redMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  blueDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: 'white',
  },
  // Route details container
  routeDetailsContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: '#fff6e7',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: 'black',
    zIndex: 10,
  },
  routeHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  routeText: {
    fontSize: 16,
    color: '#333',
  },
  startNavBtn: {
    marginTop: 12,
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  startNavBtnText: {
    color: '#fff6e7',
    fontWeight: '600',
    fontSize: 16,
  },
  // Floating “Locate Me” Button
  locateButton: {
    position: 'absolute',
    bottom: 700,
    right: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  // Instructions bar (if navigation mode active)
  instructionsBar: {
    position: 'absolute',
    top: 670,
    left: 0,
    right: 0,
    backgroundColor: '#fff6e7',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    padding: 12,
    zIndex: 20,
    alignItems: 'center',
    borderRadius: 20,
  },
  instrDistance: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  instrText: {
    fontSize: 16,
    color: '#000',
  },
  endNavButton: {
    marginLeft: 10,
  },
});
