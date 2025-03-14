import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ---- Firebase modules ----
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// ---- Firebase Config ----
const firebaseConfig = {
  apiKey: "AIzaSyC1kY4dlbg9v38ZkuYVPJGnSulMEouvw58",
  authDomain: "nexolink-b8eb5.firebaseapp.com",
  projectId: "nexolink-b8eb5",
  storageBucket: "nexolink-b8eb5.appspot.com",
  messagingSenderId: "247675121621",
  appId: "1:247675121621:web:98772b2e0cfbe8a381175c"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper: Group data by county
const groupByCounty = (data) => {
  const counties = {};
  data.forEach((item) => {
    if (!counties[item.county]) {
      counties[item.county] = [];
    }
    counties[item.county].push(item);
  });
  return Object.keys(counties).map((county) => ({
    title: county,
    data: counties[county],
  }));
};

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 40;
const ITEM_HEIGHT = 90;

const VolunteerCarousel = ({ route }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const referenceParam = route.params?.reference || 'Animal';

  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);
  // Track expanded state for each county
  const [expandedSections, setExpandedSections] = useState({});
  // Animated values for each county dropdown
  const animValuesRef = useRef({});

  const scrollViewRef = useRef(null);

  // Quick Search Bubble state & animation
  const [isSearchBubbleVisible, setSearchBubbleVisible] = useState(false);
  const bubbleScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'volunteer_organizations'),
          where('reference', '==', referenceParam)
        );
        const querySnapshot = await getDocs(q);
        const results = [];
        querySnapshot.forEach((docSnap) => {
          results.push(docSnap.data());
        });
        const grouped = groupByCounty(results);
        setSections(grouped);
        // Initialize animated values for each county if not already set
        grouped.forEach(section => {
          if (!animValuesRef.current[section.title]) {
            animValuesRef.current[section.title] = new Animated.Value(0);
          }
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [referenceParam]);

  // Build flattened data for Quick Search scrolling
  const flatData = useMemo(() => {
    const newFlat = [];
    sections.forEach((section, sectionIndex) => {
      newFlat.push({
        type: 'header',
        title: section.title,
        sectionIndex,
      });
      section.data.forEach((item, itemIndex) => {
        newFlat.push({
          type: 'item',
          sectionIndex,
          itemIndex,
          title: item.title,
        });
      });
    });
    return newFlat;
  }, [sections]);

  const toggleSearchBubble = () => {
    if (isSearchBubbleVisible) {
      Animated.timing(bubbleScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setSearchBubbleVisible(false));
    } else {
      setSearchBubbleVisible(true);
      Animated.timing(bubbleScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  // Quick Search: scroll to county header
  const handleCountySelect = (county) => {
    let offsetY = 0;
    for (let s = 0; s < sections.length; s++) {
      const currentCounty = sections[s].title;
      offsetY += HEADER_HEIGHT;
      if (currentCounty.toLowerCase() === county.toLowerCase()) break;
      const section = sections[s];
      offsetY += section.data.length * ITEM_HEIGHT;
    }
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: offsetY, animated: true });
    }
    toggleSearchBubble();
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  // Toggle dropdown with fade animation
  const toggleSection = (county) => {
    const isExpanded = expandedSections[county];
    const animValue = animValuesRef.current[county];
    if (!animValue) return;

    if (isExpanded) {
      // Animate fade out from current opacity to 0
      Animated.timing(animValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setExpandedSections(prev => ({ ...prev, [county]: false }));
      });
    } else {
      // Set expanded state immediately and animate fade in from 0 to 1
      setExpandedSections(prev => ({ ...prev, [county]: true }));
      animValue.setValue(0);
      Animated.timing(animValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
        <Text>Loading...</Text>
      </View>
    );
  }

  const availableCounties = sections.map((section) => section.title);

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 10 }]}
        onPress={handleBackPress}
      >
        <MaterialIcons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Search Icon (if bubble not visible) */}
      {!isSearchBubbleVisible && (
        <TouchableOpacity
          style={styles.searchIconContainer}
          onPress={toggleSearchBubble}
        >
          <MaterialIcons name="search" size={24} color="#333" />
        </TouchableOpacity>
      )}

      {/* Quick Search Bubble */}
      {isSearchBubbleVisible && (
        <Animated.View
          style={[
            styles.searchBubble,
            {
              transform: [{ scale: bubbleScale }],
              opacity: bubbleScale.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
          ]}
        >
          <View style={styles.bubbleHeader}>
            <Text style={styles.searchBubbleTitle}>Quick Search</Text>
            <TouchableOpacity onPress={toggleSearchBubble} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <View style={styles.countyButtonsContainer}>
            {availableCounties.map((county) => (
              <TouchableOpacity
                key={county}
                style={styles.countyButton}
                onPress={() => handleCountySelect(county)}
              >
                <Text style={styles.countyButtonText}>{county}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#fff6e7' }]}>
        <Text style={styles.headerText}>{referenceParam}</Text>
      </View>

      {/* Main Collapsible List */}
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollViewContent}>
        {sections.map((section, sIndex) => {
          const isExpanded = expandedSections[section.title];
          const animValue = animValuesRef.current[section.title];
          return (
            <View key={sIndex}>
              <TouchableOpacity
                style={styles.dropdownHeader}
                onPress={() => toggleSection(section.title)}
              >
                <Text style={styles.countyHeaderText}>{section.title}</Text>
                <MaterialIcons 
                  name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                  size={24} 
                  color="#333" 
                />
              </TouchableOpacity>
              {isExpanded && (
                <Animated.View style={{ opacity: animValue }}>
                  {section.data && section.data.length > 0 ? (
                    section.data.map((orgItem, iIndex) => (
                      <TouchableOpacity
                        key={iIndex}
                        style={styles.card}
                        onPress={() => navigation.navigate('DisplayScreen', { item: orgItem })}
                      >
                        <Text style={styles.cardTitle}>{orgItem.title}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.comingSoonContainer}>
                      <Text style={styles.comingSoonText}>Coming Soon!</Text>
                    </View>
                  )}
                </Animated.View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default VolunteerCarousel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff6e7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    shadowColor: '#333333',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  headerText: {
    fontSize: RFPercentage(3),
    fontWeight: 'bold',
    color: '#333333',
  },
  backButton: {
    marginTop: -85,
    position: 'absolute',
    left: 5,
    padding: 10,
    zIndex: 100,
  },
  scrollViewContent: {
    paddingTop: 120,
    paddingBottom: 90,
    paddingHorizontal: 20,
  },
  countyHeaderText: {
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
    color: '#333',
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff6e7',
    borderRadius: 15,
    // Removed outline (borderWidth and borderColor)
    marginVertical: 10,
  },
  card: {
    width: width * 0.9,
    backgroundColor: '#fff6e7',
    borderRadius: 15,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    marginVertical: 10,
    padding: 15,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: RFPercentage(2),
    color: '#333333',
    textAlign: 'center',
  },
  comingSoonContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: RFPercentage(2.2),
    color: '#000',
  },
  searchIconContainer: {
    position: 'absolute',
    top: 30,
    right: 20,
    zIndex: 110,
    backgroundColor: '#fff6e7',
    borderRadius: 20,
    padding: 8,
  },
  searchBubble: {
    position: 'absolute',
    top: 70,
    alignSelf: 'center',
    width: width * 0.85,
    backgroundColor: '#fff6e7',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    zIndex: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  bubbleHeader: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  searchBubbleTitle: {
    fontSize: RFPercentage(2.2),
    color: '#333',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 4,
  },
  countyButtonsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  countyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#fff6e7',
    width: '100%',
  },
  countyButtonText: {
    fontSize: RFPercentage(1.8),
    color: '#333',
    textAlign: 'center',
  },
});
