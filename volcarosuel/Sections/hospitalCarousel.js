import React, { /* useState, useEffect, useRef */ } from 'react';
import { View, StyleSheet, Text, SafeAreaView /* , Dimensions, TouchableOpacity, Image, ScrollView */ } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Animated, { useAnimatedStyle /*, useSharedValue, withSpring, withTiming*/ } from 'react-native-reanimated';
// import { useNavigation } from '@react-navigation/native';
// import { MaterialIcons } from '@expo/vector-icons';

// const { width, height } = Dimensions.get('window');
// const HospitalImage = require('../../assets/hospital.png');

// const DATA = [
//   {
//     title: 'American Cancer Society',
//     location: 'Local Office: San Francisco, CA',
//     date: '1913',
//     poster: require('../../assets/american_cancer_society.png'),
//     description: 'The American Cancer Society offers various volunteer opportunities to support the fight against cancer. Volunteers can participate in patient support programs, help organize and run fundraising events like Relay for Life, provide transportation for patients through the Road to Recovery program, and assist with administrative tasks. These activities help develop organizational and leadership skills while making a significant impact on individuals affected by cancer. Volunteering with the American Cancer Society is a great way to contribute to a cause that affects millions of lives.',
//     address: '945 Sutter Street, San Francisco, CA 94109',
//     email: '800-227-2345',
//   },
// ];

// const ITEM_HEIGHT = 85;
// const MARGIN = 10;
// const INACTIVE_TIME = 10000; // 10 seconds

const VolunteerScreen = () => {
  // const navigation = useNavigation();
  // const [activeSection, setActiveSection] = useState(null);
  // const isExpanded = useSharedValue(false);
  // const timer = useRef(null);

  // const handleCardPress = (item) => {
  //   clearTimeout(timer.current);
  //   if (activeSection === item.title) {
  //     setActiveSection(null);
  //     isExpanded.value = false;
  //   } else {
  //     setActiveSection(item.title);
  //     isExpanded.value = true;
  //     timer.current = setTimeout(() => {
  //       setActiveSection(null);
  //       isExpanded.value = false;
  //     }, INACTIVE_TIME);
  //   }
  // };

  const rMiniBarStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: -20 }], // Static translation for the header
      backgroundColor: 'black',
    };
  });

  // const renderCard = (item, index) => {
  //   const rStyle = useAnimatedStyle(() => {
  //     return {
  //       height: withTiming(isExpanded.value && activeSection === item.title ? ITEM_HEIGHT + 250 : ITEM_HEIGHT, {
  //         duration: 1000,
  //       }),
  //       marginTop: MARGIN,
  //       marginBottom: MARGIN,
  //     };
  //   });

  //   return (
  //     <Animated.View key={index} style={[styles.card, rStyle]}>
  //       <TouchableOpacity onPress={() => handleCardPress(item)}>
  //         <View style={styles.cardHeader}>
  //           <Text style={styles.cardTitle}>{item.title}</Text>
  //           <MaterialIcons name="arrow-drop-down" size={25} color={'#D4D4D4'} />
  //         </View>
  //       </TouchableOpacity>
  //       {activeSection === item.title && (
  //         <View style={styles.dropdownContent}>
  //           <Image source={item.poster} style={styles.cardImage} />
  //           <TouchableOpacity
  //             style={styles.navigateButton}
  //             onPress={() => navigation.navigate('DisplayScreen', { item })}
  //           >
  //             <Text style={styles.navigateButtonText}>Navigate</Text>
  //             <MaterialIcons name="arrow-forward" size={20} color="#000" />
  //           </TouchableOpacity>
  //         </View>
  //       )}
  //     </Animated.View>
  //   );
  // };

  // useEffect(() => {
  //   return () => clearTimeout(timer.current); // Cleanup timer on unmount
  // }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, rMiniBarStyle]}>
        <Text style={styles.headerText}>Hospital</Text>
      </Animated.View>
      <View style={styles.comingSoonContainer}>
        <Text style={styles.comingSoonText}>Coming Soon!</Text>
      </View>
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
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: RFPercentage(3),
    color: 'black',
    fontWeight: 'bold',
  },
});
