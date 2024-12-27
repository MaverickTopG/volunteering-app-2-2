import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Alert,
  Modal,
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

MapboxGL.setAccessToken('sk.eyJ1IjoiYXlhbnNoc2luZ2giLCJhIjoiY201MDN2MDEwMWpzdDJxcHAyMHZ4aGtwOSJ9.D8WgPNxITq3D4a1-AiTpVA');

const INITIAL_HOME_ADDRESS = 'San Francisco'; // Default home address
const SAN_FRANCISCO_BOUNDS = [
  [-123.173825, 37.639830], // Southwest corner
  [-122.281780, 37.929824], // Northeast corner
];


const MapScreen = () => {
  const [address, setAddress] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [isHomeModalVisible, setIsHomeModalVisible] = useState(true);
  const [homeLocation, setHomeLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    // Set initial view to San Francisco
    if (cameraRef.current) {
      cameraRef.current.fitBounds(
        SAN_FRANCISCO_BOUNDS[0], // Southwest corner
        SAN_FRANCISCO_BOUNDS[1], // Northeast corner
        50 // Padding in pixels to give some margin
      );
    }
    fetchCoordinatesForHomeLocation(INITIAL_HOME_ADDRESS);
  }, []);


  const handleSearch = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter an address to search.');
      return;
    }

    fetchCoordinatesAndCalculateRoute(address);
  };

  const fetchCoordinatesAndCalculateRoute = async (addressToSearch) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          addressToSearch
        )}&format=json&limit=1`
      );

      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        const destinationCoords = [parseFloat(lon), parseFloat(lat)];
        setDestination(destinationCoords);
        calculateRoute(destinationCoords);
      } else {
        Alert.alert('Error', 'Address not found.');
      }
    } catch (error) {
      console.error('Error fetching address coordinates:', error);
      Alert.alert('Error', 'Failed to fetch address coordinates.');
    }
  };

  const fetchCoordinatesForHomeLocation = async (addressToSet = homeAddress) => {
    if (!addressToSet.trim()) {
      Alert.alert('Error', 'Please enter your home address.');
      return;
    }

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          addressToSet
        )}&format=json&limit=1`
      );

      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        const coords = [parseFloat(lon), parseFloat(lat)];
        setHomeLocation(coords);
        setUserLocation(coords);

        if (cameraRef.current) {
          cameraRef.current.setCamera({
            centerCoordinate: coords,
            zoomLevel: 10,
            animationDuration: 1000,
          });
        }

        if (addressToSet !== INITIAL_HOME_ADDRESS) {
          setIsHomeModalVisible(false);
          Alert.alert('Success', 'Home location has been set.');
        }
      } else {
        Alert.alert('Error', 'Address not found.');
      }
    } catch (error) {
      console.error('Error fetching coordinates for home location:', error);
      Alert.alert('Error', 'Failed to set home location.');
    }
  };

  const calculateRoute = async (destinationCoords) => {
    if (!userLocation) {
      Alert.alert(
        'Error',
        'Unable to calculate route. Ensure location services are enabled or manually set your location.'
      );
      return;
    }

    const [userLon, userLat] = userLocation;
    const [destLon, destLat] = destinationCoords;

    try {
      const response = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${userLon},${userLat};${destLon},${destLat}?geometries=geojson&access_token=sk.eyJ1IjoiYXlhbnNoc2luZ2giLCJhIjoiY201MDN2MDEwMWpzdDJxcHAyMHZ4aGtwOSJ9.D8WgPNxITq3D4a1-AiTpVA`
      );

      if (response.data.routes.length > 0) {
        const { geometry, duration, distance } = response.data.routes[0];
        // Convert duration to hours and minutes
        const totalMinutes = Math.ceil(duration / 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const eta = hours > 0 ? `${hours} hours ${minutes} min` : `${minutes} min`;

        setRoute({
          coordinates: geometry.coordinates,
          duration: Math.ceil(duration / 60),
          distance: (distance / 1609.34).toFixed(2),
        });
        setTripDetails({
          eta: eta, // Show ETA in hours and minutes
          distance: (distance / 1609.34).toFixed(2),
        });

        // Auto-zoom to fit the route
        if (cameraRef.current) {
          cameraRef.current.fitBounds(
            geometry.coordinates[0],
            geometry.coordinates[geometry.coordinates.length - 1],
            50 // Padding
          );
        }
      } else {
        Alert.alert('Error', 'No routes found.');
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
      Alert.alert('Error', 'Failed to calculate route.');
    }
  };

  return (
    <View style={styles.container}>
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

      <MapboxGL.MapView style={styles.map}>
        <MapboxGL.Camera ref={cameraRef} />

        {homeLocation && (
          <MapboxGL.PointAnnotation id="homeLocation" coordinate={homeLocation}>
            <View style={styles.blueMarker} />
          </MapboxGL.PointAnnotation>
        )}

        {destination && (
          <MapboxGL.PointAnnotation id="destination" coordinate={destination}>
            <View style={styles.redMarker} />
          </MapboxGL.PointAnnotation>
        )}

        {route && (
          <MapboxGL.ShapeSource
            id="routeSource"
            shape={{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: route.coordinates,
              },
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

      {tripDetails && (
        <View style={styles.tripDetailsContainer}>
          <Text style={styles.tripHeaderText}>Your Trip</Text>
          <Text style={styles.tripDetailText}>Time: {tripDetails.eta} </Text>
          <Text style={styles.tripDetailText}>Distance: {tripDetails.distance} miles</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={() => {
          if (userLocation && cameraRef.current) {
            cameraRef.current.setCamera({
              centerCoordinate: userLocation,
              zoomLevel: 15,
              animationDuration: 1000,
            });
          } else {
            Alert.alert('Error', 'User location not available.');
          }
        }}
        style={styles.cameraButton}
      >
        <Ionicons name="locate" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setIsHomeModalVisible(true)}
        style={styles.homeButton}
      >
        <Ionicons name="home" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        transparent
        visible={isHomeModalVisible}
        animationType="slide"
        onRequestClose={() => setIsHomeModalVisible(false)} // Close modal on back button press
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setIsHomeModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Set Current Address</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter your home address"
              value={homeAddress}
              onChangeText={setHomeAddress}
            />
            <TouchableOpacity
              onPress={() => fetchCoordinatesForHomeLocation(homeAddress)}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
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
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#fff6e7',
    color: '#333333',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  searchButton: {
    marginLeft: 10,
    padding: 10,
  },
  tripDetailsContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  tripHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tripDetailText: {
    fontSize: 16,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: 'black',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  homeButton: {
    position: 'absolute',
    bottom: 140,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: 'black',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  blueMarker: {
    width: 20,
    height: 20,
    backgroundColor: '#4285F4',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  redMarker: {
    width: 20,
    height: 20,
    backgroundColor: '#FF0000',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff6e7',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  modalInput: {
    width: '100%',
    height: 45,
    backgroundColor: '#fff6e7',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    color: '#333333',
  },
  modalButton: {
    backgroundColor: '#333333',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff6e7',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
    borderRadius: 20, // Circular button
    zIndex: 10,
  },

});

export default MapScreen;
