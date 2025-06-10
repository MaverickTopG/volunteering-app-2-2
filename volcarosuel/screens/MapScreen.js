// MapScreen.js

import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Linking,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { collection, query, getDocs } from 'firebase/firestore';
import { AuthContext } from '../../auth/AuthContext';
import { db } from '../../auth/firebase';

const { width, height } = Dimensions.get('window');
const BASE_WIDTH = 428;
const BASE_HEIGHT = 926;
const scale = (s) => (width / BASE_WIDTH) * s;
const verticalScale = (s) => (height / BASE_HEIGHT) * s;

// Category lookup
const categories = [
  { reference: 'Animal',   icon: 'paw-outline',          color: '#E74C3C' },
  { reference: 'Arts',     icon: 'color-palette-outline',color: '#9B59B6' },
  { reference: 'Education',icon: 'school-outline',       color: '#3498DB' },
  { reference: 'Environment',icon: 'leaf-outline',       color: '#2ECC71' },
  { reference: 'Family',   icon: 'people-circle-outline',color: '#F1C40F' },
  { reference: 'Hospital', icon: 'medkit-outline',       color: '#E67E22' },
  { reference: 'Library',  icon: 'book-outline',         color: '#1ABC9C' },
  { reference: 'Seniors',  icon: 'walk-outline',         color: '#34495E' },
  { reference: 'Tech',     icon: 'laptop-outline',       color: '#8E44AD' },
];
const CATEGORY_ICON_MAP = {};
categories.forEach((c) => {
  CATEGORY_ICON_MAP[c.reference.toLowerCase()] = {
    icon: c.icon,
    color: c.color,
  };
});

// Geocoding via Nominatim
async function fetchCoordsForAddress(address) {
  if (!address?.trim()) return null;
  try {
    const url =
      'https://nominatim.openstreetmap.org/search?' +
      `q=${encodeURIComponent(address)}` +
      '&format=json&limit=1';
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'NexoLinkApp/1.0' },
    });
    if (Array.isArray(data) && data.length) {
      const { lat, lon } = data[0];
      return { latitude: +lat, longitude: +lon };
    }
  } catch (err) {
    console.warn('Geocode error:', err);
  }
  return null;
}

export default function MapScreen() {
  const mapRef = useRef(null);
  const panelAnim = useRef(new Animated.Value(height * 0.5)).current;
  const { user } = useContext(AuthContext);

  // state
  const [sitesWithCoords, setSitesWithCoords] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [homeLocation, setHomeLocation] = useState(null);
  const [geoFailed, setGeoFailed] = useState(false);
  const [homeAddressInput, setHomeAddressInput] = useState('');
  const [showHomeModal, setShowHomeModal] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [is3D, setIs3D] = useState(false);
  const [loadingSites, setLoadingSites] = useState(true);

  // slide bottom panel
  useEffect(() => {
    Animated.timing(panelAnim, {
      toValue: selectedSite ? 0 : height * 0.5,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selectedSite]);

  // 1) request location via Expo
  const requestLocation = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setGeoFailed(true);
      return;
    }
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });
    const coords = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };
    setUserLocation(coords);
    setHomeLocation(coords);
    setGeoFailed(false);
    mapRef.current?.animateCamera({
      center: coords,
      zoom: 14,
      pitch: is3D ? 45 : 0,
      heading: 0,
    });
  }, [is3D]);

  // 2) load + geocode volunteer sites
  const loadVolunteerSites = useCallback(async () => {
    setLoadingSites(true);
    // try cache
    try {
      const raw = await AsyncStorage.getItem('@nexolink_sites_with_coords');
      const parsed = JSON.parse(raw || '[]');
      if (parsed.length) {
        setSitesWithCoords(parsed);
        setLoadingSites(false);
        return;
      }
    } catch (e) {
      console.warn('Cache error:', e);
      await AsyncStorage.removeItem('@nexolink_sites_with_coords');
    }

    // fetch from Firestore
    let rawSites = [];
    try {
      const snap = await getDocs(query(collection(db, 'volunteer_organizations')));
      rawSites = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.title || data.name || 'Volunteer Site',
          address: data.address || '',
          type: (data.type || 'community').toLowerCase(),
          description: data.description || '',
          contact: data.contact || data.phone || null,
          website: data.website || null,
        };
      });
    } catch (e) {
      console.warn('Firestore error:', e);
    }
    setLoadingSites(false);

    // geocode sequentially
    const geocoded = [];
    for (let s of rawSites) {
      if (!s.address.trim()) continue;
      const coords = await fetchCoordsForAddress(s.address);
      if (coords) {
        geocoded.push({ ...s, coords });
        setSitesWithCoords((prev) => [...prev, { ...s, coords }]);
      }
      await new Promise((r) => setTimeout(r, 150));
    }
    // dedupe
    const uniq = {};
    geocoded.forEach((s) => {
      const key = `${s.coords.latitude.toFixed(5)}|${s.coords.longitude.toFixed(5)}`;
      if (!uniq[key]) uniq[key] = s;
    });
    const deduped = Object.values(uniq);
    setSitesWithCoords(deduped);

    // cache
    try {
      await AsyncStorage.setItem('@nexolink_sites_with_coords', JSON.stringify(deduped));
    } catch (e) {
      console.warn('Save cache error:', e);
    }
  }, []);

  // on focus, request location + load sites
  useFocusEffect(
    React.useCallback(() => {
      requestLocation();
      loadVolunteerSites();
    }, [requestLocation, loadVolunteerSites])
  );

  // recenter on toggle 2D/3D
  useEffect(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.animateCamera({
        center: userLocation,
        zoom: 14,
        pitch: is3D ? 45 : 0,
        heading: 0,
      });
    }
  }, [is3D, userLocation]);

  // handlers
  const onMarkerPress = (site) => {
    setSelectedSite(site);
    mapRef.current?.animateCamera({
      center: site.coords,
      zoom: 15,
      pitch: is3D ? 45 : 0,
      heading: 0,
    });
  };
  const onLocatePress = () => {
    const loc = homeLocation || userLocation;
    if (loc) {
      mapRef.current?.animateCamera({
        center: loc,
        zoom: 14,
        pitch: is3D ? 45 : 0,
        heading: 0,
      });
    }
  };
  const onGetDirections = () => {
    if (!selectedSite?.coords) return;
    const { latitude, longitude } = selectedSite.coords;
    const url =
      Platform.OS === 'ios'
        ? `maps://?daddr=${latitude},${longitude}`
        : `google.navigation:q=${latitude},${longitude}`;
    Linking.openURL(url).catch(console.warn);
  };
  const onCopyAddress = () => {
    if (!selectedSite?.address) return;
    Alert.alert('Copied', 'Address copied to clipboard');
  };
  const onOpenWebsite = () => {
    if (!selectedSite?.website) return;
    let url = selectedSite.website;
    if (!url.startsWith('http')) url = 'https://' + url;
    Linking.openURL(url).catch(console.warn);
  };
  const saveHomeAddress = async () => {
    if (!homeAddressInput.trim()) return;
    const coords = await fetchCoordsForAddress(homeAddressInput.trim());
    if (coords) {
      setHomeLocation(coords);
      setUserLocation(coords);
      setShowHomeModal(false);
      mapRef.current?.animateCamera({
        center: coords,
        zoom: 14,
        pitch: is3D ? 45 : 0,
        heading: 0,
      });
    } else {
      Alert.alert('Not Found', 'Could not find that address.');
    }
  };

  // fallback if location denied
  if (geoFailed) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>
          Location permission denied. Please enter your address manually.
        </Text>
        <TouchableOpacity
          style={styles.fallbackButton}
          onPress={() => setShowHomeModal(true)}
        >
          <Text style={styles.fallbackButtonText}>Set Address</Text>
        </TouchableOpacity>

        <Modal
          transparent
          visible={showHomeModal}
          animationType="slide"
          onRequestClose={() => setShowHomeModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Enter Your Address</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="123 Main St, City, State"
                placeholderTextColor="#777"
                value={homeAddressInput}
                onChangeText={setHomeAddressInput}
              />
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={saveHomeAddress}
              >
                <Text style={styles.modalSaveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // main render
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        showsUserLocation
        showsBuildings={is3D}
      >
        {sitesWithCoords.map((site) => {
          const cat = CATEGORY_ICON_MAP[site.type] || { color: '#000' };
          return (
            <Marker
              key={site.id}
              coordinate={site.coords}
              onPress={() => onMarkerPress(site)}
            >
              <Ionicons
                name="location-sharp"
                size={scale(25)}
                color={cat.color}
              />
            </Marker>
          );
        })}
      </MapView>

      <View style={styles.topRightButtons}>
        <TouchableOpacity style={styles.controlButton} onPress={onLocatePress}>
          <Ionicons name="locate-outline" size={scale(24)} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setIs3D((v) => !v)}
        >
          <Text style={styles.toggleText}>{is3D ? '3D' : '2D'}</Text>
        </TouchableOpacity>
      </View>

      {loadingSites && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3498DB" />
          <Text style={styles.loadingText}>Loading volunteer sites…</Text>
        </View>
      )}

      {selectedSite && (
        <TouchableWithoutFeedback onPress={() => setSelectedSite(null)}>
          <View style={styles.overlayTouchable} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View
        style={[
          styles.bottomPanel,
          { transform: [{ translateY: panelAnim }] },
        ]}
      >
        <View style={styles.panelHandle} />
        <ScrollView contentContainerStyle={styles.sheetContent}>
          {selectedSite ? (
            <>
              <Text style={styles.siteTitle}>{selectedSite.name}</Text>
              <Text style={styles.siteType}>
                Type:{' '}
                {selectedSite.type.charAt(0).toUpperCase() +
                  selectedSite.type.slice(1)}
              </Text>
              <Text style={styles.siteAddress}>{selectedSite.address}</Text>
              <Text style={styles.siteDescription}>
                {selectedSite.description}
              </Text>

              <View style={styles.sheetButtonsRow}>
                <TouchableOpacity
                  style={styles.sheetButton}
                  onPress={onGetDirections}
                >
                  <Ionicons name="navigate-outline" size={scale(20)} />
                  <Text style={styles.sheetButtonText}>Directions</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sheetButton}
                  onPress={onCopyAddress}
                >
                  <Ionicons name="copy-outline" size={scale(20)} />
                  <Text style={styles.sheetButtonText}>Copy Address</Text>
                </TouchableOpacity>

                {selectedSite.website && (
                  <TouchableOpacity
                    style={styles.sheetButton}
                    onPress={onOpenWebsite}
                  >
                    <Ionicons name="globe-outline" size={scale(20)} />
                    <Text style={styles.sheetButtonText}>Website</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>
              No site selected
            </Text>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },

  topRightButtons: {
    position: 'absolute',
    top: verticalScale(40),
    right: scale(20),
    alignItems: 'center',
    zIndex: 10,
  },
  controlButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: verticalScale(6),
  },
  toggleText: {
    fontSize: scale(14),
    fontWeight: '700',
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: verticalScale(8),
  },

  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(20),
  },
  fallbackText: {
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  fallbackButton: {
    backgroundColor: '#000',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(24),
    borderRadius: scale(8),
  },
  fallbackButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: scale(12),
    padding: scale(20),
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: verticalScale(15),
    fontWeight: '700',
  },
  modalInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: scale(8),
    padding: scale(15),
    marginBottom: verticalScale(20),
  },
  modalSaveBtn: {
    backgroundColor: '#000',
    borderRadius: scale(8),
    paddingVertical: verticalScale(12),
    alignItems: 'center',
  },
  modalSaveBtnText: {
    color: '#FFF',
    fontWeight: '600',
  },

  overlayTouchable: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 10,
  },

  bottomPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: height * 0.6,
    bottom: -130,
    backgroundColor: '#FFF',
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 20,
  },
  panelHandle: {
    width: scale(40),
    height: scale(4),
    backgroundColor: '#E0E0E0',
    borderRadius: scale(2),
    alignSelf: 'center',
    marginVertical: verticalScale(12),
  },
  sheetContent: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(20),
  },
  siteTitle: {
    fontSize: scale(20),
    fontWeight: '700',
    marginBottom: verticalScale(8),
  },
  siteType: {
    fontSize: scale(14),
    fontWeight: '600',
    marginBottom: verticalScale(6),
  },
  siteAddress: {
    fontSize: scale(14),
    marginBottom: verticalScale(8),
  },
  siteDescription: {
    fontSize: scale(13),
    marginBottom: verticalScale(12),
  },
  sheetButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(12),
  },
  sheetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: scale(8),
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(12),
    marginHorizontal: scale(4),
  },
  sheetButtonText: {
    marginLeft: scale(6),
    fontWeight: '600',
  },
});
