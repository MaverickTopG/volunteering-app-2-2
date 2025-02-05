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
    title: 'Grateful Gatherings Marin',
    location: 'Marin County, CA',
    date: '2013',
    poster: require('../../assets/grateful gatherings marinn.png'),
    description: 'Grateful Gatherings Marin helps families in need by providing furniture and household items to create safe and comfortable homes. They collect donations from the community and organize volunteers to deliver and set up the items in the homes of families transitioning out of homelessness or crisis. Volunteers help collect donations, assist with delivery and setup, support administrative tasks, and participate in community outreach. This opportunity is great for teens who want to help families in need and contribute to community well-being by providing essential household items to create a stable home environment.',
    address: '1940 Broadway, Suite 101, Oakland, CA 94612',
    email: '415-482-8805',
    website:'https://gratefulgatherings.org/',
    county:'Marin County',
  },
  {
    "title": "Bridge the Gap College Prep",
    "location": "Marin City, CA",
    "date": "1995",
   // "poster": "require('../../assets/bridge_the_gap.png')",
    "description": "Bridge the Gap College Prep provides comprehensive educational support for underserved students in Marin City, aiming to prepare them for college success. Volunteers can engage in tutoring, mentoring, and enrichment programs to help students achieve their academic goals.",
    "address": "2330 Marinship Way, Suite 302, Sausalito, CA 949655",
    "email": "info@btgcollegeprep.org",
    "website": "https://www.btgcollegeprep.org/",
    "county": "Marin County"
  },
  {
    "title": "Canal Alliance",
    "location": "San Rafael, CA",
    "date": "1982",
    //"poster": "require('../../assets/canal_alliance.png')",
    "description": "Canal Alliance is a nonprofit champion of immigrants who are challenged by a lack of resources and an unfamiliar environment. They offer services including education, career programs, legal advocacy, and social services to help immigrants and their families overcome barriers to success.",
    "address": "91 Larkspur Street, San Rafael, CA 94901",
    "email": "info@canalalliance.org",
    "website": "https://www.canalalliance.org/",
    "county": "Marin County"
  },
  {
    "title": "Community Action Marin",
    "location": "San Rafael, CA",
    "date": "1966",
    //"poster": "require('../../assets/community_action_marin.png')",
    "description": "Community Action Marin partners with people to support well-being, dignity, and hope. They provide services that help individuals and families meet their basic needs and empower them to create lasting change, including early childhood education, economic justice programs, and housing assistance.",
    "address": " 555 Northgate Drive, Suite 201, San Rafael, CA 94903",
    "email": "cam@camarin.org",
    "website": "https://camarin.org/",
    "county": "Marin County"
  },
  {
    "title": "Habitat for Humanity Greater San Francisco",
    "location": "San Francisco, CA",
    "date": "1989",
    //"poster": "require('../../assets/habitat_for_humanity_gsf.png')",
    "description": "Habitat for Humanity Greater San Francisco brings people together to build homes, communities, and hope. They provide affordable homeownership opportunities for families in San Francisco, San Mateo, and Marin counties. Volunteers can participate in construction, home repairs, and community beautification projects.",
    "address": "300 Montgomery Street, Suite 450, San Francisco, CA 94104",
    "email": "info@habitatgsf.org",
    "website": "https://habitatgsf.org/",
    "county": "San Francisco County"
  },
  {
    "title": "Jewish Family and Children's Services",
    "location": "San Rafael, CA",
    "date": "1850",
   // "poster": "require('../../assets/jfcs.png')",
    "description": "Jewish Family and Children's Services provides a wide array of services to people of all ages, faiths, and backgrounds. Their programs include counseling, senior services, disability services, and emergency assistance. Volunteers can engage in various roles to support individuals and families in need.",
    "address": "600 Fifth Avenue, San Rafael, CA 94901",
    "email": "info@jfcs.org",
    "website": "https://www.jfcs.org/",
    "county": "Marin County"
  },
  {
    "title": "Mill Valley Gate",
    "location": "Mill Valley, CA",
    "date": "Information not available",
    //"poster": "require('../../assets/mill_valley_gate.png')",
    "description": "Mill Valley Gate is an organization dedicated to community development and support in the Mill Valley area. Specific programs and volunteer opportunities vary; interested individuals are encouraged to contact them directly for more information.",
    "address": "Address not available",
    "email": "info@millvalleygate.org",
    "website": "http://www.millvalleygate.org/",
    "county": "Marin County"
  },
  {
    "title": "Marin YMCA",
    "location": "San Rafael, CA",
    "date": "1954",
    //"poster": "require('../../assets/marin_ymca.png')",
    "description": "The Marin YMCA offers programs that build a healthy spirit, mind, and body for all. Services include fitness classes, youth sports, childcare, and community events. Volunteers can participate in coaching, mentoring, event support, and administrative tasks.",
    "address": "1500 Los Gamos Drive, San Rafael, CA 94903",
    "email": "info@ymcasf.org",
    "website": "https://www.ymcasf.org/locations/marin-ymca",
    "county": "Marin County"
  },  
  {
    "title": "Aegis Living Corte Madera",
    "location": "Corte Madera, CA",
    "date": "2000",
   // "poster": "require('../../assets/aegis_living_corte_madera.png')",
    "description": "Aegis Living Corte Madera offers assisted living and memory care services in a community setting. They provide personalized care plans, engaging activities, and amenities designed to support the well-being of their residents.",
    "address": "5555 Paradise Drive, Corte Madera, CA 94925",
    "email": "415-483-1399",
    "website": "https://www.aegisliving.com/locations/aegis-living-corte-madera-ca/",
    "county": "Marin County"
  },
  {
    "title": "Alzheimer's Association of Marin",
    "location": "San Rafael, CA",
    "date": "1980",
  //   "poster": "require('../../assets/alzheimers_association.png')",
    "description": "The Alzheimer's Association provides support and resources for individuals affected by Alzheimer's disease and other dementias. Services include support groups, educational programs, and a 24/7 helpline.",
    "address": "4340 Redwood Highway, Suite D314, San Rafael, CA 94903",
    "email": "415-472-4340",
    "website": "https://www.alz.org/norcal",
    "county": "Marin County"
  },
  {
    "title": "LITA (Love is the Answer) of Marin",
    "location": "San Rafael, CA",
    "date": "1975",
   // "poster": "require('../../assets/lita_of_marin.png')",
    "description": "LITA of Marin is a nonprofit organization dedicated to improving the quality of life for socially isolated elderly residents in Marin County's long-term care facilities by providing volunteer visitors for regular companionship.",
    "address": "4340 Redwood Highway, Suite E-352, San Rafael, CA 94903",
    "email": "415-472-5482",
    "website": "https://litamarin.org/",
    "county": "Marin County"
  },
  {
    "title": "The Redwoods, A Community of Seniors",
    "location": "Mill Valley, CA",
    "date": "1972",
  //  "poster": "require('../../assets/the_redwoods.png')",
    "description": "The Redwoods is a nonprofit senior residential community offering independent living, assisted living, and skilled nursing services. They focus on promoting independence, dignity, and quality of life for their residents.",
    "address": "40 Camino Alto, Mill Valley, CA 94941",
    "email": "415-383-2741",
    "website": "https://www.theredwoods.org/",
    "county": "Marin County"
  }
,  
  {
    title: 'RAD Camp',
    location: 'Irvine, CA',
    date: '2014',
    poster: require('../../assets/image.png'),
    description: 'RAD camp offers volunteer opportunities to support individuals with developmental disabilities. Volunteers are at the core of RAD Camp’s mission, serving as one-on-one counselors for campers during summer camps and assisting with activities like arts and crafts, sports, and music. They also support year-round events and virtual programs that extend the RAD Camp experience. Volunteering at RAD Camp is a rewarding way to make a meaningful impact, build lasting friendships, and contribute to a supportive community.',
    address: '199 Technology Dr, Suite 100, Irvine, CA 92618',
    email: 'Camp@RADCamp.org or 949-387-5219',
    website:'https://radcamp.org/volunteer/',
    county:'Orange County',
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
          <Text style={styles.headerText}>Family</Text>
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
