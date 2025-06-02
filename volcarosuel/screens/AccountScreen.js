// /src/screens/StatsScreen.js

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

// Dummy stats cards data
const STATS_DATA = [
  {
    id: '1',
    label: 'Total Days',
    value: '9',
    icon: 'calendar-outline',
    backgroundColor: '#FF6B35', // orange
    textColor: '#FFFFFF',
  },
  {
    id: '2',
    label: 'Exercises Done',
    value: '88',
    icon: 'barbell-outline',
    backgroundColor: '#4285F4', // blue
    textColor: '#FFFFFF',
  },
  {
    id: '3',
    label: 'Activities',
    value: '225',
    icon: 'walk-outline',
    backgroundColor: '#888888', // gray
    textColor: '#FFFFFF',
  },
  {
    id: '4',
    label: 'Calories',
    value: '1,578',
    icon: 'flame-outline',
    backgroundColor: '#A259FF', // purple
    textColor: '#FFFFFF',
  },
];

const StatsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Tab button navigates via parent
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Use dark‐content on white BG */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ─── HEADER ───────────────────────────────────────────────────── */}
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

      {/* ─── TAB NAVIGATION ───────────────────────────────────────────────── */}
      <View style={styles.tabContainer}>
        <TabButton title="Badges" />
        <TabButton title="Leaderboard" />
        <TabButton title="Stats" />
      </View>

      {/* ─── STATS GRID + MONTH DROPDOWN ────────────────────────────────────── */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          {STATS_DATA.map((stat) => (
            <View
              key={stat.id}
              style={[
                styles.statCard,
                { backgroundColor: stat.backgroundColor },
              ]}
            >
              <Ionicons name={stat.icon} size={24} color={stat.textColor} />
              <Text
                style={[
                  styles.statValue,
                  { color: stat.textColor },
                ]}
              >
                {stat.value}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: stat.textColor },
                ]}
              >
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Month dropdown pill */}
        <TouchableOpacity style={styles.monthDropdown}>
          <Ionicons name="calendar-outline" size={16} color="#333333" />
          <Text style={styles.monthText}> January 2025</Text>
          <Ionicons
            name="chevron-down-outline"
            size={16}
            color="#333333"
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default StatsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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
    paddingTop: 10,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },

  monthDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 25,
  },
  monthText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
});
