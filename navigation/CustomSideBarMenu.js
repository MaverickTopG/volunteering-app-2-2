import React, { useEffect, useRef, useContext, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity, 
  Dimensions, 
  Alert 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { AuthContext } from '../auth/AuthContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '../auth/firebase'; // Ensure db is exported
import { useDrawerStatus } from '@react-navigation/drawer';
import { collection, getDocs } from 'firebase/firestore';

// Baseline (iPhone 16 Pro Max)
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

const CustomSideBarMenu = (props) => {
  const { user, setUser } = useContext(AuthContext);
  const rotation = useRef(new Animated.Value(0)).current;
  const isDrawerOpen = useDrawerStatus() === 'open';
  const animationRef = useRef(null);

  // State to store a random volunteer fact from Firestore
  const [randomFact, setRandomFact] = useState("");

  // Fetch a new volunteer fun fact every time the drawer opens
  useEffect(() => {
    if (isDrawerOpen) {
      fetchRandomFact();
    }
  }, [isDrawerOpen]);

  const fetchRandomFact = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'volunteer_funfacts'));
      const allFacts = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.fun_fact) {
          allFacts.push(data.fun_fact);
        }
      });
      if (allFacts.length > 0) {
        const index = Math.floor(Math.random() * allFacts.length);
        setRandomFact(allFacts[index]);
      } else {
        setRandomFact("Volunteering Fact: [No facts found in Firestore!]");
      }
    } catch (err) {
      console.error("Error fetching fun facts:", err);
      setRandomFact("Volunteering Fact: [Error fetching facts!]");
    }
  };

  useEffect(() => {
    if (isDrawerOpen) {
      startRotationAnimation();
    } else {
      stopRotationAnimation();
    }
    return () => {
      stopRotationAnimation();
    };
  }, [isDrawerOpen]);

  const startRotationAnimation = () => {
    rotation.setValue(0);
    animationRef.current = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    );
    animationRef.current.start();
  };

  const stopRotationAnimation = () => {
    if (animationRef.current) {
      animationRef.current.stop();
      rotation.setValue(0);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      props.navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSpaceshipPress = () => {
    if (user && user.email) {
      Alert.alert('Registered Email', user.email);
    } else {
      Alert.alert('No Email Found', 'You are not logged in.');
    }
  };

  // Rotation interpolation
  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    // Transparent container to let the dark overlay show behind it
    <View style={styles.container}>
      <DrawerContentScrollView 
        {...props} 
        contentContainerStyle={styles.drawerContent}
      >
        {/* Card items, same style as before, aligned left with spaceship */}
        <View style={styles.navSection}>
          {/* HOME Card */}
          <View style={styles.cardContainer}>
            <DrawerItem
              label="Home"
              labelStyle={styles.drawerItemLabel}
              icon={() => null}
              onPress={() => props.navigation.navigate('NexoLink')}
              style={styles.drawerItem}
              accessibilityLabel="Navigate to Home"
              accessibilityRole="button"
            />   
          </View>

          {/* ADD AN ORG Card */}
          <View style={styles.cardContainer}>
            <DrawerItem
              label="Add an Org"
              labelStyle={styles.drawerItemLabel}
              icon={() => null}
              onPress={() => props.navigation.navigate('Organizations')}
              style={styles.drawerItem}
              accessibilityLabel="Navigate to Organizations"
              accessibilityRole="button"
            />   
          </View>

          {/* ACCOUNT Card */}
          <View style={styles.cardContainer}>
            <DrawerItem
              label="Account"
              labelStyle={styles.drawerItemLabel}
              icon={() => null}
              onPress={() => props.navigation.navigate('Account')}
              style={styles.drawerItem}
              accessibilityLabel="Navigate to Account"
              accessibilityRole="button"
            />
          </View>

          {/* Black card for fun fact */}
          <View style={styles.blackCard}>
            <Ionicons name="planet" size={scale(80)} color="#fff6e7" />
            <Text style={styles.someCoolText}>
              Explore the Universe of Volunteering!
            </Text>
            <Text style={styles.funFact}>
              {randomFact}
            </Text>
          </View>
        </View>
      </DrawerContentScrollView>

      {/* Rotating Spaceship with circle behind it */}
      <TouchableOpacity 
        style={styles.spaceshipContainer} 
        onPress={handleSpaceshipPress}
      >
        <View style={styles.spaceshipCircle} />
        <Animated.Image
          source={require('../assets/spaceship.png')}
          style={[
            styles.spaceship,
            { transform: [{ rotate: rotateInterpolate }] },
          ]}
        />
      </TouchableOpacity>
    </View>
  );
};

export default CustomSideBarMenu;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Transparent to show dark overlay
  },
  drawerContent: {
    // Move everything down by ~10% of screen height
    paddingTop: verticalScale(0.15 * height),
  },
  navSection: {
    // Align left with the spaceship
    marginLeft: scale(30),
  },
  cardContainer: {
    backgroundColor: '#fff6e7',
    borderRadius: scale(12),
    marginBottom: verticalScale(12),
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    // Android elevation
    elevation: 3,
    borderWidth: scale(1),
    borderColor: '#ccc',
  },
  drawerItem: {
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(10),
  },
  drawerItemLabel: {
    color: '#000',
    fontSize: scale(16),
  },
  /* Black card for the fun fact */
  blackCard: {
    backgroundColor: '#000',
    borderRadius: scale(12),
    marginTop: verticalScale(30),
    padding: scale(15),
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.2,
    shadowRadius: scale(4),
    elevation: 4,
    alignItems: 'center',
    // Increase minHeight so longer facts fit
    minHeight: verticalScale(120),
    justifyContent: 'center',
  },
  someCoolText: {
    marginTop: verticalScale(10),
    color: '#fff6e7',
    fontSize: scale(18),
    textAlign: 'center',
  },
  funFact: {
    marginTop: verticalScale(10),
    color: '#fff6e7',
    fontSize: scale(14),
    textAlign: 'center',
  },
  /* Circle + spaceship */
  spaceshipContainer: {
    position: 'absolute',
    bottom: verticalScale(30),
    left: scale(30),
    width: scale(60),
    height: scale(60),
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceshipCircle: {
    position: 'absolute',
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    backgroundColor: '#fff6e7',
    zIndex: -1,
  },
  spaceship: {
    width: scale(50),
    height: scale(50),
  },
});
