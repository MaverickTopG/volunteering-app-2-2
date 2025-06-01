// MapScreen.js

import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
  useMemo,
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
  Platform,
  ActivityIndicator,
  Linking,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
} from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';
import { collection, query, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../auth/AuthContext';
import { db } from '../../auth/firebase';
import { useFocusEffect } from '@react-navigation/native';

// ─── DIMENSIONS & SCALING ────────────────────────────────────────────────────────
const { width, height } = Dimensions.get('window');
const BASE_WIDTH = 428;
const BASE_HEIGHT = 926;
const scale = (s) => (width / BASE_WIDTH) * s;
const verticalScale = (s) => (height / BASE_HEIGHT) * s;

// ─── CATEGORY ICON + COLOR LOOKUP ───────────────────────────────────────────────
const categories = [
  { reference: 'Animal',      icon: 'paw-outline',          color: '#E74C3C' },
  { reference: 'Arts',        icon: 'color-palette-outline',color: '#9B59B6' },
  { reference: 'Education',   icon: 'school-outline',       color: '#3498DB' },
  { reference: 'Environment', icon: 'leaf-outline',         color: '#2ECC71' },
  { reference: 'Family',      icon: 'people-circle-outline',color: '#F1C40F' },
  { reference: 'Hospital',    icon: 'medkit-outline',       color: '#E67E22' },
  { reference: 'Library',     icon: 'book-outline',         color: '#1ABC9C' },
  { reference: 'Seniors',     icon: 'walk-outline',         color: '#34495E' },
  { reference: 'Tech',        icon: 'laptop-outline',       color: '#8E44AD' },
];
const CATEGORY_ICON_MAP = {};
categories.forEach((cat) => {
  CATEGORY_ICON_MAP[cat.reference.toLowerCase()] = {
    icon: cat.icon,
    color: cat.color,
  };
});

// ─── GEOCODING HELPER (NOMINATIM) ───────────────────────────────────────────────
// Returns null or an object { latitude, longitude }
async function fetchCoordsForAddress(address) {
  if (!address || !address.trim()) return null;
  try {
    const url =
      `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(address)}` +
      `&format=json&limit=1`;
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'NexoLinkApp/1.0' },
    });
    if (Array.isArray(data) && data.length > 0) {
      const { lat, lon } = data[0];
      return {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
      };
    }
  } catch (err) {
    console.warn('Nominatim error:', err);
  }
  return null;
}

export default function MapScreen() {
  const mapRef = useRef(null);

  // ─── STATE ────────────────────────────────────────────────────────────────────
  const [sitesWithCoords, setSitesWithCoords] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [geoFailed, setGeoFailed] = useState(false);
  const [homeLocation, setHomeLocation] = useState(null);
  const [showHomeModal, setShowHomeModal] = useState(false);
  const [homeAddressInput, setHomeAddressInput] = useState('');

  const [selectedSite, setSelectedSite] = useState(null);
  const [is3D, setIs3D] = useState(false);
  const [loadingSites, setLoadingSites] = useState(true);

  const { user } = useContext(AuthContext);

  // ─── ANIMATED BOTTOM PANEL ─────────────────────────────────────────────────────
  // height of the panel when fully open:
  const PANEL_HEIGHT = height * 0.5;
  // Animated value controlling panel’s translateY.
  const panelAnim = useRef(new Animated.Value(PANEL_HEIGHT)).current;

  // Whenever selectedSite changes, slide the panel up or down.
  useEffect(() => {
    if (selectedSite) {
      // Slide up to 0
      Animated.timing(panelAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide down off-screen
      Animated.timing(panelAnim, {
        toValue: PANEL_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedSite, panelAnim]);

  // ─── 1) REQUEST DEVICE LOCATION ───────────────────────────────────────────────
  const requestLocation = async () => {
    if (Platform.OS === 'ios') {
      const status = await Geolocation.requestAuthorization('whenInUse');
      if (status === 'granted') {
        Geolocation.getCurrentPosition(
          (pos) => {
            const coords = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
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
          },
          (error) => {
            console.warn('Geo error:', error);
            setGeoFailed(true);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } else {
        setGeoFailed(true);
      }
    } else {
      Geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
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
        },
        (error) => {
          console.warn('Geo error:', error);
          setGeoFailed(true);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    }
  };

  // ─── 2) FETCH + GEOCODE VOLUNTEER SITES ────────────────────────────────────────
  const loadVolunteerSites = useCallback(async () => {
    setLoadingSites(true);

    // 2A) Attempt AsyncStorage cache
    try {
      const rawCached = await AsyncStorage.getItem(
        '@nexolink_sites_with_coords'
      );
      if (rawCached) {
        const parsed = JSON.parse(rawCached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSitesWithCoords(parsed);
          setLoadingSites(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Cache parse error, ignoring cache:', e);
      await AsyncStorage.removeItem('@nexolink_sites_with_coords');
    }

    // 2B) Fetch from Firestore, then geocode sequentially
    let rawSites = [];
    try {
      const q = query(collection(db, 'volunteer_organizations'));
      const snap = await getDocs(q);
      rawSites = snap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.title || data.name || 'Volunteer Site',
          address: data.address || '',
          type: (data.type || 'community').toLowerCase(),
          description: data.description || 'Help make a difference',
          contact: data.contact || data.phone || null,
          website: data.website || null,
        };
      });
    } catch (err) {
      console.warn('Error fetching volunteer sites:', err);
    }

    // Hide “loading” overlay now, but we will still push markers one by one
    setLoadingSites(false);

    const geocodedList = [];
    for (let site of rawSites) {
      if (!site.address.trim()) continue;
      const coords = await fetchCoordsForAddress(site.address);
      if (coords) {
        const withCoords = { ...site, coords };
        geocodedList.push(withCoords);
        // Immediately add marker to state
        setSitesWithCoords((prev) => [...prev, withCoords]);
      }
      // Throttle Nominatim requests
      await new Promise((r) => setTimeout(r, 150));
    }

    // Deduplicate by rounding lat/lng to 5 decimals
    const uniqueMap = {};
    geocodedList.forEach((s) => {
      const key = `${s.coords.latitude.toFixed(5)}|${s.coords.longitude.toFixed(5)}`;
      if (!uniqueMap[key]) uniqueMap[key] = s;
    });
    const deduped = Object.values(uniqueMap);
    setSitesWithCoords(deduped);

    // Cache to AsyncStorage
    try {
      await AsyncStorage.setItem(
        '@nexolink_sites_with_coords',
        JSON.stringify(deduped)
      );
    } catch (e) {
      console.warn('AsyncStorage set error:', e);
    }
  }, []);

  // On screen focus: request location + load volunteer sites
  useFocusEffect(
    React.useCallback(() => {
      requestLocation();
      loadVolunteerSites();
    }, [loadVolunteerSites])
  );

  // Recenter camera whenever userLocation or is3D toggles
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

  // ─── 3) MARKER & CONTROL HANDLERS ─────────────────────────────────────────────
  const onMarkerPress = (site) => {
    setSelectedSite(site);
    // Animate to that marker:
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
    Linking.openURL(url).catch((err) =>
      console.warn('Error opening Maps:', err)
    );
  };

  const onCopyAddress = () => {
    if (!selectedSite?.address) return;
    Alert.alert('Copied', 'Address copied to clipboard');
  };

  const onOpenWebsite = () => {
    if (!selectedSite?.website) return;
    let url = selectedSite.website;
    if (!url.startsWith('http')) url = 'https://' + url;
    Linking.openURL(url).catch((err) =>
      console.warn('Error opening Website:', err)
    );
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

  // ─── 4) FALLBACK WHEN GEOLOCATION IS DENIED ───────────────────────────────────
  if (geoFailed) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>
          Location permission denied or unavailable. Please enter your address
          manually.
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

  // ─── 5) MAIN RENDER ────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/** Full-screen MapView */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={
          Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
        }
        showsUserLocation={true}
        showsBuildings={is3D}
        mapType="standard"
        showsTraffic={false}
        showsIndoors={false}
        showsIndoorsLevelPicker={false}
      >
        {/** Render a marker for each geocoded site */}
        {sitesWithCoords.map((site) => {
          const cat =
            CATEGORY_ICON_MAP[site.type] || {
              icon: 'heart-outline',
              color: '#000',
            };
          return (
            <Marker
              key={site.id}
              coordinate={site.coords}
              onPress={() => onMarkerPress(site)}
            >
              {/* Use a small colored pin icon */}
              <Ionicons
                name="location-sharp"
                size={scale(25)}
                color={cat.color}
              />
            </Marker>
          );
        })}
      </MapView>

      {/** ─── TOP-RIGHT VERTICAL BUTTONS (Locate + 2D/3D) ───────────────────────────── */}
      <View style={styles.topRightButtons}>
        {/* Locate Me */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onLocatePress}
        >
          <Ionicons name="locate-outline" size={scale(24)} color="#000" />
        </TouchableOpacity>

        {/* 2D ↔ 3D Toggle */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setIs3D((v) => !v)}
        >
          <Text style={styles.toggleText}>{is3D ? '3D' : '2D'}</Text>
        </TouchableOpacity>
      </View>

      {/** ─── LOADING OVERLAY ───────────────────────────────────────────────────── */}
      {loadingSites && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3498DB" />
          <Text style={styles.loadingText}>
            Loading volunteer sites…
          </Text>
        </View>
      )}

      {/** ─── TRANSPARENT OVERLAY TO CLOSE PANEL WHEN TAPPED OUTSIDE ───────────────── */}
      {selectedSite && (
        <TouchableWithoutFeedback onPress={() => setSelectedSite(null)}>
          <View style={styles.overlayTouchable} />
        </TouchableWithoutFeedback>
      )}

      {/** ─── ANIMATED BOTTOM PANEL ───────────────────────────────────────────────── */}
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
              <Text style={styles.siteAddress}>
                {selectedSite.address}
              </Text>
              <Text style={styles.siteDescription}>
                {selectedSite.description}
              </Text>

              <View style={styles.sheetButtonsRow}>
                <TouchableOpacity
                  style={styles.sheetButton}
                  onPress={onGetDirections}
                >
                  <Ionicons
                    name="navigate-outline"
                    size={scale(20)}
                    color="#000"
                  />
                  <Text style={styles.sheetButtonText}>Directions</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sheetButton}
                  onPress={onCopyAddress}
                >
                  <Ionicons
                    name="copy-outline"
                    size={scale(20)}
                    color="#000"
                  />
                  <Text style={styles.sheetButtonText}>Copy Address</Text>
                </TouchableOpacity>

                {selectedSite.website && (
                  <TouchableOpacity
                    style={styles.sheetButton}
                    onPress={onOpenWebsite}
                  >
                    <Ionicons
                      name="globe-outline"
                      size={scale(20)}
                      color="#000"
                    />
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

// ─── STYLESHEET ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },

  // ─── TOP-RIGHT VERTICAL BUTTONS (Locate + 2D/3D) ─────────────────────────────
  topRightButtons: {
    position: 'absolute',
    top: verticalScale(40),
    right: scale(20),
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 10,
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: verticalScale(6),
    flexDirection: 'row',
  },
  toggleText: {
    fontSize: scale(14),
    fontWeight: '700',
    color: '#000',
  },

  // ─── LOADING OVERLAY ─────────────────────────────────────────────────────────────
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: verticalScale(8),
    fontSize: scale(14),
    color: '#333',
  },

  // ─── FALLBACK VIEW WHEN GEOLOCATION DENIED ──────────────────────────────────────
  fallbackContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(20),
  },
  fallbackText: {
    fontSize: scale(16),
    color: '#333',
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
    fontSize: scale(16),
    fontWeight: '600',
  },

  // ─── MODAL FOR MANUAL ADDRESS ───────────────────────────────────────────────────
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
    fontSize: scale(18),
    fontWeight: '700',
    marginBottom: verticalScale(15),
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    height: verticalScale(45),
    backgroundColor: '#F5F5F5',
    borderRadius: scale(8),
    paddingHorizontal: scale(15),
    marginBottom: verticalScale(20),
    fontSize: scale(16),
    color: '#000',
  },
  modalSaveBtn: {
    backgroundColor: '#000',
    borderRadius: scale(8),
    paddingVertical: verticalScale(12),
    alignItems: 'center',
  },
  modalSaveBtnText: {
    color: '#FFF',
    fontSize: scale(16),
    fontWeight: '600',
  },

  // ─── OVERLAY TO DISMISS BOTTOM PANEL ───────────────────────────────────────────
  overlayTouchable: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 10,
  },

  // ─── ANIMATED BOTTOM PANEL ─────────────────────────────────────────────────────
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
    marginTop: verticalScale(8),
    marginBottom: verticalScale(12),
  },
  sheetContent: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(20),
  },
  siteTitle: {
    fontSize: scale(20),
    fontWeight: '700',
    color: '#000',
    marginBottom: verticalScale(8),
  },
  siteType: {
    fontSize: scale(14),
    fontWeight: '600',
    color: '#555',
    marginBottom: verticalScale(6),
  },
  siteAddress: {
    fontSize: scale(14),
    color: '#666',
    marginBottom: verticalScale(8),
  },
  siteDescription: {
    fontSize: scale(13),
    color: '#444',
    marginBottom: verticalScale(12),
  },
  sheetButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(12),
  },
  sheetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: scale(8),
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(12),
    flex: 1,
    marginHorizontal: scale(4),
  },
  sheetButtonText: {
    marginLeft: scale(6),
    fontSize: scale(14),
    color: '#000',
    fontWeight: '600',
  },
});
