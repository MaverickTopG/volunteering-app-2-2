import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Image, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';


const { width, height } = Dimensions.get('window');
const LibraryImage = require('../../assets/library.png');

const DATA = [
  {
    title: 'Larkspur Library',
    location: 'Larkspur, CA',
    date: '1913',
    poster: require('../../assets/larkspur.png'),
    description: 'Larkspur Library welcomes teen volunteers to assist with a range of activities including event planning, organizing books, and helping with childrens programs. Volunteers play a vital role in supporting the library’s mission to serve the community.',
    address: '400 Magnolia Ave, Larkspur, CA 94939',
    email: '415-927-5022',
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
        <Text style={styles.headerText}>Library</Text>
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