// /src/screens/VolunteerDashboard.js

import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Modal,
  TextInput,
  ActivityIndicator,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Circle } from 'react-native-progress';
import { AuthContext } from '../../auth/AuthContext';
import { db } from '../../auth/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from 'firebase/firestore';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_PADDING = 20;
const CARD_BORDER_RADIUS = 16;
const CHART_HEIGHT = 140;
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Return ISO‐weekday index (Mon=1…Sun=7)
 */
function isoWeekdayIndex(date) {
  const d = new Date(date);
  let day = d.getDay();
  if (day === 0) day = 7;
  return day;
}

/**
 * Compute array of Date objects for the current week (Mon→Sun)
 */
function getCurrentWeekDates() {
  const today = new Date();
  const idx = isoWeekdayIndex(today); // 1..7
  const monday = new Date(today);
  monday.setDate(today.getDate() - (idx - 1));
  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week.push(d);
  }
  return week;
}

/**
 * Format Date to M/D/YYYY
 */
function formatMMDDYYYY(date) {
  const d = new Date(date);
  const m = d.getMonth() + 1;
  const dd = d.getDate();
  const yyyy = d.getFullYear();
  return `${m}/${dd}/${yyyy}`;
}

export default function VolunteerDashboard() {
  const { user, signOut } = useContext(AuthContext);
  const navigation = useNavigation();

  // ─── State ───────────────────────────────────────────────────────────
  const [logs, setLogs] = useState([]);            // all volunteer_sessions
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Add‐session modal
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newSite, setNewSite] = useState('');
  const [newHours, setNewHours] = useState('');

  // Daily‐goal & Total‐hours modal
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [tempDailyGoal, setTempDailyGoal] = useState(''); // for TextInput
  const [dailyGoal, setDailyGoal] = useState(8);           // default 8h/day

  // Computed metrics
  const [todayHours, setTodayHours] = useState(0);
  const [weeklyTotals, setWeeklyTotals] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [weeklyTotalSum, setWeeklyTotalSum] = useState(0);
  const [totalHours, setTotalHours] = useState(0); // <-- sum of all logs

  // Date arrays
  const weekDates = useMemo(() => getCurrentWeekDates(), []);
  const weekStrings = useMemo(
    () => weekDates.map((d) => formatMMDDYYYY(d)),
    [weekDates]
  );
  const todayString = useMemo(() => formatMMDDYYYY(new Date()), []);

  // ─── Fetch Logs from Firestore ──────────────────────────────────────
  useFocusEffect(
    React.useCallback(() => {
      if (!user) {
        navigation.navigate('Login');
        return;
      }
      fetchLogs();
    }, [user])
  );

  /**
   * Query volunteer_logs for this user and store all entries
   */
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const q = query(
        collection(db, 'volunteer_logs'),
        where('user_id', '==', user.uid)
      );
      const snap = await getDocs(q);
      const arr = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        arr.push({
          id: docSnap.id,
          site: data.site,
          hours: data.hours_contributed,
          date: data.date,
          time: data.time,
        });
      });
      setLogs(arr);
    } catch (err) {
      Alert.alert('Error', 'Failed to load logs: ' + err.message);
    } finally {
      setLoadingLogs(false);
    }
  };

  // ─── Compute Aggregates When Logs Change ────────────────────────────
  useEffect(() => {
    // 1) Build array of 7 daily totals for current week
    const dailyArr = [0, 0, 0, 0, 0, 0, 0];
    logs.forEach((entry) => {
      const idx = weekStrings.indexOf(entry.date);
      if (idx !== -1) {
        dailyArr[idx] += Number(entry.hours);
      }
    });
    setWeeklyTotals(dailyArr);

    // 2) Today's hours
    const t = logs.reduce((sum, entry) => {
      return entry.date === todayString ? sum + Number(entry.hours) : sum;
    }, 0);
    setTodayHours(t);

    // 3) Weekly total sum
    const wSum = dailyArr.reduce((a, b) => a + b, 0);
    setWeeklyTotalSum(wSum);

    // 4) Total Hours (all time)
    const allSum = logs.reduce((sum, entry) => sum + Number(entry.hours), 0);
    setTotalHours(allSum);
  }, [logs, weekStrings, todayString]);

  // ─── Save New Session ─────────────────────────────────────────────
  const handleSaveSession = async () => {
    if (!newSite.trim() || !newHours.trim()) {
      return Alert.alert('Missing Fields', 'Enter both site and hours.');
    }
    const hrs = parseFloat(newHours);
    if (isNaN(hrs) || hrs <= 0) {
      return Alert.alert('Invalid Hours', 'Enter a positive number.');
    }
    setLoadingLogs(true);
    try {
      await addDoc(collection(db, 'volunteer_logs'), {
        user_id: user.uid,
        site: newSite.trim(),
        hours_contributed: hrs,
        date: formatMMDDYYYY(new Date()),
        time: new Date().toLocaleTimeString(),
      });
      setAddModalVisible(false);
      setNewSite('');
      setNewHours('');
      await fetchLogs();
    } catch (err) {
      Alert.alert('Error', 'Could not save session: ' + err.message);
      setLoadingLogs(false);
    }
  };

  // ─── Save New Daily Goal ───────────────────────────────────────────
  const handleSaveGoal = () => {
    const num = parseFloat(tempDailyGoal);
    if (isNaN(num) || num <= 0) {
      return Alert.alert('Invalid Goal', 'Enter a positive number.');
    }
    setDailyGoal(num);
    setGoalModalVisible(false);
    setTempDailyGoal('');
  };

  // ─── Render Each Log Item ─────────────────────────────────────────
  const renderLogItem = ({ item }) => (
    <View style={styles.logItem}>
      <View style={styles.logHeader}>
        <View style={styles.logInfo}>
          <Text style={styles.logSite}>{item.site}</Text>
          <Text style={styles.logDate}>{item.date}</Text>
        </View>
        <View style={styles.logTimeContainer}>
          <Text style={styles.logHours}>{item.hours} hrs</Text>
          <Text style={styles.logTime}>{item.time}</Text>
        </View>
      </View>
    </View>
  );

  // ─── Main Render ───────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header Bar ───────────────────────────────────────────────── */}
      <View style={styles.headerBar}>
        {/* Only Sign Out icon now */}
        <TouchableOpacity onPress={() => signOut()} style={styles.logoutContainer}>
          <Ionicons name="log-out-outline" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Volunteer Dashboard</Text>

        {/* Add Session button */}
        <TouchableOpacity onPress={() => setAddModalVisible(true)} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Weekly Bar Chart Card ─────────────────────────────────────── */}
        <View style={styles.chartCard}>
          <View style={styles.rangeHeader}>
            <Text style={styles.rangeLabel}>
              {`${weekDates[0].toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })} – ${weekDates[6].toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}`}
            </Text>
          </View>
          <View style={styles.chartContainer}>
            <View style={styles.barsRow}>
              {weeklyTotals.map((val, idx) => {
                const ratio = Math.min(val / dailyGoal, 1);
                const fullBarHeight = CHART_HEIGHT - 40;
                const fillHeight = ratio * fullBarHeight;
                const isOver = val > dailyGoal;
                return (
                  <View key={idx} style={styles.barWrapper}>
                    <View style={[styles.barBackground, { height: fullBarHeight }]} />
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: fillHeight,
                          backgroundColor: isOver ? '#FFD700' : '#FF6B35',
                        },
                      ]}
                    >
                      {val > 0 && <Text style={styles.barFillText}>{val}</Text>}
                    </View>
                    <Text style={styles.barDayLabel}>{DAYS[idx]}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── Today's & Weekly/Total Hours Progress Card ───────────────── */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Today's & Weekly Progress</Text>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => {
                setTempDailyGoal(String(dailyGoal));
                setGoalModalVisible(true);
              }}
            >
              <Ionicons name="settings-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Circle showing (todayHours / dailyGoal) */}
          <View style={styles.circleSection}>
            <View style={styles.circleWrapper}>
              <Circle
                size={100}
                progress={Math.min(todayHours / dailyGoal, 1)}
                thickness={8}
                color="#FF6B35"
                unfilledColor="#DDD"
                borderWidth={0}
                showsText={false}
                strokeCap="round"
                direction="clockwise"
              />
              <View style={styles.circleCenter}>
                <Text style={styles.circleNumber}>{todayHours}h</Text>
                <Text style={styles.circleGoal}>of {dailyGoal}h</Text>
              </View>
            </View>
          </View>

          {/* Sub‐Metrics: Week Total & Total Hours All‐time */}
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Week Total</Text>
              <View style={styles.statProgressBar}>
                <View
                  style={[
                    styles.statProgressFill,
                    {
                      width: `${Math.min((weeklyTotalSum / dailyGoal) * 100, 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.statValue}>{weeklyTotalSum} h</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Hours</Text>
              <Text style={styles.statValue}>{totalHours} h</Text>
            </View>
          </View>
        </View>

        {/* ── Volunteer Sessions List ─────────────────────────────────── */}
        <View style={styles.logsContainer}>
          <View style={styles.logsHeaderRow}>
            <Text style={styles.logsHeader}>Volunteer Sessions</Text>
            <Text style={styles.logsCount}>{logs.length} sessions</Text>
          </View>

          {loadingLogs ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B35" />
              <Text style={styles.loadingText}>Loading sessions…</Text>
            </View>
          ) : logs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No sessions recorded</Text>
              <Text style={styles.emptySubtitle}>
                Tap the + button to log a volunteer session
              </Text>
            </View>
          ) : (
            <FlatList
              data={logs
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.date + ' ' + b.time) -
                    new Date(a.date + ' ' + a.time)
                )}
              keyExtractor={(item) => item.id}
              renderItem={renderLogItem}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Extra bottom padding so bottom tab bar does not overlap */}
        <View style={{ height: 100 }} />

        {/* ── Delete Icon at Bottom ───────────────────────────────────── */}
        <View style={styles.bottomDeleteContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Delete')}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Add Session Modal ───────────────────────────────────────── */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Volunteer Session</Text>
              <TouchableOpacity
                onPress={() => setAddModalVisible(false)}
                style={styles.modalClose}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Organization/Site</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter site name"
                  placeholderTextColor="#999"
                  value={newSite}
                  onChangeText={setNewSite}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Hours Volunteered</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 2.5"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={newHours}
                  onChangeText={setNewHours}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveSession}
              >
                <Text style={styles.modalSaveText}>Save Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Change Daily Goal Modal ──────────────────────────────────── */}
      <Modal
        visible={goalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <View style={styles.dropdownOverlay}>
          <View style={styles.dropdownCard}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Daily Goal & Total Hours</Text>
              <TouchableOpacity
                onPress={() => setGoalModalVisible(false)}
                style={styles.dropdownClose}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Show current Total Hours */}
              <Text style={styles.yearlyTotalText}>
                Total Hours: {totalHours}h
              </Text>

              {/* Input for daily goal */}
              <TextInput
                style={styles.modalInput}
                placeholder="Enter daily goal (e.g. 8)"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={tempDailyGoal}
                onChangeText={setTempDailyGoal}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setGoalModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveGoal}
              >
                <Text style={styles.modalSaveText}>Save Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ── Screen Container ───────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120, // ensure bottom tab does not overlap
  },

  // ── Header Bar ─────────────────────────────────────────────────
  headerBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Chart Card ─────────────────────────────────────────────────
  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: CARD_BORDER_RADIUS,
    padding: CARD_PADDING,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  rangeHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  rangeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  chartContainer: {
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flex: 1,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  barBackground: {
    width: '80%',
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    position: 'absolute',
    bottom: 24,
  },
  barFill: {
    width: '80%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    position: 'absolute',
    bottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barFillText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  barDayLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    position: 'absolute',
    bottom: 4,
  },

  // ── Progress Card ──────────────────────────────────────────────
  progressCard: {
    backgroundColor: '#FFF',
    borderRadius: CARD_BORDER_RADIUS,
    padding: CARD_PADDING,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  settingsButton: {
    padding: 4,
  },
  circleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  circleWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  circleGoal: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statsContainer: {
    gap: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  statProgressBar: {
    width: 80,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginRight: 12,
    overflow: 'hidden',
  },
  statProgressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 3,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    minWidth: 40,
    textAlign: 'right',
  },

  // ── Volunteer Logs Container ───────────────────────────────────
  logsContainer: {
    backgroundColor: '#FFF',
    borderRadius: CARD_BORDER_RADIUS,
    padding: CARD_PADDING,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logsHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  logsCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },

  // ── Log Item ───────────────────────────────────────────────────
  logItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logInfo: {
    flex: 1,
  },
  logSite: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  logDate: {
    fontSize: 12,
    color: '#666',
  },
  logTimeContainer: {
    alignItems: 'flex-end',
  },
  logHours: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  logTime: {
    fontSize: 12,
    color: '#666',
  },

  // ── Add Session Modal ──────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F8F9FA',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalSaveButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },

  // ── Change Daily Goal Modal ───────────────────────────────────────
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dropdownCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  dropdownClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearlyTotalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },

  // ── Bottom Delete Button ─────────────────────────────────────────
  bottomDeleteContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});
