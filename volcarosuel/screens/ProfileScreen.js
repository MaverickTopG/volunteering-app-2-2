import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
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

// Firebase (Web SDK) + Firestore
import { db } from '../../auth/firebase';
import { collection, query, limit, getDocs, where } from 'firebase/firestore';

const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

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

// A small synonyms map for references
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
// VolunteerBox: Displays organization info as text boxes
// -------------------------------------
const VolunteerBox = ({ org }) => (
  <View style={styles.volunteerBox}>
    <Text style={styles.volunteerBoxTitle}>{org.name}</Text>
    {org.description && <Text style={styles.volunteerBoxDetail}>{org.description}</Text>}
    {org.address && <Text style={styles.volunteerBoxDetail}>Address: {org.address}</Text>}
    {org.website && <Text style={styles.volunteerBoxDetail}>Website: {org.website}</Text>}
  </View>
);

// -------------------------------------
// FallbackVolunteerSections: Renders fallback category buttons as a chat message
// -------------------------------------
const FallbackVolunteerSections = ({ onSelectCategory }) => (
  <View style={styles.fallbackContainer}>
    <Text style={styles.fallbackTitle}>No results found. Try these volunteer sections:</Text>
    <FlatList
      data={categories}
      horizontal
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.fallbackButton}
          onPress={() => onSelectCategory(item)}
        >
          <Ionicons name={item.icon} size={scale(20)} color="black" style={{ marginRight: scale(4) }} />
          <Text style={styles.fallbackButtonText}>{item.title}</Text>
        </TouchableOpacity>
      )}
    />
  </View>
);

// -------------------------------------
// AnimatedMessage: Renders a chat message with fade-in
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
// ChatSection: Renders the list of chat messages
// -------------------------------------
const ChatSection = memo(({ data, isLoading, flatListRef, inputFocused, onSelectFallbackCategory }) => {
  const renderItem = useCallback(
    ({ item }) => <AnimatedMessage item={item} onSelectFallbackCategory={onSelectFallbackCategory} />,
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
// IntroSection: The initial screen
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
// TypingIndicator: Animated dots
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
// ChatGPT (Main Component)
// -------------------------------------
const ChatGPT = () => {
  const textInputRef = useRef(null);
  const flatListRef = useRef(null);
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
  const [dbMode, setDbMode] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const morphAnim = useRef(new Animated.Value(0)).current;
  const revertTimerRef = useRef(null);

  // ChatGPT API keys (replace with your own)
  const apiKey = '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';
  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  const modelId = 'gpt-3.5-turbo';

  // Fetch volunteer organizations from Firestore
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

  // Handle fallback category selection (when no results found)
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

  // Handle sending a message
  const handleSend = async () => {
    const messageText = textInput.trim();
    if (!messageText) return;
    setIsLoading(true);
    const lowerMessage = messageText.toLowerCase();
    const messageId = generateUniqueId();

    // DB mode: query Firestore using message text as reference
    if (dbMode) {
      setData((prevData) => [
        ...prevData,
        { id: messageId, type: 'user', text: messageText },
      ]);
      setTextInput('');
      try {
        const organizations = await fetchVolunteerOrganizations(messageText);
        if (organizations.length === 0) {
          // Add fallback message as a chat message
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

    // Special queries
    if (
      lowerMessage.includes('what is nexolink') ||
      lowerMessage.includes('what is this app') ||
      (lowerMessage.includes('nexolink') && lowerMessage.includes('app')) ||
      lowerMessage.includes('about this app')
    ) {
      const nexolinkResponse =
        'Nexolink is a revolutionary platform designed to connect volunteers with opportunities in their communities. It streamlines the process of finding and engaging in meaningful volunteer work. How else can I assist you today?';
      setData((prevData) => [
        ...prevData,
        { id: messageId, type: 'user', text: messageText },
        { id: messageId + '-bot', type: 'bot', text: nexolinkResponse },
      ]);
      setTextInput('');
      setIsLoading(false);
      setError('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      return;
    }
    if (lowerMessage.includes('who are you')) {
      const ordixResponse = 'I am Ordix, a helpful AI assistant.';
      setData((prevData) => [
        ...prevData,
        { id: messageId, type: 'user', text: messageText },
        { id: messageId + '-bot', type: 'bot', text: ordixResponse },
      ]);
      setTextInput('');
      setIsLoading(false);
      setError('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
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
    // Fallback: use ChatGPT for any other queries
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

  // Handle Ask button press to open the search bar
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

  // When tapping outside the keyboard/textInput, dismiss the keyboard and revert search bar to Ask button
  const handleOutsidePress = () => {
    if (isSearchActive) {
      Keyboard.dismiss();
      setIsSearchActive(false);
      Animated.timing(morphAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  // MorphingSearchBar renders the Ask button when inactive and the active search bar when active.
  const MorphingSearchBar = () => {
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
    const containerBackgroundColor = morphAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['black', '#fff6e7'],
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
            style={[styles.askButton, { opacity: askTextOpacity }]}
            onPress={handleAskPress}
            activeOpacity={0.8}
          >
            <Text style={styles.askButtonText}>Ask</Text>
          </TouchableOpacity>
        )}
        {isSearchActive && (
          <Animated.View style={[styles.searchSection, { opacity: searchContentOpacity }]}>
            <TouchableOpacity
              style={styles.dbModeButton}
              onPress={() => setDbMode(!dbMode)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="server-outline"
                size={scale(22)}
                color={dbMode ? 'green' : 'black'}
              />
            </TouchableOpacity>
            <TextInput
              ref={textInputRef}
              style={styles.textInput}
              placeholder={dbMode ? 'Message Ordix with database mode' : 'Message Ordix'}
              placeholderTextColor="#aaa"
              value={textInput}
              autoFocus={true}
              blurOnSubmit={false}
              keyboardAppearance="dark"
              onChangeText={setTextInput}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Ionicons name="send-outline" size={scale(22)} color="black" />
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.contentContainer}
        >
          {data.length === 1 ? (
            <IntroSection />
          ) : (
            <ChatSection
              data={data}
              isLoading={isLoading}
              flatListRef={flatListRef}
              inputFocused={isSearchActive}
              onSelectFallbackCategory={handleFallbackCategorySelect}
            />
          )}
          {error ? (
            <Animated.View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}
        </KeyboardAvoidingView>
        <MorphingSearchBar />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default ChatGPT;

// -------------------------------------
// STYLES
// -------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7',
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
    color: '#333',
    marginBottom: verticalScale(6),
  },
  introSubtitle: {
    fontSize: scale(16),
    color: '#555',
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
    backgroundColor: '#fff6e7',
    borderRadius: scale(15),
    marginVertical: verticalScale(5),
    padding: scale(10),
    maxWidth: '70%',
    borderWidth: scale(1),
    borderColor: 'black',
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff6e7',
    borderRadius: scale(15),
    marginVertical: verticalScale(5),
    padding: scale(10),
    maxWidth: '70%',
  },
  messageText: {
    fontSize: scale(16),
    color: '#333',
  },
  typingIndicatorContainer: {
    flexDirection: 'row',
    paddingHorizontal: scale(10),
    paddingBottom: verticalScale(10),
  },
  typingDot: {
    fontSize: scale(24),
    color: '#333',
    marginHorizontal: scale(2),
  },
  errorContainer: {
    position: 'absolute',
    top: '25%',
    left: '10%',
    right: '10%',
    backgroundColor: '#fff6e7',
    borderRadius: scale(10),
    padding: scale(15),
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
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
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(4),
  },
  askButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: scale(14),
  },
  dbModeButton: {
    flexDirection: 'row',
    marginRight: scale(8),
    backgroundColor: '#fff6e7',
    padding: scale(8),
    borderRadius: scale(20),
    borderColor: 'black',
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
    backgroundColor: '#fff6e7',
    borderColor: 'black',
    borderWidth: scale(1),
    color: '#333',
    marginRight: scale(8),
  },
  sendButton: {
    backgroundColor: '#fff6e7',
    borderRadius: scale(20),
    padding: scale(10),
    borderColor: 'black',
    borderWidth: scale(1),
  },
  volunteerResourcesContainer: {
    backgroundColor: '#fff6e7',
    borderRadius: scale(15),
    padding: scale(10),
    marginVertical: verticalScale(5),
    maxWidth: '70%',
  },
  volunteerHeaderText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#333',
    marginBottom: verticalScale(5),
  },
  volunteerBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: scale(10),
    padding: scale(8),
    marginVertical: verticalScale(3),
    borderWidth: scale(1),
    borderColor: 'black',
  },
  volunteerBoxTitle: {
    fontSize: scale(14),
    fontWeight: '600',
    color: '#333',
  },
  volunteerBoxDetail: {
    fontSize: scale(12),
    color: '#555',
    marginTop: verticalScale(2),
  },
  noResultsText: {
    fontSize: scale(14),
    color: 'red',
  },
  fallbackContainer: {
    padding: scale(10),
    backgroundColor: '#fff6e7',
    borderRadius: scale(10),
    marginVertical: verticalScale(10),
    alignItems: 'center',
  },
  fallbackTitle: {
    fontSize: scale(14),
    fontWeight: '600',
    color: '#333',
    marginBottom: verticalScale(5),
  },
  fallbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff6e7',
    padding: scale(8),
    marginHorizontal: scale(4),
    borderRadius: scale(10),
    borderWidth: scale(1),
    borderColor: 'black',
  },
  fallbackButtonText: {
    fontSize: scale(14),
    color: '#333',
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: verticalScale(8),
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff6e7',
    padding: scale(8),
    marginRight: scale(8),
    borderRadius: scale(10),
    borderWidth: scale(1),
    borderColor: 'black',
  },
  categoryButtonSelected: {
    backgroundColor: '#e0e0e0',
  },
  categoryButtonText: {
    fontSize: scale(14),
    color: '#333',
  },
});
