import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions, StatusBar, SafeAreaView, Animated, FlatList, Image, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');
const environmentsImage = require('../../assets/enviroment.png');

const DATA = [
  {
    title: 'Audubon Center',
    location: 'Tiburon, CA',
    date: '1960',
    poster: environmentsImage,
    description: 'The Richardson Bay Audubon Center & Sanctuary offers various volunteer opportunities for teens. Activities include helping with bird conservation efforts, participating in habitat restoration projects, assisting with educational programs, and engaging in community outreach to promote environmental awareness. Volunteers can also support the center’s youth conservation leadership program and summer camps.',
    address: '376 Greenwood Beach Road, Tiburon, CA 94920',
    email: '415-388-2524',
  },
  {
    title: 'Golden Gate National Parks Conservancy',
    location: 'San Francisco, CA',
    date: '1981',
    poster: environmentsImage,
    description: 'The Golden Gate National Parks Conservancy provides numerous volunteer opportunities for teens, including habitat restoration, trail maintenance, native plant gardening, and participating in park clean-ups. Volunteers work in various locations within the Golden Gate National Recreation Area, contributing to the conservation and preservation of natural resources and historical sites.',
    address: 'Building 201, Fort Mason, San Francisco, CA 94123',
    email: '415-561-3044',
  },
  {
    title: 'Habitat for Humanity',
    location: 'San Francisco, CA',
    date: '1987',
    poster: environmentsImage,
    description: 'Habitat for Humanity offers teens the opportunity to volunteer in park and community beautification projects. Activities include landscaping, planting trees, cleaning up public spaces, and improving community parks. These efforts aim to create safe, beautiful, and sustainable environments for local communities.',
    address: '500 Washington Street, Suite 250, San Francisco, CA 94111',
    email: '415-625-1000',
  },
  {
    title: 'Marin County Open Space',
    location: ': San Rafael, CA',
    date: '1972',
    poster: environmentsImage,
    description: 'Marin County Open Space District provides volunteer opportunities for teens to engage in habitat restoration, invasive species removal, trail maintenance, and educational outreach. Volunteers help maintain and enhance the county’s natural landscapes, contributing to the preservation of local ecosystems..',
    address: '3501 Civic Center Drive, Suite 260, San Rafael, CA 94903',
    email: '415-473-3778',
  },
  {
    title: 'Marin Agricultural Land Trust',
    location: 'Point Reyes Station, CA',
    date: '1980',
    poster: environmentsImage,
    description: 'The Marin Agricultural Land Trust (MALT) offers volunteer opportunities for teens to support the preservation of agricultural land. Activities include assisting with farm tours, helping at community events, and participating in conservation projects that protect farmland and promote sustainable agriculture.',
    address: '65 Fourth Street, Point Reyes Station, CA 94956',
    email: '415-663-1158',
  },
  {
    title: 'Marin County Parks & Landscape',
    location: 'San Rafael, CA',
    date: '1972',
    poster: environmentsImage,
    description: 'Marin County Parks offers volunteer opportunities for teens to participate in landscape maintenance, habitat restoration, and park beautification projects. Volunteers help keep parks clean, safe, and inviting for all visitors while supporting environmental conservation efforts.',
    address: '3501 Civic Center Drive, Suite 260, San Rafael, CA 94903',
    email: '415-473-2823',
  },
  {
    title: 'Marin Headlands Native Plants Nursery',
    location: 'Sausalito, CAn',
    date: '1982',
    poster: environmentsImage,
    description: 'The Marin Headlands Native Plants Nursery provides volunteer opportunities for teens to assist with growing and caring for native plants used in habitat restoration projects. Activities include seed collection, plant propagation, and nursery maintenance, contributing to the preservation of native plant species in the region.',
    address: '1033 Fort Cronkhite, Sausalito, CA 94965',
    email: '415-332-5193',
  },
  {
    title: 'Marin ReLeaf',
    location: 'San Rafael, CA',
    date: '1989',
    poster: environmentsImage,
    description: 'Marin ReLeaf offers volunteer opportunities for teens to engage in tree planting and care projects across Marin County. Volunteers help plant trees in urban and rural areas, maintain existing trees, and participate in community outreach to promote the benefits of urban forestry.',
    address: '30 N San Pedro Road, Suite 290, San Rafael, CA 94903',
    email: '415-721-4374',
  },
  {
    title: 'Mill Valley Public Works',
    location: 'Mill Valley, CA',
    date: '1900',
    poster: environmentsImage,
    description: ' Mill Valley Public Works provides volunteer opportunities for teens to assist with various public works projects, including park maintenance, street clean-ups, and infrastructure improvements. Volunteers help enhance the city’s public spaces and contribute to community well-being.',
    address: '26 Corte Madera Avenue, Mill Valley, CA 94941',
    email: '415-384-4800',
  },
  {
    title: 'Muir Woods',
    location: 'Mill Valley, CA',
    date: '1908',
    poster: environmentsImage,
    description: 'Muir Woods National Monument offers volunteer opportunities for teens to engage in habitat restoration, trail maintenance, and visitor education programs. Volunteers help preserve the natural beauty and ecological integrity of the ancient redwood forest.',
    address: '1 Muir Woods Road, Mill Valley, CA 94941',
    email: '415-561-4755',
  },
  {
    title: 'Slide Ranch',
    location: 'Muir Beach, CA',
    date: '1970',
    poster: environmentsImage,
    description: ' Slide Ranch offers volunteer opportunities for teens to assist with sustainable farming, environmental education, and habitat restoration. Volunteers help with farm chores, maintain trails, and support educational programs that connect people to nature and sustainable agriculture.',
    address: '2025 Shoreline Highway, Muir Beach, CA 94965',
    email: '415-381-6155',
  },
  {
    title: 'Mt. Tam Watershed',
    location: 'Marin County, CA',
    date: '1912',
    poster: environmentsImage,
    description: 'The Mt. Tam Watershed provides volunteer opportunities for teens to engage in watershed conservation projects, including habitat restoration, trail maintenance, and environmental education. Volunteers help protect and preserve the natural resources and biodiversity of the Mt. Tamalpais watershed.',
    address: '220 Nellen Avenue, Corte Madera, CA 94925',
    email: '415-945-1128',
  },
];

const ITEM_WIDTH = width * 0.76;
const ITEM_HEIGHT = ITEM_WIDTH * 1.5;

const TechCarousel = () => {
  const navigation = useNavigation();
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      <Animated.FlatList
        data={DATA}
        keyExtractor={(item) => item.title}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                {item.title}
              </Text>
              <View style={styles.infoContainer}>
                <Text style={styles.location}>{item.location}</Text>
                <Text style={styles.date}>{item.date}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('DisplayScreen', { item })}
              style={styles.imageContainer}
            >
              <Image source={item.poster} style={styles.posterImage} />
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default TechCarousel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7',
  },
  itemContainer: {
    width: width,
    alignItems: 'center',
  },
  imageContainer: {
    width: ITEM_WIDTH + 100,
    height: ITEM_HEIGHT + 170,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 90,
    left:13,
  },
  posterImage: {
    width: '90%',
    height: '90%',
    resizeMode: 'cover',
  },
  textContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'black',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: RFPercentage(3.5),
    fontWeight: '900',
    color: '#fff',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  location: {
    fontSize: RFPercentage(2),
    color: '#fff',
  },
  date: {
    fontSize: RFPercentage(2),
    color: '#fff',
  },
});
