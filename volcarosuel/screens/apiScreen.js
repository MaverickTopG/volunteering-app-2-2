// VolunteerList.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 100;

// Build the API URL for opportunities (always "All")
const buildApiUrl = (lat, lon, page) => {
  return `https://www.volunteerconnector.org/api/search/?cc=64&format=json&latitude=${lat}&longitude=${lon}&radius=50&page=${page}`;
};

// Fetch opportunities from the remote API
const fetchOpportunitiesFromApi = async (page, lat, lon) => {
  const url = buildApiUrl(lat, lon, page);
  console.log("Fetching opportunities from API:", url);
  const response = await fetch(url);
  const data = await response.json();
  // Map each API item to ensure a website property is available.
  const apiResults = (data.results || []).map(item => ({
    ...item,
    website: item.website || item.url,
  }));
  return { results: apiResults, next: data.next };
};

// Simulated function to fetch opportunities from a database
const fetchOpportunitiesFromDb = async (page, lat, lon) => {
  // Simulate a delay and return static sample data
  return new Promise((resolve) => {
    setTimeout(() => {
      const sampleDbData = [
        {
          title: "Local Food Bank Volunteer",
          dates: "Every Saturday",
          organization: { name: "Local Food Bank" },
          description: "Help distribute food to the needy.",
          remote_or_online: false,
          website: "https://localfoodbank.org",
          location: "Downtown",
          date: "2023-08-01",
        },
        {
          title: "Community Clean-Up",
          dates: "1st Sunday of the month",
          organization: { name: "Community Services" },
          description: "Join the local cleanup to improve your community.",
          remote_or_online: true,
          website: "https://communitycleanup.org",
          location: "Uptown",
          date: "2023-08-05",
        }
      ];
      resolve(sampleDbData);
    }, 1000);
  });
};

const VolunteerList = () => {
  const navigation = useNavigation();
  const [opportunities, setOpportunities] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [locationCoords, setLocationCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchOpportunities = async (page = 1, lat, lon, append = false) => {
    try {
      // Fetch opportunities concurrently from API and DB.
      const [apiResponse, dbResponse] = await Promise.all([
        fetchOpportunitiesFromApi(page, lat, lon),
        fetchOpportunitiesFromDb(page, lat, lon),
      ]);
      // Merge API and DB results (order as received).
      const combined = [...apiResponse.results, ...dbResponse];
      if (append) {
        setOpportunities((prev) => [...prev, ...combined]);
      } else {
        setOpportunities(combined);
      }
      setNextUrl(apiResponse.next);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      Alert.alert("Error", "There was an error fetching opportunities.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Set up location updates
  useEffect(() => {
    let subscription;
    const startLocationUpdates = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Location permission was denied.");
        setLoading(false);
        return;
      }
      try {
        const loc = await Location.getCurrentPositionAsync({});
        console.log("Initial location:", loc.coords);
        setLocationCoords(loc.coords);
        fetchOpportunities(1, loc.coords.latitude, loc.coords.longitude);
        subscription = await Location.watchPositionAsync(
          {
            timeInterval: 60000,
            distanceInterval: 0,
          },
          (newLoc) => {
            console.log("Location updated:", newLoc.coords);
            setLocationCoords(newLoc.coords);
            // Optionally, refetch opportunities on location update.
            fetchOpportunities(1, newLoc.coords.latitude, newLoc.coords.longitude);
          }
        );
      } catch (error) {
        console.error("Location error:", error);
        Alert.alert("Error", "Failed to retrieve location.");
        setLoading(false);
      }
    };

    startLocationUpdates();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const handleLoadMore = () => {
    if (nextUrl && locationCoords) {
      setLoadingMore(true);
      fetchOpportunities(currentPage + 1, locationCoords.latitude, locationCoords.longitude, true);
    }
  };

  // When a button is pressed, navigate to VolunteerScreen with the full item data.
  const handleItemPress = (item) => {
    navigation.navigate('DisplayScreen', { item });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
        <Text style={styles.loadingText}>Loading opportunities...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: 20 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Volunteer List</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Render opportunities as buttons displaying only the title */}
        {opportunities.length > 0 ? (
          opportunities.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.button}
              onPress={() => handleItemPress(item)}
            >
              <LinearGradient
                colors={['#fff0d4', '#ffe8c9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>{item.title}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No opportunities found.</Text>
          </View>
        )}
        {nextUrl && (
          <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
            <LinearGradient
              colors={['#fff0d4', '#ffe8c9']}
              style={styles.loadMoreGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loadingMore ? (
                <ActivityIndicator size="small" color="#333" />
              ) : (
                <Text style={styles.loadMoreText}>Load More</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default VolunteerList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff6e7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: RFPercentage(2.2),
    color: '#333',
  },
  header: {
    height: HEADER_HEIGHT,
    backgroundColor: '#fff6e7',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  headerText: {
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    top: -7,
  },
  backButton: {
    position: 'absolute',
    left: 10,
    top: 30,
    padding: 10,
    zIndex: 100,
  },
  scrollViewContent: {
    paddingTop: HEADER_HEIGHT + 20,
    paddingBottom: 90,
    paddingHorizontal: 20,
  },
  button: {
    marginVertical: 10,
    alignSelf: 'center',
    width: width * 0.9,
  },
  buttonGradient: {
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: RFPercentage(2.2),
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: RFPercentage(2),
    color: '#333',
  },
  loadMoreButton: {
    marginVertical: 20,
    alignSelf: 'center',
    width: width * 0.9,
  },
  loadMoreGradient: {
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreText: {
    fontSize: RFPercentage(2),
    color: '#333',
    textAlign: 'center',
  },
});
