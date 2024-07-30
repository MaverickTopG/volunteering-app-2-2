import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Image, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';


const { width, height } = Dimensions.get('window');
const HospitalImage = require('../../assets/hospital.png');

const DATA = [
  {
    title: 'American Cancer Society',
    location: 'Local Office: San Francisco, CA',
    date: '1913',
    poster: require('../../assets/american_cancer_society.png'),
    description: 'The American Cancer Society offers various volunteer opportunities to support the fight against cancer. Volunteers can participate in patient support programs, help organize and run fundraising events like Relay for Life, provide transportation for patients through the Road to Recovery program, and assist with administrative tasks. These activities help develop organizational and leadership skills while making a significant impact on individuals affected by cancer. Volunteering with the American Cancer Society is a great way to contribute to a cause that affects millions of lives.',
    address: '945 Sutter Street, San Francisco, CA 94109',
    email: '800-227-2345',
  },
  {
    title: 'Hospice by the Bay',
    location: 'Larkspur, CA',
    date: '1975',
    poster: require('../../assets/hospice.png'),
    description: 'Hospice by the Bay provides compassionate end-of-life care to patients and their families. Volunteers can play an essential role by offering companionship to patients, assisting with activities, supporting administrative tasks, and helping with fundraising events. This experience can be deeply rewarding and educational, providing insight into healthcare and the importance of emotional support for patients and their families. Those interested in healthcare or wanting to make a meaningful difference in their community will find this opportunity invaluable.',
    address: '17 East Sir Francis Drake Blvd, Suite 100, Larkspur, CA 94939',
    email: '415-927-2273',
  },
  {
    title: 'Marin Convalescent & Rehabilitation Hospital',
    location: 'Tiburon, CA',
    date: '1948',
    poster: require('../../assets/marin.webp'),
    description: 'Marin Convalescent & Rehabilitation Hospital offers skilled nursing and rehabilitation services to elderly and disabled patients. Volunteers can assist with recreational activities, provide companionship, help with meal services, and support the staff with various tasks. This opportunity allows volunteers to build relationships with residents, learn about geriatric care, and develop empathy and communication skills. Volunteering here is ideal for those considering a career in healthcare or those who enjoy working with the elderly.',
    address: '30 Hacienda Drive, Tiburon, CA 94920',
    email: '415-435-4554',
  },
  {
    title: 'Marin General Hospital',
    location: 'Greenbrae, CA',
    date: '1952',
    poster:require('../../assets/Marin.png') ,
    description: 'Marin General Hospital provides a wide range of medical services to the community. Volunteers can support different departments by assisting with patient transport, providing information and directions to visitors, delivering flowers and mail to patients, and helping with administrative tasks. This experience offers a behind-the-scenes look at hospital operations and the opportunity to interact with healthcare professionals. It’s a perfect opportunity for those interested in pursuing careers in medicine or healthcare administration, providing valuable experience and insights into the medical field.',
    address: '250 Bon Air Road, Greenbrae, CA 94904',
    email: '415-925-7258',
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
        <Text style={styles.headerText}>Hospital</Text>
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