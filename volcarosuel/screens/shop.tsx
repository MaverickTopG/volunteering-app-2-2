// ShopScreen.js
import React, {
  useState,
  useEffect,
  useContext,
  useCallback
} from 'react';
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
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../auth/AuthContext';
import { db } from '../../auth/firebase';

const { width } = Dimensions.get('window');
const CARD_W = Math.min(200, width * 0.55);

/* ——— Data ——— */
export const themePacks = [
  { id:'ocean',    name:'Ocean Explorer',    cost:2,   colors:['#005f73','#0a9396','#94d2bd','#e9d8a6'], type:'Pack' },
  { id:'vintage',  name:'Vintage Typewriter', cost:2,   colors:['#3d2c8d','#5e548e','#e0b1cb','#f1e3dd'], type:'Pack' },
  { id:'neon',     name:'Neon Night',        cost:2,   colors:['#ff006e','#8338ec','#3a86ff','#ffbe0b'], type:'Pack' },
  { id:'forest',   name:'Forest Retreat',    cost:2,   colors:['#2a9d8f','#264653','#e9c46a','#f4a261'], type:'Pack' },
  { id:'sunrise',  name:'Sunrise Glow',      cost:2,   colors:['#ff9f1c','#ffbf69','#ffffff','#cbf3f0'], type:'Pack' },
  { id:'midnight', name:'Midnight Sky',      cost:2,   colors:['#0d1b2a','#1b263b','#415a77','#778da9'], type:'Pack' },
  { id:'desert',   name:'Desert Sand',       cost:2,   colors:['#e0c097','#ffb4a2','#e5989b','#b5838d'], type:'Pack' },
  { id:'candy',    name:'Candy Floss',       cost:2,   colors:['#ff6b6b','#f06595','#cc5de8','#845ef7'], type:'Pack' },
  { id:'pastel',   name:'Pastel Dream',      cost:2,   colors:['#ffd6a5','#fdffb6','#caffbf','#9bf6ff'], type:'Pack' },
  { id:'emerald',  name:'Emerald City',      cost:2,   colors:['#006d77','#83c5be','#edf6f9','#ffddd2'], type:'Pack' },
];


export const seasonal = [
  { id:'spring',   name:'Spring Blossom',      cost:0,   colors:['#a8dadc','#f1faee','#f4a261','#e76f51'], type:'Seasonal' },
];

export default function ShopScreen() {
  const { user } = useContext(AuthContext);
  if (!user) {
    return (
      <SafeAreaView style={styles.locked}>
        <Text style={styles.lockedTxt}>
          Log in to access this feature
        </Text>
      </SafeAreaView>
    );
  }

  /* — storage keys — */
  const keySpent  = `@shop/spent-${user.uid}`;
  const keyOwned  = `@shop/owned-${user.uid}`;
  const keyActive = `@shop/active-${user.uid}`;

  /* — local state — */
  const [ totalHours, setTotalHours ] = useState(null);
  const [ spentLocal, setSpentLocal ] = useState(null);
  const [ owned,      setOwned      ] = useState([]);
  const [ active,     setActive     ] = useState(null);

  /* — compute credits — */
  const credits =
    totalHours != null && spentLocal != null
      ? totalHours - spentLocal
      : null;

  /* — hydrate persisted state — */
  useEffect(() => {
    (async () => {
      const [ rs, ro, ra ] = await Promise.all([
        AsyncStorage.getItem(keySpent),
        AsyncStorage.getItem(keyOwned),
        AsyncStorage.getItem(keyActive),
      ]);
      setSpentLocal(rs ? +rs : 0);
      setOwned   (ro ? JSON.parse(ro) : []);
      setActive  (ra);
    })();
  }, []);

  /* — subscribe volunteer_logs to sum hours_contributed — */
  useEffect(() => {
    const q = query(
      collection(db, 'volunteer_logs'),
      where('user_id','==',user.uid)
    );
    const unsub = onSnapshot(q, snap => {
      let sum = 0;
      snap.forEach(d => sum += (d.data().hours_contributed || 0));
      setTotalHours(sum);
    });
    return unsub;
  }, [ user ]);

  /* — helper to persist — */
  const persist = useCallback((k,v)=>
    AsyncStorage.setItem(k,
      typeof v === 'string' ? v : JSON.stringify(v)
    )
  ,[]);

  /* — buy an item — */
  const buy = useCallback(item => {
    if (credits < item.cost) {
      return Alert.alert('Not enough credits');
    }
    const s2 = spentLocal + item.cost;
    const o2 = [...owned, item.id];
    setSpentLocal(s2);
    setOwned(o2);
    persist(keySpent,  s2);
    persist(keyOwned,  o2);
  },[ credits, spentLocal, owned ]);

  /* — activate / deactivate — */
  const toggleActive = useCallback(id => {
    const next = (active === id ? null : id);
    setActive(next);
    persist(keyActive, next);
  },[ active ]);

  /* — pick up current palette — */
  const pack    = themePacks.find(t=>t.id===active)
                || seasonal.find(s=>s.id===active);
  const palette = pack?.colors || ['#FFF6E7','#FFF6E7','#000','#000'];
  const [ bg, secBg, txtC, btnBg ] = palette;

  /* — single card — */
  function Card({ item }) {
    const isOwned = owned.includes(item.id);
    const isActive= (active === item.id);
    const canBuy  = credits >= item.cost;
    const disabled= !isOwned && !canBuy;

    let btnColor = !isOwned
      ? (canBuy ? btnBg : '#ccc')
      : (isActive ? '#faa' : '#afa');
    let btnTxtColor = isOwned ? '#000' : '#fff';

    return (
      <View style={styles.cardContainer}>
        <Text style={[styles.typeLabel,{ color: txtC }]}>
          {item.type.toUpperCase()}
        </Text>
        <View style={[styles.card,{ backgroundColor: secBg }]}>
          <Text style={[styles.title,{ color: txtC }]}>
            {item.name}
          </Text>
        </View>
        <View style={styles.swatchRow}>
          {(item.colors||[]).map(c=>(
            <View key={c} style={[styles.swatch,{ backgroundColor:c }]} />
          ))}
        </View>
        <Text style={[styles.cost,{ color: txtC }]}>
          {item.cost} cr
        </Text>
        <TouchableOpacity
          style={[styles.button,{ backgroundColor: btnColor }]}
          disabled={disabled}
          onPress={()=>
            isOwned
              ? toggleActive(item.id)
              : buy(item)
          }
        >
          <Text style={[styles.buttonText,{ color: btnTxtColor }]}>
            {!isOwned ? 'Buy'
             : isActive ? 'Deactivate'
             : 'Activate'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sections = [
    { title:'Theme Packs', data:[{ key:'tp', list:themePacks }] },
    { title:'Seasonal',    data:[{ key:'ss', list:seasonal  }]  },
  ];

  return (
    <SafeAreaView style={[styles.container,{ backgroundColor: bg }]}>
      {/* header */}
      <View style={[styles.header,{ backgroundColor: secBg }]}>
        <Text style={[styles.headerTitle,{ color: txtC }]}>
          Shop
        </Text>
        {credits == null
          ? <ActivityIndicator color={txtC}/>
          : <Text style={[styles.headerCredits,{ color: txtC }]}>
              {credits} cr
            </Text>
        }
      </View>

      {/* sections */}
      <SectionList
        sections={sections}
        keyExtractor={i=>i.id||i.key}
        contentContainerStyle={{ paddingBottom:24 }}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({section})=>(
          <View style={[styles.sectionHeader,{ backgroundColor: bg }]}>
            <Text style={[styles.sectionTitle,{ color: txtC }]}>
              {section.title}
            </Text>
          </View>
        )}
        renderItem={({item})=>(
          <FlatList
            data={item.list}
            horizontal
            keyExtractor={i=>i.id}
            renderItem={({item})=><Card item={item}/>}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft:16 }}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex:1 },
  locked:         {
    flex:1, justifyContent:'center',
    alignItems:'center', backgroundColor:'#FFF6E7'
  },
  lockedTxt:      { fontSize:18, fontWeight:'600', color:'#000' },

  header:         {
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    padding:12, paddingHorizontal:16
  },
  headerTitle:    { fontSize:22, fontWeight:'700' },
  headerCredits:  { fontSize:16, fontWeight:'600' },

  sectionHeader:  {
    paddingVertical:8,
    paddingHorizontal:16
  },
  sectionTitle:   { fontSize:18, fontWeight:'600' },

  cardContainer:  { width:CARD_W, marginRight:12 },
  typeLabel:      {
    fontSize:12, fontWeight:'600',
    marginBottom:4
  },
  card:           {
    borderRadius:16,
    padding:12,
    justifyContent:'center',
    alignItems:'center'
  },
  title:          { fontSize:16, fontWeight:'600' },

  swatchRow:      {
    flexDirection:'row',
    marginVertical:8
  },
  swatch:         {
    width:24, height:24,
    borderRadius:4,
    marginRight:6,
    borderWidth:1,
    borderColor:'#ccc'
  },

  cost:           { fontSize:14, marginBottom:8 },

  button:         {
    paddingVertical:8,
    borderRadius:8,
    alignItems:'center'
  },
  buttonText:     {
    fontSize:14,
    fontWeight:'600'
  },
});
