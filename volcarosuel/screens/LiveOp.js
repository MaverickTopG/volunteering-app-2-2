// LiveOps.js
import React, { useState, useEffect, useContext } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { AuthContext } from '../../auth/AuthContext';
import { themePacks, seasonal } from '../screens/shop';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 100;

// API URL builder
const buildApiUrl = (lat, lon, page) =>
  `https://www.volunteerconnector.org/api/search/?cc=64&format=json&latitude=${lat}&longitude=${lon}&radius=50&page=${page}`;

export default function LiveOps() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  // ---- Theme palette state ----
  // [ background, gradient start, gradient end, text/icon ]
  const DEFAULT_PALETTE = ['#fff6e7','#fff0d4','#ffe8c9','#333'];
  const [palette, setPalette] = useState(DEFAULT_PALETTE);
  const [themeLoading, setThemeLoading] = useState(true);

  // ---- Opportunities state ----
  const [opportunities, setOpportunities] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [locationCoords, setLocationCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // --- Load active theme on mount ---
  useEffect(() => {
    if (!user) {
      setThemeLoading(false);
      return;
    }
    const key = `@shop/active-${user.uid}`;
    AsyncStorage.getItem(key)
      .then(id => {
        if (!id) return;
        const pack =
          themePacks.find(t => t.id === id) ||
          seasonal.find(s => s.id === id);
        if (pack?.colors) {
          const c = pack.colors;
          setPalette([
            c[0] || DEFAULT_PALETTE[0],
            c[1] || DEFAULT_PALETTE[1],
            c[2] || DEFAULT_PALETTE[2],
            c[3] || DEFAULT_PALETTE[3],
          ]);
        }
      })
      .catch(console.warn)
      .finally(() => setThemeLoading(false));
  }, [user]);

  // ---- Fetching opportunities ----
  const fetchOpportunities = async (page = 1, lat, lon, append = false) => {
    try {
      const url = buildApiUrl(lat, lon, page);
      const resp = await fetch(url);
      const data = await resp.json();
      const results = data.results || [];
      setOpportunities(prev => append ? [...prev, ...results] : results);
      setNextUrl(data.next);
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'There was an error fetching opportunities.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // ---- Location setup ----
  useEffect(() => {
    let sub;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission was denied.');
        setLoading(false);
        return;
      }
      try {
        const loc = await Location.getCurrentPositionAsync({});
        setLocationCoords(loc.coords);
        fetchOpportunities(1, loc.coords.latitude, loc.coords.longitude);
        sub = await Location.watchPositionAsync(
          { timeInterval: 60000, distanceInterval: 0 },
          newLoc => {
            setLocationCoords(newLoc.coords);
            fetchOpportunities(1, newLoc.coords.latitude, newLoc.coords.longitude);
          }
        );
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to retrieve location.');
        setLoading(false);
      }
    })();
    return () => sub?.remove();
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

  // ---- Open URL helper ----
  const openURL = async url => {
    try {
      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open the URL.');
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred while opening the URL.');
    }
  };
  const handleWebsitePress = item => {
    const url = item.organization?.url || item.url;
    openURL(url);
  };

  // ---- Loading screens ----
  if (themeLoading || loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: DEFAULT_PALETTE[0] }]}>
        <ActivityIndicator size="large" color={DEFAULT_PALETTE[3]} />
        <Text style={[styles.loadingText, { color: DEFAULT_PALETTE[3] }]}>
          Loading…
        </Text>
      </SafeAreaView>
    );
  }

  // ---- Main render ----
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette[0] }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: palette[0] }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={palette[3]} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: palette[3] }]}>
          Live Opportunities – All
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {opportunities.length > 0 ? opportunities.map((item, idx) => (
          <View key={idx} style={styles.cardWrapper}>
            <LinearGradient
              colors={[palette[1], palette[2]]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.card}
            >
              <Text style={[styles.cardTitle, { color: palette[3] }]}>{item.title}</Text>
              {item.dates && <Text style={[styles.cardDates, { color: palette[3] }]}>{item.dates}</Text>}
              {item.organization?.name && (
                <Text style={[styles.cardOrg, { color: palette[3] }]}>
                  Org: {item.organization.name}
                </Text>
              )}
              {item.description && (
                <Text
                  style={[styles.cardDescription, { color: palette[3] }]}
                  numberOfLines={3}
                >
                  {item.description}
                </Text>
              )}
              {typeof item.remote_or_online === 'boolean' && (
                <Text style={[styles.cardInfo, { color: palette[3] }]}>
                  {item.remote_or_online ? 'Remote/Online' : 'In-Person'}
                </Text>
              )}
              <TouchableOpacity
                style={[styles.websiteButton, { backgroundColor: palette[0], borderColor: palette[3] }]}
                onPress={() => handleWebsitePress(item)}
              >
                <Text style={[styles.websiteButtonText, { color: palette[3] }]}>
                  Website
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: palette[3] }]}>
              No opportunities found.
            </Text>
          </View>
        )}

        {nextUrl && (
          <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
            <LinearGradient
              colors={[palette[1], palette[2]]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.loadMoreGradient}
            >
              {loadingMore
                ? <ActivityIndicator size="small" color={palette[3]} />
                : <Text style={[styles.loadMoreText, { color: palette[3] }]}>Load More</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center'
  },
  loadingText: {
    marginTop: 10, fontSize: RFPercentage(2.2)
  },
  header: {
    height: HEADER_HEIGHT,
    justifyContent: 'center', alignItems: 'center',
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    position: 'absolute', top: 60, left: 0, right: 0, zIndex: 1,
    shadowColor: '#333', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1, shadowRadius: 0
  },
  headerText: {
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
    top: -0
  },
  backButton: {
    position: 'absolute', left: 10, top: 30, padding: 10, zIndex: 100
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: RFPercentage(2.2),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardDates: {
    fontSize: RFPercentage(1.8),
    textAlign: 'center',
    marginBottom: 5,
  },
  cardOrg: {
    fontSize: RFPercentage(1.8),
    textAlign: 'center',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: RFPercentage(1.8),
    textAlign: 'center',
    marginBottom: 5,
  },
  cardInfo: {
    fontSize: RFPercentage(1.8),
    textAlign: 'center',
    marginBottom: 10,
  },
  websiteButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: 'center',
  },
  websiteButtonText: {
    fontSize: RFPercentage(1.8),
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
