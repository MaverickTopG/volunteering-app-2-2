// VolunteerCarousel.js
import React, { useEffect, useRef, useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Animated,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../auth/firebase';
import { AuthContext } from '../../auth/AuthContext';
import { themePacks, seasonal } from '../screens/shop';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 140;
const ITEM_HEIGHT = 90;
const DEFAULT_PALETTE = ['#FFF6E7', '#FFF0D4', '#FFE8C9', '#333333'];

// State code ⇆ full name
const STATE_MAP = {
  CA: 'California',
  NY: 'New York',
  TX: 'Texas',
  FL: 'Florida',
  WA: 'Washington',
};
const STATE_CODES = Object.keys(STATE_MAP);

export default function VolunteerCarousel({ route }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const refParam = route.params?.reference || 'Animal';

  // theming
  const [palette, setPalette] = useState(DEFAULT_PALETTE);
  useEffect(() => {
    if (!user) return;
    AsyncStorage.getItem(`@shop/active-${user.uid}`)
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
      .catch(() => {});
  }, [user]);

  // state‐filter
  const [selectedStateCode, setSelectedStateCode] = useState(null);
  const [isStateBubbleVisible, setStateBubbleVisible] = useState(false);
  const stateBubbleScale = useRef(new Animated.Value(0)).current;

  // county‐search
  const [isSearchBubbleVisible, setSearchBubbleVisible] = useState(false);
  const bubbleScale = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery] = useState('');

  // data
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const animValuesRef = useRef({});
  const scrollViewRef = useRef(null);
  const positionsRef = useRef({});

  // toggle bubbles
  const toggleStateBubble = () => {
    if (isStateBubbleVisible) {
      Animated.timing(stateBubbleScale, { toValue: 0, duration: 200, useNativeDriver: true })
        .start(() => setStateBubbleVisible(false));
    } else {
      setStateBubbleVisible(true);
      Animated.timing(stateBubbleScale, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
  };
  const toggleSearchBubble = () => {
    if (isSearchBubbleVisible) {
      Animated.timing(bubbleScale, { toValue: 0, duration: 200, useNativeDriver: true })
        .start(() => setSearchBubbleVisible(false));
    } else {
      setSearchBubbleVisible(true);
      Animated.timing(bubbleScale, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
  };

  // fetch & group
  const fetchOrgs = async (stateName = null) => {
    setLoading(true);
    try {
      const clauses = [where('reference', '==', refParam)];
      if (stateName) clauses.push(where('state', '==', stateName));
      const q = query(collection(db, 'volunteer_organizations'), ...clauses);
      const snap = await getDocs(q);
      const byCounty = {};
      snap.forEach(d => {
        const data = d.data();
        const cnt = data.county || 'Unknown';
        byCounty[cnt] = byCounty[cnt] || [];
        byCounty[cnt].push(data);
      });
      // sort county titles alphabetically
      const titles = Object.keys(byCounty).sort((a,b) => a.localeCompare(b));
      const grouped = titles.map(title => ({ title, data: byCounty[title] }));
      setSections(grouped);
      grouped.forEach(s => {
        if (!animValuesRef.current[s.title]) {
          animValuesRef.current[s.title] = new Animated.Value(0);
        }
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const stateName = selectedStateCode ? STATE_MAP[selectedStateCode] : null;
    fetchOrgs(stateName);
  }, [refParam, selectedStateCode]);

  // expand/collapse
  const toggleSection = title => {
    const isExp = !!expandedSections[title];
    const animV = animValuesRef.current[title];
    if (!animV) return;
    if (isExp) {
      Animated.timing(animV, { toValue: 0, duration: 300, useNativeDriver: true })
        .start(() => setExpandedSections(ps => ({ ...ps, [title]: false })));
    } else {
      setExpandedSections(ps => ({ ...ps, [title]: true }));
      animV.setValue(0);
      Animated.timing(animV, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
  };

  // jump to county
  const handleCountySelect = county => {
    const y = positionsRef.current[county];
    if (y == null) {
      Alert.alert('Not Found', `${county} not found`);
    } else {
      scrollViewRef.current?.scrollTo({ y: y - HEADER_HEIGHT, animated: true });
    }
    toggleSearchBubble();
  };

  // Live Ops
  const handleLiveOps = () => navigation.navigate('LiveOps');

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: palette[0] }]}>
        <ActivityIndicator size="large" color={palette[3]} />
        <Text style={[styles.loadingText, { color: palette[3] }]}>Loading…</Text>
      </View>
    );
  }

  const counties = sections.map(s => s.title);
  const filteredCounties = counties.filter(c =>
    c.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette[0] }]}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: palette[0],bottom:-30 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={palette[3]} />
          </TouchableOpacity>

          <View style={styles.titleAndState}>
            <Text style={[styles.headerText, { color: palette[3] }]}>
              {refParam}
            </Text>
            <TouchableOpacity
              onPress={toggleStateBubble}
              style={[styles.stateButton, { borderColor: palette[3] }]}
            >
              <Text style={[styles.stateButtonText, { color: palette[3] }]}>
                {selectedStateCode || 'All'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={toggleSearchBubble}>
            <MaterialIcons name="search" size={24} color={palette[3]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* STATE BUBBLE */}
      {isStateBubbleVisible && (
        <Animated.View
          style={[
            styles.searchBubble,
            {
              backgroundColor: palette[0],
              transform: [{ scale: stateBubbleScale }],
            },
          ]}
        >
          <View style={styles.bubbleHeader}>
            <Text style={[styles.searchBubbleTitle, { color: palette[3] }]}>
              Select State
            </Text>
            <TouchableOpacity onPress={toggleStateBubble} style={styles.closeButton}>
              <MaterialIcons name="close" size={20} color={palette[3]} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.countyButtonsContainer}>
            {STATE_CODES.map(code => (
              <TouchableOpacity
                key={code}
                onPress={() => {
                  setSelectedStateCode(code);
                  toggleStateBubble();
                }}
                style={[styles.countyButton, { borderColor: palette[3], marginBottom: 8 }]}
              >
                <Text style={[styles.countyButtonText, { color: palette[3] }]}>
                  {code}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* COUNTY BUBBLE */}
      {isSearchBubbleVisible && (
        <Animated.View
          style={[
            styles.searchBubble,
            {
              backgroundColor: palette[0],
              transform: [{ scale: bubbleScale }],
            },
          ]}
        >
          <View style={styles.bubbleHeader}>
            <Text style={[styles.searchBubbleTitle, { color: palette[3] }]}>
              Find County
            </Text>
            <TouchableOpacity onPress={toggleSearchBubble} style={styles.closeButton}>
              <MaterialIcons name="close" size={20} color={palette[3]} />
            </TouchableOpacity>
          </View>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Type county…"
            placeholderTextColor={palette[3]}
            style={[styles.searchInput, { borderColor: palette[3], color: palette[3] }]}
          />
          <ScrollView contentContainerStyle={styles.countyButtonsContainer}>
            {(filteredCounties.length ? filteredCounties : ['-- no matches --']).map((c,i) => (
              <TouchableOpacity
                key={i}
                onPress={() => handleCountySelect(c)}
                style={[styles.countyButton, { borderColor: palette[3] }]}
              >
                <Text style={[styles.countyButtonText, { color: palette[3] }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* LIST */}
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollViewContent}>
        {sections.map(section => {
          const isExp = !!expandedSections[section.title];
          const animV = animValuesRef.current[section.title];
          return (
            <View
              key={section.title}
              onLayout={e => {
                positionsRef.current[section.title] = e.nativeEvent.layout.y;
              }}
            >
              <TouchableOpacity onPress={() => toggleSection(section.title)} style={styles.gradientWrapper}>
                <LinearGradient
                  colors={[palette[1], palette[2]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.dropdownHeader}
                >
                  <Text style={[styles.countyHeaderText, { color: palette[3] }]}>
                    {section.title}
                  </Text>
                  <MaterialIcons
                    name={isExp ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={24}
                    color={palette[3]}
                  />
                </LinearGradient>
              </TouchableOpacity>

              {isExp && (
                <Animated.View style={{ opacity: animV }}>
                  {section.data.length ? (
                    section.data.map((org,j) => (
                      <TouchableOpacity
                        key={j}
                        onPress={() => navigation.navigate('DisplayScreen',{item:org})}
                        style={styles.cardWrapper}
                      >
                        <LinearGradient
                          colors={[palette[1], palette[2]]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.card}
                        >
                          <Text style={[styles.cardTitle, { color: palette[3] }]}>
                            {org.title}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.comingSoonContainer}>
                      <Text style={[styles.comingSoonText, { color: palette[3] }]}>
                        Coming Soon!
                      </Text>
                    </View>
                  )}
                </Animated.View>
              )}
            </View>
          );
        })}

        <TouchableOpacity style={styles.liveButton} onPress={handleLiveOps}>
          <LinearGradient
            colors={[palette[1], palette[2]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.liveButtonGradient}
          >
            <Text style={[styles.liveButtonText, { color: palette[3] }]}>
              Live Opportunities
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Container & Loading
  container: {
    flex: 1,
    backgroundColor: DEFAULT_PALETTE[0],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DEFAULT_PALETTE[0],
  },
  loadingText: {
    marginTop: 12,
    fontSize: RFPercentage(2.2),
    color: DEFAULT_PALETTE[3],
  },

  // Header & curved background
  header: {
    position: 'absolute',
    top: insets => insets.top,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT+50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 0,
    zIndex: 10,
    
  },

  // row inside header
  headerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  backButton: {
    padding: 8,
  },

  titleAndState: {
    flexDirection: 'row',
    alignItems: 'center',
    bottom:-25,
    left:0
  },
  headerText: {
    fontSize: RFPercentage(3),
    fontWeight: '700',
  },
  stateButton: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  stateButtonText: {
    fontWeight: '600',
  },

  // Scroll content offset below header
  scrollViewContent: {
    paddingTop: HEADER_HEIGHT + 10,
    paddingBottom: 90,
    paddingHorizontal: 20,
  },

  // Section Dropdown
  gradientWrapper: {
    marginVertical: 8,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
  },
  countyHeaderText: {
    fontSize: RFPercentage(2.4),
    fontWeight: '600',
    color: DEFAULT_PALETTE[3],
  },

  // Cards
  cardWrapper: {
    alignSelf: 'center',
    marginVertical: 6,
    width: width * 0.9,
  },
  card: {
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: RFPercentage(2),
    fontWeight: '500',
    textAlign: 'center',
    color: DEFAULT_PALETTE[3],
  },
  comingSoonContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: RFPercentage(2.2),
    color: DEFAULT_PALETTE[3],
  },

  // Search bubbles
  searchBubble: {
    position: 'absolute',
    top: HEADER_HEIGHT - 20,
    left: 20,
    right: 20,
    backgroundColor: DEFAULT_PALETTE[0],
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 20,
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchBubbleTitle: {
    flex: 1,
    fontSize: RFPercentage(2.4),
    fontWeight: '600',
    color: DEFAULT_PALETTE[3],
  },
  closeButton: {
    padding: 4,
  },
  searchInput: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DEFAULT_PALETTE[2],
    fontSize: RFPercentage(2),
    color: DEFAULT_PALETTE[3],
    marginBottom: 16,
  },
  countyButtonsContainer: {
    maxHeight: 200,
  },
  countyButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DEFAULT_PALETTE[2],
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countyButtonText: {
    fontSize: RFPercentage(2),
    color: DEFAULT_PALETTE[3],
  },

  // Live Ops
  liveButton: {
    marginTop: 20,
    alignSelf: 'center',
    width: width * 0.9,
  },
  liveButtonGradient: {
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
  },
  liveButtonText: {
    fontSize: RFPercentage(2),
    fontWeight: '600',
    color: DEFAULT_PALETTE[3],
  },
});
