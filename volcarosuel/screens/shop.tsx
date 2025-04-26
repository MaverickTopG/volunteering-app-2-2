// ShopScreen.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

import { AuthContext } from '../../auth/AuthContext';
import { db } from '../../auth/firebase';

const { width } = Dimensions.get('window');
const CARD_W = Math.min(200, width * 0.55);

const themePacks = [
  { id:'ocean',    name:'Ocean Explorer',    cost:0, colors:['#005f73','#0a9396','#94d2bd','#e9d8a6'] },
  { id:'vintage',  name:'Vintage Typewriter', cost:0, colors:['#3d2c8d','#5e548e','#e0b1cb','#f1e3dd'] },
  { id:'neon',     name:'Neon Night',        cost:40, colors:['#ff006e','#8338ec','#3a86ff','#ffbe0b'] },
  { id:'forest',   name:'Forest Retreat',    cost:25, colors:['#2a9d8f','#264653','#e9c46a','#f4a261'] },
  { id:'sunrise',  name:'Sunrise Glow',      cost:35, colors:['#ff9f1c','#ffbf69','#ffffff','#cbf3f0'] },
  { id:'midnight', name:'Midnight Sky',      cost:30, colors:['#0d1b2a','#1b263b','#415a77','#778da9'] },
  { id:'desert',   name:'Desert Sand',       cost:20, colors:['#e0c097','#ffb4a2','#e5989b','#b5838d'] },
  { id:'candy',    name:'Candy Floss',       cost:40, colors:['#ff6b6b','#f06595','#cc5de8','#845ef7'] },
  { id:'pastel',   name:'Pastel Dream',      cost:25, colors:['#ffd6a5','#fdffb6','#caffbf','#9bf6ff'] },
  { id:'emerald',  name:'Emerald City',      cost:35, colors:['#006d77','#83c5be','#edf6f9','#ffddd2'] },
];
const aLaCarte = Array.from({ length: 10 }, (_, i) => ({
  id:`ala${i}`,
  name:`A-la-Carte Option ${i+1}`,
  cost:5
}));
const drops = Array.from({ length: 5 }, (_, i) => ({
  id:`drop${i}`,
  name:`Limited Drop ${i+1}`,
  cost:0
}));
// Only show spring for now
const seasonal = [
  { id:'spring', name:'Spring Blossom', cost:0, colors:['#a8dadc','#f1faee','#f4a261','#e76f51'] },
];

export default function ShopScreen() {
  const { user } = useContext(AuthContext);
  const nav      = useNavigation();
  if (!user) {
    return (
      <View style={styles.locked}>
        <Text style={styles.lockedTxt}>Log in to access this feature</Text>
      </View>
    );
  }

  const keySpent  = `@shop/spent-${user.uid}`;
  const keyOwned  = `@shop/owned-${user.uid}`;
  const keyActive = `@shop/active-${user.uid}`;

  const [totalHours, setTotal] = useState(null);
  const [spentLocal, setSpent] = useState(null);
  const [owned, setOwned]      = useState([]);
  const [active, setActive]    = useState(null);

  // credits = totalHours – amount spent
  const credits = totalHours !== null && spentLocal !== null
    ? totalHours - spentLocal
    : null;

  // load local spent, owned, active
  useEffect(() => {
    (async () => {
      const [rawSpent, rawOwned, rawActive] = await Promise.all([
        AsyncStorage.getItem(keySpent),
        AsyncStorage.getItem(keyOwned),
        AsyncStorage.getItem(keyActive),
      ]);
      setSpent(rawSpent ? +rawSpent : 0);
      setOwned(rawOwned ? JSON.parse(rawOwned) : []);
      setActive(rawActive ?? null);
    })();
  }, []);

  // listen for totalHours on Firestore
  useEffect(() => {
    const ref = doc(db, 'users', user.uid);
    return onSnapshot(ref, snap => {
      if (!snap.exists()) return;
      const d = snap.data();
      setTotal(d.totalHours ?? 0);
    });
  }, [user]);

  const persist = async (k, v) => {
    await AsyncStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
  };

  // Buy → add to owned + deduct spent
  const buy = useCallback(item => {
    if (credits < item.cost) {
      return Alert.alert('Not enough credits');
    }
    const newSpent = spentLocal + item.cost;
    const newOwned = [...owned, item.id];
    setSpent(newSpent);
    setOwned(newOwned);
    persist(keySpent, newSpent);
    persist(keyOwned, newOwned);
  }, [credits, spentLocal, owned]);

  // Activate / Deactivate
  const toggleActive = useCallback(id => {
    const next = active === id ? null : id;
    setActive(next);
    persist(keyActive, next);
  }, [active]);

  // determine current palette
  const activePack =
    themePacks.find(t=>t.id===active) ||
    aLaCarte.find(a=>a.id===active) ||
    drops.find(d=>d.id===active) ||
    seasonal.find(s=>s.id===active);

  const palette = activePack?.colors || ['#FFF6E7','#000','#000','#000'];

  /* card renderer */
  const SmallCard = ({ item }) => {
    const isOwned   = owned.includes(item.id);
    const isActive  = active === item.id;
    const canBuy    = credits >= item.cost;
    const disabled  = !isOwned && credits < item.cost;

    return (
      <View style={[
        styles.card,
        { backgroundColor: palette[0], borderColor: palette[1] },
      ]}>
        <Text style={[styles.title, { color: palette[2] }]}>
          {item.name}
        </Text>

        {item.colors && (
          <View style={styles.swatchRow}>
            {item.colors.map(c=>(
              <View key={c} style={[styles.swatch,{ backgroundColor:c }]} />
            ))}
          </View>
        )}

        <Text style={[styles.cost, { color: palette[2] }]}>
          {item.cost} cr
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            isOwned
              ? isActive
                ? { backgroundColor:'#faa' }
                : { backgroundColor:'#afa' }
              : disabled
                ? { backgroundColor:'#ccc' }
                : { backgroundColor: palette[1] },
          ]}
          onPress={() => {
            if (!isOwned) return buy(item);
            toggleActive(item.id);
          }}
        >
          <Text style={[styles.buttonText, { color: palette[3] }]}>
            { !isOwned
              ? 'Buy'
              : isActive
                ? 'Deactivate'
                : 'Activate'
            }
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const sections = [
    { title:'Theme Packs',    data:[{ key:'t', list:themePacks }] },
    { title:'A-la-Carte',      data:[{ key:'a', list:aLaCarte }] },
    { title:'Limited Drops',   data:[{ key:'d', list:drops }] },
    { title:'Seasonal',        data:[{ key:'s', list:seasonal }] },
  ];

  return (
    <View style={[styles.container, { backgroundColor: palette[0] }]}>
      <LinearGradient
        colors={['#000','#FFCED9']}
        start={{x:0,y:0}}
        end={{x:1,y:0}}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Shop</Text>
        {credits === null
          ? <ActivityIndicator color="#FFF6E7"/>
          : <Text style={styles.headerCredits}>{credits} cr</Text>}
      </LinearGradient>

      <SectionList
        sections={sections}
        keyExtractor={i=>i.id||i.key}
        contentContainerStyle={{ paddingBottom:24 }}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { backgroundColor: palette[0] }]}>
            <Text style={[styles.sectionTitle, { color: palette[2] }]}>
              {section.title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <FlatList
            data={item.list}
            horizontal
            keyExtractor={i=>i.id}
            renderItem={({ item }) => <SmallCard item={item}/>}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft:16 }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1 },

  locked:    { flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#FFF6E7' },
  lockedTxt: { fontSize:18,fontWeight:'600',color:'#000' },

  header:        {
    paddingVertical:12,
    paddingHorizontal:16,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
  },
  headerTitle:   { color:'#FFF6E7', fontSize:22, fontWeight:'700' },
  headerCredits: { color:'#FFF6E7', fontSize:16, fontWeight:'600' },

  sectionHeader: { paddingVertical:8, paddingHorizontal:16 },
  sectionTitle:  { fontSize:18, fontWeight:'600' },

  card: {
    width: CARD_W,
    borderRadius:16,
    padding:12,
    marginRight:12,
    borderWidth:2,
  },
  title:     { fontSize:16, fontWeight:'600' },
  swatchRow: { flexDirection:'row', marginVertical:8 },
  swatch:{ width:24, height:24, borderRadius:4, marginRight:6, borderWidth:1, borderColor:'#ccc' },

  cost:       { fontSize:14, marginBottom:8 },
  button:     { paddingVertical:8, borderRadius:8, alignItems:'center' },
  buttonText: { fontSize:14, fontWeight:'600' },
});
