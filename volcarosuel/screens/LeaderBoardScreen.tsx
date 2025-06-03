// /src/screens/LeaderboardScreen.js

import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../../auth/AuthContext';
import { db } from '../../auth/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';

// A small pool of icons to pick from for each rank
const ICON_POOL = [
  'star-outline',
  'trophy-outline',
  'medal-outline',
  'ribbon-outline',
  'flame-outline',
  'football-outline',
  'fitness-outline',
  'bicycle-outline',
  'leaf-outline',
  'heart-outline',
];

export default function LeaderboardScreen() {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const route = useRoute();

  const [leaderboardData, setLeaderboardData] = useState([]); // [{ userId, name, totalHours }]
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // Whenever this screen is focused, re‐fetch the leaderboard
  useFocusEffect(
    React.useCallback(() => {
      if (!user) return;
      fetchLeaderboard();
    }, [user])
  );

  // 1) Sum all volunteer_logs hours per user_id (except "master")
  // 2) Look up each user's name from /users/{userId} (fallback to "Anonymous")
  // 3) Sort by descending totalHours
  async function fetchLeaderboard() {
    setLoading(true);

    try {
      // Step 1: query all volunteer_logs where user_id != ""
      const logsQuery = query(
        collection(db, 'volunteer_logs'),
        where('user_id', '!=', '')
      );
      const logsSnap = await getDocs(logsQuery);

      // Sum hours per user_id
      const sums = {};
      logsSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const uid = data.user_id;
        const hrs = parseFloat(data.hours_contributed) || 0;
        sums[uid] = (sums[uid] || 0) + hrs;
      });

      // Convert to array and filter out "master"
      let arr = Object.entries(sums)
        .filter(([uid]) => uid !== 'master')
        .map(([uid, totalHours]) => ({ userId: uid, totalHours }));

      // Step 2: fetch each user's name
      const withNames = await Promise.all(
        arr.map(async (entry) => {
          try {
            const userRef = doc(db, 'users', entry.userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists() && userSnap.data().name) {
              return { ...entry, name: userSnap.data().name };
            }
          } catch (e) {
            // ignore
          }
          return { ...entry, name: 'Anonymous' };
        })
      );

      // Step 3: sort descending by totalHours
      withNames.sort((a, b) => b.totalHours - a.totalHours);
      setLeaderboardData(withNames);
    } catch (e) {
      console.warn('Error loading leaderboard:', e);
    } finally {
      setLoading(false);
    }
  }

  // Determine current user's rank
  const currentUserRank = (() => {
    if (!user || !leaderboardData.length) return null;
    const idx = leaderboardData.findIndex((item) => item.userId === user.uid);
    if (idx === -1) return null;
    return {
      rank: idx + 1,
      data: leaderboardData[idx],
    };
  })();

  // Render a single row (used in both main screen and modal)
  const renderRow = ({ item, index }) => {
    const rank = index + 1;
    // pick a “random” icon by cycling through ICON_POOL
    const iconName = ICON_POOL[index % ICON_POOL.length];
    const totalHrs = Math.round(item.totalHours);
    const level = Math.floor(item.totalHours / 10) + 1;

    return (
      <View style={styles.lbRow}>
        {/* Leftmost Rank Circle */}
        <View style={styles.lbRankCircle}>
          <Text style={styles.lbRankText}>{rank}</Text>
        </View>

        {/* Orange Icon */}
        <Ionicons
          name={iconName}
          size={28}
          color="#FF6B35"
          style={{ marginHorizontal: 12 }}
        />

        {/* Name + subtext */}
        <View style={{ flex: 1 }}>
          <Text style={styles.lbName}>{item.name}</Text>
          <Text style={styles.lbSubText}>
            {totalHrs} h • Lvl {level}
          </Text>
        </View>

        {/* Rightmost hours badge (orange rounded rect) */}
        <View style={styles.lbBadge}>
          <Text style={styles.lbBadgeText}>{totalHrs}</Text>
        </View>
      </View>
    );
  };

  // Podium for top 3
  const Podium = ({ data }) => {
    const entry1 = data[0] || { name: '—', totalHours: 0 };
    const entry2 = data[1] || { name: '—', totalHours: 0 };
    const entry3 = data[2] || { name: '—', totalHours: 0 };

    const hrs1 = Math.round(entry1.totalHours);
    const hrs2 = Math.round(entry2.totalHours);
    const hrs3 = Math.round(entry3.totalHours);

    return (
      <View style={styles.podiumContainer}>
        {/* Rank 2 (silver) */}
        <View style={styles.podiumSlot}>
          <Ionicons name="medal-outline" size={36} color="#C0C0C0" />
          <Text style={styles.podiumName}>{entry2.name}</Text>
          <Text style={styles.podiumHrs}>{hrs2} h</Text>
          <View style={[styles.podiumBase, styles.podiumSecond]}>
            <Text style={styles.podiumRank}>2</Text>
          </View>
        </View>

        {/* Rank 1 (gold) */}
        <View style={styles.podiumSlot}>
          <View>
            <Ionicons name="trophy-outline" size={48} color="#FFD700" />
            {/* small trophy overlay */}
            <View style={styles.crownIcon}>
              <Ionicons name="trophy" size={20} color="#FFD700" />
            </View>
          </View>
          <Text style={styles.podiumName}>{entry1.name}</Text>
          <Text style={styles.podiumHrs}>{hrs1} h</Text>
          <View style={[styles.podiumBase, styles.podiumFirst]}>
            <Text style={styles.podiumRank}>1</Text>
          </View>
        </View>

        {/* Rank 3 (bronze) */}
        <View style={styles.podiumSlot}>
          <Ionicons name="ribbon-outline" size={36} color="#CD7F32" />
          <Text style={styles.podiumName}>{entry3.name}</Text>
          <Text style={styles.podiumHrs}>{hrs3} h</Text>
          <View style={[styles.podiumBase, styles.podiumThird]}>
            <Text style={styles.podiumRank}>3</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* White status bar */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ─── HEADER ────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        {/* Keep title centered by leaving empty spacer */}
        <View style={styles.headerSpacer} />
      </View>

      {/* ─── TAB NAVIGATION ─────────────────────────────────────────────────── */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => navigation.getParent()?.navigate('Badges')}
        >
          <Text style={styles.tabText}>Badges</Text>
        </TouchableOpacity>

        <View style={[styles.tabButton, styles.activeTabButton]}>
          <Text style={[styles.tabText, styles.activeTabText]}>
            Leaderboard
          </Text>
        </View>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => navigation.getParent()?.navigate('Stats')}
        >
          <Text style={styles.tabText}>Stats</Text>
        </TouchableOpacity>
      </View>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#FF6B35" />
        ) : (
          <>
            {/* Current User Section */}
            {currentUserRank && (
              <View style={styles.currentUserSection}>
            
                <Text style={styles.currentUserScore}>
                  {Math.round(currentUserRank.data.totalHours)} h
                </Text>
                <Text style={styles.currentUserName}>
                  {currentUserRank.data.name}
                </Text>
                <Text style={styles.currentUserRank}>
                  🏆{' '}
                  {currentUserRank.rank === 1
                    ? '1st'
                    : currentUserRank.rank === 2
                    ? '2nd'
                    : currentUserRank.rank === 3
                    ? '3rd'
                    : `${currentUserRank.rank}th`}{' '}
                  Place
                </Text>
              </View>
            )}

            {/* Podium: top 3 */}
            {leaderboardData.length >= 3 && (
              <Podium data={leaderboardData} />
            )}

            {/* “All Leaderboards” Header */}
            <View style={styles.allHeaderRow}>
              <Text style={styles.allHeaderTitle}>All Leaderboards</Text>
              {leaderboardData.length > 5 && (
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Top 5 in a FlatList (scroll disabled, because ScrollView handles scrolling) */}
            <FlatList
              data={leaderboardData.slice(0, 5)}
              keyExtractor={(item, idx) => item.userId + idx}
              renderItem={renderRow}
              ItemSeparatorComponent={() => (
                <View style={styles.separator} />
              )}
              scrollEnabled={false}
            />
          </>
        )}
      </ScrollView>

      {/* ─── “Top 10 Leaderboard” MODAL ─────────────────────────────────── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Header row */}
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalTitle}>Top 10 Leaderboard</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close-outline" size={28} color="#333333" />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.modalDivider} />

          {/* Podium (ranks 1–3) */}
          {leaderboardData.length >= 3 && (
            <Podium data={leaderboardData} />
          )}

          {/* Ranks 4–10 in a scrollable FlatList */}
          <FlatList
            data={leaderboardData.slice(3, 10)}
            keyExtractor={(item, idx) => item.userId + idx}
            renderItem={renderRow}
            ItemSeparatorComponent={() => (
              <View style={styles.separator} />
            )}
            contentContainerStyle={styles.modalList}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ── Container & Header ──────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center', // center title
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  headerSpacer: {
    position: 'absolute',
    right: 20,
    width: 40,
    height: 40,
  },

  // ── Tab Navigation ─────────────────────────────────────────────────
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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

  // ── Main ScrollView Content ────────────────────────────────────────
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // ── Current User Section ──────────────────────────────────────────
  currentUserSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  currentUserScore: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000000',
    marginTop: 8,
  },
  currentUserName: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  currentUserRank: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '500',
    marginTop: 4,
  },

  // ── Podium ─────────────────────────────────────────────────────────
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  podiumSlot: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  crownIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 2,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginTop: 8,
  },
  podiumHrs: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  podiumBase: {
    width: 60,
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 6,
    marginTop: 8,
  },
  podiumFirst: {
    backgroundColor: '#FFD700',
  },
  podiumSecond: {
    backgroundColor: '#C0C0C0',
  },
  podiumThird: {
    backgroundColor: '#CD7F32',
  },
  podiumRank: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ── “All Leaderboards” Header ─────────────────────────────────────
  allHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  allHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF6B35',
  },

  // ── Leaderboard Row ───────────────────────────────────────────────
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  lbRankCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lbRankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  lbName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  lbSubText: {
    fontSize: 12,
    color: '#666666',
  },
  lbBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  lbBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 54, // aligns under the name column
  },

  // ── Modal ───────────────────────────────────────────────────────────
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 16,
  },
  modalList: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
});
