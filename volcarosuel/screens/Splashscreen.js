// GoFundMeScreen.js
import React, { useRef, useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../auth/AuthContext';
import { themePacks, seasonal } from '../screens/shop';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const scale = (s) => (width  / guidelineBaseWidth)  * s;
const verticalScale = (s) => (height / guidelineBaseHeight) * s;

export default function GoFundMeScreen() {
  const { user } = useContext(AuthContext);

  // 4-color palette: [bg, gradStart, gradEnd, text]
  const DEFAULT = ['#FFF6E7','#FFF0D4','#FFE8C9','#333'];
  const [palette, setPalette] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);

  // load active theme from AsyncStorage
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const key = `@shop/active-${user.uid}`;
    AsyncStorage.getItem(key)
      .then(id => {
        if (!id) return;
        const pack =
          themePacks.find(t=>t.id===id) ||
          seasonal.find(s=>s.id===id);
        if (pack?.colors) {
          const c = pack.colors;
          setPalette([
            c[0]||DEFAULT[0],
            c[1]||DEFAULT[1],
            c[2]||DEFAULT[2],
            c[3]||DEFAULT[3],
          ]);
        }
      })
      .catch(console.warn)
      .finally(()=>setLoading(false));
  },[user]);

  // Animations
  const logoScale   = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const [typedText,setTypedText] = useState('');
  const indexRef    = useRef(0);
  const fullText    = 'Empowering volunteers!';

  useEffect(()=>{
    if(loading) return;
    // logo spring
    Animated.spring(logoScale,{ toValue:1, friction:5, useNativeDriver:true }).start();
    // text fade
    Animated.timing(textOpacity,{ toValue:1, duration:800, delay:500, useNativeDriver:true }).start();
    // typing effect
    setTypedText('');
    indexRef.current=0;
    const tick = () => {
      if(indexRef.current<fullText.length){
        setTypedText(prev=>prev+fullText[indexRef.current]);
        indexRef.current++;
        setTimeout(tick,100);
      }
    };
    setTimeout(tick,1000);
  },[loading]);

  if(loading){
    return (
      <SafeAreaView style={[styles.container,{backgroundColor:DEFAULT[0]}]}>
        <ActivityIndicator size="large" color={DEFAULT[3]} />
      </SafeAreaView>
    );
  }

  const goFundMeUrl =
    'https://www.gofundme.com/f/empower-volunteers-and-transform-communities-with-nexolink';

  return (
    <SafeAreaView style={[styles.container,{ backgroundColor: palette[0] }]}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, { transform:[{scale:logoScale}] }]}>
          <Image
            source={require('../../assets/spaceship.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Title */}
        <Animated.View style={[styles.textContainer,{opacity:textOpacity}]}>
          <Text style={[styles.title,{ color: palette[3] }]}>
            NexoLink Fundraiser
          </Text>
        </Animated.View>

        {/* Typed Text */}
        <Animated.View style={[styles.textContainer,{opacity:textOpacity}]}>
          <Text style={[styles.typingText,{ color: palette[3] }]}>
            {typedText}
          </Text>
        </Animated.View>

        {/* Donate Now Button */}
        <TouchableOpacity
          onPress={()=> Linking.openURL(goFundMeUrl)}
          activeOpacity={0.85}
          style={{marginTop:verticalScale(20)}}
        >
          <LinearGradient
            colors={[palette[1],palette[2]]}
            start={{x:0,y:0}} end={{x:1,y:0}}
            style={styles.gradientButton}
          >
            <Text style={[styles.gradientButtonText,{ color: palette[3] }]}>
              Donate Now
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Info Section */}
        <LinearGradient
          colors={[palette[1],palette[2]]}
          start={{x:0,y:0}} end={{x:1,y:0}}
          style={styles.infoSection}
        >
          <Text style={[styles.infoTitle, { color: palette[3] }]}>
            Why We Need Your Help
          </Text>
          <Text style={[styles.infoText, { color: palette[3] }]}>
            We're raising funds to keep NexoLink as a nonprofit and to purchase subscriptions
            that will enhance the app’s features. Your support helps us improve volunteering
            accessibility and impact more lives.
          </Text>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1 },
  contentContainer:{
    flexGrow:1,
    padding:scale(20),
    alignItems:'center',
    justifyContent:'center',
  },
  logoContainer:{ marginBottom:verticalScale(20) },
  logo:{ width:scale(128), height:scale(128) },
  textContainer:{ alignItems:'center', marginBottom:verticalScale(15) },
  title:{
    fontSize:scale(28),
    fontWeight:'bold',
  },
  typingText:{
    fontSize:scale(20),
    marginTop:verticalScale(5),
  },
  gradientButton:{
    borderRadius:scale(10),
    paddingVertical:verticalScale(12),
    paddingHorizontal:scale(40),
    shadowColor:'#000',
    shadowOpacity:0.1,
    shadowRadius:scale(6),
    shadowOffset:{width:0,height:verticalScale(3)},
    elevation:6,
  },
  gradientButtonText:{
    fontSize:scale(18),
    fontWeight:'700',
    textAlign:'center',
  },
  infoSection:{
    marginTop:verticalScale(30),
    width:'100%',
    borderRadius:scale(12),
    paddingHorizontal:scale(20),
    paddingVertical:verticalScale(15),
    shadowColor:'#000',
    shadowOpacity:0.1,
    shadowRadius:scale(6),
    shadowOffset:{width:0,height:verticalScale(3)},
    elevation:4,
    alignItems:'center',
  },
  infoTitle:{
    fontSize:scale(20),
    fontWeight:'bold',
    marginBottom:verticalScale(10),
    textAlign:'center',
  },
  infoText:{
    fontSize:scale(16),
    textAlign:'center',
    lineHeight:verticalScale(22),
  },
});
