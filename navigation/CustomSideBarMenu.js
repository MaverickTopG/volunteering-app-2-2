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
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const positionX = useRef(new Animated.Value(width * 0.1)).current;
  const positionY = useRef(new Animated.Value(height * 0.9)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  const isDrawerOpen = useDrawerStatus() === 'open';

  useEffect(() => {
    if (isDrawerOpen) {
      startSpaceshipAnimation();
    }
  }, [isDrawerOpen]);

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const startSpaceshipAnimation = () => {
    const path = [
      { x: width * 0.1, y: height * 0.3 },
      { x: width * 0.5, y: height * 0.3 },
      { x: width * 0.5, y: height * 0.9 },
      { x: width * 0.2, y: height * 0.9 },
      { x: width * 0.2, y: height * 0.4 },
      { x: width * 0.39, y: height * 0.4 },
      { x: width * 0.39, y: height * 0.9 },
      { x: width * 0.25, y: height * 0.5 },
      { x: width * 0.1, y: height * 0.85 },
    ];

    const animations = path.map((point, index) => {
      const duration = 2000;
      return Animated.parallel([
        Animated.timing(positionX, {
          toValue: point.x,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(positionY, {
          toValue: point.y,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: index % 2 === 0 ? 1 : 0,
          duration,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.sequence(animations).start(() => {
      positionX.setValue(width * 0.1);
      positionY.setValue(height * 0.85);
      rotation.setValue(0);
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
          <Animated.View style={[styles.boxContainer, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.box}>
              <Text style={styles.boxText}>NexoLink</Text>
            </View>
          </Animated.View>
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
        {/* Add other DrawerItem components as needed */}

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
              { translateX: positionX },
              { translateY: positionY },
              {
                rotate: rotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
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
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  spaceship: {
    width: 40,
    height: 40,
    tintColor: 'black',
  },
});

export default CustomSideBarMenu;
