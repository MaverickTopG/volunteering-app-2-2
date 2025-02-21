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
  Modal,
  Dimensions,
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';

MapboxGL.setAccessToken(
  'sk.eyJ1IjoiYXlhbnNoc2luZ2giLCJhIjoiY201MDN2MDEwMWpzdDJxcHAyMHZ4aGtwOSJ9.D8WgPNxITq3D4a1-AiTpVA'
);

// Define baseline dimensions (iPhone 16 Pro Max as an example)
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const { width, height } = Dimensions.get('window');

const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

// In-memory cache for geocoding results
const geocodeCache = {};

// Helper: Geocode an address using Nominatim (using the hardcoded address)
const fetchCoordsForAddress = async (addr) => {
  if (!addr || addr.trim().toLowerCase() === 'not specified') {
    return null;
  }
  if (geocodeCache[addr]) {
    return geocodeCache[addr];
  }
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      addr
    )}&format=json&limit=1`;
    const resp = await axios.get(url);
    if (resp.data.length > 0) {
      const { lat, lon } = resp.data[0];
      const coords = [parseFloat(lon), parseFloat(lat)];
      geocodeCache[addr] = coords;
      return coords;
    }
    return null;
  } catch (err) {
    console.warn('fetchCoordsForAddress error:', err);
    return null;
  }
};

// Volunteer sites data (nested array)
const VOLUNTEER_SITES = [
  {
    id: "1",
    name: "WILDCARE",
    address: "220 S Garrard Blvd, Point Richmond, CA 94801",
  },
  {
    id: "2",
    name: "Hooves for Harmony",
    address: "Morning Star Farm, Novato, CA 94948",
  },
  {
    id: "3",
    name: "Giants Steps Therapeutic Equestrian Center",
    address: "7600 Lakeville Highway, Sonoma Horse Park, Petaluma, CA 94954",
  },
  {
    id: "4",
    name: "Halleck Creek Ranch",
    address: "1740 Old Rancheria Road, Nicasio, CA 94946",
  },
  {
    id: "5",
    name: "Marine Mammal Center",
    address: "2000 Bunker Road, Fort Cronkhite, Sausalito, CA 94965-2619",
  },
  {
    id: "6",
    name: "Milo Foundation",
    address: "220 S Garrard Blvd, Point Richmond, CA 94801",
  },
  {
    id: "7",
    name: "Save A Bunny",
    address: "Not Specified",
  },
  {
    id: "8",
    name: "The Little Red Dog",
    address: "23046 Avenida de la Carlota Suite 600, Laguna Hills, CA 92653",
  },
  {
    id: "9",
    name: "Hanaeleh Horse Rescue",
    address: "Trabuco Canyon, Orange County, California",
  },
  {
    id: "10",
    name: "Marin County Parks & Landscape",
    address: "3501 Civic Center Drive, Suite 260, San Rafael, CA 94903",
  },
  {
    id: "11",
    name: "Mill Valley Public Works",
    address: "26 Corte Madera Avenue, Mill Valley, CA 94941",
  },
  {
    id: "12",
    name: "Slide Ranch",
    address: "2025 Shoreline Highway, Muir Beach, CA 94965",
  },
  {
    id: "13",
    name: "Audubon Center",
    address: "376 Greenwood Beach Road, Tiburon, CA 94920",
  },
  {
    id: "14",
    name: "Golden Gate National Parks Conservancy",
    address: "Building 201, Fort Mason, San Francisco, CA 94123",
  },
  {
    id: "15",
    name: "Habitat for Humanity - Park/Community Beautification",
    address: "300 Montgomery Street, Suite 450, San Francisco, CA 94104",
  },
  {
    id: "16",
    name: "Marin County Open Space",
    address: "3501 Civic Center Drive, Suite 260, San Rafael, CA 94903",
  },
  {
    id: "17",
    name: "Marin Agricultural Land Trust",
    address: "P.O. Box 850, Point Reyes Station, CA 94956",
  },
  {
    id: "18",
    name: "Marin Headlands Native Plants Nursery",
    address: "1301 Kirkpatrick Street, Fort Cronkite, Sausalito, CA 94965",
  },
  {
    id: "19",
    name: "Muir Woods",
    address: "1 Muir Woods Road, Mill Valley, CA 94941",
  },
  {
    id: "20",
    name: "Mt. Tam Watershed",
    address: "220 Nellen Avenue, Corte Madera, CA 94925",
  },
  {
    id: "21",
    name: "Grateful Gatherings Marin",
    address: "1940 Broadway, Suite 101, Oakland, CA 94612",
  },
  {
    id: "22",
    name: "Bridge the Gap College Prep",
    address: "2330 Marinship Way, Suite 302, Sausalito, CA 949655",
  },
  {
    id: "23",
    name: "Canal Alliance",
    address: "91 Larkspur Street, San Rafael, CA 94901",
  },
  {
    id: "24",
    name: "Community Action Marin",
    address: "555 Northgate Drive, Suite 201, San Rafael, CA 94903",
  },
  {
    id: "25",
    name: "Habitat for Humanity Greater San Francisco",
    address: "300 Montgomery Street, Suite 450, San Francisco, CA 94104",
  },
  {
    id: "26",
    name: "Jewish Family and Children's Services",
    address: "600 Fifth Avenue, San Rafael, CA 94901",
  },
  {
    id: "27",
    name: "Mill Valley Gate",
    address: "Address not available",
  },
  {
    id: "28",
    name: "Marin YMCA",
    address: "1500 Los Gamos Drive, San Rafael, CA 94903",
  },
  {
    id: "29",
    name: "Aegis Living Corte Madera",
    address: "5555 Paradise Drive, Corte Madera, CA 94925",
  },
  {
    id: "30",
    name: "Alzheimer's Association of Marin",
    address: "4340 Redwood Highway, Suite D314, San Rafael, CA 94903",
  },
  {
    id: "31",
    name: "LITA (Love is the Answer) of Marin",
    address: "4340 Redwood Highway, Suite E-352, San Rafael, CA 94903",
  },
  {
    id: "32",
    name: "The Redwoods, A Community of Seniors",
    address: "40 Camino Alto, Mill Valley, CA 94941",
  },
  {
    id: "33",
    name: "RAD Camp",
    address: "199 Technology Dr, Suite 100, Irvine, CA 92618",
  },
  {
    id: "34",
    name: "By the Bay Health",
    address: "17 East Sir Francis Drake Boulevard, Larkspur, CA 94939",
  },
  {
    id: "35",
    name: "MarinHealth Medical Center",
    address: "250 Bon Air Road, Greenbrae, CA 94904",
  },
  {
    id: "36",
    name: "Mission Hospital",
    address: "27700 Medical Center Rd, Mission Viejo, CA 92691",
  },
  {
    id: "37",
    name: "American Cancer Society",
    address: "1451 Guerneville Rd, Suite 220, Santa Rosa, CA 95403",
  },
  {
    id: "38",
    name: "Larkspur Library",
    address: "400 Magnolia Ave, Larkspur, CA 94939",
  },
  {
    id: "39",
    name: "The Book Exchange",
    address: "Not specified",
  },
  {
    id: "40",
    name: "Belvedere Tiburon Library",
    address: "780 Tiburon Blvd, Tiburon, CA 94920",
  },
  {
    id: "41",
    name: "Corte Madera Library",
    address: "20 Corte Madera Blvd, Corte Madera, CA 94920",
  },
  {
    id: "42",
    name: "Marin City/Sausalito Library",
    address: "200 Sausalito Blvd, Sausalito, CA 94965",
  },
  {
    id: "43",
    name: "Marin County Public Library",
    address: "250 Civic Center Dr, San Rafael, CA 94901",
  }
];

const MapScreen = () => {
  // ====== State ======
  const [address, setAddress] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [geoLocationFailed, setGeoLocationFailed] = useState(false);
  const [isHomeModalVisible, setIsHomeModalVisible] = useState(false);
  const [homeAddress, setHomeAddress] = useState('');
  const [homeLocation, setHomeLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [route, setRoute] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [navigationMode, setNavigationMode] = useState(false);

  // Volunteer sites with coordinates will be updated incrementally
  const [volunteerSitesWithCoords, setVolunteerSitesWithCoords] = useState([]);

  // Animations & Refs
  const instructionAnim = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef(null);
  const watchId = useRef(null);

  // ====== Effects ======
  // Request geolocation and fetch initial user location
  useEffect(() => {
    Geolocation.requestAuthorization('whenInUse').then((status) => {
      if (status === 'granted') {
        getCurrentLocation();
      } else {
        setGeoLocationFailed(true);
      }
    });
  }, []);

  // Geocode volunteer sites sequentially (using the hardcoded address)
  useEffect(() => {
    async function geocodeVolunteerSites() {
      const sitesArray = VOLUNTEER_SITES.flat();
      // Process each site one at a time
      for (let i = 0; i < sitesArray.length; i++) {
        const site = sitesArray[i];
        const coords = await fetchCoordsForAddress(site.address);
        // Update the state incrementally so markers appear as soon as they are fetched
        setVolunteerSitesWithCoords((prev) => [...prev, { ...site, coords }]);
        // Delay to reduce risk of hitting the rate limit (adjust delay if needed)
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
    geocodeVolunteerSites();
  }, []);

  useEffect(() => {
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
        setHomeLocation(coords);
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
      { enableHighAccuracy: true, distanceFilter: scale(5) }
    );
  };

  const stopLocationWatch = () => {
    if (watchId.current) {
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  };

  // ====== Fallback Home Location ======
  const handleSubmitHomeAddress = async () => {
    if (!homeAddress.trim()) {
      Alert.alert('Error', 'Please enter your home address.');
      return;
    }
    try {
      stopLocationWatch();
      const coords = await fetchCoordsForAddress(homeAddress);
      if (coords) {
        setHomeLocation(coords);
        setUserLocation(coords);
        setIsHomeModalVisible(false);
        setGeoLocationFailed(false);
        cameraRef.current?.setCamera({
          centerCoordinate: coords,
          zoomLevel: 14,
          animationDuration: 1000,
        });
        Alert.alert('Success', 'Home location has been set/updated.');
      } else {
        Alert.alert('Error', 'Address not found.');
      }
    } catch (err) {
      console.warn('Error setting home location:', err);
      Alert.alert('Error', 'Failed to set location.');
    }
  };

  // ====== NAVIGATION STEPS ======
  const handleUserProgress = (coords) => {
    setUserLocation(coords);
    if (!steps.length || currentStepIndex >= steps.length) return;
    const step = steps[currentStepIndex];
    const stepEnd = step.maneuver.location; // [lon, lat]
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
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
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
      Alert.alert('Location Missing', 'We do not have your location yet.');
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
        setTripDetails({
          eta: etaStr,
          distance: (distance / 1609.34).toFixed(2),
        });
        cameraRef.current?.fitBounds(
          geometry.coordinates[0],
          geometry.coordinates[geometry.coordinates.length - 1],
          scale(50)
        );
      } else {
        console.warn('No driving route found.');
        return;
      }
    } catch (err) {
      console.warn('calculateRoute error:', err);
      Alert.alert('Error', 'Could not calculate route.');
    }
  };

  const startNavigation = () => {
    if (!route || !steps.length) {
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
    volunteerSitesWithCoords.map((site) => {
      if (!site.coords) return null;
      return (
        <MapboxGL.PointAnnotation
          key={site.id}
          id={`volunteer-${site.id}`}
          coordinate={site.coords}
          onSelected={() => {
            Alert.alert(
              'Volunteer Site',
              `${site.name}\n${site.address}`,
              [
                {
                  text: 'Show Directions',
                  onPress: async () => {
                    if (site.coords) {
                      setDestination(site.coords);
                      await calculateRoute(site.coords);
                      startNavigation();
                    } else {
                      Alert.alert('Error', 'Coordinates not available for this site.');
                    }
                  },
                },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }}
        >
          <View style={styles.blackMarker}>
            <Ionicons name="location" size={scale(26)} color="black" />
          </View>
        </MapboxGL.PointAnnotation>
      );
    });

  // ====== Instructions Bar ======
  const renderInstructionsBar = () => {
    if (!steps.length || currentStepIndex >= steps.length) return null;
    const step = steps[currentStepIndex];
    const distanceM = step.distance;
    const distanceLabel =
      distanceM < 1000
        ? `${Math.round(distanceM)} m`
        : `${(distanceM / 1000).toFixed(1)} km`;
    const instruction = step.maneuver.instruction || '';
    const translateY = instructionAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [verticalScale(-100), 0],
    });
    return (
      <Animated.View
        style={[styles.instructionsBar, { transform: [{ translateY }] }]}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.instrDistance}>{distanceLabel}</Text>
          <Text style={styles.instrText}>{instruction}</Text>
        </View>
        <TouchableOpacity style={styles.endNavButton} onPress={stopNavigation}>
          <Ionicons name="close" size={scale(24)} color="#000" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // ====== HOME BUTTON ======
  const handleHomePress = () => {
    if (homeLocation) {
      Alert.alert('Home Location', 'Do you want to update your home location?', [
        { text: 'Yes', onPress: () => setIsHomeModalVisible(true) },
        {
          text: 'No',
          onPress: () => cameraRef.current?.flyTo(homeLocation, 1200),
          style: 'cancel',
        },
      ]);
    } else {
      setIsHomeModalVisible(true);
    }
  };

  // ====== Custom Blue Dot ======
  const renderUserLocationDot = () => {
    if (!userLocation) return null;
    return (
      <MapboxGL.PointAnnotation id="userLocationDot" coordinate={userLocation}>
        <View style={styles.blueDot} />
      </MapboxGL.PointAnnotation>
    );
  };

  // ====== RENDER ======
  return (
    <SafeAreaView style={styles.container}>
      {navigationMode && renderInstructionsBar()}

      {/* Top Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter address"
          placeholderTextColor="black"
          value={address}
          onChangeText={setAddress}
          keyboardAppearance="dark"
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Ionicons name="search" size={scale(24)} color="black" />
        </TouchableOpacity>
      </View>

      {/* Map with 3D terrain + custom user dot */}
      <MapboxGL.MapView
        style={styles.map}
        onRegionDidChange={(e) => {
          if (e.properties && e.properties.pitch > 50) {
            const { pitch, zoom, centerCoordinate } = e.properties;
            cameraRef.current?.setCamera({
              centerCoordinate: centerCoordinate,
              zoomLevel: zoom,
              pitch: 50,
              animationDuration: 300,
            });
          }
        }}
      >
        <MapboxGL.Camera ref={cameraRef} />

        {/* 3D Terrain */}
        <MapboxGL.RasterDemSource
          id="mapbox-dem"
          url="mapbox://mapbox.mapbox-terrain-dem-v1"
          tileSize={scale(512)}
        >
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
            fillExtrusionOpacity: 0.6,
          }}
        />

        {renderVolunteerMarkers()}
        {renderUserLocationDot()}

        {/* Destination marker */}
        {destination && (
          <MapboxGL.PointAnnotation id="destination" coordinate={destination}>
            <View style={styles.redMarker}>
              <Ionicons name="pin" size={scale(30)} color="#FF0000" />
            </View>
          </MapboxGL.PointAnnotation>
        )}

        {/* Route line */}
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
                lineWidth: scale(6),
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </MapboxGL.ShapeSource>
        )}
      </MapboxGL.MapView>

      {/* Bottom route details */}
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

      {/* Floating “Locate Me” button */}
      <TouchableOpacity
        style={styles.locateButton}
        onPress={() => {
          const loc = homeLocation || userLocation;
          if (!loc) {
            Alert.alert('No Location', 'User location is not available yet.');
            return;
          }
          cameraRef.current?.flyTo(loc, 1200);
        }}
      >
        <Ionicons name="locate" size={scale(24)} color="#fff" />
      </TouchableOpacity>

      {/* Always-visible Home button */}
      <TouchableOpacity style={styles.homeButton} onPress={handleHomePress}>
        <Ionicons name="home" size={scale(24)} color="#fff" />
      </TouchableOpacity>

      {/* “Set Location” button if geolocation fails */}
      {geoLocationFailed && (
        <TouchableOpacity
          style={styles.setLocationButton}
          onPress={() => setIsHomeModalVisible(true)}
        >
          <Text style={styles.setLocationText}>Set Location</Text>
        </TouchableOpacity>
      )}

      {/* “Set Current Address” Modal */}
      <Modal
        transparent
        visible={isHomeModalVisible}
        animationType="slide"
        onRequestClose={() => setIsHomeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => setIsHomeModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={scale(24)} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Set Your Current Address</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter your home address"
              placeholderTextColor="#777"
              value={homeAddress}
              onChangeText={setHomeAddress}
              keyboardAppearance="dark"
            />
            <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSubmitHomeAddress}>
              <Text style={styles.modalSaveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1,
    bottom:verticalScale(-16) },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff6e7',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(20),
    borderBottomLeftRadius: scale(30),
    borderBottomRightRadius: scale(30),
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  searchInput: {
    flex: 1,
    height: verticalScale(50),
    backgroundColor: '#fff6e7',
    color: '#333',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: scale(25),
    paddingHorizontal: scale(20),
    fontSize: scale(16),
  },
  searchButton: {
    marginLeft: scale(10),
    padding: scale(10),
  },
  blackMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  redMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  blueDot: {
    width: scale(18),
    height: scale(18),
    borderRadius: scale(9),
    backgroundColor: '#007AFF',
    borderWidth: scale(2),
    borderColor: 'white',
  },
  routeDetailsContainer: {
    position: 'absolute',
    bottom: verticalScale(120),
    left: scale(20),
    right: scale(80),
    backgroundColor: '#fff6e7',
    borderRadius: scale(8),
    padding: scale(16),
    borderWidth: 1,
    borderColor: 'black',
    zIndex: 10,
  },
  routeHeader: {
    fontSize: scale(18),
    fontWeight: '700',
    color: '#333',
    marginBottom: verticalScale(8),
  },
  routeText: {
    fontSize: scale(16),
    color: '#333',
  },
  startNavBtn: {
    marginTop: verticalScale(12),
    backgroundColor: '#333',
    borderRadius: scale(8),
    paddingVertical: verticalScale(10),
    alignItems: 'center',
  },
  startNavBtnText: {
    color: '#fff6e7',
    fontWeight: '600',
    fontSize: scale(16),
  },
  locateButton: {
    position: 'absolute',
    bottom: verticalScale(80),
    right: scale(10),
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  homeButton: {
    position: 'absolute',
    bottom: verticalScale(140),
    right: scale(10),
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  setLocationButton: {
    position: 'absolute',
    bottom: verticalScale(440),
    right: 0,
    backgroundColor: 'black',
    borderRadius: scale(8),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    zIndex: 1000,
  },
  setLocationText: {
    color: '#fff6e7',
    fontWeight: '600',
    fontSize: scale(14),
  },
  instructionsBar: {
    position: 'absolute',
    top: verticalScale(640),
    left: scale(10),
    right: scale(70),
    backgroundColor: '#fff6e7',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    padding: scale(12),
    zIndex: 20,
    alignItems: 'center',
    borderRadius: scale(20),
  },
  instrDistance: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#000',
  },
  instrText: {
    fontSize: scale(16),
    color: '#000',
  },
  endNavButton: {
    marginLeft: scale(10),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff6e7',
    borderRadius: scale(12),
    padding: scale(20),
    borderWidth: 1,
    borderColor: 'black',
  },
  closeButton: {
    position: 'absolute',
    top: scale(10),
    right: scale(10),
  },
  modalTitle: {
    fontSize: scale(18),
    fontWeight: '700',
    color: '#333',
    marginBottom: verticalScale(15),
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    height: verticalScale(45),
    backgroundColor: '#fff6e7',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: scale(10),
    paddingHorizontal: scale(15),
    marginBottom: verticalScale(20),
    fontSize: scale(16),
    color: '#333',
  },
  modalSaveBtn: {
    backgroundColor: 'black',
    borderRadius: scale(8),
    paddingVertical: verticalScale(10),
    bottom: 0,
    alignItems: 'center',
  },
  modalSaveBtnText: {
    color: '#fff6e7',
    fontSize: scale(16),
    fontWeight: '600',
  },
});
