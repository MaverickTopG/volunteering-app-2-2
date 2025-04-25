// LeaderboardScreen.tsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../auth/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* ── palette ─────────────────────────────────────── */
const BG     = '#fff6e7';
const CARD   = '#fff6e7';
const ROWBG  = '#fff0d4';
const BORDER = 'black';
const ACCENT = '#fff6e7';

/* podium token */
const CHIP = 28;

/* icons – 24 fun glyphs */
const ICON_POOL = [
  'happy-outline','paw-outline','leaf-outline','planet-outline',
  'fish-outline','sunny-outline','rocket-outline','ice-cream-outline',
  'balloon-outline','cafe-outline','bug-outline','bulb-outline',
  'flame-outline','cloudy-night-outline','game-controller-outline',
  'heart-outline','musical-notes-outline','pizza-outline',
  'rainy-outline','snow-outline','star-outline','water-outline',
  'wine-outline','tennisball-outline',
];
const pickIcon = (uid:string)=>{
  let h=0;for(let c of uid)h=c.charCodeAt(0)+((h<<5)-h);
  return ICON_POOL[Math.abs(h)%ICON_POOL.length];
};

/* types */
interface Player { uid:string; name:string; hours:number }

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const meUid  = (auth.currentUser as FirebaseUser | null)?.uid;

  const [players,setPlayers] = useState<Player[]>([]);
  const [loading,setLoading] = useState(true);

  /* live aggregation */
  useEffect(()=>{
    const unsub = onSnapshot(collection(db,'volunteer_logs'), snap=>{
      const map:Record<string,Player> = {};
      snap.forEach(doc=>{
        const { user_id, hours_contributed=0, user_name='Unknown' } = doc.data() as any;
        if(!map[user_id]) map[user_id] = { uid:user_id,name:user_name,hours:0 };
        map[user_id].hours += +hours_contributed;
      });
      setPlayers(Object.values(map).sort((a,b)=>b.hours-a.hours));
      setLoading(false);
    });
    return unsub;
  },[]);

  const podium = useMemo(()=>players.slice(0,3),[players]);
  const rest   = useMemo(()=>players.slice(3),[players]);

  /* reusable avatar */
  const Avatar = ({p,rank,size}:{p:Player;rank:number;size:number})=>(
    <View style={{alignItems:'center'}}>
      <View style={[
        styles.avatar,
        { width:size+6,height:size+6,borderRadius:(size+6)/2 }
      ]}>
        <Ionicons name={pickIcon(p.uid)} size={size*0.65} color="#fff"/>
      </View>
    
      <View style={styles.chip}>
        <Text style={styles.chipTxt}>{rank}</Text>
      </View>
    </View>
  );

  /* list row */
  const Row = ({item,index}:{item:Player;index:number})=>{
    const rank=index+4, mine=item.uid===meUid;
    return(
      <View style={[
        styles.row,
        mine&&{backgroundColor:ACCENT}
      ]}>
        <View style={styles.rowLeft}>
          <Text style={[styles.rankNo,mine&&{color:'#000'}]}>{rank}</Text>
          <Avatar p={item} rank={rank} size={34}/>
          <Text
            numberOfLines={1}
            style={[styles.rowName,mine&&{color:'#000',fontWeight:'700'}]}
          >
            {item.name}
          </Text>
        </View>
        <View style={{flexDirection:'row',alignItems:'center'}}>
          <Ionicons
            name="trophy-outline"
            size={16}
            color={mine?'#000':"black"}
            style={{marginRight:4}}
          />
          <Text style={[
            styles.hoursTxt,
            mine&&{color:'#000',fontWeight:'700'}
          ]}>
            {item.hours}
          </Text>
        </View>
      </View>
    )
  };

  if(loading){
    return(
      <View style={[styles.container,{justifyContent:'center'}]}>
        <ActivityIndicator size="large" color={ACCENT}/>
      </View>
    );
  }

  return(
    <View style={styles.container}>
      <Text style={[styles.title,{marginTop:insets.top-60}]}>Leaderboard</Text>

  {/* podium — force 1st place in the middle, 2nd left, 3rd right */}
<View style={styles.podium}>
  {/**
   * We want visual order  ⟨ rank-2 | rank-1 | rank-3 ⟩
   * podiumOrder maps to indices in the sorted `players` array.
   */}
  {([1, 0, 2] as const).map((sortedIdx, visualIdx) => {
    const p    = players[sortedIdx];
    if (!p) return null;                       // in case fewer than 3 players
    const rank = sortedIdx + 1;                // actual rank (1-based)

    const size = rank === 1 ? 96 : 76;         // bigger crown
    return (
      <View key={p.uid} style={styles.podiumItem}>
        <Avatar p={p} rank={rank} size={size} />

        <Text
          numberOfLines={1}
          style={[styles.podiumName, { width: size + 20 }]}
        >
          {p.name}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="trophy-outline" size={14} color={ACCENT} />
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
          keyExtractor={p=>p.uid}
          renderItem={Row}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={()=> <View style={{height:1,backgroundColor:BORDER+'33'}}/> }
          contentContainerStyle={{paddingBottom:20}}
        />
      </View>
    </View>
  );
}

/* styles */
const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:BG, paddingHorizontal:20 },
  title:{ textAlign:'center', fontSize:24, fontWeight:'700', color:'#000', marginBottom:30 },

  /* podium */
  podium:{ flexDirection:'row', justifyContent:'space-between', marginBottom:24 },
  podiumItem:{ alignItems:'center', flex:1 },
  avatar:{
    borderWidth:3, borderColor:BORDER,
    backgroundColor:'#000', justifyContent:'center', alignItems:'center',
  },
  chip:{
    position:'absolute', bottom:-CHIP/2,
    width:CHIP, height:CHIP, borderRadius:CHIP/2,
    backgroundColor:ACCENT, alignItems:'center', justifyContent:'center',
    borderWidth:2, borderColor:BORDER,
  },
  chipTxt:{ fontWeight:'700', color:'#000' },
  podiumName:{ color:'#000', fontWeight:'600', marginTop:14, fontSize:14, textAlign:'center' },
  podiumHours:{ color:ACCENT, fontSize:12 },

  /* list card */
  card:{
    flex:1, backgroundColor:CARD, borderRadius:20,
    paddingVertical:8, paddingHorizontal:12,
    borderWidth:0, borderColor:BORDER,
  },
  row:{
    flexDirection:'row', alignItems:'center',
    paddingVertical:12, paddingHorizontal:10,
    borderRadius:14, backgroundColor:ROWBG, borderWidth:1, borderColor:BORDER,
  },
  rowLeft:{ flexDirection:'row', alignItems:'center', flex:1 },
  rankNo:{ width:24, textAlign:'center', fontWeight:'700', color:BORDER, marginRight:10 },
  rowName:{ flex:1, marginLeft:10, fontSize:15, fontWeight:'600', color:'#4A4A4A' },
  hoursTxt:{ fontSize:15, fontWeight:'600', color:'#4A4A4A' },
});
