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

const MapScreen = () => {
  const [address, setAddress] = useState('');
  const [manualLocation, setManualLocation] = useState('');
  const [homeLocation, setHomeLocation] = useState(null);
  const [homeAddress, setHomeAddress] = useState(''); // For home address input
  const [isHomeModalVisible, setIsHomeModalVisible] = useState(false); // Modal state
  const [destination, setDestination] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (userLocation && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: userLocation,
        zoomLevel: 15,
        animationDuration: 1000,
      });
    }
  }, [userLocation]);

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

  const fetchCoordinatesForHomeLocation = async () => {
    if (!homeAddress.trim()) {
      Alert.alert('Error', 'Please enter your home address.');
      return;
    }

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          homeAddress
        )}&format=json&limit=1`
      );

      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        const coords = [parseFloat(lon), parseFloat(lat)];
        setHomeLocation(coords);
        setUserLocation(coords);

        // Center the camera on the home location
        if (cameraRef.current) {
          cameraRef.current.setCamera({
            centerCoordinate: coords,
            zoomLevel: 15,
            animationDuration: 1000,
          });
        }

        setIsHomeModalVisible(false); // Close the modal
        Alert.alert('Success', 'Home location has been set.');
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
        setRoute({
          coordinates: geometry.coordinates,
          duration: Math.ceil(duration / 60), // Convert to minutes
          distance: (distance / 1609.34).toFixed(2), // Convert to miles
        });
        setTripDetails({
          eta: Math.ceil(duration / 60), // Minutes
          distance: (distance / 1609.34).toFixed(2), // Miles
        });

        // Auto-zoom to encapsulate the entire route
        const routeBounds = geometry.coordinates.reduce(
          (bounds, coord) => {
            return [
              [
                Math.min(bounds[0][0], coord[0]),
                Math.min(bounds[0][1], coord[1]),
              ],
              [
                Math.max(bounds[1][0], coord[0]),
                Math.max(bounds[1][1], coord[1]),
              ],
            ];
          },
          [
            [Infinity, Infinity],
            [-Infinity, -Infinity],
          ]
        );

        cameraRef.current.setCamera({
          bounds: routeBounds,
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          animationDuration: 1000,
        });
      } else {
        Alert.alert('Error', 'No routes found.');
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
      Alert.alert('Error', 'Failed to calculate route. Check console for details.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
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

      {/* Map */}
      <MapboxGL.MapView style={styles.map} zoomEnabled>
        <MapboxGL.Camera ref={cameraRef} />

        <MapboxGL.UserLocation
          visible
          onUpdate={(location) =>
            setUserLocation([location.coords.longitude, location.coords.latitude])
          }
        />

        {destination && (
          <MapboxGL.PointAnnotation id="destination" coordinate={destination} />
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

      {/* Trip Details */}
      {tripDetails && (
        <View style={styles.tripDetailsContainer}>
          <Text style={styles.tripHeaderText}>Your Trip</Text>
          <Text style={styles.tripDetailText}>ETA: {tripDetails.eta} mins</Text>
          <Text style={styles.tripDetailText}>Distance: {tripDetails.distance} miles</Text>
        </View>
      )}

      {/* Camera Button */}
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

      {/* Home Button */}
      <TouchableOpacity
        onPress={() => setIsHomeModalVisible(true)}
        style={styles.homeButton}
      >
        <Ionicons name="home" size={24} color="white" />
      </TouchableOpacity>

      {/* Home Address Modal */}
      <Modal
        transparent
        visible={isHomeModalVisible}
        animationType="slide"
        onRequestClose={() => setIsHomeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Home Address</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter your home address"
              value={homeAddress}
              onChangeText={setHomeAddress}
            />
            <TouchableOpacity
              onPress={fetchCoordinatesForHomeLocation}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Set Home</Text>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
  },
  modalContent: {
    width: '85%', // Slightly wider for better usability
    backgroundColor: '#fff6e7', // Light cream color to match your app
    padding: 20,
    borderRadius: 15, // More rounded edges for a modern look
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Elevation for a subtle shadow
  },
  modalTitle: {
    fontSize: 20, // Slightly larger font for the title
    fontWeight: 'bold',
    color: '#333333', // Dark text for contrast
    marginBottom: 15, // More space between the title and input
  },
  modalInput: {
    width: '100%',
    height: 45, // Slightly taller for better usability
    backgroundColor: '#fff6e7', // White background for input
    borderColor: '#333333', // Subtle border for contrast
    borderWidth: 1,
    borderRadius: 10, // Rounded input field
    paddingHorizontal: 15,
    marginBottom: 20, // More space between input and button
    fontSize: 16, // Larger font for readability
    color: '#333333',
  },
  modalButton: {
    backgroundColor: '#333333', // Dark button to contrast with the background
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8, // Rounded button
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff6e7', // Light text to contrast with dark button
    fontSize: 16, // Slightly larger text
    fontWeight: 'bold', // Bold text for emphasis
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 10,
    backgroundColor: '#333333', 
    padding: 8,
    borderRadius: 20, 
  },

});

export default MapScreen;
