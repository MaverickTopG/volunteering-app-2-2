import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Image, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';


const { width, height } = Dimensions.get('window');


const DATA = [
  {
    title: 'Audubon Center',
    location: 'Tiburon, CA',
    date: '1960',
    poster: require('../../assets/audubon_logo.gif'),
    description: 'The Richardson Bay Audubon Center & Sanctuary offers various volunteer opportunities for teens. Activities include helping with bird conservation efforts, participating in habitat restoration projects, assisting with educational programs, and engaging in community outreach to promote environmental awareness. Volunteers can also support the center’s youth conservation leadership program and summer camps.',
    address: '376 Greenwood Beach Road, Tiburon, CA 94920',
    email: '415-388-2524',
  },
  {
    title: 'Golden Gate National Parks Conservancy',
    location: 'San Francisco, CA',
    date: '1981',
    poster: require('../../assets/logo.png'),
    description: 'The Golden Gate National Parks Conservancy provides numerous volunteer opportunities for teens, including habitat restoration, trail maintenance, native plant gardening, and participating in park clean-ups. Volunteers work in various locations within the Golden Gate National Recreation Area, contributing to the conservation and preservation of natural resources and historical sites.',
    address: 'Building 201, Fort Mason, San Francisco, CA 94123',
    email: '415-561-3044',
  },
  {
    title: 'Habitat for Humanity',
    location: 'San Francisco, CA',
    date: '1987',
    poster: require('../../assets/Habitat-For-Humanity-Logo.png'),
    description: 'Habitat for Humanity offers teens the opportunity to volunteer in park and community beautification projects. Activities include landscaping, planting trees, cleaning up public spaces, and improving community parks. These efforts aim to create safe, beautiful, and sustainable environments for local communities.',
    address: '500 Washington Street, Suite 250, San Francisco, CA 94111',
    email: '415-625-1000',
  },
  {
    title: 'Marin County Open Space',
    location: ': San Rafael, CA',
    date: '1972',
    poster: require('../../assets/download.png'),
    description: 'Marin County Open Space District provides volunteer opportunities for teens to engage in habitat restoration, invasive species removal, trail maintenance, and educational outreach. Volunteers help maintain and enhance the county’s natural landscapes, contributing to the preservation of local ecosystems..',
    address: '3501 Civic Center Drive, Suite 260, San Rafael, CA 94903',
    email: '415-473-3778',
  },
  {
    title: 'Marin Agricultural Land Trust',
    location: 'Point Reyes Station, CA',
    date: '1980',
    poster: require('../../assets/download (1).png'),
    description: 'The Marin Agricultural Land Trust (MALT) offers volunteer opportunities for teens to support the preservation of agricultural land. Activities include assisting with farm tours, helping at community events, and participating in conservation projects that protect farmland and promote sustainable agriculture.',
    address: '65 Fourth Street, Point Reyes Station, CA 94956',
    email: '415-663-1158',
  },
  {
    title: 'Marin County Parks & Landscape',
    location: 'San Rafael, CA',
    date: '1972',
    poster: require('../../assets/download.png'),
    description: 'Marin County Parks offers volunteer opportunities for teens to participate in landscape maintenance, habitat restoration, and park beautification projects. Volunteers help keep parks clean, safe, and inviting for all visitors while supporting environmental conservation efforts.',
    address: '3501 Civic Center Drive, Suite 260, San Rafael, CA 94903',
    email: '415-473-2823',
  },
  {
    title: 'Marin Headlands Native Plants Nursery',
    location: 'Sausalito, CA',
    date: '1982',
    poster: require('../../assets/marin headlands.jpg'),
    description: 'The Marin Headlands Native Plants Nursery provides volunteer opportunities for teens to assist with growing and caring for native plants used in habitat restoration projects. Activities include seed collection, plant propagation, and nursery maintenance, contributing to the preservation of native plant species in the region.',
    address: '1033 Fort Cronkhite, Sausalito, CA 94965',
    email: '415-332-5193',
  },
  {
    title: 'Marin ReLeaf',
    location: 'San Rafael, CA',
    date: '1989',
    poster: require('../../assets/releaf.png'),
    description: 'Marin ReLeaf offers volunteer opportunities for teens to engage in tree planting and care projects across Marin County. Volunteers help plant trees in urban and rural areas, maintain existing trees, and participate in community outreach to promote the benefits of urban forestry.',
    address: '30 N San Pedro Road, Suite 290, San Rafael, CA 94903',
    email: '415-721-4374',
  },
  {
    title: 'Mill Valley Public Works',
    location: 'Mill Valley, CA',
    date: '1900',
    poster: require('../../assets/millvalley.png'),
    description: ' Mill Valley Public Works provides volunteer opportunities for teens to assist with various public works projects, including park maintenance, street clean-ups, and infrastructure improvements. Volunteers help enhance the city’s public spaces and contribute to community well-being.',
    address: '26 Corte Madera Avenue, Mill Valley, CA 94941',
    email: '415-384-4800',
  },
  {
    title: 'Muir Woods',
    location: 'Mill Valley, CA',
    date: '1908',
    poster: require('../../assets/muir woods.webp'),
    description: 'Muir Woods National Monument offers volunteer opportunities for teens to engage in habitat restoration, trail maintenance, and visitor education programs. Volunteers help preserve the natural beauty and ecological integrity of the ancient redwood forest.',
    address: '1 Muir Woods Road, Mill Valley, CA 94941',
    email: '415-561-4755',
  },
  {
    title: 'Slide Ranch',
    location: 'Muir Beach, CA',
    date: '1970',
    poster: require('../../assets/slide ranch.png'),
    description: ' Slide Ranch offers volunteer opportunities for teens to assist with sustainable farming, environmental education, and habitat restoration. Volunteers help with farm chores, maintain trails, and support educational programs that connect people to nature and sustainable agriculture.',
    address: '2025 Shoreline Highway, Muir Beach, CA 94965',
    email: '415-381-6155',
  },
  {
    title: 'Mt. Tam Watershed',
    location: 'Marin County, CA',
    date: '1912',
    poster: require('../../assets/mt tam.png'),
    description: 'The Mt. Tam Watershed provides volunteer opportunities for teens to engage in watershed conservation projects, including habitat restoration, trail maintenance, and environmental education. Volunteers help protect and preserve the natural resources and biodiversity of the Mt. Tamalpais watershed.',
    address: '220 Nellen Avenue, Corte Madera, CA 94925',
    email: '415-945-1128',
  },
];

const ITEM_HEIGHT = 85;
const MARGIN = 10;
const INACTIVE_TIME = 10000; // 10 seconds

const VolunteerScreen = () => {
  const navigation = useNavigation();
  const [activeSection, setActiveSection] = useState(null);
  const isExpanded = useSharedValue(false);
  const timer = useRef(null);

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

  const rMiniBarStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: withSpring(isExpanded.value ? -20 : 0) }],
      backgroundColor: 'black',
    };
  });

  const renderCard = (item, index) => {
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
      <Animated.View key={index} style={[styles.card, rStyle]}>
        <TouchableOpacity onPress={() => handleCardPress(item)}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <MaterialIcons name="arrow-drop-down" size={25} color={'#D4D4D4'} />
          </View>
        </TouchableOpacity>
        {activeSection === item.title && (
          <View style={styles.dropdownContent}>
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
    return () => clearTimeout(timer.current); // Cleanup timer on unmount
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, rMiniBarStyle]}>
        <Text style={styles.headerText}>Environment</Text>
      </Animated.View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {DATA.map((item, index) => renderCard(item, index))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default VolunteerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7',
  },
  header: {
    height: 85,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerText: {
    fontSize: RFPercentage(3),
    fontWeight: 'bold',
    color: '#fff6e7',
  },
  scrollViewContent: {
    paddingTop: 100,
    paddingBottom: 20,
  },
  card: {
    width: width * 0.9,
    backgroundColor: '#1B1B1B',
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#000',
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
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  dropdownContent: {
    alignItems: 'center',
    padding: 15,
    paddingBottom: 15, // Adjusted padding to avoid bottom tab overlap
  },
  cardImage: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    borderRadius: 15,
    marginBottom: 10,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff6e7',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  navigateButtonText: {
    color: '#000',
    fontSize: 18,
  },
});