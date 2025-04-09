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
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 100;

// Mapping of category names to activity codes (update values if needed)
const categoryFilterMapping = {
  Animal: "&ac=79",
  // other categories...
};

// For this version, we always want to display all opportunities
const reference = 'All';

// Build the API URL without a category filter when reference is "All"
const buildApiUrl = (lat, lon, page) => {
  let categoryFilter = "";
  // If reference were anything but 'All', it would add a filter.
  // Since reference is hard-coded as 'All', categoryFilter stays empty.
  return `https://www.volunteerconnector.org/api/search/?cc=64&format=json&latitude=${lat}&longitude=${lon}&radius=50&page=${page}${categoryFilter}`;
};

const LiveOps = () => {
  const navigation = useNavigation();
  
  const [opportunities, setOpportunities] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [locationCoords, setLocationCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchOpportunities = async (page = 1, lat, lon, append = false) => {
    try {
      const url = buildApiUrl(lat, lon, page);
      console.log("Fetching opportunities from:", url);
      const response = await fetch(url);
      const data = await response.json();
      console.log("Fetched data:", data);
      if (append) {
        setOpportunities((prev) => [...prev, ...(data.results || [])]);
      } else {
        setOpportunities(data.results || []);
      }
      setNextUrl(data.next);
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

  const openOpportunityURL = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open the URL.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while trying to open the URL.");
    }
  };

  const handleWebsitePress = (item) => {
    const url = item.organization && item.organization.url ? item.organization.url : item.url;
    openOpportunityURL(url);
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
        <Text style={styles.headerText}>
          Live Opportunities - All
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* List of Opportunities from API */}
        {opportunities.length > 0 ? (
          opportunities.map((item, index) => (
            <View key={index} style={styles.cardWrapper}>
              <LinearGradient
                colors={['#fff0d4', '#ffe8c9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.card}
              >
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.dates && <Text style={styles.cardDates}>{item.dates}</Text>}
                {item.organization && item.organization.name && (
                  <Text style={styles.cardOrg}>Org: {item.organization.name}</Text>
                )}
                {item.description && (
                  <Text style={styles.cardDescription} numberOfLines={3}>
                    {item.description}
                  </Text>
                )}
                {item.remote_or_online !== undefined && (
                  <Text style={styles.cardInfo}>
                    {item.remote_or_online ? "Remote/Online" : "In-Person"}
                  </Text>
                )}
                <TouchableOpacity style={styles.websiteButton} onPress={() => handleWebsitePress(item)}>
                  <Text style={styles.websiteButtonText}>Website</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No opportunities found for All.</Text>
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

export default LiveOps;

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
  cardWrapper: {
    marginVertical: 10,
    alignSelf: 'center',
    width: width * 0.9,
  },
  card: {
    borderRadius: 15,
    padding: 15,
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: RFPercentage(2.2),
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardDates: {
    fontSize: RFPercentage(1.8),
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  cardOrg: {
    fontSize: RFPercentage(1.8),
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: RFPercentage(1.8),
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  cardInfo: {
    fontSize: RFPercentage(1.8),
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  websiteButton: {
    backgroundColor: '#fff6e7',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: 'center',
    marginTop: 5,
  },
  websiteButtonText: {
    fontSize: RFPercentage(1.8),
    color: '#333',
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
  liveButton: {
    marginBottom: 20,
    alignSelf: 'center',
    width: '90%',
  },
  liveButtonGradient: {
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveButtonText: {
    fontSize: RFPercentage(2.2),
    color: '#333',
  },
});
