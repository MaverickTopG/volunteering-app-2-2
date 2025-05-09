import React, { useState, useEffect, useRef, memo, useCallback,useContext} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  SafeAreaView,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themePacks, seasonal } from '../screens/shop';  // adjust path
import { AuthContext } from '../../auth/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
// Firebase (Web SDK) + Firestore
import { db } from '../../auth/firebase';
import { collection, query, limit, getDocs, where } from 'firebase/firestore';

const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

const DEFAULT_PALETTE = ['#FFF6E7', '#FFF0D4', '#FFF6E7', '#000'];


// Categories for fallback volunteer sections
const categories = [
  { id: '1', title: 'Animals', icon: 'paw-outline', reference: 'Animal' },
  { id: '2', title: 'Arts', icon: 'color-palette-outline', reference: 'Arts' },
  { id: '4', title: 'Family', icon: 'people-circle-outline', reference: 'Family' },
  { id: '5', title: 'Tech', icon: 'laptop-outline', reference: 'Tech' },
  { id: '6', title: 'Education', icon: 'school-outline', reference: 'Education' },
  { id: '7', title: 'Environs', icon: 'leaf-outline', reference: 'Environment' },
  { id: '8', title: 'Hospital', icon: 'medkit-outline', reference: 'Hospital' },
  { id: '9', title: 'Library', icon: 'book-outline', reference: 'Library' },
  { id: '11', title: 'Seniors', icon: 'walk-outline', reference: 'Seniors' },
];

// A small synonyms map for references (to improve matching)
const synonymsMap = {
  tech: 'Tech',
  technology: 'Tech',
  animal: 'Animal',
  animals: 'Animal',
  family: 'Family',
  education: 'Education',
  school: 'Education',
  environ: 'Environment',
  environment: 'Environment',
  hospital: 'Hospital',
  library: 'Library',
  seniors: 'Seniors',
  elder: 'Seniors',
};

// Normalize user input to a Firestore reference
const normalizeReference = (rawRef) => {
  if (!rawRef) return null;
  const lower = rawRef.toLowerCase();
  if (synonymsMap[lower]) {
    return synonymsMap[lower];
  }
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

// Generate a unique ID for messages
const generateUniqueId = () =>
  Date.now().toString() + Math.random().toString(36).substring(2, 9);

// -------------------------------------
// VolunteerBox: Display organization info as non-clickable text
// -------------------------------------


// -------------------------------------
// ChatGPT (Main Component)
// -------------------------------------
const ChatGPT = () => {
  const textInputRef = useRef(null);
  const flatListRef = useRef(null);
  const morphAnim = useRef(new Animated.Value(0)).current;
  const revertTimerRef = useRef(null);


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
const VolunteerBox = ({ org }) => (
  <View style={styles.volunteerBox}>
    <Text style={styles.volunteerBoxTitle}>{org.name}</Text>
    {org.description && <Text style={styles.volunteerBoxDetail}>{org.description}</Text>}
    {org.address && <Text style={styles.volunteerBoxDetail}>Address: {org.address}</Text>}
    {org.website && <Text style={styles.volunteerBoxDetail}>Website: {org.website}</Text>}
  </View>
);

// -------------------------------------
// FallbackVolunteerSections: Fallback buttons in a chat message
// -------------------------------------
const FallbackVolunteerSections = ({ onSelectCategory }) => (
  <View style={styles.fallbackContainer}>
    <Text style={styles.fallbackTitle}>
      No results found. Try these volunteer sections:
    </Text>
    <FlatList
      data={categories}
      horizontal
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.fallbackButton} onPress={() => onSelectCategory(item)}>
          <Ionicons
            name={item.icon}
            size={scale(20)}
            color="black"
            style={{ marginRight: scale(4) }}
          />
          <Text style={styles.fallbackButtonText}>{item.title}</Text>
        </TouchableOpacity>
      )}
    />
  </View>
);

// -------------------------------------
// AnimatedMessage: Renders a chat message with animation
// -------------------------------------
const AnimatedMessage = memo(({ item, onSelectFallbackCategory }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  if (item.type === 'volunteerResources') {
    return (
      <Animated.View style={[{ opacity: fadeAnim }, styles.volunteerResourcesContainer]}>
        <Text style={styles.volunteerHeaderText}>
          {item.categoryTitle
            ? `Top ${item.categoryTitle} Organizations:`
            : 'Top Volunteering Organizations:'}
        </Text>
        {item.organizations.length > 0 ? (
          item.organizations.map((org) => <VolunteerBox key={org.id} org={org} />)
        ) : (
          <Text style={styles.noResultsText}>No organizations found for this category.</Text>
        )}
      </Animated.View>
    );
  }

  if (item.type === 'fallbackVolunteerSections') {
    return (
      <Animated.View style={[{ opacity: fadeAnim }, styles.volunteerResourcesContainer]}>
        <FallbackVolunteerSections onSelectCategory={onSelectFallbackCategory} />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View style={item.type === 'user' ? styles.userMessageContainer : styles.botMessageContainer}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    </Animated.View>
  );
});

// -------------------------------------
// ChatSection
// -------------------------------------
const ChatSection = memo(({ data, isLoading, flatListRef, inputFocused, onSelectFallbackCategory }) => {
  const renderItem = useCallback(
    ({ item }) => (
      <AnimatedMessage key={item.id} item={item} onSelectFallbackCategory={onSelectFallbackCategory} />
    ),
    [onSelectFallbackCategory]
  );
  return (
    <View style={[styles.chatContainer, inputFocused && { paddingBottom: verticalScale(150) }]}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatListContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
      {isLoading && <TypingIndicator />}
    </View>
  );
});

// -------------------------------------
// IntroSection
// -------------------------------------
const IntroSection = memo(() => {
  const introPhrases = [
    'How can I help you today?',
    'What volunteering opportunities interest you?',
    'Need assistance finding a volunteer project?',
    'Looking for ways to make an impact?',
  ];
  const PHRASE_ANIMATION_SPEED = 300;
  const [introPhrase, setIntroPhrase] = useState(introPhrases[0]);
  const introFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(introFadeAnim, {
        toValue: 0,
        duration: PHRASE_ANIMATION_SPEED,
        useNativeDriver: true,
      }).start(() => {
        setIntroPhrase((prev) => {
          const currentIndex = introPhrases.indexOf(prev);
          const nextIndex = (currentIndex + 1) % introPhrases.length;
          return introPhrases[nextIndex];
        });
        Animated.timing(introFadeAnim, {
          toValue: 1,
          duration: PHRASE_ANIMATION_SPEED,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [introFadeAnim]);

  return (
    <View style={styles.centerIntroContainer}>
      <Image
        source={require('../../assets/spaceship.png')}
        style={styles.logoStyle}
        resizeMode="contain"
      />
      <Text style={styles.introTitle}>Hi, I'm Ordix.</Text>
      <Animated.Text style={[styles.introSubtitle, { opacity: introFadeAnim }]}>
        {introPhrase}
      </Animated.Text>
    </View>
  );
});

// -------------------------------------
// TypingIndicator
// -------------------------------------
const TypingIndicator = () => {
  const dot1Opacity = useRef(new Animated.Value(0)).current;
  const dot2Opacity = useRef(new Animated.Value(0)).current;
  const dot3Opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(dot1Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot2Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot3Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(300),
        Animated.parallel([
          Animated.timing(dot1Opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2Opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3Opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
        Animated.delay(300),
      ]).start(animate);
    };
    animate();
  }, []);
  return (
    <View style={styles.typingIndicatorContainer}>
      <Animated.Text style={[styles.typingDot, { opacity: dot1Opacity }]}>•</Animated.Text>
      <Animated.Text style={[styles.typingDot, { opacity: dot2Opacity }]}>•</Animated.Text>
      <Animated.Text style={[styles.typingDot, { opacity: dot3Opacity }]}>•</Animated.Text>
    </View>
  );
};

// -------------------------------------
// MorphingSearchBar Component (memoized)
// -------------------------------------
const MorphingSearchBar = memo(({ isSearchActive, setIsSearchActive, dbMode, setDbMode, textInput, setTextInput, handleSend, handleAskPress, morphAnim, textInputRef }) => {
  const initialWidth = scale(60);
  const finalWidth = width - scale(20);
  const containerWidth = morphAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [initialWidth, finalWidth],
  });
  const containerBorderRadius = morphAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [scale(30), scale(10)],
  });
  // Restore previous Ask button color using black as background.
  const containerBackgroundColor = morphAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ffe8c9', '#fff6e7'],
  });
  const askTextOpacity = morphAnim.interpolate({
    inputRange: [0, 0.5],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const searchContentOpacity = morphAnim.interpolate({
    inputRange: [0.5, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.morphContainer,
        {
          width: containerWidth,
          borderRadius: containerBorderRadius,
          backgroundColor: containerBackgroundColor,
        },
      ]}
    >
      {!isSearchActive && (
        <TouchableOpacity
          onPress={handleAskPress}
          activeOpacity={0.8}
          style={{ opacity: askTextOpacity, ...styles.askButton }}
        >
          <Text style={styles.askButtonText}>Ask</Text>
        </TouchableOpacity>
      )}
      <Animated.View style={[styles.searchSection, { opacity: searchContentOpacity }]}>
        {isSearchActive && (
          <>
            <TouchableOpacity
              style={styles.dbModeButton}
              onPress={() => setDbMode(!dbMode)}
              activeOpacity={0.8}
            >
              <Ionicons name="server-outline" size={scale(22)} color={dbMode ? 'green' : 'black'} />
            </TouchableOpacity>
            <TextInput
              ref={textInputRef}
              style={styles.textInput}
              placeholder={dbMode ? 'Message Ordix with database mode' : 'Message Ordix'}
              placeholderTextColor="#aaa"
              value={textInput}
              keyboardAppearance="dark"
              // Do not use autoFocus—focus is handled manually.
              onChangeText={setTextInput}
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.sendButton} onPress={() => {
              handleSend();
              // After sending, immediately re-focus the input.
              setTimeout(() => textInputRef.current?.focus(), 100);
            }}>
              <Ionicons name="send-outline" size={scale(22)} color="black" />
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </Animated.View>
  );
});

  const [data, setData] = useState([
    {
      id: 'init',
      type: 'bot',
      text:
        'Welcome to Nexolink – your volunteering companion. How can I help you find meaningful volunteer opportunities today?',
    },
  ]);
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [dbMode, setDbMode] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  // ChatGPT API keys (replace with your own key)
  const apiKey = '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'; // shortened for brevity
  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  const modelId = 'gpt-3.5-turbo';

  // -------------------------------------------------
  // fetchVolunteerOrganizations with optional reference
  // -------------------------------------------------
  const fetchVolunteerOrganizations = async (rawReference) => {
    try {
      const finalRef = normalizeReference(rawReference);
      let q = query(collection(db, 'volunteer_organizations'), limit(10));
      if (finalRef) {
        q = query(
          collection(db, 'volunteer_organizations'),
          where('reference', '==', finalRef),
          limit(10)
        );
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching organizations:', error);
      return [];
    }
  };

  // -------------------------------------
  // handleFallbackCategorySelect: user clicks a fallback category button
  // -------------------------------------
  const handleFallbackCategorySelect = async (category) => {
    setIsLoading(true);
    const messageId = generateUniqueId();
    setData((prevData) => [
      ...prevData,
      { id: messageId, type: 'user', text: `Show me ${category.title} organizations` },
    ]);
    try {
      const organizations = await fetchVolunteerOrganizations(category.reference);
      setData((prevData) => [
        ...prevData.filter((msg) => msg.type !== 'fallbackVolunteerSections'),
        {
          id: messageId + '-vol',
          type: 'volunteerResources',
          organizations,
          categoryTitle: category.title,
        },
      ]);
      setShowFallback(false);
      setError('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      setError('Failed to load volunteering organizations for this category.');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------
  // handleSend: process message and decide flow (DB mode, volunteer query, or ChatGPT)
  // -------------------------------------
  const handleSend = async () => {
    const messageText = textInput.trim();
    if (!messageText) return;

    if (revertTimerRef.current) {
      clearTimeout(revertTimerRef.current);
      revertTimerRef.current = null;
    }

    setIsLoading(true);
    const lowerMessage = messageText.toLowerCase();
    const messageId = generateUniqueId();

    // DB mode: query Firestore using the message text as reference
    if (dbMode) {
      setData((prevData) => [
        ...prevData,
        { id: messageId, type: 'user', text: messageText },
      ]);
      setTextInput('');
      try {
        const organizations = await fetchVolunteerOrganizations(messageText);
        if (organizations.length === 0) {
          setData((prevData) => [
            ...prevData,
            { id: messageId + '-fb', type: 'fallbackVolunteerSections' },
          ]);
        } else {
          setData((prevData) => [
            ...prevData,
            { id: messageId + '-vol', type: 'volunteerResources', organizations },
          ]);
        }
        setError('');
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      } catch (err) {
        setError('Failed to load volunteering organizations from DB mode.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Check if query is about volunteering organizations
    if (
      lowerMessage.includes('volunteering organizations') ||
      lowerMessage.includes('volunteer opportunities') ||
      lowerMessage.includes('good volunteering org')
    ) {
      let reference = null;
      const forIndex = lowerMessage.indexOf('for ');
      if (forIndex !== -1) {
        reference = messageText.substring(forIndex + 4).trim();
      }
      setData((prevData) => [
        ...prevData,
        { id: messageId, type: 'user', text: messageText },
      ]);
      setTextInput('');
      try {
        const organizations = await fetchVolunteerOrganizations(reference);
        if (organizations.length === 0) {
          setData((prevData) => [
            ...prevData,
            { id: messageId + '-fb', type: 'fallbackVolunteerSections' },
          ]);
        } else {
          setData((prevData) => [
            ...prevData,
            { id: messageId + '-vol', type: 'volunteerResources', organizations },
          ]);
        }
        setError('');
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      } catch (err) {
        setError('Failed to load volunteering organizations.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Fallback to ChatGPT for other queries
    setData((prevData) => [
      ...prevData,
      { id: messageId, type: 'user', text: messageText },
    ]);
    setTextInput('');
    try {
      const systemInstruction = 'You are a helpful AI volunteer assistant.';
      const response = await axios.post(
        apiUrl,
        {
          model: modelId,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: messageText },
          ],
          max_tokens: 1024,
          temperature: 0.5,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      const botReply = response.data.choices[0].message.content;
      setData((prevData) => [
        ...prevData,
        { id: messageId + '-bot', type: 'bot', text: botReply },
      ]);
      setError('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.error('Error:', err);
      if (err.response && err.response.data) {
        setError(`An error occurred: ${err.response.data.error.message}`);
      } else {
        setError('An error occurred while fetching response. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------
  // handleAskPress: expand the search bar and focus the input
  // -------------------------------------
  const handleAskPress = () => {
    Animated.timing(morphAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setIsSearchActive(true);
      textInputRef.current?.focus();
    });
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette[0],               // was '#fff6e7'
    },
    contentContainer: {
      flex: 1,
    },
    centerIntroContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoStyle: {
      width: scale(80),
      height: scale(80),
      marginBottom: verticalScale(20),
    },
    introTitle: {
      fontSize: scale(22),
      fontWeight: '600',
      color: palette[3],                         // was '#333'
      marginBottom: verticalScale(6),
    },
    introSubtitle: {
      fontSize: scale(16),
      color: palette[3],                         // was '#555'
    },
    chatContainer: {
      flex: 1,
    },
    flatListContent: {
      paddingTop: verticalScale(10),
      paddingHorizontal: scale(10),
      paddingBottom: verticalScale(80),
      flexGrow: 1,
      minHeight: '100%',
    },
    userMessageContainer: {
      alignSelf: 'flex-end',
      backgroundColor: palette[0],               // bubble bg same as screen bg
      borderRadius: scale(15),
      marginVertical: verticalScale(5),
      padding: scale(10),
      maxWidth: '70%',
      borderWidth: scale(1),
      borderColor: palette[3],                   // text/icon color
    },
    botMessageContainer: {
      alignSelf: 'flex-start',
      backgroundColor: palette[0],
      borderRadius: scale(15),
      marginVertical: verticalScale(5),
      padding: scale(10),
      maxWidth: '70%',
    },
    messageText: {
      fontSize: scale(16),
      color: palette[3],                         // text color
    },
    typingIndicatorContainer: {
      flexDirection: 'row',
      paddingHorizontal: scale(10),
      paddingBottom: verticalScale(10),
    },
    typingDot: {
      fontSize: scale(24),
      color: palette[3],
      marginHorizontal: scale(2),
    },
    errorContainer: {
      position: 'absolute',
      top: '25%',
      left: '10%',
      right: '10%',
      backgroundColor: palette[0],
      borderRadius: scale(10),
      padding: scale(15),
      alignItems: 'center',
    },
    errorText: {
      color: palette[3],
      fontSize: scale(16),
    },
    morphContainer: {
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(8),
      alignSelf: 'center',
      marginBottom: verticalScale(20),
      flexDirection: 'row',
      alignItems: 'center',
      bottom: '35%',
    },
    askButton: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: palette[4],               // was '#ffe8c9'
      paddingHorizontal: scale(6),
      paddingVertical: verticalScale(4),
      borderRadius: scale(30),
    },
    askButtonText: {
      textAlign: 'center',
      color: palette[3],
      fontSize: scale(14),
    },
    dbModeButton: {
      flexDirection: 'row',
      marginRight: scale(8),
      backgroundColor: palette[0],
      padding: scale(8),
      borderRadius: scale(20),
      borderColor: palette[3],
      borderWidth: scale(1),
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    textInput: {
      flex: 1,
      height: verticalScale(40),
      borderRadius: scale(20),
      paddingHorizontal: scale(15),
      fontSize: scale(16),
      backgroundColor: palette[0],
      borderColor: palette[3],
      borderWidth: scale(1),
      color: palette[3],
      marginRight: scale(8),
    },
    sendButton: {
      backgroundColor: palette[0],
      borderRadius: scale(20),
      padding: scale(10),
      borderColor: palette[3],
      borderWidth: scale(1),
    },
    volunteerResourcesContainer: {
      backgroundColor: palette[0],
      borderRadius: scale(15),
      padding: scale(10),
      marginVertical: verticalScale(5),
      maxWidth: '70%',
    },
    volunteerHeaderText: {
      fontSize: scale(16),
      fontWeight: '600',
      color: palette[3],
      marginBottom: verticalScale(5),
    },
    volunteerBox: {
      backgroundColor: palette[0],
      borderRadius: scale(10),
      padding: scale(8),
      marginVertical: verticalScale(3),
      borderWidth: scale(1),
      borderColor: palette[3],
    },
    volunteerBoxTitle: {
      fontSize: scale(14),
      fontWeight: '600',
      color: palette[3],
    },
    volunteerBoxDetail: {
      fontSize: scale(12),
      color: palette[3],
      marginTop: verticalScale(2),
    },
    noResultsText: {
      fontSize: scale(14),
      color: 'red',
    },
    fallbackContainer: {
      padding: scale(10),
      backgroundColor: palette[0],
      borderRadius: scale(10),
      marginVertical: verticalScale(10),
      alignItems: 'center',
    },
    fallbackTitle: {
      fontSize: scale(14),
      fontWeight: '600',
      color: palette[3],
      marginBottom: verticalScale(5),
    },
    fallbackButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette[0],
      padding: scale(8),
      marginHorizontal: scale(4),
      borderRadius: scale(10),
      borderWidth: scale(1),
      borderColor: palette[3],
    },
    fallbackButtonText: {
      fontSize: scale(14),
      color: palette[3],
    },
    categoryContainer: {
      flexDirection: 'row',
      marginBottom: verticalScale(8),
    },
    categoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette[0],
      padding: scale(8),
      marginRight: scale(8),
      borderRadius: scale(10),
      borderWidth: scale(1),
      borderColor: palette[3],
    },
    categoryButtonSelected: {
      backgroundColor: palette[2],
    },
    categoryButtonText: {
      fontSize: scale(14),
      color: palette[3],
    },
    staticSearchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: scale(10),
      borderBottomWidth: 1,
      borderColor: '#ccc',
      backgroundColor: palette[0],
    },
    staticDbButton: {
      marginRight: scale(8),
      padding: scale(6),
    },
    staticTextInput: {
      flex: 1,
      height: verticalScale(40),
      borderRadius: scale(20),
      paddingHorizontal: scale(15),
      borderWidth: 1,
      borderColor: palette[3],
      backgroundColor: palette[0],
      color: palette[3],
    },
    staticSendButton: {
      marginLeft: scale(8),
      padding: scale(6),
    },
    
  });
  

  return (
    <SafeAreaView style={styles.container}>
      {/* Static search bar at top */}
      <View style={styles.staticSearchBar}>
        {/* DB mode toggle */}
        <TouchableOpacity
          style={styles.staticDbButton}
          onPress={() => setDbMode(!dbMode)}
        >
          <Ionicons
            name="server-outline"
            size={scale(22)}
            color={dbMode ? 'green' : palette[3]}
          />
        </TouchableOpacity>
  
        {/* Text input */}
        <TextInput
          ref={textInputRef}
          style={styles.staticTextInput}
          placeholder={dbMode ? 'DB-mode: enter a category' : 'Message Ordix'}
          placeholderTextColor="#aaa"
          value={textInput}
          onChangeText={setTextInput}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
  
        {/* Send button */}
        <TouchableOpacity
          style={styles.staticSendButton}
          onPress={handleSend}
        >
          <Ionicons name="send-outline" size={scale(22)} color={palette[3]} />
        </TouchableOpacity>
      </View>
  
      {/* Chat area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.contentContainer}
      >
        {data.length === 1
          ? <IntroSection />
          : (
            <ChatSection
              data={data}
              isLoading={isLoading}
              flatListRef={flatListRef}
              inputFocused={inputFocused}
              onSelectFallbackCategory={handleFallbackCategorySelect}
            />
          )
        }
  
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
  
  
};

export default ChatGPT;

// -------------------------------------
// STYLES
// -------------------------------------
// inside ChatGPT(), after you’ve loaded palette from AsyncStorage:
