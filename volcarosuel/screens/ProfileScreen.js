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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';

// Define baseline dimensions (e.g. iPhone 16 Pro Max)
const guidelineBaseWidth = 428;
const guidelineBaseHeight = 926;
const { width, height } = Dimensions.get('window');
const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

// Helper function to generate a unique ID
const generateUniqueId = () =>
  Date.now().toString() + Math.random().toString(36).substring(2, 9);

// Create an animated version of TouchableOpacity
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// -- AnimatedMessage --
const AnimatedMessage = memo(({ item }) => {
  const fadeAnimMessage = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnimMessage, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnimMessage]);

  return (
    <Animated.View style={{ opacity: fadeAnimMessage }}>
      <View
        style={
          item.type === 'user'
            ? styles.userMessageContainer
            : styles.botMessageContainer
        }
      >
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    </Animated.View>
  );
});

// -- ChatSection --
const ChatSection = memo(({ data, isLoading, flatListRef }) => {
  const renderItem = useCallback(
    ({ item }) => <AnimatedMessage key={item.id} item={item} />,
    []
  );

  return (
    <View style={styles.chatContainer}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={styles.flatListContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
      />
      {isLoading && <TypingIndicator />}
    </View>
  );
});

// -- IntroSection --
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

// -- TypingIndicator --
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

// -- ChatGPT (Main) --
const ChatGPT = () => {
  const textInputRef = useRef(null);
  const flatListRef = useRef(null);
  const [fadeAnim] = useState(new Animated.Value(1));
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

  const morphAnim = useRef(new Animated.Value(0)).current;
  const revertTimerRef = useRef(null);

  const apiKey = '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';
  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  const modelId = 'gpt-3.5-turbo';

  // -- Handle sending the user's message
  const handleSend = async () => {
    const messageText = textInput.trim();
    if (!messageText) return;

    // If user typed something, cancel the revert timer
    if (revertTimerRef.current) {
      clearTimeout(revertTimerRef.current);
      revertTimerRef.current = null;
    }

    setIsLoading(true);
    const lowerMessage = messageText.toLowerCase();
    const messageId = generateUniqueId();

    // Quick custom responses
    if (
      lowerMessage.includes('what is nexolink') ||
      lowerMessage.includes('what is this app') ||
      (lowerMessage.includes('nexolink') && lowerMessage.includes('app')) ||
      lowerMessage.includes('about this app')
    ) {
      const nexolinkResponse =
        'Nexolink is a revolutionary platform designed to connect volunteers with opportunities in their communities. It streamlines the process of finding and engaging in meaningful volunteer work, empowering you to make a positive impact. How else can I assist you today?';
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

    // Otherwise, send to ChatGPT
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
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 0,
        useNativeDriver: false,
      }).start(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          delay: 3000,
          useNativeDriver: false,
        }).start();
      });
    } finally {
      setIsLoading(false);
    }
  };

  // -- Handle "Ask" button press
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

  // -- Revert to the small Ask button if user doesn't type anything for 5s on the first query
  useEffect(() => {
    if (isSearchActive && data.length === 1 && textInput.trim() === '') {
      revertTimerRef.current = setTimeout(() => {
        Animated.timing(morphAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start(() => {
          setIsSearchActive(false);
        });
      }, 5000);
    }
    return () => {
      if (revertTimerRef.current) {
        clearTimeout(revertTimerRef.current);
        revertTimerRef.current = null;
      }
    };
  }, [isSearchActive, data.length, textInput]);

  // -- MorphingSearchBar
  const MorphingSearchBar = () => {
    // Very small initial width, so the button just fits "Ask" text
    const initialWidth = scale(60);
    // Expand to near full screen
    const finalWidth = width - scale(20);

    const containerWidth = morphAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [initialWidth, finalWidth],
    });
    // From round to slightly rounded
    const containerBorderRadius = morphAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [scale(30), scale(10)],
    });
    // From black to light background
    const containerBackgroundColor = morphAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['black', '#fff6e7'],
    });
    // Fade out "Ask" text from 0 to 0.5
    const askTextOpacity = morphAnim.interpolate({
      inputRange: [0, 0.5],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });
    // Fade in text input from 0.5 to 1
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
          <AnimatedTouchableOpacity
            style={[styles.askButton, { opacity: askTextOpacity }]}
            onPress={handleAskPress}
            activeOpacity={0.8}
          >
            <Text style={styles.askButtonText}>Ask</Text>
          </AnimatedTouchableOpacity>
        )}

        {/* Search content is invisible until morph is halfway done */}
        <Animated.View style={[styles.searchSection, { opacity: searchContentOpacity }]}>
          {isSearchActive && (
            <>
              <TextInput
                ref={textInputRef}
                style={styles.textInput}
                placeholder="Message Ordix"
                placeholderTextColor="#aaa"
                value={textInput}
                keyboardAppearance="dark"
                onChangeText={setTextInput}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                <Ionicons name="send-outline" size={scale(22)} color="black" />
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.contentContainer}
      >
        {data.length === 1 ? (
          <IntroSection />
        ) : (
          <ChatSection data={data} isLoading={isLoading} flatListRef={flatListRef} />
        )}
        {error ? (
          <Animated.View style={[styles.errorContainer, { opacity: fadeAnim }]}>
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        ) : null}
      </KeyboardAvoidingView>
      <MorphingSearchBar />
    </SafeAreaView>
  );
};

export default ChatGPT;

// -- STYLES --
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
    borderBottomColor: 'black',
    borderWidth: scale(1),
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
    backgroundColor: '#ff3333',
    borderRadius: scale(10),
    padding: scale(15),
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: scale(16),
  },
  // Morphing container
  morphContainer: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(8),
    alignSelf: 'center',
    marginBottom: verticalScale(20),
    flexDirection: 'row',
    alignItems: 'center',
    bottom:'35%'
  },
  // Ask button
  askButton: {
    // No flex:1 so it stays small
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(4),
  },
  askButtonText: {
    textAlign: 'center',
    color: '#fff',
    // Smaller font so the button is "way smaller"
    fontSize: scale(14),
  },
  // The container for the TextInput and Send button
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    // We'll let the container expand once isSearchActive is true
    flex: 1,
  },
  // Text input styling
  textInput: {
    flex: 1,
    height: verticalScale(40),
    borderRadius: scale(20),
    paddingHorizontal: scale(15),
    fontSize: scale(16),
    color: '#333',
    marginRight: scale(8),
    backgroundColor: '#fff6e7',
    borderColor: 'black',
    borderWidth: scale(1),
  },
  // Send button styling
  sendButton: {
    backgroundColor: '#fff6e7',
    borderRadius: scale(20),
    padding: scale(10),
    borderColor: 'black',
    borderWidth: scale(1),
  },
});
