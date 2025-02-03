import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Alert,
  SafeAreaView,
  Animated,
  Modal,
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

const ChatGPT = () => {
  // Reference to the TextInput to focus programmatically.
  const textInputRef = useRef(null);
  const flatListRef = useRef(null);

  // Animated value for error fade.
  const [fadeAnim] = useState(new Animated.Value(1));

  // Track keyboard visibility.
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Initial welcome message.
  const initialMessage = {
    type: 'bot',
    text:
      "Welcome to Nexolink – your volunteering companion. How can I help you find meaningful volunteer opportunities today?",
  };

  const [data, setData] = useState([initialMessage]);
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Hard-coded API key (for demonstration only).
  const apiKey = 'YOUR_API_KEY_HERE';
  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  const modelId = 'gpt-3.5-turbo';

  // ********* INPUT BAR POSITION ANIMATION *********
  // Adjust these values to control the vertical position of the input bar.
  const INITIAL_INPUT_OFFSET = 80; // Input bar lower when not focused.
  const FOCUSED_INPUT_OFFSET = -312; // Input bar higher when focused.
  const [inputYOffset] = useState(new Animated.Value(INITIAL_INPUT_OFFSET));

  // Handlers for input focus and blur to animate the input bar's position.
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

  // ********* INTRO PHRASE ANIMATION *********
  // Intro phrases for the animated subtitle.
  const introPhrases = [
    "How can I help you today?",
    "What volunteering opportunities interest you?",
    "Need assistance finding a volunteer project?",
    "Looking for ways to make an impact?",
  ];
  // Speed of the phrase fade animation (in milliseconds) - adjust as needed.
  const PHRASE_ANIMATION_SPEED = 300;

  const [introPhrase, setIntroPhrase] = useState(introPhrases[0]);
  const introFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out the current phrase.
      Animated.timing(introFadeAnim, {
        toValue: 0,
        duration: PHRASE_ANIMATION_SPEED,
        useNativeDriver: true,
      }).start(() => {
        // Update to the next phrase.
        setIntroPhrase((prev) => {
          const currentIndex = introPhrases.indexOf(prev);
          const nextIndex = (currentIndex + 1) % introPhrases.length;
          return introPhrases[nextIndex];
        });
        // Fade in the new phrase.
        Animated.timing(introFadeAnim, {
          toValue: 1,
          duration: PHRASE_ANIMATION_SPEED,
          useNativeDriver: true,
        }).start();
      });
    }, 3000); // Change phrase every 3 seconds.
    return () => clearInterval(interval);
  }, []);
  // ***********************************************

  // Listen for keyboard events to update our keyboardVisible state.
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Typing indicator with animated dots.
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

  // Animated message bubble for fade-in effect.
  const AnimatedMessage = ({ item }) => {
    const fadeAnimMessage = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(fadeAnimMessage, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, []);

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
  };

  // Sends user input to either a custom response or the ChatGPT API.
  const handleSend = async () => {
    const message = textInput.trim();
    if (!message) return;

    setIsLoading(true);
    const lowerMessage = message.toLowerCase();

    // Custom response for "Nexolink" queries.
    if (
      lowerMessage.includes('what is nexolink') ||
      (lowerMessage.includes('nexolink') && lowerMessage.includes('app')) ||
      lowerMessage.includes('about this app')
    ) {
      const nexolinkResponse =
        'Nexolink is a revolutionary platform designed to connect volunteers with opportunities in their communities. It streamlines the process of finding and engaging in meaningful volunteer work, empowering you to make a positive impact. How else can I assist you today?';
      setData((prevData) => [
        ...prevData,
        { type: 'user', text: message },
        { type: 'bot', text: nexolinkResponse },
      ]);
      setTextInput('');
      setIsLoading(false);
      setError('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      return;
    }

    // Custom response for "who are you" queries.
    if (lowerMessage.includes('who are you')) {
      const ordixResponse = 'I am Ordix, a helpful AI assistant.';
      setData((prevData) => [
        ...prevData,
        { type: 'user', text: message },
        { type: 'bot', text: ordixResponse },
      ]);
      setTextInput('');
      setIsLoading(false);
      setError('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      return;
    }

    // Otherwise, send the user message to the API.
    setData((prevData) => [...prevData, { type: 'user', text: message }]);
    setTextInput('');
    try {
      const response = await axios.post(
        apiUrl,
        {
          model: modelId,
          messages: [{ role: 'user', content: message }],
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
      setData((prevData) => [...prevData, { type: 'bot', text: botReply }]);
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

  // Render each chat item.
  const renderItem = ({ item }) => <AnimatedMessage item={item} />;
  const isChatEmpty = data.length <= 1;

  // Toggle keyboard when tapping on the content area.
  const handleContentPress = () => {
    if (keyboardVisible) {
      Keyboard.dismiss();
    } else if (textInputRef.current) {
      textInputRef.current.focus();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Wrap the content area in TouchableWithoutFeedback to toggle keyboard on press */}
      <TouchableWithoutFeedback onPress={handleContentPress}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.contentContainer}
        >
          {isChatEmpty ? (
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
          ) : (
            <View style={styles.chatContainer}>
              <FlatList
                ref={flatListRef}
                data={data}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                contentContainerStyle={styles.flatListContent}
                keyboardShouldPersistTaps="handled"
              />
              {isLoading && <TypingIndicator />}
            </View>
          )}
          {error ? (
            <Animated.View style={[styles.errorContainer, { opacity: fadeAnim }]}>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      {/* Bottom Input Bar with animated vertical offset */}
      <Animated.View style={[styles.inputBar, { transform: [{ translateY: inputYOffset }] }]}>
        <TextInput
          ref={textInputRef}
          style={styles.textInput}
          placeholder="Message Nexolink"
          placeholderTextColor="#aaa"
          value={textInput}
          keyboardAppearance="dark"
          onChangeText={setTextInput}
          onSubmitEditing={handleSend}
          onFocus={handleInputFocus}  // Moves input bar higher when focused.
          onBlur={handleInputBlur}    // Moves input bar lower when blurred.
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
  container: {
    flex: 1,
    backgroundColor: '#fff6e7', // Cream color.
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
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  introSubtitle: {
    fontSize: 16,
    color: '#555',
  },
  chatContainer: {
    flex: 1,
  },
  flatListContent: {
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 80, // Leave space for the input bar.
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#fff6e7',
    borderRadius: 15,
    marginVertical: 5,
    padding: 10,
    maxWidth: '70%',
    borderBottomColor: "black",
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
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  typingIndicatorContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  typingDot: {
    fontSize: 24,
    color: '#333',
    marginHorizontal: 2,
  },
  errorContainer: {
    position: 'absolute',
    top: '25%',
    left: '10%',
    right: '10%',
    backgroundColor: '#ff3333',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff6e7',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopColor: '#fff6e7',
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#fff6e7',
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    marginRight: 8,
    borderColor: 'black',
    borderWidth: 1,
  },
  sendButton: {
    backgroundColor: '#fff6e7',
    borderRadius: 20,
    padding: 10,
    borderColor: "black",
    borderWidth: 1,
  },
});
