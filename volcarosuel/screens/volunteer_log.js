// VolunteerDashboard.js

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
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const CARD_PADDING = 16;
const CARD_BORDER_RADIUS = 24;
const CHART_HEIGHT = 120;
const BAR_SPACING = 4;
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Helper: Given a Date, returns ISO weekday index: 1=Mon … 7=Sun
 */
function isoWeekdayIndex(date) {
  const d = new Date(date);
  let day = d.getDay();
  if (day === 0) day = 7;
  return day;
}

/**
 * Helper: Returns array of Dates (Mon→Sun) for current week
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
 * Helper: Format Date to "M/D/YYYY"
 */
function formatMMDDYYYY(date) {
  const d = new Date(date);
  const m = d.getMonth() + 1;
  const dd = d.getDate();
  const yyyy = d.getFullYear();
  return `${m}/${dd}/${yyyy}`;
}

/**
 * Main Volunteer Dashboard Screen
 */
export default function VolunteerDashboard() {
  const { user, signOut } = useContext(AuthContext);
  const navigation = useNavigation();

  // ─── State ───────────────────────────────────────────────────────────
  // Firestore logs: { id, site, hours, date: "M/D/YYYY", time }
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Modal for adding a session
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newSite, setNewSite] = useState('');
  const [newHours, setNewHours] = useState('');

  // Dropdown to switch Week/Month/Year (we’ll implement only “Week” for now)
  const [rangeDropdownVisible, setRangeDropdownVisible] = useState(false);
  const [currentRange, setCurrentRange] = useState('Week');
  const [dateRangeLabel, setDateRangeLabel] = useState('');

  // Logging‐in and user metadata
  const [accountCreatedAt, setAccountCreatedAt] = useState(null);

  // Today’s metrics
  const [todayHours, setTodayHours] = useState(0);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [yearlyTotal, setYearlyTotal] = useState(0);

  // Daily goal (e.g. 8 hrs/day)
  const DAILY_GOAL = 8;

  // Date calculations
  const weekDates = useMemo(() => getCurrentWeekDates(), []);
  const weekStrings = useMemo(
    () => weekDates.map((d) => formatMMDDYYYY(d)),
    [weekDates]
  );
  const todayString = useMemo(() => formatMMDDYYYY(new Date()), []);

  // ─── Fetch Logs from Firestore ──────────────────────────────────────
  // Whenever screen gains focus or user changes
  useFocusEffect(
    React.useCallback(() => {
      if (!user) {
        navigation.navigate('Login');
        return;
      }
      // Grab account creation time from Firebase metadata
      const created = user.metadata?.creationTime
        ? new Date(user.metadata.creationTime)
        : new Date();
      setAccountCreatedAt(created);
      fetchLogs();
    }, [user])
  );

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

  // ─── Compute Aggregates ────────────────────────────────────────────
  // 1) Weekly totals (array of 7 numbers), 2) today’s hours, 3) monthly, 4) yearly
  const weeklyTotals = useMemo(() => {
    // initialize 7 zeros
    const out = [0, 0, 0, 0, 0, 0, 0];
    logs.forEach((entry) => {
      const idx = weekStrings.indexOf(entry.date);
      if (idx !== -1) {
        out[idx] += Number(entry.hours);
      }
    });
    return out;
  }, [logs, weekStrings]);

  useEffect(() => {
    // Today's hours
    const t = logs.reduce((sum, entry) => {
      return entry.date === todayString ? sum + Number(entry.hours) : sum;
    }, 0);
    setTodayHours(t);

    // Weekly total: just sum weeklyTotals
    const wSum = weeklyTotals.reduce((a, b) => a + b, 0);
    setWeeklyTotal(wSum);

    // Monthly total: sum logs whose month matches current month
    const now = new Date();
    const monthStr = `${now.getMonth() + 1}/${now.getFullYear()}`; // e.g. "6/2025"
    const mSum = logs.reduce((sum, entry) => {
      const [m, d, y] = entry.date.split('/').map(Number);
      if (m === now.getMonth() + 1 && y === now.getFullYear()) {
        return sum + Number(entry.hours);
      }
      return sum;
    }, 0);
    setMonthlyTotal(mSum);

    // Yearly total: sum logs from accountCreatedAt up to now
    if (accountCreatedAt) {
      const start = accountCreatedAt.getTime();
      const ySum = logs.reduce((sum, entry) => {
        const eDate = new Date(entry.date);
        if (eDate.getTime() >= start && eDate.getTime() <= Date.now()) {
          return sum + Number(entry.hours);
        }
        return sum;
      }, 0);
      setYearlyTotal(ySum);
    } else {
      setYearlyTotal(0);
    }
  }, [logs, accountCreatedAt, weeklyTotals, todayString]);

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

  // ─── Render Volunteer Log Item ───────────────────────────────────
  const renderLogItem = ({ item }) => (
    <View style={styles.logItem}>
      <Text style={styles.logSite}>{item.site}</Text>
      <View style={styles.logMetaRow}>
        <Text style={styles.logMetaText}>{item.hours} hrs</Text>
        <Text style={styles.logMetaText}>{item.date}</Text>
        <Text style={styles.logMetaText}>{item.time}</Text>
      </View>
    </View>
  );

  // ─── Year/Month/Week Dropdown UI ─────────────────────────────────
  const renderRangeDropdown = () => (
    <Modal
      transparent
      animationType="fade"
      visible={rangeDropdownVisible}
      onRequestClose={() => setRangeDropdownVisible(false)}
    >
      <View style={styles.dropdownOverlay}>
        <View style={styles.dropdownCard}>
          {['Week', 'Month', 'Year'].map((r) => (
            <TouchableOpacity
              key={r}
              style={styles.dropdownOption}
              onPress={() => {
                setCurrentRange(r);
                setRangeDropdownVisible(false);
                // In a real app, you would also recalc `dateRangeLabel` for month/year
              }}
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  r === currentRange && { fontWeight: '700' },
                ]}
              >
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  // ─── Weekly Date Range Label ─────────────────────────────────────
  useEffect(() => {
    // For “Week,” show e.g. “Jul 16 – 24” based on weekDates
    if (currentRange === 'Week') {
      const start = weekDates[0];
      const end = weekDates[6];
      const opts = { month: 'short', day: 'numeric' };
      const sStr = start.toLocaleDateString(undefined, opts); // e.g. “Jul 16”
      const eStr = end.toLocaleDateString(undefined, opts);   // e.g. “Jul 24”
      setDateRangeLabel(`${sStr} – ${eStr}`);
    } else {
      // Placeholder for Month/Year labels
      setDateRangeLabel(currentRange);
    }
  }, [currentRange, weekDates]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerIcon}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Volunteer Dashboard</Text>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => setAddModalVisible(true)}
          >
            <Ionicons name="add" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* ── Weekly Bar Chart Card ─────────────────────────────────────── */}
        <View style={styles.card}>
          {/* Date Range + Arrows + Dropdown */}
          <View style={styles.rangeHeader}>
            <TouchableOpacity style={styles.rangeArrow}>
              <Ionicons name="chevron-back" size={20} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.rangeLabel}>{dateRangeLabel}</Text>

            <TouchableOpacity style={styles.rangeArrow}>
              <Ionicons name="chevron-forward" size={20} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.rangeDropdown}
              onPress={() => setRangeDropdownVisible(true)}
            >
              <Text style={styles.rangeDropdownText}>{currentRange} </Text>
              <Ionicons name="chevron-down" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Bar Chart Area */}
          <View style={styles.chartContainer}>
            {/* Horizontal dashed grid lines at 100% and 50% */}
            <View style={[styles.dashedLine, { top: 0 }]} />
            <View
              style={[styles.dashedLine, { top: CHART_HEIGHT / 2 }]}
            />

            <View style={styles.barsRow}>
              {weeklyTotals.map((val, idx) => {
                const maxVal = Math.max(...weeklyTotals, 1);
                const rawHeight = (val / maxVal) * (CHART_HEIGHT - 16);
                const barHeight = Math.max(rawHeight, 8);

                return (
                  <View key={idx} style={styles.barWrapper}>
                    {/* Background bar (semi-transparent white) */}
                    <View style={styles.barBackground} />

                    {/* Filled bar (solid white) */}
                    <View
                      style={[
                        styles.barFill,
                        { height: barHeight },
                      ]}
                    />

                    {/* Tooltip if selected (Thursday when idx===3) */}
                    {idx === 3 && (
                      <View
                        style={[
                          styles.tooltip,
                          { bottom: barHeight + 24 },
                        ]}
                      >
                        <Text style={styles.tooltipText}>{val}</Text>
                        <View style={styles.tooltipArrow} />
                      </View>
                    )}

                    <Text style={styles.barDayLabel}>{DAYS[idx]}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {renderRangeDropdown()}

        {/* ── Today’s Volunteering Card ───────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreTitle}>Today’s Volunteering</Text>
            <TouchableOpacity onPress={() => { /* optional details */ }}>
              <Text style={styles.learnMoreText}>Details</Text>
            </TouchableOpacity>
          </View>

          {/* Circular Progress (Today’s hours vs DAILY_GOAL) */}
          <View style={styles.circleWrapper}>
            <Circle
              size={120}
              progress={todayHours / DAILY_GOAL}
              thickness={12}
              color="#FFF"
              unfilledColor="rgba(255,255,255,0.2)"
              borderWidth={0}
              showsText={false}
              strokeCap="round"
              direction="clockwise"
            />
            <View style={styles.circleCenter}>
              <Text style={styles.circleNumber}>{todayHours}h</Text>
            </View>
          </View>

          {/* Sub‐Metrics: Hours This Week / This Month / Total Hours */}
          <View style={styles.sliderRow}>
            <Ionicons name="calendar-outline" size={20} color="#FFF" />
            <Text style={styles.sliderLabel}>Hours This Week</Text>
            <View style={styles.sliderBarBg}>
              <View
                style={[
                  styles.sliderBarFill,
                  {
                    width: `${
                      weeklyTotal / (DAILY_GOAL * 7) * 100 > 100
                        ? 100
                        : (weeklyTotal / (DAILY_GOAL * 7)) * 100
                    }%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.sliderValue}>{weeklyTotal}h</Text>
          </View>

          <View style={styles.sliderRow}>
            <Ionicons name="time-outline" size={20} color="#FFF" />
            <Text style={styles.sliderLabel}>Hours This Month</Text>
            <View style={styles.sliderBarBg}>
              <View
                style={[
                  styles.sliderBarFill,
                  {
                    width: `${
                      monthlyTotal / (DAILY_GOAL * 30) * 100 > 100
                        ? 100
                        : (monthlyTotal / (DAILY_GOAL * 30)) * 100
                    }%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.sliderValue}>{monthlyTotal}h</Text>
          </View>

          <View style={styles.sliderRow}>
            <Ionicons name="trophy-outline" size={20} color="#FFF" />
            <Text style={styles.sliderLabel}>Total Hours</Text>
            <View style={styles.sliderBarBg}>
              <View
                style={[
                  styles.sliderBarFill,
                  {
                    width: `${
                      yearlyTotal / (DAILY_GOAL * 365) * 100 > 100
                        ? 100
                        : (yearlyTotal / (DAILY_GOAL * 365)) * 100
                    }%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.sliderValue}>{yearlyTotal}h</Text>
          </View>
        </View>

        {/* ── Volunteer Logs List ─────────────────────────────────────── */}
        <View style={styles.logsContainer}>
          <Text style={styles.logsHeader}>Volunteer Sessions</Text>
          {loadingLogs ? (
            <ActivityIndicator size="large" color="#000" />
          ) : logs.length === 0 ? (
            <Text style={styles.emptyLogsText}>
              No sessions logged yet.
            </Text>
          ) : (
            <FlatList
              data={logs.sort(
                (a, b) =>
                  new Date(b.date + ' ' + b.time) -
                  new Date(a.date + ' ' + a.time)
              )}
              keyExtractor={(item) => item.id}
              renderItem={renderLogItem}
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>

      {/* ── Add Session Modal ───────────────────────────────────────── */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Volunteer Session</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Site Name"
              placeholderTextColor="#666"
              value={newSite}
              onChangeText={setNewSite}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Hours (e.g. 2.5)"
              placeholderTextColor="#666"
              keyboardType="numeric"
              value={newHours}
              onChangeText={setNewHours}
            />
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSaveSession}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: '#000' }]}>
                  Cancel
                </Text>
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
    backgroundColor: '#FFF', // white background
  },

  // ── Header Bar ─────────────────────────────────────────────────
  headerBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000', // black circle behind icon
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },

  // ── Card Style (both chart and circle card) ────────────────────
  card: {
    marginHorizontal: 16,
    backgroundColor: '#000', // black card
    borderRadius: CARD_BORDER_RADIUS,
    padding: CARD_PADDING,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // ── Weekly Range Header (arrows + date + dropdown) ─────────────
  rangeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rangeArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rangeLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  rangeDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
  },
  rangeDropdownText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },

  // ── Bar Chart Area ─────────────────────────────────────────────
  chartContainer: {
    height: CHART_HEIGHT,
    position: 'relative',
    marginBottom: 8,
  },
  dashedLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    borderBottomWidth: 1,
    borderStyle: 'dashed',
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
  },
  barBackground: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: CHART_HEIGHT - 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
  },
  barFill: {
    width: '100%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    position: 'absolute',
    bottom: 0,
  },
  barDayLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#FFF',
  },
  barValue: {
    fontSize: 12,
    color: '#FFF',
    marginBottom: 4,
  },

  // Tooltip for selected bar
  tooltip: {
    position: 'absolute',
    backgroundColor: '#FFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
  },
  tooltipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -6,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderTopColor: '#FFF',
    borderLeftWidth: 6,
    borderLeftColor: 'transparent',
    borderRightWidth: 6,
    borderRightColor: 'transparent',
  },

  // ── “Today’s Volunteering” Header ─────────────────────────────
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  learnMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFF',
  },

  // ── Circular Progress for Today’s Hours ────────────────────────
  circleWrapper: {
    alignSelf: 'center',
    marginVertical: 12,
  },
  circleCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },

  // ── Sub‐Metrics Sliders ─────────────────────────────────────────
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sliderLabel: {
    flex: 1,
    marginLeft: 8,
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  sliderBarBg: {
    flex: 2,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  sliderBarFill: {
    height: 6,
    backgroundColor: '#FFF',
  },
  sliderValue: {
    width: 48,
    textAlign: 'right',
    fontSize: 12,
    color: '#FFF',
  },

  // ── Volunteer Logs List ────────────────────────────────────────
  logsContainer: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  logsHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  emptyLogsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  logItem: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logSite: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  logMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logMetaText: {
    fontSize: 12,
    color: '#666',
  },

  // ── Add Session Modal ──────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#DDD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalInput: {
    width: '100%',
    height: 44,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#000',
    marginBottom: 12,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  modalSaveButton: {
    backgroundColor: '#000',
  },
  modalCancelButton: {
    backgroundColor: '#EEE',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },

  // ── Range Dropdown Modal ───────────────────────────────────────
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: width * 0.5,
    paddingVertical: 8,
  },
  dropdownOption: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#000',
  },

  // ── Loading Overlay ───────────────────────────────────────────
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
