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
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { TapGestureHandler } from 'react-native-gesture-handler';

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

const ITEM_HEIGHT = 85;
const MARGIN = 10;
const INACTIVE_TIME = 10000; // 10 seconds

const VolunteerScreen = () => {
  const navigation = useNavigation();
  const [activeSection, setActiveSection] = useState(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isExpanded = useSharedValue(false);
  const timer = useRef(null);
  const listRef = useRef(null);
  const searchBarTimer = useRef(null);

  const handleCardPress = (item) => {
    clearTimeout(timer.current);
    if (activeSection === item.title) {
      setActiveSection(null);
      isExpanded.value = false;
    } else {
      setActiveSection(item.title);
      isExpanded.value = true;
      timer.current = setTimeout(() => {
        setActiveSection(null);
        isExpanded.value = false;
      }, INACTIVE_TIME);
    }
  };

  const handleDoubleTap = () => {
    setSearchVisible((prev) => !prev);
    if (!searchVisible) {
      clearTimeout(searchBarTimer.current);
      Keyboard.dismiss();
    }
  };

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

  const rMiniBarStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: withSpring(isExpanded.value ? -20 : 0) }],
      backgroundColor: '#fff6e7',
    };
  });

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  const renderItem = ({ item }) => {
    const rStyle = useAnimatedStyle(() => {
      return {
        height: withTiming(isExpanded.value && activeSection === item.title ? ITEM_HEIGHT + 250 : ITEM_HEIGHT, {
          duration: 1000,
        }),
        marginTop: MARGIN,
        marginBottom: MARGIN,
      };
    });

    return (
      <Animated.View key={item.title} style={[styles.card, rStyle]}>
        <TouchableOpacity onPress={() => handleCardPress(item)}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <MaterialIcons
              name={isExpanded.value && activeSection === item.title ? 'arrow-drop-up' : 'arrow-drop-down'}
              size={25}
              color={'#D4D4D4'}
            />
          </View>
        </TouchableOpacity>
        {activeSection === item.title && (
          <View style={[styles.dropdownContent, { height: ITEM_HEIGHT + 150 }]}>
            <Image source={item.poster} style={styles.cardImage} />
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={() => navigation.navigate('DisplayScreen', { item })}
            >
              <Text style={styles.navigateButtonText}>Navigate</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    );
  };

  useEffect(() => {
    if (searchVisible) {
      searchBarTimer.current = setTimeout(() => {
        setSearchVisible(false);
        setSearchQuery('');
      }, INACTIVE_TIME);
    }
    return () => clearTimeout(searchBarTimer.current); // Cleanup timer
  }, [searchVisible]);

  return (
    <TapGestureHandler numberOfTaps={2} onActivated={handleDoubleTap}>
      <SafeAreaView style={styles.container}>
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
        <Animated.View style={[styles.header, rMiniBarStyle]}>
          <Text style={styles.headerText}>Family</Text>
        </Animated.View>
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
  headerText: {
    fontSize: RFPercentage(3),
    fontWeight: 'bold',
    color: '#333333',
  },
  scrollViewContent: {
    paddingTop: 120,
    paddingBottom: 20,
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
    overflow: 'hidden',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#333333',
    marginVertical: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  cardTitle: {
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
    color: '#333333',
  },
  dropdownContent: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  cardImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    borderRadius: 10,
    marginBottom: 10,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff6e7',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  navigateButtonText: {
    color: '#333333',
    fontSize: 18,
  },
  searchBar: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    height: 50,
    backgroundColor: '#fff6e7',
    borderRadius: 25, // Rounded corners for smooth look
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10, // Soft shadow
    zIndex: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10, // Space between icon and input
  },
  searchIcon: {
    marginRight: 10, // Space between icon and input
  },
});
