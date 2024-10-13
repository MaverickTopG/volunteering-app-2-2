import React, { useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, Animated, Image, Dimensions, Alert } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { DrawerContentScrollView, DrawerItem, useDrawerStatus } from '@react-navigation/drawer';
import { AuthContext } from '../auth/AuthContext'; // Import AuthContext
import { signOut } from 'firebase/auth';  // Import Firebase signOut function
import { auth } from '../auth/firebase';  // Import the initialized auth object from Firebase

const { width, height } = Dimensions.get('window');

const CustomSideBarMenu = (props) => {
  const { user, setUser } = useContext(AuthContext); // Use AuthContext for authentication
  const rotation = useRef(new Animated.Value(0)).current; // Rotation animation value

  const isDrawerOpen = useDrawerStatus() === 'open';

  useEffect(() => {
    if (isDrawerOpen) {
      startRotationAnimation(); // Start rotation when the drawer opens
    }
  }, [isDrawerOpen]);

  const startRotationAnimation = () => {
    Animated.timing(rotation, {
      toValue: 1, // Rotate 360 degrees (1 in interpolation)
      duration: 2000, // Duration of rotation
      useNativeDriver: true,
    }).start(() => {
      rotation.setValue(0); // Reset rotation value after animation completes
    });
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

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props}>
        <View style={styles.header}>
          <View style={styles.boxContainer}>
            <View style={styles.box}>
              <Text style={styles.boxText}>NexoLink</Text>
            </View>
          </View>
        </View>
        <DrawerItem
          label="Home"
          labelStyle={styles.drawerItemLabel}
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('NexoLink')}
        />
        <DrawerItem
          label="Volunteer Logs"
          labelStyle={styles.drawerItemLabel}
          style={styles.drawerItem}
          onPress={() => props.navigation.navigate('VolunteerLogs')}
        />

        {user && (
          <DrawerItem
            label="Logout"
            labelStyle={styles.drawerItemLabel}
            style={styles.drawerItem}
            onPress={handleLogout}
          />
        )}
      </DrawerContentScrollView>

      <Animated.View
        style={[
          styles.spaceshipContainer,
          {
            transform: [
              {
                rotate: rotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'], // Rotate once from 0 to 360 degrees
                }),
              },
            ],
          },
        ]}
      >
        <Image source={require('../assets/spaceship.png')} style={styles.spaceship} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  boxContainer: {
    backgroundColor: '#fff6e7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  box: {
    backgroundColor: 'black',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  boxText: {
    fontSize: RFValue(16),
    fontWeight: 'bold',
    color: '#fff6e7',
  },
  drawerItem: {
    backgroundColor: 'black',
    marginVertical: 5,
    borderRadius: 10,
  },
  drawerItemLabel: {
    color: '#fff6e7',
    fontSize: RFValue(16),
    paddingHorizontal: 20,
  },
  spaceshipContainer: {
    position: 'absolute',
    bottom: 50,
    right: 180,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceship: {
    width: 40,
    height: 40,
    tintColor: 'black',
  },
});

export default CustomSideBarMenu;
