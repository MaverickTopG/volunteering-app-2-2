// VolunteerCarousel.js

import React, { useEffect, useRef, useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  StatusBar,
  ImageBackground,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../auth/firebase';
import { AuthContext } from '../../auth/AuthContext';

const { width, height } = Dimensions.get('window');

// Simple map from two‐letter state codes to full names
const STATE_MAP = {
  CA: 'California',
  NY: 'New York',
  TX: 'Texas',
  FL: 'Florida',
  WA: 'Washington',
  // add more as needed
};

// Compute status‐bar height (Android vs. iOS)
const STATUS_BAR_HEIGHT =
  Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;
const HEADER_IMAGE_HEIGHT = 200; // Actual image height (excluding status bar)
const TOTAL_HEADER_HEIGHT = HEADER_IMAGE_HEIGHT + STATUS_BAR_HEIGHT;

const BOTTOM_SHEET_HEIGHT = height * 0.77;
const CATEGORY_IMAGES = {
  Animal: require('../../assets/animal.png'),
  Arts:    require('../../assets/art.png'),
  Education: require('../../assets/education.png'),
  Environment: require('../../assets/enviroment.png'),
  Family:  require('../../assets/family.png'),
  Hospital: require('../../assets/hospital.png'),
  Library: require('../../assets/library.png'),
  Seniors: require('../../assets/seniors.png'),
  Tech:    require('../../assets/tech.png'),
};

export default function VolunteerCarousel() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useContext(AuthContext);

  // Retrieve category ("reference") and state code from route params
  const reference = route.params?.category || 'Animal';
  const stateCode = route.params?.stateCode || 'CA';
  const stateName = STATE_MAP[stateCode] || stateCode;

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const animValuesRef = useRef({});

  // Fetch and group all orgs for this category & state
  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const clauses = [
        where('reference', '==', reference),
        where('state', '==', stateName),
      ];
      const q = query(collection(db, 'volunteer_organizations'), ...clauses);
      const snap = await getDocs(q);

      // Group by county name (trimmed), eliminating duplicates
      const byCounty = {};
      snap.forEach((doc) => {
        const data = doc.data();
        const rawCounty = data.county?.trim() || 'Unknown';
        if (!byCounty[rawCounty]) byCounty[rawCounty] = {};
        const key = doc.id || data.title;
        byCounty[rawCounty][key] = data;
      });

      // Convert into sorted array of { title: "X County", data: [ … ] }
      const sortedCounties = Object.keys(byCounty)
        .sort((a, b) => a.localeCompare(b))
        .map((countyKey) => {
          const orgMap = byCounty[countyKey];
          const orgList = Object.keys(orgMap).map((k) => orgMap[k]);
          return {
            title: countyKey + ' County',
            data: orgList,
          };
        });

      setSections(sortedCounties);

      // Initialize animated values for each county section
      sortedCounties.forEach((sec) => {
        if (!animValuesRef.current[sec.title]) {
          animValuesRef.current[sec.title] = new Animated.Value(0);
        }
      });
    } catch (e) {
      console.error('Error fetching organizations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, [reference, stateName]);

  // Toggle expand/collapse of a given county section
  const toggleSection = (title) => {
    const isExpanded = !!expandedSections[title];
    const animV = animValuesRef.current[title];
    if (!animV) return;

    if (isExpanded) {
      Animated.timing(animV, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setExpandedSections((prev) => ({ ...prev, [title]: false }));
      });
    } else {
      setExpandedSections((prev) => ({ ...prev, [title]: true }));
      animV.setValue(0);
      Animated.timing(animV, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };

  // Navigate to LiveOps screen
  const handleLiveOps = () => {
    navigation.navigate('LiveOps');
  };

  // Navigate to DisplayScreen for a given org
  const handleOrgPress = (org) => {
    navigation.navigate('DisplayScreen', { item: org });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
        <Text style={styles.loadingText}>Loading opportunities…</Text>
      </View>
    );
  }

  // Pick header background image based on category, fallback if missing
  const headerBgImage = CATEGORY_IMAGES[reference]

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Full‐width Header Image (behind status bar, no tint) */}
      <ImageBackground
       source={headerBgImage}  
        style={[
          styles.headerImage,
          { width: width, height: TOTAL_HEADER_HEIGHT },
        ]}
        imageStyle={{ resizeMode: 'cover' }}
      >
        <View style={styles.headerOverlay}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            {/* White circle around back arrow */}
            <View style={styles.backCircle}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </View>
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{reference}</Text>
            <Text style={styles.headerState}>{stateName}</Text>
          </View>

          <View style={styles.headerRightPlaceholder} />
        </View>
      </ImageBackground>

      {/* Bottom Sheet: full‐width, elevated above header */}
      <View style={[styles.bottomSheet, { height: BOTTOM_SHEET_HEIGHT }]}>
        <View style={styles.handleBar} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {sections.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🐾</Text>
              <Text style={styles.emptyStateText}>
                No opportunities found
              </Text>
            </View>
          ) : (
            sections.map((section) => {
              const isExpanded = !!expandedSections[section.title];
              const animV = animValuesRef.current[section.title];

              return (
                <View key={section.title} style={styles.countyCard}>
                  {/* County Header */}
                  <TouchableOpacity
                    onPress={() => toggleSection(section.title)}
                    style={styles.countyHeader}
                    activeOpacity={0.8}
                  >
                    <View style={styles.countyInfo}>
                      <Text style={styles.countyName}>
                        {section.title}
                      </Text>
                      <Text style={styles.countyCount}>
                        {section.data.length}{' '}
                        {section.data.length === 1
                          ? 'organization'
                          : 'organizations'}
                      </Text>
                    </View>
                    {/* Dropdown icon */}
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={24}
                      color="#333"
                    />
                  </TouchableOpacity>

                  {/* Expanded organization list */}
                  {isExpanded && (
                    <Animated.View
                      style={[
                        styles.orgsContainer,
                        {
                          opacity: animV,
                          transform: [{ scale: animV }],
                        },
                      ]}
                    >
                      {section.data.map((org, idx) => (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => handleOrgPress(org)}
                          style={styles.organizationItem}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.orgTitle}>{org.title}</Text>
                          <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#AAA"
                          />
                        </TouchableOpacity>
                      ))}
                    </Animated.View>
                  )}
                </View>
              );
            })
          )}

          {/* Live Opportunities Button (black background, white text) */}
          <View style={styles.liveWrap}>
            <TouchableOpacity
              style={styles.liveButton}
              onPress={handleLiveOps}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#000', '#444']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.liveButtonGradient}
              >
                <Text style={styles.liveButtonText}>
                  Live Opportunities
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },

  // Loading Screen
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: RFPercentage(2),
    color: '#333',
  },

  // Header Image + Overlay (covers status bar)
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  headerOverlay: {
    flex: 1,
    marginTop: STATUS_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: HEADER_IMAGE_HEIGHT,
  },
  backButton: {
    padding: 6,
  },
  backCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: RFPercentage(3),
    fontWeight: '800',
    color: '#FFF',
  },
  headerState: {
    fontSize: RFPercentage(1.8),
    color: '#EEE',
    marginTop: 2,
  },
  headerRightPlaceholder: {
    width: 32,
  },

  // Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    zIndex: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#CCC',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 8,
  },

  // ScrollView Container
  scrollView: {
    flex: 1,
    marginTop: TOTAL_HEADER_HEIGHT - HEADER_IMAGE_HEIGHT-30, // push content below header
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120, // extra space so live button isn’t covered
  },

  // Empty State
  emptyState: {
    marginTop: 30,
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: 48,
    color: '#CCC',
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: RFPercentage(2.2),
    color: '#AAA',
  },

  // County Card
  countyCard: {
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECECEC',
    overflow: 'hidden',
  },
  countyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  countyInfo: {
    flex: 1,
  },
  countyName: {
    fontSize: RFPercentage(2.2),
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  countyCount: {
    fontSize: RFPercentage(1.6),
    color: '#777',
  },

  // Expanded Orgs Container
  orgsContainer: {
    paddingTop: 4,
    paddingBottom: 8,
  },
  organizationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    marginBottom: 6,
    borderRadius: 12,
    backgroundColor: '#F7F7F7',
  },
  orgTitle: {
    flex: 1,
    fontSize: RFPercentage(2),
    color: '#444',
  },

  // Live Opportunities
  liveWrap: {
    marginTop: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  liveButton: {
    width: '90%',
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 3,
  },
  liveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  liveButtonText: {
    fontSize: RFPercentage(2.2),
    color: '#FFF',
    fontWeight: '700',
  },
});
