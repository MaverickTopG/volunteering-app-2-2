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
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { collection, query, getDocs } from 'firebase/firestore';
import { AuthContext } from '../../auth/AuthContext';
import { db } from '../../auth/firebase';

const { width, height } = Dimensions.get('window');

// Responsive scaling
const BASE_WIDTH = 428;
const BASE_HEIGHT = 926;
const scale = (size) => (width / BASE_WIDTH) * size;
const verticalScale = (size) => (height / BASE_HEIGHT) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

// Screen size detection
const isSmallScreen = width < 400;
const isMediumScreen = width >= 400 && width < 450;
const isLargeScreen = width >= 450;
const isTablet = width > 768;

// Dynamic snap points based on screen size
const getSnapPoints = () => {
  if (isTablet) {
    return ['25%', '50%', '75%'];
  } else if (isSmallScreen) {
    return ['35%','60%', '70%'];
  } else {
    return ['30%', '70%'];
  }
};

// Category definitions with tailored icons
const categories = [
  { ref: 'Animal', icon: 'paw', color: '#000000' },
  { ref: 'Arts', icon: 'color-palette', color: '#000000' },
  { ref: 'Education', icon: 'school', color: '#000000' },
  { ref: 'Environment', icon: 'leaf', color: '#000000' },
  { ref: 'Family', icon: 'people-circle', color: '#000000' },
  { ref: 'Hospital', icon: 'medkit', color: '#000000' },
  { ref: 'Library', icon: 'library', color: '#000000' },
  { ref: 'Seniors', icon: 'walk', color: '#000000' },
  { ref: 'Tech', icon: 'laptop', color: '#000000' },
];

const CATEGORY_MAP = {};
categories.forEach(c => {
  CATEGORY_MAP[c.ref.toLowerCase()] = { icon: c.icon, color: c.color };
});

// Geocoding function
async function fetchCoordsForAddress(address) {
  if (!address?.trim()) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'NexoLink/1.0' }
    });
    if (Array.isArray(data) && data.length > 0) {
      const { lat, lon } = data[0];
      return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    }
  } catch (err) {
    console.warn('Geocode error:', err);
  }
  return null;
}

export default function MapScreen() {
  const mapRef = useRef(null);
  const sheetRef = useRef(null);
  const { user } = useContext(AuthContext);

  // Dynamic snap points
  const snapPoints = useMemo(() => getSnapPoints(), []);

  // State
  const [sitesWithCoords, setSitesWithCoords] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [geoFailed, setGeoFailed] = useState(false);
  const [homeAddressInput, setHomeAddressInput] = useState('');
  const [showHomeModal, setShowHomeModal] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [is3D, setIs3D] = useState(false);
  const [loadingSites, setLoadingSites] = useState(true);

  // Request location permission and get current location
  const requestLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGeoFailed(true);
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({ 
        accuracy: Location.Accuracy.Highest 
      });
      
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setUserLocation(coords);
      setGeoFailed(false);
      
      // Animate to user location
      if (mapRef.current) {
        mapRef.current.animateCamera({
          center: coords,
          zoom: 14,
          pitch: is3D ? 45 : 0,
          heading: 0,
        });
      }
    } catch (error) {
      console.warn('Location error:', error);
      setGeoFailed(true);
    }
  }, [is3D]);

  // Load volunteer sites from Firestore and geocode them
  const loadVolunteerSites = useCallback(async () => {
    setLoadingSites(true);

    // Try to load from cache first
    try {
      const cachedData = await AsyncStorage.getItem('@nexolink_sites_with_coords');
      const parsedData = JSON.parse(cachedData || '[]');
      if (parsedData.length > 0) {
        setSitesWithCoords(parsedData);
        setLoadingSites(false);
        return;
      }
    } catch (error) {
      console.warn('Cache error:', error);
      await AsyncStorage.removeItem('@nexolink_sites_with_coords');
    }

    // Fetch from Firestore
    let rawSites = [];
    try {
      const snapshot = await getDocs(query(collection(db, 'volunteer_organizations')));
      rawSites = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.title || data.name || 'Volunteer Site',
          address: data.address || '',
          type: (data.type || 'community').toLowerCase(),
          description: data.description || '',
          website: data.website || null,
        };
      });
    } catch (error) {
      console.warn('Firestore error:', error);
    }

    setLoadingSites(false);

    // Geocode each site
    const geocodedSites = [];
    for (const site of rawSites) {
      if (!site.address.trim()) continue;
      
      const coords = await fetchCoordsForAddress(site.address);
      if (coords) {
        const siteWithCoords = { ...site, coords };
        geocodedSites.push(siteWithCoords);
        setSitesWithCoords(prev => [...prev, siteWithCoords]);
      }
      
      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    // Remove duplicates based on coordinates
    const uniqueSites = {};
    geocodedSites.forEach(site => {
      const key = `${site.coords.latitude.toFixed(5)}_${site.coords.longitude.toFixed(5)}`;
      if (!uniqueSites[key]) {
        uniqueSites[key] = site;
      }
    });
    
    const finalSites = Object.values(uniqueSites);
    setSitesWithCoords(finalSites);

    // Cache the results
    try {
      await AsyncStorage.setItem('@nexolink_sites_with_coords', JSON.stringify(finalSites));
    } catch (error) {
      console.warn('Cache save error:', error);
    }
  }, []);

  // Initialize on screen focus
  useFocusEffect(
    useCallback(() => {
      requestLocation();
      loadVolunteerSites();
    }, [requestLocation, loadVolunteerSites])
  );

  // Update camera when 3D mode changes
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

  // Handlers
  const onMarkerPress = useCallback((site) => {
    setSelectedSite(site);
    
    // Animate camera to marker
    if (mapRef.current) {
      mapRef.current.animateCamera({
        center: site.coords,
        zoom: 15,
        pitch: is3D ? 45 : 0,
        heading: 0,
      });
    }
    
    // Open bottom sheet to appropriate size
    if (sheetRef.current) {
      const targetIndex = site.website ? (snapPoints.length - 1) : (snapPoints.length - 2);
      sheetRef.current.snapToIndex(Math.max(0, targetIndex));
    }
  }, [is3D, snapPoints.length]);

  const onCloseSheet = useCallback(() => {
    setSelectedSite(null);
  }, []);

  const onLocatePress = useCallback(() => {
    if (!userLocation || !mapRef.current) return;
    
    mapRef.current.animateCamera({
      center: userLocation,
      zoom: 14,
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
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    
    Linking.openURL(url).catch(console.warn);
  }, [selectedSite]);

  const saveHomeAddress = useCallback(async () => {
    if (!homeAddressInput.trim()) return;
    
    const coords = await fetchCoordsForAddress(homeAddressInput.trim());
    if (coords) {
      setUserLocation(coords);
      setShowHomeModal(false);
      setHomeAddressInput('');
      
      if (mapRef.current) {
        mapRef.current.animateCamera({
          center: coords,
          zoom: 14,
          pitch: is3D ? 45 : 0,
          heading: 0,
        });
      }
    } else {
      Alert.alert('Not Found', 'Could not find that address. Please try again.');
    }
  }, [homeAddressInput, is3D]);



  // Fallback UI when location permission is denied
  if (geoFailed) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>
          Location permission is required to show nearby volunteer opportunities. 
          Please enter your address manually.
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
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={saveHomeAddress}
              />
              <View style={styles.modalButtonRow}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalCancelButton]} 
                  onPress={() => setShowHomeModal(false)}
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
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // Main render
  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        {/* Map */}
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
          {sitesWithCoords.map(site => {
            const category = CATEGORY_MAP[site.type] || { icon: 'location', color: '#000000' };
            return (
              <Marker
                key={site.id}
                coordinate={site.coords}
                onPress={() => onMarkerPress(site)}
              >
                <Ionicons
                  name="location-sharp"
                  size={moderateScale(25)}
                  color={category.color}
                />
              </Marker>
            );
          })}
        </MapView>

        {/* Top Right Controls */}
        <View style={styles.topRightControls}>
          <TouchableOpacity style={styles.controlButton} onPress={onLocatePress}>
            <Ionicons name="locate-outline" size={moderateScale(24)} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={() => setIs3D(prev => !prev)}
          >
            <Text style={styles.toggleText}>{is3D ? '3D' : '2D'}</Text>
          </TouchableOpacity>
        </View>

        {/* Loading Overlay */}
        {loadingSites && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#000000" />
            <Text style={styles.loadingText}>Loading volunteer sites...</Text>
          </View>
        )}

        {/* Bottom Sheet */}
        <BottomSheet
          ref={sheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          onClose={onCloseSheet}
          backgroundStyle={styles.sheetBackground}
          handleStyle={styles.sheetHandle}
          handleIndicatorStyle={styles.sheetHandleIndicator}
        >
          <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
            {selectedSite ? (
              <>
                <Text style={styles.siteTitle}>{selectedSite.name}</Text>
                <Text style={styles.siteType}>
                  {selectedSite.type.charAt(0).toUpperCase() + selectedSite.type.slice(1)} Organization
                </Text>
                <Text style={styles.siteAddress}>{selectedSite.address}</Text>
                {selectedSite.description && (
                  <Text style={styles.siteDescription}>{selectedSite.description}</Text>
                )}

                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.actionButton} onPress={onGetDirections}>
                    <Ionicons name="navigate-outline" size={moderateScale(20)} color="#FFF" />
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
                <Ionicons name="location-outline" size={moderateScale(48)} color="#CCC" />
                <Text style={styles.noSiteText}>Tap a marker to see details</Text>
                <Text style={styles.noSiteSubText}>
                  Explore volunteer opportunities in your area
                </Text>
              </View>
            )}
          </BottomSheetScrollView>
        </BottomSheet>

        {/* Home Address Modal */}
        <Modal
          transparent
          visible={showHomeModal}
          animationType="slide"
          onRequestClose={() => setShowHomeModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
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
            </View>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },



  // Top Right Controls
  topRightControls: {
    position: 'absolute',
    top: verticalScale(50),
    right: scale(20),
    alignItems: 'center',
    zIndex: 10,
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#000',
  },

  // Loading
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(16),
    color: '#000',
    fontWeight: '500',
  },

  // Fallback
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(24),
    backgroundColor: '#F8F9FA',
  },
  fallbackText: {
    textAlign: 'center',
    marginBottom: verticalScale(24),
    fontSize: moderateScale(16),
    color: '#000',
    lineHeight: moderateScale(24),
  },
  fallbackButton: {
    backgroundColor: '#000',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(24),
    borderRadius: moderateScale(8),
  },
  fallbackButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: moderateScale(16),
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(20),
  },
  modalContainer: {
    width: '100%',
    maxWidth: scale(400),
    backgroundColor: '#FFF',
    borderRadius: moderateScale(16),
    padding: scale(24),
  },
  modalTitle: {
    textAlign: 'center',
    fontSize: moderateScale(20),
    fontWeight: '700',
    marginBottom: verticalScale(8),
    color: '#000',
  },
  modalSubtitle: {
    textAlign: 'center',
    fontSize: moderateScale(14),
    color: '#000',
    marginBottom: verticalScale(20),
  },
  modalInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(8),
    padding: scale(16),
    marginBottom: verticalScale(20),
    fontSize: moderateScale(16),
    color: '#000',
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: scale(12),
  },
  modalButton: {
    flex: 1,
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#F5F5F5',
  },
  modalSaveButton: {
    backgroundColor: '#000',
  },
  modalCancelButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: moderateScale(16),
  },
  modalSaveButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: moderateScale(16),
  },

  // Bottom Sheet
  sheetBackground: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  sheetHandle: {
    backgroundColor: 'transparent',
    paddingVertical: verticalScale(8),
  },
  sheetHandleIndicator: {
    backgroundColor: '#E0E0E0',
    width: scale(40),
    height: verticalScale(4),
    borderRadius: moderateScale(2),
  },
  sheetContent: {
    paddingHorizontal: scale(24),
    paddingBottom: verticalScale(32),
  },

  // Site Details
  siteTitle: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    marginBottom: verticalScale(8),
    color: '#000',
    lineHeight: moderateScale(30),
  },
  siteType: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: verticalScale(8),
    color: '#000',
  },
  siteAddress: {
    fontSize: moderateScale(16),
    marginBottom: verticalScale(12),
    color: '#000',
    lineHeight: moderateScale(22),
  },
  siteDescription: {
    fontSize: moderateScale(15),
    marginBottom: verticalScale(20),
    color: '#000',
    lineHeight: moderateScale(22),
  },

  // Buttons
  buttonContainer: {
    gap: verticalScale(12),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(20),
  },
  actionButtonText: {
    marginLeft: scale(8),
    color: '#FFF',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(20),
    borderWidth: 2,
    borderColor: '#000',
  },
  secondaryButtonText: {
    marginLeft: scale(8),
    color: '#000',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },

  // No Site Selected
  noSiteContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(40),
  },
  noSiteText: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#000',
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
  },
  noSiteSubText: {
    fontSize: moderateScale(14),
    color: '#000',
    textAlign: 'center',
  },
});