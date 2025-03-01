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
  const [expandedCounties, setExpandedCounties] = useState([]);
  const [countyAnims, setCountyAnims] = useState({});
  const [fadeInProgress, setFadeInProgress] = useState({});

  const [isSearchBubbleVisible, setSearchBubbleVisible] = useState(false);
  const bubbleScale = useRef(new Animated.Value(0)).current;

  const scrollViewRef = useRef(null);

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
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [referenceParam]);

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

  const toggleCounty = (countyTitle) => {
    const section = sections.find((s) => s.title === countyTitle);
    if (!section || section.data.length <= 1) return;
    const isCurrentlyExpanded = expandedCounties.includes(countyTitle);
    if (!isCurrentlyExpanded) {
      const animValues = section.data.slice(1).map(() => new Animated.Value(0));
      setCountyAnims((prev) => ({ ...prev, [countyTitle]: animValues }));
      setFadeInProgress((prev) => ({ ...prev, [countyTitle]: 0 }));
      setExpandedCounties((prev) => [...prev, countyTitle]);
      section.data.slice(1).forEach((_, i) => {
        Animated.timing(animValues[i], {
          toValue: 1,
          duration: 1000,
          delay: i * 1000,
          useNativeDriver: true,
        }).start(() => {
          setFadeInProgress((prev) => ({
            ...prev,
            [countyTitle]: i + 1,
          }));
        });
      });
    } else {
      const animValues = countyAnims[countyTitle];
      const progress = fadeInProgress[countyTitle] || 0;
      if (animValues && progress > 0) {
        for (let i = progress; i < animValues.length; i++) {
          animValues[i].stopAnimation(() => {
            animValues[i].setValue(0);
          });
        }
        for (let i = progress - 1; i >= 0; i--) {
          Animated.timing(animValues[i], {
            toValue: 0,
            duration: 1000,
            delay: (progress - 1 - i) * 1000,
            useNativeDriver: true,
          }).start(() => {
            if (i === 0) {
              setExpandedCounties((prev) => prev.filter((c) => c !== countyTitle));
              setFadeInProgress((prev) => ({ ...prev, [countyTitle]: 0 }));
            }
          });
        }
      } else {
        setExpandedCounties((prev) => prev.filter((c) => c !== countyTitle));
      }
    }
  };

  const handleCountySelect = (county) => {
    let offsetY = 0;
    for (let s = 0; s < sections.length; s++) {
      const currentCounty = sections[s].title;
      offsetY += HEADER_HEIGHT;
      if (currentCounty.toLowerCase() === county.toLowerCase()) break;
      const section = sections[s];
      if (section.data.length > 0) {
        if (expandedCounties.includes(currentCounty)) {
          offsetY += section.data.length * ITEM_HEIGHT;
        } else {
          offsetY += ITEM_HEIGHT;
        }
      }
    }
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: offsetY, animated: true });
    }
    toggleSearchBubble();
  };

  const handleBackPress = () => {
    navigation.goBack();
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
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 10 }]}
        onPress={handleBackPress}
      >
        <MaterialIcons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {!isSearchBubbleVisible && (
        <TouchableOpacity
          style={styles.searchIconContainer}
          onPress={toggleSearchBubble}
        >
          <MaterialIcons name="search" size={24} color="#333" />
        </TouchableOpacity>
      )}

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

      <View style={[styles.header, { backgroundColor: '#fff6e7' }]}>
        <Text style={styles.headerText}>{referenceParam}</Text>
      </View>

      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollViewContent}>
        {sections.map((section, sIndex) => {
          const isExpandable = section.data.length > 1;
          const isExpanded = expandedCounties.includes(section.title);
          return (
            <View key={sIndex}>
              <TouchableOpacity
                style={styles.countyHeader}
                onPress={() => {
                  if (isExpandable) toggleCounty(section.title);
                }}
              >
                <Text style={styles.countyHeaderText}>{section.title}</Text>
                {isExpandable && (
                  <MaterialIcons
                    name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={24}
                    color="#333"
                  />
                )}
              </TouchableOpacity>
              {section.data.slice(0, 1).map((orgItem, iIndex) => (
                <TouchableOpacity
                  key={iIndex}
                  style={styles.card}
                  onPress={() => navigation.navigate('DisplayScreen', { item: orgItem })}
                >
                  <Text style={styles.cardTitle}>{orgItem.title}</Text>
                </TouchableOpacity>
              ))}
              {isExpandable && isExpanded && (
                <>
                  {section.data.slice(1).map((orgItem, iIndex) => (
                    <Animated.View
                      key={iIndex}
                      style={{
                        opacity: countyAnims[section.title]
                          ? countyAnims[section.title][iIndex]
                          : 1,
                      }}
                    >
                      <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate('DisplayScreen', { item: orgItem })}
                      >
                        <Text style={styles.cardTitle}>{orgItem.title}</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </>
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
  countyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    marginVertical: 10,
    paddingVertical: 5,
  },
  countyHeaderText: {
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
    color: '#333',
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
