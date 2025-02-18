import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  SafeAreaView,
  SectionList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { MaterialIcons } from '@expo/vector-icons';
import { TapGestureHandler } from 'react-native-gesture-handler';
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

const VolunteerCarousel = ({ route }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Get the reference from route.params (default to "Animal" if not passed)
  const referenceParam = route.params?.reference || 'Animal';

  // States for Firestore data & loading
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);

  // Search states/refs (optional; you can remove if not needed)
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const listRef = useRef(null);
  const searchBarTimer = useRef(null);

  // Fetch data from Firestore filtering by the passed reference id
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

  // Optional: Toggle search bar (if you want to re-enable search later)
  useEffect(() => {
    if (searchVisible) {
      searchBarTimer.current = setTimeout(() => {
        setSearchVisible(false);
        setSearchQuery('');
      }, 10000);
    }
    return () => clearTimeout(searchBarTimer.current);
  }, [searchVisible]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const sectionIndex = sections.findIndex((section) =>
      section.title.toLowerCase().includes(query.toLowerCase())
    );
    if (sectionIndex >= 0 && listRef.current) {
      listRef.current.scrollToLocation({
        sectionIndex,
        itemIndex: 0,
        viewOffset: 100,
      });
    }
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

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('DisplayScreen', { item })}
    >
      <Text style={styles.cardTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <TapGestureHandler
      numberOfTaps={2}
      onActivated={() => setSearchVisible(!searchVisible)}
    >
      <SafeAreaView style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + 10 }]}
          onPress={handleBackPress}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        {/* Optional Search Bar */}
        {searchVisible && (
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              placeholder="Search by county..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={handleSearch}
              style={styles.searchInput}
            />
          </View>
        )}

        {/* Header displays the passed reference (e.g., Library, Animal, etc.) */}
        <View style={[styles.header, { backgroundColor: '#fff6e7' }]}>
          <Text style={styles.headerText}>{referenceParam}</Text>
        </View>

        {/* SectionList displays organizations grouped by county */}
        <SectionList
          ref={listRef}
          sections={sections}
          keyExtractor={(item, index) => item.title + index}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
          contentContainerStyle={styles.scrollViewContent}
          stickySectionHeadersEnabled
        />
      </SafeAreaView>
    </TapGestureHandler>
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
  backButton: {
    marginTop: -85,
    position: 'absolute',
    left: 5,
    padding: 10,
    zIndex: 100,
  },
  headerText: {
    fontSize: RFPercentage(3),
    fontWeight: 'bold',
    color: '#333333',
  },
  scrollViewContent: {
    paddingTop: 120,
    paddingBottom: 90,
  },
  sectionHeader: {
    backgroundColor: '#fff6e7',
    paddingVertical: 10,
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
  },
  cardTitle: {
    fontSize: RFPercentage(2),
    color: '#333333',
    textAlign: 'center',
  },
  searchBar: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    height: 50,
    backgroundColor: '#fff6e7',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    zIndex: 200,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
});
