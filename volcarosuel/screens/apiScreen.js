// VolunteerList.js
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
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
  Animated,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../auth/AuthContext';
import { themePacks, seasonal } from '../screens/shop';

// --- API helpers omitted for brevity (same as before) ---
const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 100;

// Default fallback palette (bg, header‐start, header‐end, text/icon)
const DEFAULT_PALETTE = ['#FFF6E7', '#FFF0D4', '#FFE8C9', '#333333'];

export default function VolunteerList() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  // ---- theme wiring ----
  const [palette, setPalette] = useState(DEFAULT_PALETTE);
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      const key = `@shop/active-${user.uid}`;
      AsyncStorage.getItem(key)
        .then(id => {
          if (!id) {
            setPalette(DEFAULT_PALETTE);
            return;
          }
          const pack =
            themePacks.find(t => t.id === id) ||
            seasonal.find(s => s.id === id);
          if (pack?.colors) {
            const c = pack.colors;
            setPalette([
              c[0] ?? DEFAULT_PALETTE[0],
              c[1] ?? DEFAULT_PALETTE[1],
              c[2] ?? DEFAULT_PALETTE[2],
              c[3] ?? DEFAULT_PALETTE[3],
            ]);
          }
        })
        .catch(() => {
          setPalette(DEFAULT_PALETTE);
        });
    }, [user])
  );

  // ---- existing list state & fetching ----
  const [opportunities, setOpportunities] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [locationCoords, setLocationCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchOpportunities = async (page = 1, lat, lon, append = false) => {
    try {
      const [apiResponse, dbResponse] = await Promise.all([
        fetchOpportunitiesFromApi(page, lat, lon),
        fetchOpportunitiesFromDb(page, lat, lon),
      ]);
      const combined = [...apiResponse.results, ...dbResponse];
      setOpportunities(prev =>
        append ? [...prev, ...combined] : combined
      );
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

  useEffect(() => {
    let subscription;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Location permission was denied.");
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocationCoords(loc.coords);
      fetchOpportunities(1, loc.coords.latitude, loc.coords.longitude);
      subscription = await Location.watchPositionAsync(
        { timeInterval: 60000, distanceInterval: 0 },
        newLoc => {
          setLocationCoords(newLoc.coords);
          fetchOpportunities(
            1,
            newLoc.coords.latitude,
            newLoc.coords.longitude
          );
        }
      );
    })();
    return () => subscription && subscription.remove();
  }, []);

  const handleLoadMore = () => {
    if (nextUrl && locationCoords) {
      setLoadingMore(true);
      fetchOpportunities(
        currentPage + 1,
        locationCoords.latitude,
        locationCoords.longitude,
        true
      );
    }
  };

  const handleItemPress = item => {
    navigation.navigate('DisplayScreen', { item });
  };

  // ---- render ----
  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: palette[0] }]}>
        <ActivityIndicator size="large" color={palette[3]} />
        <Text style={[styles.loadingText, { color: palette[3] }]}>
          Loading opportunities...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette[0] }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: palette[0] }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={palette[3]} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: palette[3] }]}>
          Volunteer List
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {opportunities.length > 0 ? (
          opportunities.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.button}
              onPress={() => handleItemPress(item)}
            >
              <LinearGradient
                colors={[palette[1], palette[2]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={[styles.buttonText, { color: palette[3] }]}>
                  {item.title}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: palette[3] }]}>
              No opportunities found.
            </Text>
          </View>
        )}

        {nextUrl && (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={handleLoadMore}
          >
            <LinearGradient
              colors={[palette[1], palette[2]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loadMoreGradient}
            >
              {loadingMore ? (
                <ActivityIndicator size="small" color={palette[3]} />
              ) : (
                <Text style={[styles.loadMoreText, { color: palette[3] }]}>
                  Load More
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles untouched except colors pulled from palette
const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: RFPercentage(2.2),
  },
  header: {
    height: HEADER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 1,
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  headerText: {
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
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
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: RFPercentage(2),
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
    textAlign: 'center',
  },
});
