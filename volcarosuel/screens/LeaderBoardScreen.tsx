// LeaderboardScreen.tsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../auth/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* ── responsive helpers (reference 428 × 926) ─────────────────── */
const { width, height } = Dimensions.get('window');
const refW = 428;
const refH = 926;
const scale   = (s: number) => (width  / refW) * s;          // horizontal
const vScale  = (s: number) => (height / refH) * s;          // vertical
const ms      = (s: number, f = 0.5) => s + (scale(s) - s) * f; // “moderate” scale

/* ── palette ──────────────────────────────────────────────────── */
const BG     = '#fff6e7';   // screen
const CARD   = '#fff6e7';   // card
const ROWBG  = '#fff0d4';   // list rows
const BORDER = '#000';      // borders / numbers
const ACCENT = '#fff6e7';   // chip + hours accent
const trophyClr = '#000';   // trophy icon in rows
const crownImg  = require('../../assets/spaceship.png');

/* ── deterministic fun icons (24) ─────────────────────────────── */
const ICONS = [
  'happy-outline','paw-outline','leaf-outline','planet-outline',
  'fish-outline','sunny-outline','rocket-outline','ice-cream-outline',
  'balloon-outline','cafe-outline','bug-outline','bulb-outline',
  'flame-outline','cloudy-night-outline','game-controller-outline',
  'heart-outline','musical-notes-outline','pizza-outline',
  'rainy-outline','snow-outline','star-outline','water-outline',
  'wine-outline','tennisball-outline',
];
const iconFor = (uid: string) => {
  let h = 0;
  for (const c of uid) h = c.charCodeAt(0) + ((h << 5) - h);
  return ICONS[Math.abs(h) % ICONS.length];
};

/* ── types ─────────────────────────────────────────────────────── */
interface Player { uid: string; name: string; hours: number }

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const meUid  = (auth.currentUser as FirebaseUser | null)?.uid;

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  /* live aggregation of volunteer_logs */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'volunteer_logs'), snap => {
      const map: Record<string, Player> = {};
      snap.forEach(doc => {
        const { user_id, hours_contributed = 0, user_name = 'Unknown' } =
          doc.data() as any;
        if (!map[user_id]) map[user_id] = { uid: user_id, name: user_name, hours: 0 };
        map[user_id].hours += +hours_contributed;
      });
      setPlayers(Object.values(map).sort((a, b) => b.hours - a.hours));
      setLoading(false);
    });
    return unsub;
  }, []);

  const podium = useMemo(() => players.slice(0, 3), [players]);
  const rest   = useMemo(() => players.slice(3), [players]);

  /* reusable avatar ------------------------------------------------ */
  const CHIP = scale(28);

  const Avatar = ({ p, rank, size }: { p: Player; rank: number; size: number }) => (
    <View style={{ alignItems: 'center' }}>
      <View style={[
        styles.avatar,
        { width: size + scale(6), height: size + scale(6), borderRadius: (size + scale(6)) / 2 }
      ]}>
        <Ionicons name={iconFor(p.uid)} size={size * 0.65} color="#fff" />
      </View>

      <View style={styles.chip}>
        <Text style={styles.chipTxt}>{rank}</Text>
      </View>
    </View>
  );

  /* list row ------------------------------------------------------- */
  const Row = ({ item, index }: { item: Player; index: number }) => {
    const rank = index + 4;
    const mine = item.uid === meUid;
    return (
      <View style={[styles.row, mine && { backgroundColor: ACCENT }]}>
        <View style={styles.rowLeft}>
          <Text style={[styles.rankNo, mine && { color: '#000' }]}>{rank}</Text>
          <Avatar p={item} rank={rank} size={scale(34)} />
          <Text
            numberOfLines={1}
            style={[styles.rowName, mine && { color: '#000', fontWeight: '700' }]}
          >
            {item.name}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons
            name="trophy-outline"
            size={scale(16)}
            color={mine ? '#000' : trophyClr}
            style={{ marginRight: scale(4) }}
          />
          <Text
            style={[styles.hoursTxt, mine && { color: '#000', fontWeight: '700' }]}
          >
            {item.hours}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  /* ── render ──────────────────────────────────────────────────── */
  return (
    <View style={styles.container}>
      <Text style={[
        styles.title,
        { marginTop: insets.top + vScale(-50) }
      ]}>
        Leaderboard
      </Text>

      {/* podium: visual order 2 | 1 | 3 */}
      <View style={styles.podium}>
        {[1, 0, 2].map(idx => {
          const p = players[idx];
          if (!p) return null;
          const rank = idx + 1;
          const size = rank === 1 ? scale(96) : scale(76);

          return (
            <View key={p.uid} style={styles.podiumItem}>
              <Avatar p={p} rank={rank} size={size} />
              <Text
                numberOfLines={1}
                style={[styles.podiumName, { width: size + scale(20) }]}
              >
                {p.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="trophy-outline" size={scale(14)} color={ACCENT} />
                <Text style={styles.podiumHours}> {p.hours} hrs</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* list */}
      <View style={styles.card}>
        <FlatList
          data={rest}
          keyExtractor={p => p.uid}
          renderItem={Row}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: BORDER + '33' }} />
          )}
          contentContainerStyle={{ paddingBottom: vScale(20) }}
        />
      </View>
    </View>
  );
}

/* ── styles ────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: scale(20),
  },
  title: {
    textAlign: 'center',
    fontSize: ms(24),
    fontWeight: '700',
    color: '#000',
    marginBottom: vScale(32),
  },

  /* podium */
  podium: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vScale(24),
  },
  podiumItem: { alignItems: 'center', flex: 1 },
  avatar: {
    borderWidth: scale(3),
    borderColor: BORDER,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chip: {
    position: 'absolute',
    bottom: -scale(28) / 2,
    width: scale(28),
    height: scale(28),
    borderRadius: scale(28) / 2,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: scale(2),
    borderColor: BORDER,
  },
  chipTxt: {
    fontWeight: '700',
    color: '#000',
    fontSize: ms(12),
  },
  podiumName: {
    color: '#000',
    fontWeight: '600',
    marginTop: vScale(14),
    fontSize: ms(14),
    textAlign: 'center',
  },
  podiumHours: { color: ACCENT, fontSize: ms(12) },

  /* card & list */
  card: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: scale(20),
    paddingVertical: vScale(8),
    paddingHorizontal: scale(12),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vScale(12),
    paddingHorizontal: scale(10),
    borderRadius: scale(14),
    backgroundColor: ROWBG,
    borderWidth: 1,
    borderColor: BORDER,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rankNo: {
    width: scale(24),
    textAlign: 'center',
    fontWeight: '700',
    color: BORDER,
    marginRight: scale(10),
    fontSize: ms(14),
  },
  rowName: {
    flex: 1,
    marginLeft: scale(10),
    fontSize: ms(15),
    fontWeight: '600',
    color: '#4A4A4A',
  },
  hoursTxt: { fontSize: ms(15), fontWeight: '600', color: '#4A4A4A' },
});
