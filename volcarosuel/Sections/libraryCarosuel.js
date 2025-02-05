import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  SectionList,
  TextInput,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { MaterialIcons } from '@expo/vector-icons';
import { TapGestureHandler } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const { width } = Dimensions.get('window');

// Data with counties added
const DATA = [

  {
    title: 'Larkspur Library',
    location: 'Larkspur, CA',
    date: '1913',
    poster: require('../../assets/larkspur.png'),
    description: 'Larkspur Library welcomes teen volunteers to assist with a range of activities including event planning, organizing books, and helping with childrens programs. Volunteers play a vital role in supporting the library’s mission to serve the community.',
    address: '400 Magnolia Ave, Larkspur, CA 94939',
    email: '415-927-5022',
    website: 'https://www.ci.larkspur.ca.us/926/Volunteer',
    county: 'Marin County',
  },

  {
    title: 'The Book Exchange',
    location: 'Not specified',
    date: '1913',
    poster: require('../../assets/bookexchange.png'),
    description: 'The Book Exchange offers a platform for exchanging used books to promote reading and literacy. Volunteers can help organize books, manage exchanges, and assist with community outreach efforts to encourage book donations and literacy programs.',
    address: 'Not specified',
    website: 'https://bookexchangemarin.org/volunteer/',
    county: 'Marin County',
  },
  {
    title: 'Belvedere Tiburon Library',
    location: 'Belvedere Tiburon, CA',
    date: 'N/A',
    // If you have an image, include a poster field. For example:
    // poster: require('../../assets/belvedere-tiburon.png'),
    description: 'Belvedere Tiburon Library welcomes teen volunteers to assist with a range of activities including event planning, organizing books, and helping with children\'s programs. Volunteers play a vital role in supporting the library’s mission to serve the community.',
    address: '780 Tiburon Blvd, Tiburon, CA 94920',
    email: '415-789-2665',
    website: 'https://www.beltiblibrary.org/support-services/get-involved-volunteer',
    county: 'Marin County',
  },
  {
    title: 'Corte Madera Library',
    location: 'Corte Madera, CA',
    date: 'N/A',
    // poster: require('../../assets/corte-madera.png'), // if available
    description: 'Corte Madera Library welcomes teen volunteers to assist with a range of activities including event planning, organizing books, and helping with children\'s programs. Volunteers play a vital role in supporting the library’s mission to serve the community.',
    address: '20 Corte Madera Blvd, Corte Madera, CA 94920',
    email: '415-924-3515',
    website: 'https://www.marinlibraryfriends.org/friends-of-the-corte-madera-library',
    county: 'Marin County',
  },
  {
    title: 'Marin City/Sausalito Library',
    location: 'Sausalito, CA',
    date: 'N/A',
    // poster: require('../../assets/sausalito.png'), // if available
    description: 'Marin City/Sausalito Library welcomes teen volunteers to assist with a range of activities including event planning, organizing books, and helping with children\'s programs. Volunteers play a vital role in supporting the library’s mission to serve the community.',
    address: '200 Sausalito Blvd, Sausalito, CA 94965',
    email: '415-332-6158',
    website: 'https://www.sausalitolibrary.org/about-us/friends-bookstore',
    county: 'Marin County',
  },
  {
    title: 'Marin County Public Library',
    location: 'San Rafael, CA',
    date: 'N/A',
    // poster: require('../../assets/marin-county-public.png'), // if available
    description: 'Marin County Public Library welcomes teen volunteers to assist with a range of activities including event planning, organizing books, and helping with children\'s programs. Volunteers play a vital role in supporting the library’s mission to serve the community.',
    address: '250 Civic Center Dr, San Rafael, CA 94901',
    email: '415-473-3220',
    website: 'https://marinlibrary.org/teen-volunteer-leadership-opportunities/',
    county: 'Marin County',
  },
  

];

// Group data by county
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

const SECTIONS = groupByCounty(DATA);

const VolunteerScreen = ({ route }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const listRef = useRef(null);
  const searchBarTimer = useRef(null);

  // Retrieve data passed from Search Screen (if any)
  const { searchScreenData } = route.params || {};

  const handleSearch = (query) => {
    setSearchQuery(query);
    const sectionIndex = SECTIONS.findIndex((section) =>
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
    navigation.navigate('SearchScreen', { data: searchScreenData });
  };

  // Static mini header style (no animation)
  const headerStyle = {
    backgroundColor: '#fff6e7',
  };

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  // Each card is rendered as a simple button with the item title.
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('DisplayScreen', { item })}
    >
      <Text style={styles.cardTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    if (searchVisible) {
      searchBarTimer.current = setTimeout(() => {
        setSearchVisible(false);
        setSearchQuery('');
      }, 10000);
    }
    return () => clearTimeout(searchBarTimer.current);
  }, [searchVisible]);

  return (
    <TapGestureHandler numberOfTaps={2} onActivated={() => setSearchVisible(!searchVisible)}>
      <SafeAreaView style={styles.container}>
        {/* Back Button: using safe-area inset to ensure it’s not covered */}
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + 10 }]}
          onPress={handleBackPress}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

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

        <View style={[styles.header, headerStyle]}>
          <Text style={styles.headerText}>Library</Text>
        </View>
        <SectionList
          ref={listRef}
          sections={SECTIONS}
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

export default VolunteerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7',
  },
  header: {
    height: 100,
    backgroundColor: '#fff6e7',
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
  // Back button now uses insets so it won’t be hidden.
  backButton: {
    marginTop:-45,
    position: 'absolute',
    left: 10,
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
