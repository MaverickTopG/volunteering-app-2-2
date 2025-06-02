// /src/screens/BadgesScreen.js

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

const BadgesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Dummy data: first 3 unlocked, next 3 locked
  const badges = [
    { id: 1, number: 11, type: 'shield', unlocked: true },
    { id: 2, number: 80, type: 'banner', unlocked: true },
    { id: 3, type: 'circle', icon: '🏋️', unlocked: true },
    { id: 4, type: 'shield', unlocked: false },
    { id: 5, type: 'banner', unlocked: false },
    { id: 6, type: 'circle', unlocked: false },
  ];

  // Renders each badge shape
  const BadgeComponent = ({ badge }) => {
    const containerStyle = [
      styles.badgeContainer,
      badge.unlocked
        ? styles.badgeBorderUnlocked
        : styles.badgeBorderLocked,
    ];

    let inner;
    if (badge.type === 'shield') {
      inner = (
        <View
          style={[
            styles.shieldBadge,
            badge.unlocked
              ? styles.unlockedBackground
              : styles.lockedBackground,
          ]}
        >
          {badge.unlocked && (
            <Text style={styles.badgeNumber}>{badge.number}</Text>
          )}
        </View>
      );
    } else if (badge.type === 'banner') {
      inner = (
        <View
          style={[
            styles.bannerBadge,
            badge.unlocked
              ? styles.unlockedBackground
              : styles.lockedBackground,
          ]}
        >
          {badge.unlocked && (
            <Text style={styles.badgeNumber}>{badge.number}</Text>
          )}
        </View>
      );
    } else {
      inner = (
        <View
          style={[
            styles.circleBadge,
            badge.unlocked
              ? styles.unlockedBackground
              : styles.lockedBackground,
          ]}
        >
          {badge.unlocked && (
            <Text style={styles.badgeIcon}>{badge.icon}</Text>
          )}
        </View>
      );
    }

    return <View style={containerStyle}>{inner}</View>;
  };

  // Tab button that navigates via parent navigator
  const TabButton = ({ title }) => {
    const isActive = route.name === title;
    return (
      <TouchableOpacity
        style={[styles.tabButton, isActive && styles.activeTabButton]}
        onPress={() => {
          if (!isActive) {
            // Navigate using the parent stack navigator
            navigation.getParent()?.navigate(title);
          }
        }}
      >
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Dark‐content status bar for a white background */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ─── HEADER ────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Achievements</Text>

        <TouchableOpacity style={styles.settingsButton}>
          <Text style={styles.settingsButtonText}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* ─── TAB NAVIGATION ─────────────────────────────────────────────────── */}
      <View style={styles.tabContainer}>
        <TabButton title="Badges" />
        <TabButton title="Leaderboard" />
        <TabButton title="Stats" />
      </View>

      {/* ─── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Text */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            You currently have{' '}
            {badges.filter((b) => b.unlocked).length} active badges.
          </Text>
          <Text style={styles.statusSubtext}>
            Congratulations on your fitness journey!
          </Text>
        </View>

        {/* Badges Grid */}
        <View style={styles.badgesGrid}>
          {badges.map((badge) => (
            <BadgeComponent key={badge.id} badge={badge} />
          ))}
        </View>

        {/* Extra bottom padding so content isn’t cut off */}
        <View style={styles.additionalBadges} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default BadgesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#333333',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButtonText: {
    fontSize: 18,
    color: '#333333',
  },

  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: 'transparent',
  },
  activeTabButton: {
    backgroundColor: '#000000',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  statusText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  statusSubtext: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },

  badgesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  badgeContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  shieldBadge: {
    width: 80,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    borderWidth: 3,
  },
  bannerBadge: {
    width: 80,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 3,
  },
  circleBadge: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
    borderWidth: 3,
  },
  unlockedBackground: {
    backgroundColor: '#000000',
    borderColor: '#FF6B35',
  },
  lockedBackground: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CCCCCC',
  },
  badgeBorderUnlocked: {
    marginBottom: 20,
  },
  badgeBorderLocked: {
    marginBottom: 20,
  },
  badgeNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  badgeIcon: {
    fontSize: 30,
  },
  additionalBadges: {
    paddingBottom: 40,
  },
});
