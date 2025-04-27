// ShopScreen.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View, Text, SectionList, FlatList, TouchableOpacity,
  StyleSheet, Dimensions, Alert, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { AuthContext } from '../../auth/AuthContext';
import { db } from '../../auth/firebase';

const { width } = Dimensions.get('window');
const CARD_W = Math.min(200, width * 0.55);

const themePacks = [
  { id:'ocean',    name:'Ocean Explorer',    cost:2, colors:['#005f73','#0a9396','#94d2bd','#e9d8a6'],type: 'Pack' },
  { id:'vintage',  name:'Vintage Typewriter', cost:2, colors:['#3d2c8d','#5e548e','#e0b1cb','#f1e3dd'],type: 'Pack' },
  { id:'neon',     name:'Neon Night',        cost:2, colors:['#ff006e','#8338ec','#3a86ff','#ffbe0b'] ,type: 'Pack'},
  { id:'forest',   name:'Forest Retreat',    cost:2, colors:['#2a9d8f','#264653','#e9c46a','#f4a261'],type: 'Pack' },
  { id:'sunrise',  name:'Sunrise Glow',      cost:2, colors:['#ff9f1c','#ffbf69','#ffffff','#cbf3f0'] ,type: 'Pack'},
  { id:'midnight', name:'Midnight Sky',      cost:2, colors:['#0d1b2a','#1b263b','#415a77','#778da9'] ,type: 'Pack'},
  { id:'desert',   name:'Desert Sand',       cost:2, colors:['#e0c097','#ffb4a2','#e5989b','#b5838d'] ,type: 'Pack'},
  { id:'candy',    name:'Candy Floss',       cost:2, colors:['#ff6b6b','#f06595','#cc5de8','#845ef7'],type: 'Pack' },
  { id:'pastel',   name:'Pastel Dream',      cost:2, colors:['#ffd6a5','#fdffb6','#caffbf','#9bf6ff'] ,type: 'Pack'},
  { id:'emerald',  name:'Emerald City',      cost:2, colors:['#006d77','#83c5be','#edf6f9','#ffddd2'],type: 'Pack' },
];
const aLaCarte = [
  { id: 'bgSwap',   name: 'Background Swap',       cost: 0.5, colors: ['#ffe8d6'], type: 'background' },
  { id: 'btnStyle', name: 'Button Style',          cost: 0.5, colors: ['#ff006e'], type: 'button' },
  { id: 'textColor',name: 'Text Color Override',   cost: 0.5, colors: ['#001219'], type: 'text' },
  { id: 'border',   name: 'Border Highlight',      cost: 0.5, colors: ['#0a9396'], type: 'border' },
  // ... up to 10 items ...
];

const seasonal = [
  { id: 'spring', name: 'Spring Blossom', cost: 0, colors: ['#a8dadc','#f1faee','#f4a261','#e76f51'], type: 'Pack' },
];

export default function ShopScreen() {
  const { user } = useContext(AuthContext);
  const nav = useNavigation();

  if (!user) {
    return (
      <View style={styles.locked}>
        <Text style={styles.lockedTxt}>Log in to access this feature</Text>
      </View>
    );
  }

  const keySpent = `@shop/spent-${user.uid}`;
  const keyOwned = `@shop/owned-${user.uid}`;
  const keyActive = `@shop/active-${user.uid}`;

  const [totalHours, setTotal] = useState(null);
  const [spentLocal, setSpent] = useState(null);
  const [owned, setOwned] = useState([]);
  const [active, setActive] = useState(null);

  const credits = totalHours !== null && spentLocal !== null
    ? totalHours - spentLocal
    : null;

  useEffect(() => {
    (async () => {
      const [rawS, rawO, rawA] = await Promise.all([
        AsyncStorage.getItem(keySpent),
        AsyncStorage.getItem(keyOwned),
        AsyncStorage.getItem(keyActive),
      ]);
      setSpent(rawS ? +rawS : 0);
      setOwned(rawO ? JSON.parse(rawO) : []);
      setActive(rawA);
    })();
  }, []);

  useEffect(() => {
    const ref = doc(db, 'users', user.uid);
    return onSnapshot(ref, s => {
      if (!s.exists()) return;
      setTotal(s.data().totalHours || 0);
    });
  }, [user]);

  const persist = async (k, v) =>
    await AsyncStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));

  const buy = useCallback(item => {
    if (credits < item.cost) return Alert.alert('Not enough credits');
    const newSpent = spentLocal + item.cost;
    const newOwned = [...owned, item.id];
    setSpent(newSpent);
    setOwned(newOwned);
    persist(keySpent, newSpent);
    persist(keyOwned, newOwned);
  }, [credits, spentLocal, owned]);

  const toggleActive = useCallback(id => {
    const next = active === id ? null : id;
    setActive(next);
    persist(keyActive, next);
  }, [active]);

  const pack = themePacks.find(t => t.id === active)
    || seasonal.find(s => s.id === active)
  const palette = pack
    ? pack.colors || pack.gradient
    : ['#FFF6E7', '#000', '#000', '#000'];

  const SmallCard = ({ item }) => {
    const isOwned = owned.includes(item.id);
    const isActive = active === item.id;
    const canBuy = credits >= item.cost;
    const disabled = !isOwned && !canBuy;

    let btnBg;
    let btnText = '#fff';
    if (!isOwned) {
      btnBg = canBuy ? '#000' : '#ccc';
    } else {
      btnBg = isActive ? '#faa' : '#afa';
      btnText = '#000';
    }

    return (
      <View style={styles.cardContainer}>
        <Text style={[styles.typeLabel, { color: palette[2] }]}>{item.type.toUpperCase()}</Text>
        {item.gradient ? (
          <LinearGradient colors={item.gradient} style={[styles.card, { backgroundColor: palette[0] }]}> 
            <Text style={[styles.title, { color: '#fff' }]}>{item.name}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.card, { backgroundColor: palette[0] }]}> 
            <Text style={[styles.title, { color: palette[2] }]}>{item.name}</Text>
          </View>
        )}

        <View style={styles.swatchRow}>
          {(item.colors || []).map(c => (
            <View key={c} style={[styles.swatch, { backgroundColor: c }]} />
          ))}
        </View>
        <Text style={[styles.cost, { color: palette[2] }]}>{item.cost} cr</Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: btnBg }]}
          disabled={disabled && !isOwned}
          onPress={() => isOwned ? toggleActive(item.id) : buy(item)}
        >
          <Text style={[styles.buttonText, { color: btnText }]}> 
            {!isOwned ? 'Buy' : isActive ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const sections = [
    { title: 'Theme Packs', data: [{ key: 't', list: themePacks }] },
    { title: 'A‑la‑Carte', data: [{ key: 'a', list: aLaCarte }] },
    { title: 'Seasonal', data: [{ key: 's', list: seasonal }] },
  ];

  return (
    <View style={[styles.container, { backgroundColor: palette[0] }]}> 
      <View style={[styles.header, { backgroundColor: '#FFF6E7' }]}> 
        <Text style={[styles.headerTitle, { color: '#000' }]}>Shop</Text>
        <View style={styles.headerRight}>
          {credits === null
            ? <ActivityIndicator color='#000'/>
            : <Text style={[styles.headerCredits, { color: '#000' }]}>{credits} cr</Text>}
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={i => i.id || i.key}
        contentContainerStyle={{ paddingBottom: 24 }}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { backgroundColor: palette[0] }]}> 
            <Text style={[styles.sectionTitle, { color: palette[2] }]}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <FlatList
            data={item.list}
            horizontal
            keyExtractor={i => i.id}
            renderItem={({ item }) => <SmallCard item={item}/>} 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 16 }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex:1 },
  locked:        { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#FFF6E7' },
  lockedTxt:     { fontSize:18, fontWeight:'600', color:'#000' },
  header:        { padding:12, paddingHorizontal:16, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  headerTitle:   { fontSize:22, fontWeight:'700' },
  headerRight:   { flexDirection:'row', alignItems:'center' },
  headerCredits: { fontSize:16, fontWeight:'600', marginRight:12 },

  sectionHeader: { paddingVertical:8, paddingHorizontal:16 },
  sectionTitle:  { fontSize:18, fontWeight:'600' },

  cardContainer: { width:CARD_W, marginRight:12 },
  typeLabel:     { fontSize:12, fontWeight:'600', marginBottom:4 },
  card:          { borderRadius:16, padding:12, justifyContent:'center', alignItems:'center' },
  title:         { fontSize:16, fontWeight:'600' },
  swatchRow:     { flexDirection:'row', marginVertical:8 },
  swatch:        { width:24, height:24, borderRadius:4, marginRight:6, borderWidth:1, borderColor:'#ccc' },
  cost:          { fontSize:14, marginBottom:8 },
  button:        { paddingVertical:8, borderRadius:8, alignItems:'center', marginBottom:16 },
  buttonText:    { fontSize:14, fontWeight:'600' },
});
