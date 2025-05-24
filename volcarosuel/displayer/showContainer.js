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
const HEADER_HEIGHT = 40;
const ITEM_HEIGHT = 90;

const DEFAULT_PALETTE = ['#FFF6E7', '#FFF0D4', '#FFE8C9', '#333333'];

const VolunteerCarousel = ({ route }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const refParam = route.params?.reference || 'Animal';

  // theming
  const [palette, setPalette] = useState(DEFAULT_PALETTE);
  useEffect(() => {
    if (!user) return;
    const key = `@shop/active-${user.uid}`;
    AsyncStorage.getItem(key)
      .then(id => {
        if (!id) return;
        const pack = themePacks.find(t => t.id === id) || seasonal.find(s => s.id === id);
        if (pack?.colors) {
          const c = pack.colors;
          setPalette([c[0] ?? DEFAULT_PALETTE[0], c[1] ?? DEFAULT_PALETTE[1], c[2] ?? DEFAULT_PALETTE[2], c[3] ?? DEFAULT_PALETTE[3]]);
        }
      })
      .catch(() => {});
  }, [user]);

  // data + sections
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const animValuesRef = useRef({});
  const scrollViewRef = useRef(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'volunteer_organizations'), where('reference', '==', refParam));
        const snap = await getDocs(q);
        const byCounty = {};
        snap.forEach(d => {
          const dta = d.data();
          byCounty[dta.county] = byCounty[dta.county] || [];
          byCounty[dta.county].push(dta);
        });
        const grouped = Object.keys(byCounty).map(title => ({ title, data: byCounty[title] }));
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
    })();
  }, [refParam]);

  // search bubble
  const [isSearchBubbleVisible, setSearchBubbleVisible] = useState(false);
  const bubbleScale = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery] = useState('');
  const counties = sections.map(s => s.title);
  const filteredCounties = counties.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
  const positionsRef = useRef({});
  const HEADER_OFFSET = 140;    

  const toggleSearchBubble = () => {
    if (isSearchBubbleVisible) {
      Animated.timing(bubbleScale, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setSearchBubbleVisible(false));
    } else {
      setSearchBubbleVisible(true);
      Animated.timing(bubbleScale, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
  };

  const handleCountySelect = county => {
    const y = positionsRef.current[county];
    if (y == null) {
      Alert.alert('Not Found', `${county} does not exist.`);
    } else {
      const targetY = Math.max(0, y - HEADER_OFFSET);
      scrollViewRef.current?.scrollTo({y:targetY , animated: true });
    }
    toggleSearchBubble();
  };

  // dropdown toggle
  const toggleSection = county => {
    const isExp = expandedSections[county];
    const animV = animValuesRef.current[county];
    if (!animV) return;
    if (isExp) {
      Animated.timing(animV, { toValue: 0, duration: 300, useNativeDriver: true }).start(() =>
        setExpandedSections(ps => ({ ...ps, [county]: false }))
      );
    } else {
      setExpandedSections(ps => ({ ...ps, [county]: true }));
      animV.setValue(0);
      Animated.timing(animV, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
  };

  const handleLiveOpportunitiesPress = () => navigation.navigate('LiveOps');

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: palette[0] }]}>   
        <ActivityIndicator size="large" color={palette[3]} />
        <Text style={[styles.loadingText, { color: palette[3] }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette[0] }]}>   
      {/* BACK */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 50 }]}
        onPress={() => navigation.goBack()}
      >
        <MaterialIcons name="arrow-back" size={24} color={palette[3]} />
      </TouchableOpacity>

      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: palette[0] }]}>   
        <Text style={[styles.headerText, { color: palette[3] }]}>{refParam}</Text>
        <TouchableOpacity onPress={toggleSearchBubble} style={[ { left:150,top:-25}]}>
          <MaterialIcons name="search" size={24} color={palette[3]} />
        </TouchableOpacity>
      </View>

      {/* SEARCH BUBBLE */}
      {isSearchBubbleVisible && (
        <Animated.View style={[styles.searchBubble, { transform: [{ scale: bubbleScale }], backgroundColor: palette[0] }]}>   
          <View style={styles.bubbleHeader}>
            <Text style={[styles.searchBubbleTitle, { color: palette[3] }]}>Find County</Text>
            <TouchableOpacity onPress={toggleSearchBubble} style={styles.closeButton}>
              <MaterialIcons name="close" size={20} color={palette[3]} />
            </TouchableOpacity>
          </View>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Type county name..."
            placeholderTextColor={palette[3]}
            style={[styles.searchInput, { borderColor: palette[3], color: palette[3] }]}
          />
          <ScrollView contentContainerStyle={styles.countyButtonsContainer}>
            {(filteredCounties.length > 0 ? filteredCounties : ['-- No matches --']).map((c, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleCountySelect(c)}
                style={[styles.countyButton, { borderColor: palette[3] }]}
              >
                <Text style={[styles.countyButtonText, { color: palette[3] }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* SECTIONS */}
<ScrollView
  ref={scrollViewRef}
  contentContainerStyle={styles.scrollViewContent}
>
  {sections.map((section, i) => {
    const isExp = expandedSections[section.title];
    const animV = animValuesRef.current[section.title];

    return (
      // WRAP each section in a View that captures its y-position:
      <View
        key={section.title}
        onLayout={e => {
          positionsRef.current[section.title] = e.nativeEvent.layout.y;
        }}
      >
        <TouchableOpacity
          onPress={() => toggleSection(section.title)}
          style={styles.gradientWrapper}
        >
          <LinearGradient
            colors={[palette[1], palette[2]]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
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
            {section.data.length > 0 ? (
              section.data.map((org, j) => (
                <TouchableOpacity
                  key={j}
                  onPress={() =>
                    navigation.navigate('DisplayScreen', { item: org })
                  }
                  style={styles.cardWrapper}
                >
                  <LinearGradient
                    colors={[palette[1], palette[2]]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
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

        {/* LIVE OPS */}
        <TouchableOpacity style={styles.liveButton} onPress={handleLiveOpportunitiesPress}>
          <LinearGradient
            colors={[palette[1], palette[2]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.liveButtonGradient}
          >
            <Text style={[styles.liveButtonText, { color: palette[3] }]}>Live Opportunities</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VolunteerCarousel;

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

  // Header & Back Button
  header: {
    height: 140, justifyContent: 'center', alignItems: 'center',
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    position: 'absolute', top: 40, left: 0, right: 0, zIndex: 1,
    shadowColor: '#333', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1, shadowRadius: 0,
  },
  headerText: { fontSize: RFPercentage(3), fontWeight: 'bold',marginTop:40 },
  backButton: { marginTop: -17, position: 'absolute', left: 5, padding: 10, zIndex: 100 },
  scrollViewContent: { paddingTop: 140, paddingBottom: 90, paddingHorizontal: 20 },
 


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

  // Organization Card
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

  // Quick-Search Bubble
  searchBubble: {
    position: 'absolute',
    top: 100,
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
    zIndex: 200,
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
    justifyContent: 'space-between',
  },
  countyButtonText: {
    fontSize: RFPercentage(2),
    color: DEFAULT_PALETTE[3],
  },

  // Live Ops Button
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

// Extension FAB styles
const extStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -80,
    left: width * 0.5 - 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: DEFAULT_PALETTE[0],
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: DEFAULT_PALETTE[0],
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Center wrapper for FAB
const fabStyles = StyleSheet.create({
  centerWrapper: {
    position: 'absolute',
    top: -80,
    left: width * 0.5 - 25,
  },
});

