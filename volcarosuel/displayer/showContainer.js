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
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../auth/firebase';
import { AuthContext } from '../../auth/AuthContext';

const { width, height } = Dimensions.get('window');

const getResponsiveValues = () => {
  const screenRatio = width / height;
  const isVerySmallScreen = width < 405;
  const isSmallScreen = width < 410;
  const isMediumScreen = width >= 440 && width < 600;
  const isLargeScreen = width >= 428 && width <= 430; // iPhone 14 Pro Max, 15 Pro Max (6.7")

  return {
    statusBarHeight: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : isVerySmallScreen ? 40 : isMediumScreen ? 20 : 44,
    headerImageHeight:
      isVerySmallScreen ? 160 :
        isMediumScreen ? 250 :
          isLargeScreen ? 190 : 140,
    searchInputHeight: isVerySmallScreen ? 36 : 40,
    searchIconSize: isVerySmallScreen ? 28 : 32,
    bottomSheetHeight: height * (isVerySmallScreen ? 0.78 : 0.77),
    backCircleSize: isVerySmallScreen ? 32 : 36,
    backIconSize: isVerySmallScreen ? 20 : 24,
    borderRadius: isVerySmallScreen ? 20 : 24,
    cardBorderRadius: isVerySmallScreen ? 14 : 16,
    horizontalPadding: isVerySmallScreen ? 12 : 16,
    verticalPadding: isVerySmallScreen ? 16 : 20,
    marginBottom: isVerySmallScreen ? 12 : 16,
    scrollMarginTop: isVerySmallScreen ? 0 : 0,
    paddingBottom: isVerySmallScreen ? 40 : 60,
    handleBarWidth: isVerySmallScreen ? 35 : 40,
  };
};
const responsive = getResponsiveValues();

const STATE_MAP = {
  CA: 'California',
  NY: 'New York',
  TX: 'Texas',
  FL: 'Florida',
  WA: 'Washington',
};

const TOTAL_HEADER_HEIGHT = responsive.headerImageHeight + responsive.statusBarHeight;

const CATEGORY_IMAGES = {
  Animal: require('../../assets/animal.png'),
  "Advocacy & Change": require('../../assets/advocacy.png'),
  Arts: require('../../assets/art.png'),
  Education: require('../../assets/education.png'),
  Environment: require('../../assets/enviroment.png'),
  Family: require('../../assets/family.png'),
  Hospital: require('../../assets/hospital.png'),
  Library: require('../../assets/library.png'),
  Seniors: require('../../assets/seniors.png'),
  Tech: require('../../assets/tech.png'),
};

export default function VolunteerCarousel() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useContext(AuthContext);

  const reference = route.params?.category || 'Animal';
  const stateCode = route.params?.stateCode || 'CA';
  const stateName = STATE_MAP[stateCode] || stateCode;

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const animValuesRef = useRef({});

  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const scrollRef = useRef(null);
  const sectionLayouts = useRef({});

  // Animation values for background movement
  const backgroundAnimX = useRef(new Animated.Value(0)).current;
  const backgroundAnimY = useRef(new Animated.Value(0)).current;
  const backgroundScale = useRef(new Animated.Value(1.2)).current;

  const matchingCounties = sections
    .map((sec) => sec.title)
    .filter((title) =>
      title.toLowerCase().includes(searchText.trim().toLowerCase())
    );

  // Start background animation
  useEffect(() => {
    const startBackgroundAnimation = () => {
      const createRandomAnimation = () => {
        // Calculate safe movement bounds based on scale
        const currentScale = 1.2 + Math.random() * 0.8;
        const scaleFactor = currentScale - 1; // Extra area due to scaling
        const safetyMargin = 20; // Additional safety margin

        // Calculate maximum safe movement (accounting for scale and safety)
        const maxMoveX = (width * scaleFactor * 0.5) - safetyMargin;
        const maxMoveY = (height * scaleFactor * 0.5) - safetyMargin;

        // Ensure minimum movement bounds
        const minMove = 10;
        const finalMaxMoveX = Math.max(minMove, maxMoveX);
        const finalMaxMoveY = Math.max(minMove, maxMoveY);

        const randomX = (Math.random() - 0.5) * 2 * finalMaxMoveX;
        const randomY = (Math.random() - 0.5) * 2 * finalMaxMoveY;
        const randomScale = currentScale;
        const duration = 6000 + Math.random() * 3000;
        Animated.parallel([
          Animated.timing(backgroundAnimX, {
            toValue: randomX,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(backgroundAnimY, {
            toValue: randomY,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(backgroundScale, {
            toValue: randomScale,
            duration: duration,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Start next random animation
          createRandomAnimation();
        });
      };

      createRandomAnimation();
    };

    startBackgroundAnimation();
  }, []);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const clauses = [
        where('reference', '==', reference),
        where('state', '==', stateName),
      ];
      const q = query(collection(db, 'volunteer_organizations'), ...clauses);
      const snap = await getDocs(q);

      const byCounty = {};
      snap.forEach((doc) => {
        const data = doc.data();
        const rawCounty = data.county?.trim() || 'Unknown';
        if (!byCounty[rawCounty]) byCounty[rawCounty] = {};
        const key = doc.id || data.title;
        byCounty[rawCounty][key] = data;
      });

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

  const handleLiveOps = () => {
    navigation.navigate('LiveOps');
  };

  const handleOrgPress = (org) => {
    navigation.navigate('DisplayScreen', { item: org });
  };

  const onSubmitSearch = () => {
    const query = searchText.trim().toLowerCase();
    if (!query) {
      Alert.alert('Enter county name');
      return;
    }
    if (matchingCounties.length > 0) {
      const matchKey = matchingCounties[0];
      const yOffset = sectionLayouts.current[matchKey];
      if (yOffset !== undefined && scrollRef.current) {
        scrollRef.current.scrollTo({ y: yOffset, animated: true });
        setShowSearch(false);
        setSearchText('');
      }
    } else {
      Alert.alert('Not found', 'No matching county section');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
        <Text style={styles.loadingText}>Loading opportunities…</Text>
      </View>
    );
  }

  const headerBgImage = CATEGORY_IMAGES[reference] || CATEGORY_IMAGES.Animal;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ImageBackground
        source={headerBgImage}
        style={[
          styles.headerImage,
          { width: width, height: TOTAL_HEADER_HEIGHT },
        ]}
        imageStyle={{ resizeMode: 'cover' }}
      >
        <View style={styles.headerOverlay}>
          <View style={styles.backCircle}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.8}
            >
              <View style={styles.backCircle}>
              
                  <View style={styles.backCircleContent}>
                    <Ionicons name="chevron-back" size={responsive.searchIconSize} color="#FFFFFF" />
                  </View>
              
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.headerTextContainer}>
            {showSearch ? (
              <>
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search county..."
                    placeholderTextColor="#AAA"
                    value={searchText}
                    onChangeText={setSearchText}
                    onSubmitEditing={onSubmitSearch}
                    returnKeyType="search"
                    autoFocus
                  />
                </View>
                {matchingCounties.length > 0 && searchText.trim() !== '' && (
                  <View style={styles.suggestionsContainer}>
                    {matchingCounties.slice(0, 5).map((title) => (
                      <TouchableOpacity
                        key={title}
                        onPress={() => {
                          const yOffset = sectionLayouts.current[title];
                          if (yOffset !== undefined && scrollRef.current) {
                            scrollRef.current.scrollTo({
                              y: yOffset,
                              animated: true,
                            });
                            setShowSearch(false);
                            setSearchText('');
                          }
                        }}
                        style={styles.suggestionItem}
                      >
                        <Text style={styles.suggestionText}>
                          {title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <>
                <Text style={styles.headerTitle}>{reference}</Text>
                <Text style={styles.headerState}>{stateName}</Text>
              </>
            )}
          </View>

          <TouchableOpacity
            onPress={() => {
              if (showSearch) {
                setShowSearch(false);
                setSearchText('');
              } else {
                setShowSearch(true);
              }
            }}
            style={styles.searchButton}
            activeOpacity={0.8}
          >
            <Ionicons
              name={showSearch ? 'close-outline' : 'search-outline'}
              size={responsive.searchIconSize}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* Bottom Sheet with Animated Blurred Background */}
      <View style={[styles.bottomSheet, { height: responsive.bottomSheetHeight }]}>
        {/* Animated Background Image */}
        <View style={styles.backgroundContainer}>
          <Animated.View
            style={[
              styles.animatedBackground,
              {
                transform: [
                  { translateX: backgroundAnimX },
                  { translateY: backgroundAnimY },
                  { scale: backgroundScale },
                ],
              },
            ]}
          >
            <ImageBackground
              source={headerBgImage}
              style={styles.backgroundImage}
              imageStyle={{ resizeMode: 'cover' }}
            />
          </Animated.View>
        </View>

        {/* Blur Overlay */}
        <BlurView intensity={60} style={styles.blurOverlay}>
          <View style={styles.handleBar} />

          <ScrollView
            ref={scrollRef}
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
                  <View
                    key={section.title}
                    style={styles.countyCard}
                    onLayout={(e) => {
                      sectionLayouts.current[section.title] = e.nativeEvent.layout.y;
                    }}
                  >
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
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={24}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>

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
                            <Text style={styles.orgTitle}>
                              {org.title}
                            </Text>
                            <Ionicons
                              name="chevron-forward"
                              size={20}
                              color="#E1D9D1"
                            />
                          </TouchableOpacity>
                        ))}
                      </Animated.View>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEFEF',
  },

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

  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  headerOverlay: {
    flex: 1,
    marginTop: responsive.statusBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsive.horizontalPadding,
    height: responsive.headerImageHeight,
  },
  backButton: {
    padding: 6,
  },
  backCircle: {
  width: responsive.backCircleSize,
  height: responsive.backCircleSize,
  borderRadius: responsive.backCircleSize / 2,
  overflow: 'hidden',
},
backCircleContent: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.0)',
},
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: responsive.backCircleSize, // Add this line to account for both back and search buttons
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

  searchButton: {
    padding: 6,
  },
  searchContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
  },
  searchInput: {
    height: responsive.searchInputHeight,
    paddingHorizontal: 10,
    fontSize: RFPercentage(1.8),
    color: '#000',
  },
  suggestionsContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 100,
    width: '100%',
  },
  suggestionItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  suggestionText: {
    fontSize: RFPercentage(1.8),
    color: '#333',
  },

  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: responsive.borderRadius,
    borderTopRightRadius: responsive.borderRadius,
    elevation: 8,
    zIndex: 10,
    overflow: 'hidden',
  },

  // New styles for animated background
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  animatedBackground: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  blurOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  handleBar: {
    width: responsive.handleBarWidth,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 8,
  },

  scrollView: {
    flex: 1,
    marginTop: responsive.scrollMarginTop,
  },
  scrollContent: {
    paddingHorizontal: responsive.horizontalPadding,
    paddingBottom: responsive.paddingBottom,
  },

  emptyState: {
    marginTop: 30,
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: 48,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: RFPercentage(2.2),
    color: 'rgba(255, 255, 255, 0.8)',
  },

  countyCard: {
    marginBottom: responsive.marginBottom,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: responsive.cardBorderRadius,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  countyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: responsive.verticalPadding,
    paddingHorizontal: responsive.horizontalPadding,
  },
  countyInfo: {
    flex: 1,
  },
  countyName: {
    fontSize: RFPercentage(2.2),
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  countyCount: {
    fontSize: RFPercentage(1.6),
    color: 'rgba(255, 255, 255, 0.8)',
  },

  orgsContainer: {
    paddingTop: 4,
    paddingBottom: 8,
  },
  organizationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: responsive.horizontalPadding,
    marginHorizontal: 8,
    marginBottom: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  orgTitle: {
    flex: 1,
    fontSize: RFPercentage(2),
    color: '#FFF',
  },

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