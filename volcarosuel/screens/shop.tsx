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
import { collection, query, where, onSnapshot, doc, onSnapshot as onDocSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

import { AuthContext } from '../../auth/AuthContext';
import { db } from '../../auth/firebase';

const { width } = Dimensions.get('window');
const CARD_W = Math.min(200, width * 0.55);

const themePacks = [
  { id:'ocean',name:'Ocean Explorer',cost:30 },
  { id:'vintage',name:'Vintage Typewriter',cost:20 },
  { id:'neon',name:'Neon Night',cost:40 },
  { id:'forest',name:'Forest Retreat',cost:25 },
  { id:'fiesta',name:'Festival Fiesta',cost:35 },
];
const aLaCarte = [
  { id:'bgColor',name:'Background Color Swap',cost:5 },
  { id:'button', name:'Button Shape & Color',cost:5 },
  { id:'accentColor',name:'Accent Color Override',cost:5 },
  { id:'textStyle',name:'Text Color & Font Style',cost:5 },
  { id:'crooked',name:'Crooked Text Effect',cost:8 },
  { id:'micro',name:'Animated Micro-FX',cost:10 },
];
const drops = [
  { id:'spring',name:'Spring Bloom',cost:0 },
  { id:'techfest',name:'Tech Fest Neon',cost:0 },
  { id:'harvest',name:'Harvest Gold',cost:0 },
];
const profile = [
  { id:'badge',name:'Volunteer Badge Set',cost:10 },
  { id:'frame',name:'Profile Frame Style',cost:8 },
  { id:'accessory',name:'Avatar Accessory',cost:7 },
];
const collections = [
  { id:'nature',name:'Nature Lover',components:['ocean','forest','frame'],bonus:'+1 badge credit' },
  { id:'vintageSet',name:'Vintage Buff',components:['vintage','crooked','textStyle'],bonus:'Sepia app icon' },
  { id:'neonPulse',name:'Neon Pulse',components:['neon','techfest','micro'],bonus:'Neon trail' },
];

export default function ShopScreen() {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  // storage key per‐user
  const storageKey = user ? `@shop/spent-${user.uid}` : null;

  const [totalCredits, setTotalCredits] = useState(null);
  const [spentLocal,    setSpentLocal]   = useState(null);
  const [owned,         setOwned]        = useState([]);
  const [preview,       setPreview]      = useState(null);
  const [loading,       setLoading]      = useState(true);

  // derived remaining credits
  const remaining = (totalCredits ?? 0) - (spentLocal ?? 0);

  // load spentLocal from AsyncStorage
  useEffect(() => {
    if (!storageKey) return;
    AsyncStorage.getItem(storageKey).then(raw => {
      setSpentLocal(raw ? parseInt(raw, 10) : 0);
    });
  }, [storageKey]);

  // subscribe volunteer_logs for this user and sum hours
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(
      collection(db, 'volunteer_logs'),
      where('user_id', '==', user.uid)
    );
    const unsub = onSnapshot(q, snap => {
      let sum = 0;
      snap.forEach(d => {
        sum += d.data().hours_contributed ?? 0;
      });
      setTotalCredits(sum);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  // subscribe to user doc to pick up any shopOwned array
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid);
    const unsub = onDocSnapshot(ref, docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setOwned(data.shopOwned ?? []);
      }
    });
    return unsub;
  }, [user]);

  // persist new spentLocal
  const saveSpent = useCallback(val => {
    setSpentLocal(val);
    storageKey && AsyncStorage.setItem(storageKey, String(val));
  }, [storageKey]);

  // redeem handler
  const redeem = useCallback(item => {
    if (remaining < item.cost) {
      return Alert.alert('Not enough credits', `You need ${item.cost - remaining} more.`);
    }
    if (owned.includes(item.id)) {
      return Alert.alert('Already owned', item.name);
    }
    saveSpent((spentLocal ?? 0) + item.cost);
    setOwned(o => [...o, item.id]);
    Alert.alert('Unlocked!', `You bought ${item.name}.`);
  }, [remaining, owned, spentLocal, saveSpent]);

  // all hooks done — now guard on user and loading
  if (!user) {
    return (
      <View style={styles.locked}>
        <Text style={styles.lockedTxt}>Log in to access this feature</Text>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginBtnTxt}>Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (loading || spentLocal === null || totalCredits === null) {
    return (
      <View style={[styles.locked, { paddingTop: 0 }]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  /* ── UI components ──────────────────────────────────────────── */
  const SmallCard = ({ item }) => {
    const isOwned = owned.includes(item.id);
    const canBuy  = remaining >= item.cost && !isOwned;
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.cost}>{item.cost} cr</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.previewBtn}
            onPress={() => setPreview(p => (p === item.id ? null : item.id))}
          >
            <Text style={styles.btnTxt}>{preview === item.id ? 'Hide' : 'Preview'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={!canBuy}
            style={[styles.redeemBtn, !canBuy && styles.disabledBtn]}
            onPress={() => redeem(item)}
          >
            <Text style={[styles.btnTxt, { color: '#fff' }]}>
              {isOwned ? 'Owned' : 'Redeem'}
            </Text>
          </TouchableOpacity>
        </View>
        {preview === item.id && (
          <View style={styles.previewBox}>
            <Text style={styles.previewTxt}>✨ Preview enabled</Text>
          </View>
        )}
      </View>
    );
  };

  const CollectionCard = ({ item }) => {
    const done = item.components.filter(c => owned.includes(c)).length;
    const complete = done === item.components.length;
    const claimed  = owned.includes(item.id);
    return (
      <View style={[styles.card, { width: '100%' }]}>
        <Text style={styles.title}>{item.name} Collection</Text>
        <Text style={styles.progress}>{done}/{item.components.length} unlocked</Text>
        <Text style={styles.bonus}>Bonus: {item.bonus}</Text>
        <TouchableOpacity
          disabled={!complete || claimed}
          style={[styles.redeemBtn, (!complete || claimed) && styles.disabledBtn]}
          onPress={() => redeem({ id: item.id, name: item.name, cost: 0 })}
        >
          <Text style={[styles.btnTxt, { color: '#fff' }]}>
            {claimed ? 'Claimed' : complete ? 'Claim Bonus' : 'Incomplete'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const sections = [
    { title: 'Theme Packs',       data: [{ key: 'themes', list: themePacks }] },
    { title: 'A-la-Carte',        data: [{ key: 'ala',    list: aLaCarte  }] },
    { title: 'Limited Drops',     data: [{ key: 'drops',  list: drops     }] },
    { title: 'Profile & Badges',  data: [{ key: 'prof',   list: profile   }] },
    { title: 'Collections',       data: collections, isCol: true },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#fff6e7','#fff6e7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.banner}
      >
        <Text style={styles.bannerTxt}>Shop</Text>
        <Text style={styles.balance}>{remaining} cr</Text>
      </LinearGradient>

      <SectionList
        sections={sections}
        keyExtractor={i => i.id || i.key}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.section}>{title}</Text>
        )}
        renderItem={({ item, section }) => {
          if (section.isCol) return <CollectionCard item={item} />;
          return (
            <FlatList
              data={item.list}
              horizontal
              keyExtractor={i => i.id}
              renderItem={({ item }) => <SmallCard item={item} />}
              showsHorizontalScrollIndicator={false}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  locked: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FFF6E7',
  },
  lockedTxt:  { fontSize: 18, fontWeight: '600', color: '#000' },
  loginBtn:   { marginTop: 12, padding: 12, backgroundColor: '#000', borderRadius: 20 },
  loginBtnTxt:{ color: '#FFF6E7', fontWeight: '600' },

  container: { flex: 1, backgroundColor: '#FFF6E7' },
  banner: {
    paddingVertical: 16, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,


  },
  bannerTxt:{ color:'black', fontSize:22, fontWeight:'700' },
  balance:  { color:'#FFF6E7', fontSize:16, fontWeight:'600' },

  section:{ fontSize:18, fontWeight:'600', marginVertical:14, marginLeft:16 },

  card:{
    width:CARD_W, backgroundColor:'#fff', borderRadius:16, padding:14,
    marginRight:12, shadowColor:'#000', shadowOpacity:0.08,
    shadowRadius:4, shadowOffset:{width:0,height:2},
  },
  title:{ fontSize:15, fontWeight:'600', color:'#000' },
  cost: { fontSize:13, color:'#666', marginVertical:4 },

  row:{ flexDirection:'row', justifyContent:'space-between', marginTop:6 },
  previewBtn:{ backgroundColor:'#DDE1FF', padding:6, borderRadius:8 },
  redeemBtn:{ backgroundColor:'#000', padding:6, borderRadius:8 },
  disabledBtn:{ backgroundColor:'#9E9E9E' },
  btnTxt:{ fontSize:12, fontWeight:'500' },

  previewBox:{ marginTop:8, padding:8, backgroundColor:'#DDE1FF', borderRadius:8 },
  previewTxt:{ fontSize:12 },

  progress:{ fontSize:13, marginVertical:4 },
  bonus:{ fontSize:12, fontStyle:'italic', marginBottom:8 },
});
