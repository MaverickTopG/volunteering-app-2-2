import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions, StatusBar, SafeAreaView, Animated, FlatList, Image, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');
const HospitalImage = require('../../assets/hospital.png');

const DATA = [
  {
    title: 'American Cancer Society',
    location: 'Local Office: San Francisco, CA',
    date: '1913',
    poster: HospitalImage,
    description: 'The American Cancer Society offers various volunteer opportunities to support the fight against cancer. Volunteers can participate in patient support programs, help organize and run fundraising events like Relay for Life, provide transportation for patients through the Road to Recovery program, and assist with administrative tasks. These activities help develop organizational and leadership skills while making a significant impact on individuals affected by cancer. Volunteering with the American Cancer Society is a great way to contribute to a cause that affects millions of lives.',
    address: '945 Sutter Street, San Francisco, CA 94109',
    email: '800-227-2345',
  },
  {
    title: 'Hospice by the Bay',
    location: 'Larkspur, CA',
    date: '1975',
    poster: HospitalImage,
    description: 'Hospice by the Bay provides compassionate end-of-life care to patients and their families. Volunteers can play an essential role by offering companionship to patients, assisting with activities, supporting administrative tasks, and helping with fundraising events. This experience can be deeply rewarding and educational, providing insight into healthcare and the importance of emotional support for patients and their families. Those interested in healthcare or wanting to make a meaningful difference in their community will find this opportunity invaluable.',
    address: '17 East Sir Francis Drake Blvd, Suite 100, Larkspur, CA 94939',
    email: '415-927-2273',
  },
  {
    title: 'Marin Convalescent & Rehabilitation Hospital',
    location: 'Tiburon, CA',
    date: '1948',
    poster: HospitalImage,
    description: 'Marin Convalescent & Rehabilitation Hospital offers skilled nursing and rehabilitation services to elderly and disabled patients. Volunteers can assist with recreational activities, provide companionship, help with meal services, and support the staff with various tasks. This opportunity allows volunteers to build relationships with residents, learn about geriatric care, and develop empathy and communication skills. Volunteering here is ideal for those considering a career in healthcare or those who enjoy working with the elderly.',
    address: '30 Hacienda Drive, Tiburon, CA 94920',
    email: '415-435-4554',
  },
  {
    title: 'Marin General Hospital',
    location: 'Greenbrae, CA',
    date: '1952',
    poster: HospitalImage,
    description: 'Marin General Hospital provides a wide range of medical services to the community. Volunteers can support different departments by assisting with patient transport, providing information and directions to visitors, delivering flowers and mail to patients, and helping with administrative tasks. This experience offers a behind-the-scenes look at hospital operations and the opportunity to interact with healthcare professionals. It’s a perfect opportunity for those interested in pursuing careers in medicine or healthcare administration, providing valuable experience and insights into the medical field.',
    address: '250 Bon Air Road, Greenbrae, CA 94904',
    email: '415-925-7258',
  },
];

const ITEM_WIDTH = width * 0.76;
const ITEM_HEIGHT = ITEM_WIDTH * 1.5;

const HospitalCarousel = () => {
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

export default HospitalCarousel;

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
    marginTop: 110,
    left:29,
  },
  posterImage: {
    width: '85%',
    height: '85%',
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
