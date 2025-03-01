import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  SectionList,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ---- Import Firebase modules (v9+ Modular syntax) ----
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// ---- Firebase Config & Initialization ----
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
// Define fixed heights (adjust as needed)
const HEADER_HEIGHT = 40;
const ITEM_HEIGHT = 90;

const VolunteerCarousel = ({ route }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const referenceParam = route.params?.reference || 'Animal';

  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);

  // Quick Search bubble state and animation
  const [isSearchBubbleVisible, setSearchBubbleVisible] = useState(false);
  const bubbleScale = useRef(new Animated.Value(0)).current;

  // FlatList ref for scrolling (if using flatten approach) or SectionList ref
  const listRef = useRef(null);

  // Fetch data from Firestore
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

  // Compute flattened data from sections for scrolling via scrollToIndex
  const flatData = useMemo(() => {
    const flat = [];
    sections.forEach((section, sectionIndex) => {
      flat.push({ type: 'header', title: section.title, sectionIndex });
      section.data.forEach((item, itemIndex) => {
        flat.push({ type: 'item', item, sectionIndex, itemIndex });
      });
    });
    return flat;
  }, [sections]);

  // Toggle Quick Search bubble with animation
  const toggleSearchBubble = () => {
    if (isSearchBubbleVisible) {
      Animated.timing(bubbleScale, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setSearchBubbleVisible(false));
    } else {
      setSearchBubbleVisible(true);
      Animated.timing(bubbleScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  // When a county is tapped, find its header index in flatData and scroll there.
  const handleCountySelect = (county) => {
    const targetIndex = flatData.findIndex(
      (item) => item.type === 'header' && item.title.toLowerCase() === county.toLowerCase()
    );
    console.log('Selected county:', county, 'FlatList index:', targetIndex);
    if (targetIndex >= 0 && listRef.current) {
      listRef.current.scrollToIndex({
        index: targetIndex,
        animated: true,
        viewPosition: 0,
      });
    } else {
      console.warn('Header not found for county:', county);
    }
    toggleSearchBubble();
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  // getItemLayout for FlatList based on fixed heights
  const getItemLayout = (data, index) => {
    const item = data[index];
    const length = item.type === 'header' ? HEADER_HEIGHT : ITEM_HEIGHT;
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += data[i].type === 'header' ? HEADER_HEIGHT : ITEM_HEIGHT;
    }
    return { length, offset, index };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
        <Text>Loading...</Text>
      </View>
    );
  }

  // Render function for FlatList items (flattened approach)
  const renderFlatItem = ({ item }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>{item.title}</Text>
        </View>
      );
    } else {
      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('DisplayScreen', { item: item.item })}
        >
          <Text style={styles.cardTitle}>{item.item.title}</Text>
        </TouchableOpacity>
      );
    }
  };

  // For Quick Search bubble, list available counties
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

      {/* Render Search Icon only when bubble is not active */}
      {!isSearchBubbleVisible && (
        <TouchableOpacity
          style={styles.searchIconContainer}
          onPress={toggleSearchBubble}
        >
          <MaterialIcons name="search" size={24} color="#333" />
        </TouchableOpacity>
      )}

      {/* Quick Search Bubble at Top Center */}
      {isSearchBubbleVisible && (
        <Animated.View
          style={[
            styles.searchBubble,
            { transform: [{ scale: bubbleScale }] },
          ]}
        >
          <View style={styles.bubbleHeader}>
            <Text style={styles.searchBubbleTitle}>Quick Search</Text>
            <TouchableOpacity onPress={toggleSearchBubble} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color='black' />
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

      {/* FlatList displays flattened data */}
      <FlatList
        ref={listRef}
        data={flatData}
        keyExtractor={(_, index) => String(index)}
        renderItem={renderFlatItem}
        getItemLayout={getItemLayout}
        initialNumToRender={20}
        contentContainerStyle={styles.scrollViewContent}
      />
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
  },
  sectionHeader: {
    height: HEADER_HEIGHT,
    backgroundColor: '#fff6e7',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sectionHeaderText: {
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
    color: '#333333',
  },
  card: {
    width: width * 0.9,
    backgroundColor: '#fff6e7',
    borderRadius: 15,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    marginVertical: 15,
    padding: 15,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: RFPercentage(2),
    color: '#333333',
    textAlign: 'center',
  },
  // --- Search Icon Style ---
  searchIconContainer: {
    position: 'absolute',
    top: 30,
    right: 20,
    zIndex: 110,
    backgroundColor: '#fff6e7',
    borderRadius: 20,
    padding: 8,
  },
  // --- Quick Search Bubble Styles ---
  searchBubble: {
    position: 'absolute',
    top: 70,
    alignSelf: 'center',
    width: width * 0.85, // Dynamic bubble width
    backgroundColor: '#fff6e7',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    zIndex: 200,
    // Prominent shadow:
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
