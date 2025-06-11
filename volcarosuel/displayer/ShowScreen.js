import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ImageBackground,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { AuthContext } from '../../auth/AuthContext';
import { RFPercentage } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');

const getResponsiveValues = () => {
  const screenRatio = width / height;
  const isVerySmallScreen = width < 405;
  const isSmallScreen = width < 410;
  const isMediumScreen = width >= 440 && width < 600;
  
  return {
    statusBarHeight: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : isVerySmallScreen ? 40 : isMediumScreen ? 20 : 44,
    headerImageHeight: isVerySmallScreen ? 160 : isMediumScreen ? 250 : 140,
    bottomSheetHeight: height * (isVerySmallScreen ? 0.78 : 0.77),
    backCircleSize: isVerySmallScreen ? 32 : 36,
    backIconSize: isVerySmallScreen ? 20 : 24,
    borderRadius: isVerySmallScreen ? 20 : 24,
    cardBorderRadius: isVerySmallScreen ? 14 : 16,
    horizontalPadding: isVerySmallScreen ? 12 : 16,
    verticalPadding: isVerySmallScreen ? 16 : 20,
    marginBottom: isVerySmallScreen ? 12 : 16,
    scrollMarginTop: isVerySmallScreen ? 0 : 0,
    paddingBottom: isVerySmallScreen ? 40 : 60,
    handleBarWidth: isVerySmallScreen ? 35 : 40,
  };
};

const responsive = getResponsiveValues();

const STATE_MAP = {
  CA: 'California',
  NY: 'New York',
  TX: 'Texas',
  FL: 'Florida',
  WA: 'Washington',
};

const CATEGORY_IMAGES = {
  Animal: require('../../assets/animal.png'),
  Arts: require('../../assets/art.png'),
  Education: require('../../assets/education.png'),
  Environment: require('../../assets/enviroment.png'),
  Family: require('../../assets/family.png'),
  Hospital: require('../../assets/hospital.png'),
  Library: require('../../assets/library.png'),
  Seniors: require('../../assets/seniors.png'),
  Tech: require('../../assets/tech.png'),
};

const DEFAULT_HEADER_IMAGE = require('../../assets/animal.png');
const TOTAL_HEADER_HEIGHT = responsive.headerImageHeight + responsive.statusBarHeight;

export default function ShowScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useContext(AuthContext);

  const item = route.params?.item || {};
  const category = item.reference || 'Animal';
  const headerBgImage = CATEGORY_IMAGES[category] || DEFAULT_HEADER_IMAGE;

  const DEFAULT_PALETTE = [
    '#F7F7F7',
    '#FFFFFF',
    '#FFFFFF',
    '#333333',
  ];
  const [palette, setPalette] = useState(DEFAULT_PALETTE);

  const openMaps = () => {
    if (!item.address) return;

    const encodedAddress = encodeURIComponent(item.address);
    let url = '';

    if (Platform.OS === 'ios') {
      url = `maps://?daddr=${encodedAddress}`;
    } else {
      url = `google.navigation:q=${encodedAddress}`;
    }

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
          return Linking.openURL(webUrl);
        }
      })
      .catch(() => Alert.alert('Error', 'Unable to open maps.'));
  };

  const copyToClipboard = (text) => {
    Clipboard.setStringAsync(text)
      .then(() => {
        Alert.alert('Copied!', `${text} has been copied to clipboard.`);
      })
      .catch(() => {
        Alert.alert('Error', 'Failed to copy.');
      });
  };

  const handleVisit = () => {
    if (!item.website) return;
    let url = item.website;
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    Linking.canOpenURL(url)
      .then((supported) => {
        supported
          ? Linking.openURL(url)
          : Alert.alert('Error', 'Cannot open link');
      })
      .catch(() => Alert.alert('Error', 'Unexpected error'));
  };

  return (
    <View style={[styles.container, { backgroundColor: palette[0] }]}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ImageBackground
        source={headerBgImage}
        style={[
          styles.headerImage,
          { width: width, height: TOTAL_HEADER_HEIGHT },
        ]}
        imageStyle={{ resizeMode: 'cover' }}
      >
        <View style={styles.headerOverlay}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <View style={[styles.backCircle, { backgroundColor: palette[1] }]}>
              <Ionicons name="chevron-back" size={responsive.backIconSize} color="#000" />
            </View>
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: '#FFF' }]}>
              {item.title}
            </Text>
          </View>

          <View style={styles.headerRightPlaceholder} />
        </View>
      </ImageBackground>

      <View
        style={[
          styles.bottomSheet,
          { height: responsive.bottomSheetHeight, backgroundColor: palette[0] },
        ]}
      >
        <View style={styles.handleBar} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, { backgroundColor: palette[1] }]}>
            <Text style={[styles.sectionLabel, { color: palette[3] }]}>
              Description
            </Text>
            <Text style={[styles.bodyText, { color: palette[3] }]}>
              {item.description}
            </Text>
          </View>

          {item.address && (
            <View style={[styles.card, { backgroundColor: palette[1] }]}>
              <Text style={[styles.sectionLabel, { color: palette[3] }]}>
                Address
              </Text>
              <TouchableOpacity onPress={openMaps}>
                <Text style={[styles.linkText, { color: '#1E90FF' }]}>
                  {item.address}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {item.email && (
            <View style={[styles.card, { backgroundColor: palette[1] }]}>
              <Text style={[styles.sectionLabel, { color: palette[3] }]}>
                Contact
              </Text>
              <View style={styles.contactRow}>
                <Text style={[styles.bodyText, { color: palette[3] }]}>
                  {item.email}
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(item.email)}
                  style={styles.copyButton}
                >
                  <Ionicons name="copy-outline" size={20} color={palette[3]} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {item.website && (
            <TouchableOpacity
              style={[styles.visitBtn, { backgroundColor: palette[2] }]}
              onPress={handleVisit}
            >
              <Text style={[styles.visitTxt, { color: palette[3] }]}>
                Visit Website
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  headerOverlay: {
    flex: 1,
    marginTop: responsive.statusBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsive.horizontalPadding,
    height: responsive.headerImageHeight,
  },
  backButton: {
    padding: 6,
  },
  backCircle: {
    width: responsive.backCircleSize,
    height: responsive.backCircleSize,
    borderRadius: responsive.backCircleSize / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: RFPercentage(3),
    fontWeight: '800',
    color: '#FFF',
  },
  headerRightPlaceholder: {
    width: 32,
  },

  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: responsive.borderRadius,
    borderTopRightRadius: responsive.borderRadius,
    elevation: 8,
    zIndex: 10,
  },
  handleBar: {
    width: responsive.handleBarWidth,
    height: 4,
    backgroundColor: 'black',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 8,
  },
  scrollView: {
    flex: 1,
    marginTop: responsive.scrollMarginTop,
  },
  scrollContent: {
    paddingHorizontal: responsive.horizontalPadding,
    paddingBottom: responsive.paddingBottom,
    backgroundColor: 'transparent',
  },

  card: {
    borderRadius: responsive.cardBorderRadius,
    padding: responsive.verticalPadding,
    marginBottom: responsive.marginBottom,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionLabel: {
    fontSize: RFPercentage(2.2),
    fontWeight: '600',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: RFPercentage(1.8),
    lineHeight: RFPercentage(2.6),
  },
  linkText: {
    fontSize: RFPercentage(1.8),
    textDecorationLine: 'underline',
  },

  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  copyButton: {
    padding: 4,
  },

  visitBtn: {
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: responsive.horizontalPadding,
    marginTop: 12,
  },
  visitTxt: {
    fontSize: RFPercentage(2),
    fontWeight: '600',
  },
});