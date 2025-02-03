import React, { useContext } from 'react';
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

// Tab Navigator
const AnimalTabNavigator = () => {
  const _renderIcon = (routeName, selectedTab) => {
    let icon = '';

    switch (routeName) {
      case 'Show':
        icon = 'eye';
        break;
      case 'Vlogs':
        icon = 'search';
        break;
      case 'Search':
        icon = 'home';
        break;
      case 'Map':
        icon = 'map';
        break;
      case 'Profile':
        icon = 'person';
        break;
    }

    return (
      <Ionicons
        name={icon}
        size={25}
        color={routeName === selectedTab ? '#fff6e7' : '#ffffff40'}
      />
    );
  };

  const renderTabBar = ({ routeName, selectedTab, navigate }) => {
    return (
      <TouchableOpacity
        onPress={() => navigate(routeName)}
        style={styles.tabButton}
      >
        {_renderIcon(routeName, selectedTab)}
      </TouchableOpacity>
    );
  };

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
            <Animated.View style={styles.circleContainer}>
              <TouchableOpacity
                style={styles.btnCircle}
                onPress={() => navigate('Show')}
              >
                <Image
                  source={require('../../assets/spaceship.png')}
                  style={styles.spaceshipIcon}
                />
              </TouchableOpacity>
            </Animated.View>
          )}
          tabBar={renderTabBar}
        >
          <CurvedBottomBarExpo.Screen
            name="Search"
            position="LEFT"
            component={CarouselStack}
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
    borderColor: 'black',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceshipIcon: {
    width: 30,
    height: 30,
    tintColor: '#fff6e7',
  },
});
