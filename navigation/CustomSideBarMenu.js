// CustomSideBarMenu.js

import React, { useEffect, useRef, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity, 
  Dimensions, 
  Alert 
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { AuthContext } from '../auth/AuthContext'; // Import AuthContext
import { signOut } from 'firebase/auth';  // Import Firebase signOut function
import { auth } from '../auth/firebase';  // Import the initialized auth object from Firebase
import { useDrawerStatus } from '@react-navigation/drawer'; // Import useDrawerStatus hook

const { width, height } = Dimensions.get('window');

const CustomSideBarMenu = (props) => {
  const { user, setUser } = useContext(AuthContext); // Use AuthContext for authentication
  const rotation = useRef(new Animated.Value(0)).current; // Rotation animation value
  const isDrawerOpen = useDrawerStatus() === 'open'; // Check if drawer is open

  const animationRef = useRef(null); // Reference to the animation

  useEffect(() => {
    if (isDrawerOpen) {
      startRotationAnimation();
    } else {
      stopRotationAnimation();
    }

    // Cleanup on unmount
    return () => {
      stopRotationAnimation();
    };
  }, [isDrawerOpen]);

  const startRotationAnimation = () => {
    // Reset rotation value
    rotation.setValue(0);

    // Define the rotation animation
    animationRef.current = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1, // Rotate from 0 to 360 degrees
        duration: 4000, // Duration for one full rotation
        useNativeDriver: true,
      })
    );

    // Start the animation
    animationRef.current.start();
  };

  const stopRotationAnimation = () => {
    if (animationRef.current) {
      animationRef.current.stop(); // Stop the animation
      rotation.setValue(0); // Reset rotation value
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);  // Use Firebase signOut
      setUser(null);  // Clear the user in AuthContext
      props.navigation.navigate('Login');  // Navigate to the Login screen after logout
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

  // Interpolate rotation value to degrees
  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
        
        {/* Navigation Items */}
        <View style={styles.navSection}>
          <DrawerItem
            label="Home"
            labelStyle={styles.drawerItemLabel}
            icon={() => null} // No icon
            onPress={() => props.navigation.navigate('NexoLink')}
            style={styles.drawerItem}
            accessibilityLabel="Navigate to Home"
            accessibilityRole="button"
          />
          <DrawerItem
            label="Volunteer Logs"
            labelStyle={styles.drawerItemLabel}
            icon={() => null} // No icon
            onPress={() => props.navigation.navigate('VolunteerLogs')}
            style={styles.drawerItem}
            accessibilityLabel="Navigate to Volunteer Logs"
            accessibilityRole="button"
          />
        </View>

        {/* Logout Item */}
        {user && (
          <View style={styles.logoutSection}>
            <DrawerItem
              label="Logout"
              labelStyle={styles.drawerItemLabel}
              icon={() => null} // No icon
              onPress={handleLogout}
              style={styles.drawerItem}
              accessibilityLabel="Logout from the app"
              accessibilityRole="button"
            />
          </View>
        )}
      </DrawerContentScrollView>

      {/* Rotating Spaceship */}
      <TouchableOpacity style={styles.spaceshipContainer} onPress={handleSpaceshipPress}>
        <Animated.Image
          source={require('../assets/spaceship.png')} // Your spaceship image
          style={[
            styles.spaceship,
            {
              transform: [
                {
                  rotate: rotateInterpolate,
                },
              ],
            },
          ]}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7', // Light cream background
  },
  drawerContent: {
    paddingTop: height*0.1,
    paddingHorizontal: 10,
  },
  navSection: {
    marginTop: 10,
  },
  drawerItem: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    // No background or border to have no boxes around items
  },
  drawerItemLabel: {
    color: '#000000', // Black text
    fontSize: RFValue(16),
    marginTop:10,
  },
  logoutSection: {
    marginTop: 0,
  },
  spaceshipContainer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceship: {
    width: 50,
    height: 50,
    // No tintColor since it's a custom image
  },
});

export default CustomSideBarMenu;
