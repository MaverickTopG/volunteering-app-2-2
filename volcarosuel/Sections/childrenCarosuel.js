import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Image, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';


const { width, height } = Dimensions.get('window');
const familyImage = require('../../assets/family.png');

const DATA = [
  {
    title: 'Bridge The Gap',
    location: 'Marin City, CA',
    date: '1995',
    poster: require('../../assets/bridge the gap.png'),
    description: 'Bridge The Gap is an academic enrichment program that supports the educational achievements of underserved youth in Marin City. The organization offers after-school tutoring, mentoring, college prep, and summer programs to help students excel academically and develop essential life skills. Volunteers can tutor students, mentor youth, assist with program activities, and support administrative tasks. This opportunity is ideal for teens passionate about education and making a difference in the lives of underserved youth. Volunteers help students improve their academic performance, build self-confidence, and develop important life skills.',
    address: '2330 Marinship Way, Suite 302, Sausalito, CA 94965',
    email: '415-339-9411',
  },
  {
    title: 'Canal Community Alliance',
    location: ' San Rafael, CA',
    date: '1982',
    poster: require('../../assets/canal alliance.webp'),
    description: 'Canal Community Alliance is a non-profit organization dedicated to improving the quality of life for residents of the Canal neighborhood in San Rafael. They provide a range of services including workforce development, housing assistance, health and wellness programs, and educational opportunities. Volunteers assist with program delivery, support administrative tasks, engage in community outreach, and help organize events. This opportunity is great for teens who want to contribute to social justice and community development, helping to empower residents and promote economic stability.',
    address: '91 Larkspur Street, San Rafael, CA 94901',
    email: '415-454-2640',
  },
  {
    title: 'Community Action Marin',
    location: 'San Rafael, CA',
    date: '1966',
    poster: require('../../assets/community action marin.png'),
    description: 'Community Action Marin is a social services agency that provides various programs to support low-income individuals and families in Marin County. Their services include childcare, mental health support, financial education, housing assistance, and food distribution. Volunteers help with program delivery, support administrative tasks, assist with fundraising events, and engage in community outreach. This opportunity is ideal for teens passionate about social services and helping alleviate poverty, making a direct impact on the lives of individuals and families in need.',
    address: '555 Northgate Drive, Suite 201, San Rafael, CA 94903',
    email: '415-526-7500',
  },
  {
    title: 'Grateful Gatherings Marin',
    location: 'Marin County, CA',
    date: '2013',
    poster: require('../../assets/grateful gatherings marinn.png'),
    description: 'Grateful Gatherings Marin helps families in need by providing furniture and household items to create safe and comfortable homes. They collect donations from the community and organize volunteers to deliver and set up the items in the homes of families transitioning out of homelessness or crisis. Volunteers help collect donations, assist with delivery and setup, support administrative tasks, and participate in community outreach. This opportunity is great for teens who want to help families in need and contribute to community well-being by providing essential household items to create a stable home environment.',
    address: '1940 Broadway, Suite 101, Oakland, CA 94612',
    email: '415-482-8805',
  },
  {
    title: 'Habitat for Humanity Greater San Francisco',
    location: 'San Francisco, CA',
    date: '1987',
    poster: require('../../assets/habitat.png'),
    description: 'Habitat for Humanity Greater San Francisco builds affordable homes and provides homeownership opportunities for low-income families. They also offer critical home repairs and neighborhood revitalization projects. Volunteers participate in home construction, support home repair projects, assist with administrative tasks, and engage in community outreach. This is an excellent opportunity for teens interested in construction and community service, and wanting to help provide safe and affordable housing for families in need. Volunteers gain hands-on experience in building and renovating homes while contributing to a larger mission of housing equality.',
    address: '500 Washington Street, Suite 250, San Francisco, CA 94111',
    email: '415-625-1000',
  },
  {
    title: 'Jewish Family & Childrens Services',
    location: 'San Rafael, CA',
    date: '1850',
    poster: require('../../assets/jew.png'),
    description: 'Jewish Family & Childrens Services (JFCS) provides comprehensive social services to individuals and families in need, regardless of religion or background. Their programs include counseling, senior services, disability services, emergency assistance, and youth programs. Volunteers assist with program delivery, support administrative tasks, engage in community outreach, and help with fundraising events. This opportunity is great for teens passionate about social services and wanting to make a positive impact in their community. Volunteers support various programs that strengthen families and individuals during times of crisis.',
    address: '600 Fifth Avenue, San Rafael, CA 94901',
    email: '415-491-7960',
  },
  {
    title: 'Mill Valley Gate',
    location: 'Mill Valley, CA',
    date: '1970',
    poster: require('../../assets/millvalley.png'),
    description: 'Mill Valley Gate offers a range of community services and programs to support the well-being of residents in Mill Valley. They provide educational workshops, recreational activities, and social services aimed at fostering community engagement and enhancing the quality of life for all residents. Volunteers assist with program delivery, support administrative tasks, help organize events, and engage in community outreach. This opportunity is great for teens who want to contribute to their local community and support various programs and services that enhance the well-being of residents across all stages of life.',
    address: '350 Camino Alto, Suite 100, Mill Valley, CA 94941',
    email: '415-388-0184',
  },
  {
    title: 'YMCA Marin',
    location: 'San Rafael, CA',
    date: '1954',
    poster: require('../../assets/long-island-ymca-logo.png'),
    description: 'YMCA Marin is a community organization that offers a wide range of programs and services to promote healthy living, youth development, and social responsibility. Their offerings include fitness classes, sports leagues, after-school programs, summer camps, and community events. Volunteers assist with program delivery, support administrative tasks, help organize events, and engage in community outreach. This opportunity is great for teens who want to support youth development and promote a healthy lifestyle in their community, helping to build strong kids, strong families, and strong communities.',
    address: '1500 Los Gamos Drive, Suite 350, San Rafael, CA 94903',
    email: '415-492-9622',
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
        <Text style={styles.headerText}>Family</Text>
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