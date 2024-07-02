import React from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CurvedBottomBarExpo } from 'react-native-curved-bottom-bar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import AnimalCarousel from '../Sections/animalCarousel';
import SearchScreen from './SearchScreen';
import TechCarousel from '../Sections/techCarosuel';
import FamilyCarousel from '../Sections/childrenCarosuel';
import HospitalCarousel from '../Sections/hospitalCarousel';
import SeniorCarousel from '../Sections/seniorsCarousel';
import AIScreen from './ProfileScreen';
import DisplayScreen from '../ShowScreen';
import MapScreen from './MapScreen';
import { CarouselProvider, useCarousel } from './CarosuelSelection';

const Stack = createStackNavigator();

const HomeStack = () => {
    const { selectedCarousel } = useCarousel();
    let CarouselComponent;
    switch (selectedCarousel) {
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
            <Stack.Screen
                name="Carousel"
                component={CarouselComponent}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="DisplayScreen"
                component={DisplayScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

const AnimalTabNavigator = () => {
    const navigation = useNavigation();
    const { setSelectedCarousel } = useCarousel();

    const _renderIcon = (routeName, selectedTab) => {
        let icon = "";

        switch (routeName) {
            case "Home":
                icon = "home";
                break;
            case "Search":
                icon = "search";
                break;
            case "Map":
                icon = "map";
                break;
            case "Profile":
                icon = "person";
                break;
        }

        return (
            <Ionicons
                name={icon}
                size={25}
                color={routeName === selectedTab ? "#fff" : "#ffffff40"}
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
        <CarouselProvider>
            <View style={{ flex: 1 }}>
                <CurvedBottomBarExpo.Navigator
                    style={styles.bottomBar}
                    height={65}
                    circleWidth={75}
                    bgColor="#1A1A23"
                    initialRouteName="Home"
                    borderTopLeftRight
                    renderCircle={({ selectedTab, navigate }) => (
                        <Animated.View style={styles.circleContainer}>
                            <TouchableOpacity
                                style={styles.btnCircle}
                                onPress={() => { }}
                            >
                                <Ionicons name={"add"} color="white" size={30} />
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                    tabBar={renderTabBar}
                >
                    <CurvedBottomBarExpo.Screen
                        name="Home"
                        position="LEFT"
                        component={HomeStack}
                        options={{ headerShown: false }}
                    />
                    <CurvedBottomBarExpo.Screen
                        name="Search"
                        position="LEFT"
                        component={SearchScreen}
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
                        component={AIScreen}
                        options={{ headerShown: false }}
                    />
                </CurvedBottomBarExpo.Navigator>
            </View>
        </CarouselProvider>
    );
};

export default AnimalTabNavigator;

const styles = StyleSheet.create({
    bottomBar: {
        position: "absolute",
        borderRadius: 20,
        elevation: 1000,
        shadowColor: "#000",
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
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "black",
        shadowColor: "#1A1A23",
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
        borderColor: "black",
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
    },
});
