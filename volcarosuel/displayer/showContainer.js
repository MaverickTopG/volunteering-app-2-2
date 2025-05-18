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

const DEFAULT_PALETTE = [
  '#FFF6E7', // bg
  '#FFF0D4', // gradient start
  '#FFE8C9', // gradient end
  '#333333'  // text/icon
];

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
      .catch(() => { });
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
        const grouped = Object.keys(byCounty).map(title => ({
          title, data: byCounty[title]
        }));
        setSections(grouped);
        grouped.forEach(s => {
          if (!animValuesRef.current[s.title]) {
            animValuesRef.current[s.title] = new Animated.Value(0);
          }
        });
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    })();
  }, [refParam]);

  // quick-search bubble
  const [isSearchBubbleVisible, setSearchBubbleVisible] = useState(false);
  const bubbleScale = useRef(new Animated.Value(0)).current;
  const toggleSearchBubble = () => {
    if (isSearchBubbleVisible) {
      Animated.timing(bubbleScale, { toValue: 0, duration: 200, useNativeDriver: true })
        .start(() => setSearchBubbleVisible(false));
    } else {
      setSearchBubbleVisible(true);
      Animated.timing(bubbleScale, { toValue: 1, duration: 200, useNativeDriver: true })
        .start();
    }
  };
  const handleCountySelect = (county) => {
    let offsetY = 0;
    for (let i = 0; i < sections.length; i++) {
      offsetY += HEADER_HEIGHT;
      if (sections[i].title === county) break;
      offsetY += sections[i].data.length * ITEM_HEIGHT;
    }
    scrollViewRef.current?.scrollTo({ y: offsetY, animated: true });
    toggleSearchBubble();
  };

  // dropdown toggle
  const toggleSection = (county) => {
    const isExp = expandedSections[county];
    const animV = animValuesRef.current[county];
    if (!animV) return;
    if (isExp) {
      Animated.timing(animV, { toValue: 0, duration: 300, useNativeDriver: true })
        .start(() => setExpandedSections(ps => ({ ...ps, [county]: false })));
    } else {
      setExpandedSections(ps => ({ ...ps, [county]: true }));
      animV.setValue(0);
      Animated.timing(animV, { toValue: 1, duration: 300, useNativeDriver: true })
        .start();
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

  const counties = sections.map(s => s.title);

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
      </View>

      {/* SECTIONS */}
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollViewContent}>
        {sections.map((section, i) => {
          const isExp = expandedSections[section.title];
          const animV = animValuesRef.current[section.title];
          return (
            <View key={i}>
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
                  {section.data.length > 0 ? section.data.map((org, j) => (
                    <TouchableOpacity
                      key={j}
                      onPress={() => navigation.navigate('DisplayScreen', { item: org })}
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
                  )) : (
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
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
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
};

export default VolunteerCarousel;

/* — all your original styles unchanged — */
const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center'
  },
  loadingText: { marginTop: 10, fontSize: 18 },
  header: {
    height: 140, justifyContent: 'center', alignItems: 'center',
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    position: 'absolute', top: 50, left: 0, right: 0, zIndex: 1,
    shadowColor: '#333', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1, shadowRadius: 0
  },
  headerText: { fontSize: RFPercentage(3), fontWeight: 'bold',marginTop:10 },
  backButton: { marginTop: -10, position: 'absolute', left: 5, padding: 10, zIndex: 100 },
  scrollViewContent: { paddingTop: 140, paddingBottom: 90, paddingHorizontal: 20 },
  countyHeaderText: { fontSize: RFPercentage(2.5), fontWeight: 'bold' },
  gradientWrapper: { marginVertical: 10 },
  dropdownHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 15, paddingHorizontal: 15, borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 5, elevation: 3
  },
  cardWrapper: { alignSelf: 'center', marginVertical: 8 },
  card: {
    width: width * 0.9, borderRadius: 15, padding: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, shadowRadius: 5, elevation: 3
  },
  cardTitle: { fontSize: RFPercentage(2), textAlign: 'center' },
  comingSoonContainer: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  comingSoonText: { fontSize: RFPercentage(2.2) },
  searchIconContainer: {
    position: 'absolute', top: 30, right: 20, zIndex: 110,
    borderRadius: 20, padding: 8
  },
  searchBubble: {
    position: 'absolute', top: 70, alignSelf: 'center',
    width: width * 0.85, borderRadius: 20,
    paddingVertical: 16, paddingHorizontal: 12, zIndex: 200,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 10
  },
  bubbleHeader: {
    width: '100%', alignItems: 'center', justifyContent: 'center',
    marginBottom: 10, position: 'relative'
  },
  searchBubbleTitle: { fontSize: RFPercentage(2.2), textAlign: 'center' },
  closeButton: { position: 'absolute', right: 0, top: 0, padding: 4 },
  countyButtonsContainer: { flexDirection: 'column', alignItems: 'center', width: '100%' },
  countyButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginVertical: 10, paddingVertical: 15, paddingHorizontal: 20,
    borderRadius: 20, borderWidth: 1, width: '100%'
  },
  countyButtonText: { fontSize: RFPercentage(1.8), textAlign: 'center' },
  liveButton: { marginVertical: 20, alignSelf: 'center', width: width * 0.9 },
  liveButtonGradient: {
    borderRadius: 15, padding: 15, alignItems: 'center', justifyContent: 'center'
  },
  liveButtonText: { fontSize: RFPercentage(2), textAlign: 'center' }
});
