import React, { useContext, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import { CurvedBottomBarExpo } from 'react-native-curved-bottom-bar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../../auth/AuthContext'; // AuthContext for authentication state
import AnimalCarousel from '../Sections/animalCarousel';
import TechCarousel from '../Sections/environmentCarosuel';
import FamilyCarousel from '../Sections/familyCarosuel';
import HospitalCarousel from '../Sections/hospitalCarousel';
import SeniorCarousel from '../Sections/libraryCarosuel';
import SearchScreen from '../screens/SearchScreen';
import AIScreen from '../screens/ProfileScreen';
import VolunteerLogs from '../screens/volunteer_log';
import LoginScreen from '../../auth/LoginScreen';
import RegisterScreen from '../../auth/RegisterScreen';
import DisplayScreen from '../displayer/ShowScreen';
import MapScreen from '../screens/MapScreen';
import SplashScreen from '../screens/Splashscreen';
import DeleteScreen from '../../auth/deleteScreen';

const Stack = createStackNavigator();

// Carousel Stack for Dynamic Navigation
const CarouselStack = ({ route }) => {
  const { carouselName } = route.params || {};
  let CarouselComponent;

  switch (carouselName) {
    case 'TechCarousel':
      CarouselComponent = TechCarousel;
      break;
    case 'FamilyCarousel':
      CarouselComponent = FamilyCarousel;
      break;
    case 'HospitalCarousel':
      CarouselComponent = HospitalCarousel;
      break;
    case 'SeniorCarousel':
      CarouselComponent = SeniorCarousel;
      break;
    default:
      CarouselComponent = AnimalCarousel;
      break;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Carousel" component={CarouselComponent} />
      <Stack.Screen name="DisplayScreen" component={DisplayScreen} />
    </Stack.Navigator>
  );
};

// Volunteer Logs Stack with Auth Integration
const VolunteerLogsStack = () => {
  const { user } = useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // Authenticated users
        <Stack.Screen name="VolunteerLogs" component={VolunteerLogs} />
      ) : (
        // Unauthenticated users with proper transitions
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Delete" component={DeleteScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const TabStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
      <Stack.Screen name="CarouselStack" component={CarouselStack} />
    </Stack.Navigator>
  );
};

// New TabIcon component with spinning animation on press.
// When pressed, navigation is triggered immediately, then the icon spins.
const TabIcon = ({ routeName, selectedTab, onPress }) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handlePress = () => {
    // Navigate immediately.
    onPress();
    // Then spin the icon.
    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      spinAnim.setValue(0);
    });
  };

  let iconName = '';
  switch (routeName) {
    case 'Show':
      iconName = 'eye';
      break;
    case 'Vlogs':
      iconName = 'search';
      break;
    case 'Search':
      iconName = 'home';
      break;
    case 'Map':
      iconName = 'map';
      break;
    case 'Profile':
      iconName = 'person';
      break;
    default:
      iconName = 'alert';
      break;
  }

  return (
    <TouchableOpacity onPress={handlePress} style={styles.tabButton}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Ionicons
          name={iconName}
          size={25}
          color={routeName === selectedTab ? '#fff6e7' : '#ffffff40'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

// Create a similar component for the center (circle) icon.
const CenterIcon = ({ onPress }) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handlePress = () => {
    onPress();
    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      spinAnim.setValue(0);
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.btnCircle}>
      <Animated.Image
        source={require('../../assets/spaceship.png')}
        style={[styles.spaceshipIcon, { transform: [{ rotate: spin }] }]}
      />
    </TouchableOpacity>
  );
};

const renderTabBar = ({ routeName, selectedTab, navigate }) => {
  return (
    <TabIcon
      routeName={routeName}
      selectedTab={selectedTab}
      onPress={() => navigate(routeName)}
    />
  );
};

// Tab Navigator
const AnimalTabNavigator = () => {
  return (
    <View style={{ flex: 1 }}>
      <CurvedBottomBarExpo.Navigator
        style={styles.bottomBar}
        height={65}
        circleWidth={75}
        bgColor="black"
        initialRouteName="Search"
        borderTopLeftRight
        renderCircle={({ selectedTab, navigate }) => (
          <View style={styles.circleContainer}>
            <CenterIcon onPress={() => navigate('Show')} />
          </View>
        )}
        tabBar={renderTabBar}
      >
        <CurvedBottomBarExpo.Screen
          name="Search"
          position="LEFT"
          component={TabStack}
          options={{ headerShown: false }}
        />
        <CurvedBottomBarExpo.Screen
          name="Vlogs"
          position="LEFT"
          component={AIScreen}
          options={{ headerShown: false }}
        />
        <CurvedBottomBarExpo.Screen
          name="Map"
          position="RIGHT"
          component={MapScreen}
          options={{ headerShown: false }}
        />
        <CurvedBottomBarExpo.Screen
          name="Profile"
          position="RIGHT"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <CurvedBottomBarExpo.Screen
          name="Show"
          position="CIRCLE"
          component={VolunteerLogsStack}
          options={{ headerShown: false }}
        />
      </CurvedBottomBarExpo.Navigator>
    </View>
  );
};

export default AnimalTabNavigator;


const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    borderRadius: 20,
    elevation: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0.5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  btnCircle: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    shadowColor: '#1A1A23',
    shadowOffset: {
      width: 0,
      height: 0.5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 0.41,
    elevation: 1,
  },
  circleContainer: {
    position: 'relative',
    top: -45,
    alignSelf: 'center',
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceshipIcon: {
    width: 30,
    height: 30,
    tintColor: '#fff6e7',
  },
});
