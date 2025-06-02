// /src/screens/LeaderboardScreen.js

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Image,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

// Dummy “All Leaderboards” data array
const LEADERBOARD_DATA = [
  {
    id: '1',
    rank: 1,
    avatar:
      'https://images.unsplash.com/photo-1603415526960-f4e04fc1c5b3?&w=100&h=100',
    name: 'Azunyan U. Wu',
    points: '118,487 pts',
    level: 'Lvl 10',
    badgeNumber: 80,
  },
  {
    id: '2',
    rank: 2,
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?&w=100&h=100',
    name: 'Charlotte S. Nova',
    points: '113,210 pts',
    level: 'Lvl 9',
    badgeNumber: 75,
  },
  {
    id: '3',
    rank: 3,
    avatar:
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?&w=100&h=100',
    name: 'The Infiltrator',
    points: '4,878 pts',
    level: 'Lvl 5',
    badgeNumber: 50,
  },
  {
    id: '4',
    rank: 4,
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?&w=100&h=100',
    name: 'Skyler J. Trent',
    points: '3,540 pts',
    level: 'Lvl 4',
    badgeNumber: 40,
  },
  // …add more if needed…
];

const LeaderboardScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Tab button that bubbles up to parent navigator
  const TabButton = ({ title }) => {
    const isActive = route.name === title;
    return (
      <TouchableOpacity
        style={[styles.tabButton, isActive && styles.activeTabButton]}
        onPress={() => {
          if (!isActive) {
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

  // Renders each row in “All Leaderboards”
  const renderRow = ({ item }) => (
    <View style={styles.lbRow}>
      <View style={styles.lbRankCircle}>
        <Text style={styles.lbRankText}>{item.rank}</Text>
      </View>
      <Image source={{ uri: item.avatar }} style={styles.lbAvatar} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.lbName}>{item.name}</Text>
        <Text style={styles.lbPointsLvl}>
          {item.points} · {item.level}
        </Text>
      </View>
      <View style={styles.lbBadgeWrapper}>
        <View style={styles.lbBadge}>
          <Text style={styles.lbBadgeText}>{item.badgeNumber}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* White status bar */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ─── HEADER ────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerButtonText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Achievements</Text>

        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.headerButtonText}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* ─── TAB NAVIGATION ─────────────────────────────────────────────────── */}
      <View style={styles.tabContainer}>
        <TabButton title="Badges" />
        <TabButton title="Leaderboard" />
        <TabButton title="Stats" />
      </View>

      {/* ─── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <View style={styles.content}>
        {/* Top section: small trophy icon, avatar circle, small chart icon */}
        <View style={styles.topSection}>
          <TouchableOpacity style={styles.smallCircleBtn}>
            <Ionicons name="trophy-outline" size={24} color="#333333" />
          </TouchableOpacity>

          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri:
                  'https://images.unsplash.com/photo-1502735088834-7b5e9c8046d4?&w=200&h=200',
              }}
              style={styles.avatarImage}
            />
          </View>

          <TouchableOpacity style={styles.smallCircleBtn}>
            <Ionicons name="bar-chart-outline" size={24} color="#333333" />
          </TouchableOpacity>
        </View>

        <Text style={styles.largeScore}>4,878</Text>
        <View style={styles.scoreSubtitleRow}>
          <Text style={styles.scoreSubtitle}>The Infiltrator</Text>
          <Ionicons
            name="trophy-outline"
            size={16}
            color="#FF6B35"
            style={{ marginHorizontal: 6 }}
          />
          <Text style={[styles.scoreSubtitle, { color: '#FF6B35' }]}>
            3rd Place
          </Text>
        </View>

        <TouchableOpacity style={styles.viewStatsButton}>
          <Ionicons name="bar-chart" size={16} color="#FFFFFF" />
          <Text style={styles.viewStatsText}> View Stats</Text>
        </TouchableOpacity>

        {/* ─── “All Leaderboards” HEADER ──────────────────────────────────── */}
        <View style={styles.allLbHeader}>
          <Text style={styles.allLbTitle}>All Leaderboards</Text>
          <TouchableOpacity>
            <Text style={styles.allLbSeeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* ─── LIST (FlatList) ────────────────────────────────────────────── */}
        <FlatList
          data={LEADERBOARD_DATA}
          keyExtractor={(item) => item.id}
          renderItem={renderRow}
          ItemSeparatorComponent={() => (
            <View style={styles.separator} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </View>
    </SafeAreaView>
  );
};

export default LeaderboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: {
    fontSize: 24,
    color: '#333333',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },

  // Tabs
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

  // Main content wrapper
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Top section: icons + avatar
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  smallCircleBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FF6B35',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },

  largeScore: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginTop: 20,
  },
  scoreSubtitleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  scoreSubtitle: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  viewStatsButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6B35',
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 12,
  },
  viewStatsText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },

  allLbHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 10,
    alignItems: 'center',
  },
  allLbTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  allLbSeeAll: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
  },

  // Each leaderboard row
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  lbRankCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lbRankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  lbAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
  lbName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  lbPointsLvl: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  lbBadgeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lbBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lbBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },

  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 4,
  },
});
