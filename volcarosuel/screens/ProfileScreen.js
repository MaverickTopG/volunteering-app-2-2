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
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';

// Helper function to generate a unique id.
const generateUniqueId = () =>
  Date.now().toString() + Math.random().toString(36).substring(2, 9);

// Memoized animated message component.
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

// Memoized chat section component.
const ChatSection = memo(({ data, isLoading, flatListRef }) => {
  // Memoized renderItem function.
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
        contentContainerStyle={styles.flatListContent}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
        showsVerticalScrollIndicator={true}
      />
      {isLoading && <TypingIndicator />}
    </View>
  );
});

// Intro section remains as before.
const IntroSection = memo(() => {
  const introPhrases = [
    "How can I help you today?",
    "What volunteering opportunities interest you?",
    "Need assistance finding a volunteer project?",
    "Looking for ways to make an impact?",
  ];
  const PHRASE_ANIMATION_SPEED = 300;
  const [introPhrase, setIntroPhrase] = useState(introPhrases[0]);
  const introFadeAnim = useRef(new Animated.Value(1)).current;
  const tapToStartOpacity = useRef(new Animated.Value(1)).current;
  const [showTapToStart, setShowTapToStart] = useState(true);

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

  useEffect(() => {
    Animated.timing(tapToStartOpacity, {
      toValue: 0,
      duration: 2000,
      delay: 2000,
      useNativeDriver: true,
    }).start(() => setShowTapToStart(false));
  }, [tapToStartOpacity]);

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
      {showTapToStart && (
        <Animated.Text style={[styles.tapToStartText, { opacity: tapToStartOpacity }]}>
          Tap to start
        </Animated.Text>
      )}
    </View>
  );
});

// Typing indicator remains unchanged.
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

const ChatGPT = () => {
  const textInputRef = useRef(null);
  const flatListRef = useRef(null);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // NEW: Animated value for shifting the chat UI when the keyboard is active.
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      Animated.timing(keyboardOffset, {
        toValue: -e.endCoordinates.height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [keyboardOffset]);

  const initialMessage = {
    id: 'init',
    type: 'bot',
    text:
      "Welcome to Nexolink – your volunteering companion. How can I help you find meaningful volunteer opportunities today?",
  };

  // Chat data state.
  const [data, setData] = useState([initialMessage]);
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const apiKey = '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';
  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  const modelId = 'gpt-3.5-turbo';

  // ********* INPUT BAR POSITION ANIMATION *********
  const INITIAL_INPUT_OFFSET = 80;
  const FOCUSED_INPUT_OFFSET = -312;
  const [inputYOffset] = useState(new Animated.Value(INITIAL_INPUT_OFFSET));

  const handleInputFocus = () => {
    Animated.timing(inputYOffset, {
      toValue: FOCUSED_INPUT_OFFSET,
      duration: 260,
      useNativeDriver: true,
    }).start();
  };

  const handleInputBlur = () => {
    Animated.timing(inputYOffset, {
      toValue: INITIAL_INPUT_OFFSET,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };
  // ***********************************************

  const isChatEmpty = data.length === 1;

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false)
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Sends user input to either a custom response or the ChatGPT API.
  const handleSend = async () => {
    const messageText = textInput.trim();
    if (!messageText) return;

    setIsLoading(true);
    const lowerMessage = messageText.toLowerCase();
    const messageId = generateUniqueId();

    // Custom responses for predefined questions.
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

    // Add the user's message to the chat.
    setData((prevData) => [...prevData, { id: messageId, type: 'user', text: messageText }]);
    setTextInput('');

    try {
      // Include a system instruction to restrict answers to volunteering topics.
      const systemInstruction =
        "You are a helpful AI volunteer assistant. Only answer questions related to volunteering. If the user asks anything unrelated to volunteering, respond with: 'I'm sorry, I only answer questions about volunteering.'";
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

  // Allow tapping the content area to dismiss or focus the input.
  const handleContentPress = () => {
    if (keyboardVisible) {
      Keyboard.dismiss();
    } else if (textInputRef.current) {
      textInputRef.current.focus();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={handleContentPress}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.contentContainer}
        >
          {/* Wrap the chat UI (or intro section) in an Animated.View for keyboard offset */}
          <Animated.View style={{ flex: 1, transform: [{ translateY: keyboardOffset }] }}>
            {isChatEmpty ? (
              <IntroSection />
            ) : (
              <ChatSection data={data} isLoading={isLoading} flatListRef={flatListRef} />
            )}
          </Animated.View>
          {error ? (
            <Animated.View style={[styles.errorContainer, { opacity: fadeAnim }]}>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      <Animated.View style={[styles.inputBar, { transform: [{ translateY: inputYOffset }] }]}>
        <TextInput
          ref={textInputRef}
          style={styles.textInput}
          placeholder="Message Ordix"
          placeholderTextColor="#aaa"
          value={textInput}
          keyboardAppearance="dark"
          onChangeText={setTextInput}
          onSubmitEditing={handleSend}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          blurOnSubmit={false}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Ionicons name="send-outline" size={22} color="black" />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

export default ChatGPT;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff6e7' },
  contentContainer: { flex: 1 },
  centerIntroContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoStyle: { width: 80, height: 80, marginBottom: 20 },
  introTitle: { fontSize: 22, fontWeight: '600', color: '#333', marginBottom: 6 },
  introSubtitle: { fontSize: 16, color: '#555' },
  tapToStartText: { fontSize: 14, color: '#333', marginTop: 10 },
  chatContainer: { flex: 1 },
  flatListContent: { paddingTop: 10, paddingHorizontal: 10, paddingBottom: 80 },
  userMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#fff6e7',
    borderRadius: 15,
    marginVertical: 5,
    padding: 10,
    maxWidth: '70%',
    borderBottomColor: 'black',
    borderWidth: 1,
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff6e7',
    borderRadius: 15,
    marginVertical: 5,
    padding: 10,
    maxWidth: '70%',
  },
  messageText: { fontSize: 16, color: '#333' },
  typingIndicatorContainer: { flexDirection: 'row', paddingHorizontal: 10, paddingBottom: 10 },
  typingDot: { fontSize: 24, color: '#333', marginHorizontal: 2 },
  errorContainer: { position: 'absolute', top: '25%', left: '10%', right: '10%', backgroundColor: '#ff3333', borderRadius: 10, padding: 15, alignItems: 'center' },
  errorText: { color: '#fff', fontSize: 16 },
  inputBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff6e7', paddingHorizontal: 10, paddingVertical: 8, borderTopColor: '#fff6e7', borderTopWidth: 1 },
  textInput: { flex: 1, backgroundColor: '#fff6e7', height: 40, borderRadius: 20, paddingHorizontal: 15, fontSize: 16, color: '#333', marginRight: 8, borderColor: 'black', borderWidth: 1 },
  sendButton: { backgroundColor: '#fff6e7', borderRadius: 20, padding: 10, borderColor: 'black', borderWidth: 1 },
});
