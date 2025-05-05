// LeaderboardScreen.tsx
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { onSnapshot, collection } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';

import { AuthContext } from '../../auth/AuthContext';
import { themePacks, seasonal } from '../screens/shop';
import { db, auth } from '../../auth/firebase';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const refW = 428, refH = 926;
const scale  = (s: number) => (width  / refW) * s;
const vScale = (s: number) => (height / refH) * s;
const ms     = (s: number, f = 0.5) => s + (scale(s) - s) * f;

// default 4-color palette
const DEFAULT_PALETTE = ['#FFF6E7', '#FFF0D4', '#FFF6E7', '#000'];

interface Player { uid: string; name: string; hours: number }

// 100 humorous placeholders
const FUNNY_NAMES = [
  "Mystery Hero","Secret Agent","Ninja Volunteer","Phantom Giver","Invisible Samaritan",
  "Undercover Helper","Time-Traveler","Rogue Robin Hood","Masked Do-Gooder","Cloaked Contributor",
  "Stealth Goodwill","Whimsical Warrior","Ghost Helper","Quiet Crusader","Masked Philanthropist",
  "Hidden Hand","Camouflage Caregiver","Shadow Samaritan","Wandering Benefactor","Silent Sower",
  "Sneaky Supporter","Covert Kindness","Subtle Samaritan","Midnight Mentor","Hidden Heart",
  "Secret Support","Stealth Steward","Anonymous Ally","Invisible Ivy","Phantom Philanthropist",
  "Dusty Do-Gooder","Muted Mentor","Blind Benefactor","Hidden Herald","Secret Shepherd",
  "Sly Samaritan","Hushed Helper","Guerilla Goodwill","Cloaked Crusader","Secret Smile",
  "Undercover Uplifter","Stealth Steward","Masked Mentor","Unknown Uplifter","Quiet Quartermaster",
  "Cloaked Captain","Midnight Medic","Invisible Inspirer","Phantom Philomath","Ghostly Guide",
  "Hidden Healer","Subterranean Samaritan","Low-key Leader","Secret Sentinel","Quiet Questor",
  "Masked Maverick","Obscure Oracle","Silent Samaritan","Undercover Umpire","Shadow Shepherd",
  "Veiled Volunteer","Mystic Mentor","Covert Guide","Sneaky Samaritan","Hidden Handshake",
  "Subtle Samaritan","Camouflaged Caregiver","Masked Medic","Cloaked Coach","Invisible Instructor",
  "Phantom Partner","Ghostly Giver","Secret Supporter","Shy Samaritan","Shadowy Samaritan",
  "Stealthy Spreader","Masked Motivator","Undercover Underdog","Quiet Quester","Hidden Helper",
  "Mystery Motivator","Phantom Philomath","Ghost Giver","Cloaked Contributor","Subtle Supporter",
  "Secret Sailor","Silent Sailor","Stealth Scholar","Camouflage Coach","Invisible Icon",
  "Masked Mastermind","Shadow Shaper","Undercover Umpire","Buried Benefactor","Quiet Queller",
  "Hidden Harmonizer","Stealth Sprite","Phantom Friend"
];

function pickFunnyName(uid: string): string {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FUNNY_NAMES[Math.abs(hash) % FUNNY_NAMES.length];
}

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const meUid  = (auth.currentUser as FirebaseUser | null)?.uid;

  
  const [players, setPlayers]             = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  const { user } = useContext(AuthContext);
  const [palette, setPalette] = useState(DEFAULT_PALETTE);
  const [loading, setLoading] = useState(true);

  const loadActiveTheme = async () => {
    if (!user) {
      setPalette(DEFAULT_PALETTE);
      setLoading(false);
      return;
    }
    try {
      const key = `@shop/active-${user.uid}`;
      const id  = await AsyncStorage.getItem(key);
      if (id) {
        const pack =
          themePacks.find(t => t.id === id) ||
          seasonal.find(s => s.id === id);
        if (pack?.colors) {
          const c = pack.colors;
          // fill out exactly 4 slots
          setPalette([
            c[0] ?? DEFAULT_PALETTE[0],
            c[1] ?? DEFAULT_PALETTE[1],
            c[2] ?? DEFAULT_PALETTE[2],
            c[3] ?? DEFAULT_PALETTE[3],
          ]);
          return;
        }
      }
      // no active theme found
      setPalette(DEFAULT_PALETTE);
    } catch (e) {
      console.warn('Failed loading active theme', e);
      setPalette(DEFAULT_PALETTE);
    } finally {
      setLoading(false);
    }
  };

  // run on mount...
  useEffect(() => { loadActiveTheme(); }, [user]);
  // ...and every time screen regains focus
  useFocusEffect(
    React.useCallback(() => {
      loadActiveTheme();
    }, [user])
  );

  // subscribe volunteer_logs
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'volunteer_logs'),
      snap => {
        const map: Record<string, Player> = {};
        snap.forEach(doc => {
          const { user_id, hours_contributed = 0, user_name = 'Unknown' } =
            doc.data() as any;
          if (!map[user_id]) {
            map[user_id] = { uid: user_id, name: user_name, hours: 0 };
          }
          map[user_id].hours += +hours_contributed;
        });
        setPlayers(Object.values(map).sort((a,b)=>b.hours - a.hours));
        setLoadingPlayers(false);
      },
      err => {
        console.warn('Leaderboard error', err);
        setLoadingPlayers(false);
      }
    );
    return unsub;
  }, []);



  const [BG, ROWBG, CARDBG, TEXTCOL] = palette;
  const BORDER = TEXTCOL;
  const ACCENT = BG;

  const podium = players.slice(0,3);
  const rest   = players.slice(3);

  // Avatar same as before
  const iconFor = (uid: string) => {
    const ICONS = [
      'happy-outline','paw-outline','leaf-outline','planet-outline',
      'fish-outline','sunny-outline','rocket-outline','ice-cream-outline',
      'balloon-outline','cafe-outline','bug-outline','bulb-outline',
      'flame-outline','cloudy-night-outline','game-controller-outline',
      'heart-outline','musical-notes-outline','pizza-outline',
      'rainy-outline','snow-outline','star-outline','water-outline',
      'wine-outline','tennisball-outline',
    ];
    let h = 0;
    for (const c of uid) h = c.charCodeAt(0) + ((h<<5)-h);
    return ICONS[Math.abs(h) % ICONS.length];
  };
  const Avatar = ({ p, rank, size }: { p: Player; rank: number; size:number }) => (
    <View style={{ alignItems:'center' }}>
      <View style={[
        styles.avatar,
        {
          width: size + scale(6),
          height: size + scale(6),
          borderRadius: (size+scale(6))/2,
          borderColor: BORDER,
          backgroundColor: TEXTCOL
        }
      ]}>
        <Ionicons name={iconFor(p.uid)} size={size*0.65} color={BG} />
      </View>
      <View style={[
        styles.chip,
        { backgroundColor: ACCENT, borderColor: BORDER }
      ]}>
        <Text style={[styles.chipTxt,{ color: BORDER }]}>{rank}</Text>
      </View>
    </View>
  );

  const Row = ({ item, index }: { item:Player; index:number }) => {
    const rank = index + 4;
    const mine = item.uid === meUid;
    const name = item.name === 'Unknown' ? pickFunnyName(item.uid) : item.name;
    return (
      <View style={[
        styles.row,
        { backgroundColor: mine ? ACCENT : ROWBG, borderColor: BORDER }
      ]}>
        <View style={styles.rowLeft}>
          <Text style={[styles.rankNo,{ color: BORDER }]}>{rank}</Text>
          <Avatar p={item} rank={rank} size={scale(34)} />
          <Text
            numberOfLines={1}
            style={[
              styles.rowName,
              mine && { color: BORDER, fontWeight:'700' }
            ]}
          >{name}</Text>
        </View>
        <View style={{ flexDirection:'row', alignItems:'center' }}>
          <Ionicons
            name="trophy-outline"
            size={scale(16)}
            color={mine ? BORDER : TEXTCOL}
            style={{ marginRight: scale(4) }}
          />
          <Text style={[styles.hoursTxt, mine && { color: BORDER, fontWeight:'700' }]}>
            {item.hours}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container,{ backgroundColor: BG }]}>
      <Text style={[
        styles.title,
        { marginTop: insets.top + vScale(-50), color: TEXTCOL }
      ]}>
        Leaderboard
      </Text>

      <View style={styles.podium}>
        {[1,0,2].map(idx => {
          const p = players[idx];
          if (!p) return null;
          const rank = idx+1;
          const size = rank===1 ? scale(96) : scale(76);
          const name = p.name === 'Unknown' ? pickFunnyName(p.uid) : p.name;
          return (
            <View key={p.uid} style={styles.podiumItem}>
              <Avatar p={p} rank={rank} size={size} />
              <Text numberOfLines={1}
                style={[styles.podiumName,{ width:size+scale(20), color: TEXTCOL }]}
              >{name}</Text>
              <View style={{flexDirection:'row',alignItems:'center'}}>
                <Ionicons name="trophy-outline" size={scale(14)} color={TEXTCOL}/>
                <Text style={[styles.podiumHours,{ color: TEXTCOL }]}>
                  {' '}{p.hours} hrs
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={[styles.card,{ backgroundColor: CARDBG }]}>
        <FlatList
          data={rest}
          keyExtractor={p=>p.uid}
          renderItem={Row}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={()=> <View style={{height:1,backgroundColor: BORDER+'33'}}/>}
          contentContainerStyle={{ paddingBottom: vScale(20) }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, paddingHorizontal: scale(20) },
  title:{
    textAlign:'center',
    fontSize: ms(24),
    fontWeight:'700',
    marginBottom: vScale(32),
  },
  podium:{
    flexDirection:'row',
    justifyContent:'space-between',
    marginBottom: vScale(24),
  },
  podiumItem:{ alignItems:'center', flex:1 },
  avatar:{
    borderWidth: scale(3),
    justifyContent:'center',
    alignItems:'center',
  },
  chip:{
    position:'absolute',
    bottom:-scale(28)/2,
    width: scale(28),
    height: scale(28),
    borderRadius: scale(28)/2,
    alignItems:'center',
    justifyContent:'center',
    borderWidth: scale(2),
  },
  chipTxt:{ fontWeight:'700', fontSize: ms(12) },
  podiumName:{ fontWeight:'600', marginTop: vScale(14), fontSize: ms(14), textAlign:'center' },
  podiumHours:{ fontSize: ms(12) },

  card:{
    flex:1,
    borderRadius: scale(20),
    paddingVertical: vScale(8),
    paddingHorizontal: scale(12),
  },
  row:{
    flexDirection:'row',
    alignItems:'center',
    paddingVertical: vScale(12),
    paddingHorizontal: scale(10),
    borderRadius: scale(14),
    borderWidth: 1,
  },
  rowLeft:{ flexDirection:'row', alignItems:'center', flex:1 },
  rankNo:{
    width: scale(24),
    textAlign:'center',
    fontWeight:'700',
    marginRight: scale(10),
    fontSize: ms(14),
  },
  rowName:{ flex:1, marginLeft: scale(10), fontSize: ms(15), fontWeight:'600' },
  hoursTxt:{ fontSize: ms(15), fontWeight:'600' },
});
