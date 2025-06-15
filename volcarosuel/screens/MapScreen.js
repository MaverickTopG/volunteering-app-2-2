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
  ActivityIndicator,
  Linking,
  ScrollView,
  Platform,
  Animated,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT, Polyline, Circle } from 'react-native-maps';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { collection, query, getDocs } from 'firebase/firestore';
import { AuthContext } from '../../auth/AuthContext';
import { db } from '../../auth/firebase';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

// Responsive scaling
const BASE_WIDTH = 428;
const BASE_HEIGHT = 926;
const scale = (size) => (width / BASE_WIDTH) * size;
const verticalScale = (size) => (height / BASE_HEIGHT) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

// Screen size detection
const isSmallScreen = width < 400;
const isTablet = width > 768;

// Dynamic snap points
const getSnapPoints = () => {
  if (isTablet) return ['25%', '50%', '75%'];
  if (isSmallScreen) return ['35%', '60%', '70%'];
  return ['30%', '70%'];
};

const categories = [
  { ref: 'Animal', icon: 'paw', color: '#000' },
  { ref: 'Arts', icon: 'color-palette', color: '#000' },
  { ref: 'Education', icon: 'school', color: '#000' },
  { ref: 'Environment', icon: 'leaf', color: '#000' },
  { ref: 'Family', icon: 'people-circle', color: '#000' },
  { ref: 'Hospital', icon: 'medkit', color: '#000' },
  { ref: 'Library', icon: 'library', color: '#000' },
  { ref: 'Seniors', icon: 'walk', color: '#000' },
  { ref: 'Tech', icon: 'laptop', color: '#000' },
];

const CATEGORY_MAP = {};
categories.forEach(c => {
  CATEGORY_MAP[c.ref.toLowerCase()] = { icon: c.icon, color: c.color };
});

const DISTANCE_OPTIONS = [
  { label: 'N/A', value: null },
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
];

// Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

async function fetchCoordsForAddress(address) {
  if (!address?.trim()) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'NexoLink/1.0' }
    });
    if (data.length) {
      const { lat, lon } = data[0];
      return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    }
  } catch (err) {
    console.warn('Geocode error:', err);
  }
  return null;
}

async function getRouteCoordinates(start, end) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?geometries=geojson`;
    const { data } = await axios.get(url);
    if (data.routes?.length) {
      return data.routes[0].geometry.coordinates.map(c => ({
        latitude: c[1],
        longitude: c[0],
      }));
    }
  } catch (err) {
    console.warn('Route error:', err);
  }
  // fallback
  return [start, end];
}

const LoadingDots = () => {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => (d === '...' ? '' : d + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);
  return <Text style={styles.loadingDots}>{dots}</Text>;
};

export default function MapScreen() {
  const mapRef = useRef(null);
  const sheetRef = useRef(null);
  const { user } = useContext(AuthContext);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const snapPoints = useMemo(() => getSnapPoints(), []);
  const [sitesWithCoords, setSitesWithCoords] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [geoFailed, setGeoFailed] = useState(false);
  const [homeAddressInput, setHomeAddressInput] = useState('');
  const [showHomeModal, setShowHomeModal] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [is3D, setIs3D] = useState(false);
  const [loadingSites, setLoadingSites] = useState(true);
  const [selectedDistance, setSelectedDistance] = useState(null);
  const [showDistanceOptions, setShowDistanceOptions] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  const filteredSites = useMemo(() => {
    if (!selectedDistance || !userLocation) return sitesWithCoords;
    return sitesWithCoords.filter(site =>
      calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        site.coords.latitude,
        site.coords.longitude
      ) <= selectedDistance
    );
  }, [sitesWithCoords, selectedDistance, userLocation]);

  const startPulsing = useCallback(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]).start(pulse);
    };
    pulse();
  }, [pulseAnim]);

  const requestLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return setGeoFailed(true);
      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      setUserLocation({ latitude: coords.latitude, longitude: coords.longitude });
      setGeoFailed(false);
      mapRef.current?.animateCamera({ center: coords, zoom: 14, pitch: is3D ? 45 : 0, heading: 0 });
    } catch {
      setGeoFailed(true);
    }
  }, [is3D]);

  const loadVolunteerSites = useCallback(async () => {
    setLoadingSites(true);
    // try cache
    try {
      const cached = JSON.parse(await AsyncStorage.getItem('@nexolink_sites_with_coords') || '[]');
      if (cached.length) {
        setSitesWithCoords(cached);
        setLoadingSites(false);
        return;
      }
    } catch { /* ignore */ }

    // fetch
    let raw = [];
    try {
      const snap = await getDocs(query(collection(db, 'volunteer_organizations')));
      raw = snap.docs.map(d => ({
        id: d.id,
        name: d.data().title || d.data().name || 'Volunteer Site',
        address: d.data().address || '',
        type: (d.data().type || 'community').toLowerCase(),
        description: d.data().description || '',
        website: d.data().website || null,
      }));
    } catch (e) {
      console.warn('Firestore error:', e);
    }

    const geocoded = [];
    for (const site of raw) {
      if (!site.address.trim()) continue;
      const coords = await fetchCoordsForAddress(site.address);
      if (coords) {
        geocoded.push({ ...site, coords });
        setSitesWithCoords(s => [...s, { ...site, coords }]);
      }
      await new Promise(r => setTimeout(r, 150));
    }

    // dedupe
    const uniq = {};
    geocoded.forEach(s => {
      const key = `${s.coords.latitude.toFixed(5)}_${s.coords.longitude.toFixed(5)}`;
      if (!uniq[key]) uniq[key] = s;
    });
    const finalSites = Object.values(uniq);
    setSitesWithCoords(finalSites);
    try {
      await AsyncStorage.setItem('@nexolink_sites_with_coords', JSON.stringify(finalSites));
    } catch {}
    setLoadingSites(false);
  }, []);

  useFocusEffect(useCallback(() => {
    requestLocation(); loadVolunteerSites();
  }, [requestLocation, loadVolunteerSites]));

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

  useEffect(() => {
    if (selectedDistance && userLocation && mapRef.current) {
      const latDelta = (selectedDistance / 69) * 2.2;
      const lngDelta = latDelta * 1.5;
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      }, 1000);
    }
  }, [selectedDistance, userLocation]);

  const onMarkerPress = useCallback(async site => {
    setSelectedSite(site);
    if (userLocation) {
      const route = await getRouteCoordinates(userLocation, site.coords);
      setRouteCoordinates(route);
    }
    if (userLocation && mapRef.current) {
      mapRef.current.fitToCoordinates(
        [userLocation, site.coords],
        {
          edgePadding: {
              top:    scale(16),      // small top padding
      right:  scale(16),
      bottom: height * 0.6,    // ← big bottom padding now
      left:   scale(16),
          },
          animated: true,
        }
      );
    }
    startPulsing();
    if (!selectedDistance && sheetRef.current) {
      const idx = site.website ? snapPoints.length - 1 : snapPoints.length - 2;
      sheetRef.current.snapToIndex(Math.max(0, idx));
    }
  }, [userLocation, selectedDistance, snapPoints.length, startPulsing]);

  const onCloseSheet = useCallback(() => {
    setSelectedSite(null);
    setRouteCoordinates([]);
  }, []);

  const onLocatePress = useCallback(() => {
    if (!userLocation) return;
    mapRef.current?.animateCamera({
      center: userLocation,
      zoom: 18,
      pitch: is3D ? 45 : 0,
      heading: 0,
    });
  }, [userLocation, is3D]);

  const onGetDirections = useCallback(() => {
    if (!selectedSite?.coords) return;
    const { latitude, longitude } = selectedSite.coords;
    const url = Platform.OS === 'ios'
      ? `maps://?daddr=${latitude},${longitude}`
      : `google.navigation:q=${latitude},${longitude}`;
    Linking.openURL(url).catch(console.warn);
  }, [selectedSite]);

  const onCopyAddress = useCallback(() => {
    if (!selectedSite?.address) return;
    Alert.alert('Copied', 'Address copied to clipboard');
  }, [selectedSite]);

  const onOpenWebsite = useCallback(() => {
    if (!selectedSite?.website) return;
    let url = selectedSite.website;
    if (!url.startsWith('http')) url = 'https://' + url;
    Linking.openURL(url).catch(console.warn);
  }, [selectedSite]);

  const saveHomeAddress = useCallback(async () => {
    if (!homeAddressInput.trim()) return;
    const coords = await fetchCoordsForAddress(homeAddressInput.trim());
    if (coords) {
      setUserLocation(coords);
      setShowHomeModal(false);
      setHomeAddressInput('');
      mapRef.current?.animateCamera({
        center: coords,
        zoom: 14,
        pitch: is3D ? 45 : 0,
        heading: 0,
      });
    } else {
      Alert.alert('Not Found', 'Could not find that address. Please try again.');
    }
  }, [homeAddressInput, is3D]);

  const onDistanceFilterPress = () => setShowDistanceOptions(v => !v);
  const onDistanceOptionSelect = d => {
    setSelectedDistance(d);
    setShowDistanceOptions(false);
    setRouteCoordinates([]);
    setSelectedSite(null);
  };

  if (geoFailed) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>
          Location permission is required to show nearby volunteer opportunities.
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        showsUserLocation
        showsMyLocationButton={false}
        showsBuildings={is3D}
        pitchEnabled={is3D}
        rotateEnabled={is3D}
      >
        {selectedDistance && userLocation && (
          <Circle
            center={userLocation}
            radius={selectedDistance * 1609.34}
            strokeColor="rgba(0, 122, 255, 0.3)"
            fillColor="rgba(0, 122, 255, 0.1)"
            strokeWidth={2}
          />
        )}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#007AFF"
            strokeWidth={4}
            lineDashPattern={[5, 5]}
          />
        )}
        {filteredSites.map(site => {
          const category = CATEGORY_MAP[site.type] || { icon: 'location', color: '#000' };
          const isSelected = selectedSite?.id === site.id;
          return (
            <Marker
              key={site.id}
              coordinate={site.coords}
              onPress={() => onMarkerPress(site)}
            >
              <Animated.View
                style={[
                  styles.markerContainer,
                  isSelected && { transform: [{ scale: pulseAnim }] }
                ]}
              >
                <Ionicons
                  name="location-sharp"
                  size={moderateScale(isSelected ? 30 : 25)}
                  color={isSelected ? '#007AFF' : category.color}
                />
              </Animated.View>
            </Marker>
          );
        })}
      </MapView>

      <View style={styles.topRightControls}>
        <BlurView intensity={50} style={styles.blurredControlButton}>
          <TouchableOpacity style={styles.controlButtonInner} onPress={onLocatePress}>
            <Ionicons name="locate-outline" size={moderateScale(24)} color="#000" />
          </TouchableOpacity>
        </BlurView>
        <BlurView intensity={50} style={styles.blurredControlButton}>
          <TouchableOpacity
            style={styles.controlButtonInner}
            onPress={() => setIs3D(v => !v)}
          >
            <Text style={styles.toggleText}>{is3D ? '3D' : '2D'}</Text>
          </TouchableOpacity>
        </BlurView>
        <View style={styles.distanceFilterContainer}>
          <BlurView
            intensity={50}
            style={[
              styles.blurredControlButton,
              showDistanceOptions && styles.expandedDistanceButton
            ]}
          >
            <TouchableOpacity
              style={styles.controlButtonInner}
              onPress={onDistanceFilterPress}
            >
              <Ionicons name="radio-button-on" size={moderateScale(24)} color="#000" />
            </TouchableOpacity>
            {showDistanceOptions && (
              <View style={styles.distanceOptions}>
                {DISTANCE_OPTIONS.map((opt, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.distanceOption,
                      selectedDistance === opt.value && styles.selectedDistanceOption
                    ]}
                    onPress={() => onDistanceOptionSelect(opt.value)}
                  >
                    <Text
                      style={[
                        styles.distanceOptionText,
                        selectedDistance === opt.value && styles.selectedDistanceOptionText
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </BlurView>
        </View>
      </View>

      {loadingSites && (
        <View style={styles.loadingOverlay}>
          <BlurView intensity={50} style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading organizations... please stand by</Text>
            <LoadingDots />
          </BlurView>
        </View>
      )}

      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onCloseSheet}
        backgroundComponent={({ style }) => (
          <BlurView intensity={50} style={[style, styles.sheetBlurBackground]} />
        )}
        handleStyle={styles.sheetHandle}
        handleIndicatorStyle={styles.sheetHandleIndicator}
      >
        <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
          {selectedSite ? (
            <>
              <Text style={styles.siteTitle}>{selectedSite.name}</Text>
              <Text style={styles.siteAddress}>{selectedSite.address}</Text>
              {selectedSite.description && (
                <Text style={styles.siteDescription}>{selectedSite.description}</Text>
              )}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={onGetDirections}>
                  <Ionicons name="navigate-outline" size={moderateScale(20)} color="white" />
                  <Text style={styles.actionButtonText}>Directions</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={onCopyAddress}>
                  <Ionicons name="copy-outline" size={moderateScale(20)} color="#000" />
                  <Text style={styles.secondaryButtonText}>Copy Address</Text>
                </TouchableOpacity>
                {selectedSite.website && (
                  <TouchableOpacity style={styles.secondaryButton} onPress={onOpenWebsite}>
                    <Ionicons name="globe-outline" size={moderateScale(20)} color="#000" />
                    <Text style={styles.secondaryButtonText}>Visit Website</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          ) : (
            <View style={styles.noSiteContainer}>
              <Ionicons name="location-outline" size={moderateScale(48)} color="#000" />
              <Text style={styles.noSiteText}>Tap a marker to see details</Text>
              <Text style={styles.noSiteSubText}>
                Explore volunteer opportunities in your area
              </Text>
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheet>

      <Modal
        transparent
        visible={showHomeModal}
        animationType="slide"
        onRequestClose={() => setShowHomeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={50} style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Set Home Address</Text>
            <Text style={styles.modalSubtitle}>
              This will be used as your reference location
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="123 Main St, City, State"
              placeholderTextColor="#777"
              value={homeAddressInput}
              onChangeText={setHomeAddressInput}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={saveHomeAddress}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowHomeModal(false);
                  setHomeAddressInput('');
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={saveHomeAddress}
              >
                <Text style={styles.modalSaveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  map: { ...StyleSheet.absoluteFillObject },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  topRightControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? verticalScale(60) : verticalScale(50),
    right: scale(16),
    alignItems: 'center',
    zIndex: 10,
  },
  blurredControlButton: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    marginBottom: verticalScale(12),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  controlButtonInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  toggleText: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.5,
  },
  distanceFilterContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  expandedDistanceButton: {
    height: 'auto',
    minHeight: moderateScale(48),
    borderRadius: moderateScale(24),
    paddingVertical: verticalScale(8),
  },
  distanceOptions: {
    paddingVertical: verticalScale(4),
    width: moderateScale(48),
  },
  distanceOption: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(16),
    marginVertical: verticalScale(2),
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  selectedDistanceOption: {
    backgroundColor: 'rgba(0,122,255,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.5)',
  },
  distanceOptionText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  selectedDistanceOptionText: {
    color: '#000000',
    fontWeight: '700',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    paddingHorizontal: scale(32),
    paddingVertical: verticalScale(24),
    borderRadius: moderateScale(16),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  loadingText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  loadingDots: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: '#007AFF',
    minWidth: scale(30),
    textAlign: 'center',
  },
  sheetBlurBackground: {
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderBottomWidth: 0,
  },
  sheetHandle: {
    backgroundColor: 'transparent',
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingVertical: verticalScale(8),
  },
  sheetHandleIndicator: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    width: scale(36),
    height: verticalScale(4),
    borderRadius: moderateScale(2),
  },
  sheetContent: {
    padding: scale(20),
    paddingBottom: verticalScale(40),
  },
  siteTitle: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: '#000',
    marginBottom: verticalScale(8),
  },
  siteAddress: {
    fontSize: moderateScale(16),
    color: 'rgba(0,0,0,0.8)',
    marginBottom: verticalScale(12),
    lineHeight: moderateScale(22),
  },
  siteDescription: {
    fontSize: moderateScale(14),
    color: 'rgba(0,0,0,0.9)',
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(20),
  },
  buttonContainer: {
    flexDirection: 'column',
    width: '100%',
    marginTop: verticalScale(16),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(25),
    width: '100%',
    marginBottom: verticalScale(12),
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.3)',
  },
  actionButtonText: {
    color: 'white',
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginLeft: scale(8),
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(25),
    width: '100%',
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  secondaryButtonText: {
    color: '#000',
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginLeft: scale(6),
  },
  noSiteContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(40),
  },
  noSiteText: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: 'rgba(0,0,0,0.8)',
    marginTop: verticalScale(16),
    textAlign: 'center',
  },
  noSiteSubText: {
    fontSize: moderateScale(14),
    color: 'rgba(0,0,0,0.6)',
    marginTop: verticalScale(8),
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(20),
  },
  modalContainer: {
    width: '100%',
    maxWidth: scale(350),
    padding: scale(24),
    borderRadius: moderateScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modalTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  modalSubtitle: {
    fontSize: moderateScale(14),
    color: 'rgba(0,0,0,0.8)',
    textAlign: 'center',
    marginBottom: verticalScale(20),
    lineHeight: moderateScale(20),
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    fontSize: moderateScale(16),
    color: '#000',
    marginBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: scale(12),
  },
  modalButton: {
    flex: 1,
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(20),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalCancelButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  modalSaveButton: {
    backgroundColor: 'rgba(0,122,255,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.3)',
  },
  modalCancelButtonText: {
    color: 'rgba(0,0,0,0.8)',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  modalSaveButtonText: {
    color: '#000',
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    padding: scale(20),
  },
  fallbackText: {
    fontSize: moderateScale(16),
    color: '#000',
    textAlign: 'center',
    lineHeight: moderateScale(24),
  },
});
