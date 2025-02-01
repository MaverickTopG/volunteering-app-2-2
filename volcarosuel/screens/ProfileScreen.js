import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const ChatGPT = () => {
  // Initial message introduces Nexolink as a volunteering companion.
  const [data, setData] = useState([
    {
      type: 'bot',
      text:
        'Welcome to Nexolink – your volunteering companion. How can I help you find meaningful volunteer opportunities today?',
    },
  ]);
  // Replace with your valid OpenAI API key.
  const apiKey = ''; 
  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  const modelId = 'gpt-3.5-turbo';
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState('');
  const [inputPosition] = useState(new Animated.Value(0));
  const [inputWidth] = useState(new Animated.Value(1));
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1)); // For error message
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [showButtons, setShowButtons] = useState(true);
  const buttonOpacity = useRef(new Animated.Value(1)).current;
  const flatListRef = useRef();
  const buttonTimeoutRef = useRef(null);

  // Get screen dimensions.
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    const showKeyboard = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
    const hideKeyboard = Keyboard.addListener('keyboardDidHide', keyboardDidHide);

    return () => {
      showKeyboard.remove();
      hideKeyboard.remove();
    };
  }, []);

  useEffect(() => {
    if (showButtons) {
      clearTimeout(buttonTimeoutRef.current);
      buttonTimeoutRef.current = setTimeout(() => {
        fadeOutButtons();
      }, 5000);
    }
  }, [showButtons]);

  const keyboardDidShow = (event) => {
    Animated.timing(inputPosition, {
      duration: event.duration,
      toValue: -event.endCoordinates.height + 60,
      useNativeDriver: false,
    }).start();
  };

  const keyboardDidHide = (event) => {
    Animated.timing(inputPosition, {
      duration: event.duration,
      toValue: 0,
      useNativeDriver: false,
    }).start();
  };

  // Typing indicator with animated dots (mimicking Deepseek)
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
        ]).start(() => animate());
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

  // Animated message component for smooth chat transitions.
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
        <View style={item.type === 'user' ? styles.userMessageContainer : styles.botMessageContainer}>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
      </Animated.View>
    );
  };

  // This function sends the user input to either a custom Nexolink response or the ChatGPT API.
  const handleSend = async () => {
    const message = textInput;
    if (message.trim() === '') return;
    setIsLoading(true);
    const lowerMessage = message.toLowerCase();

    // If the user asks about Nexolink or the app, provide a custom response.
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
      setTimeout(() => flatListRef.current.scrollToEnd({ animated: true }), 100);
      return;
    }

    // Otherwise, send the user message to the ChatGPT API.
    setData((prevData) => [...prevData, { type: 'user', text: message }]);
    setTextInput('');
    try {
      // ChatGPT API call integrated here.
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
      const text = response.data.choices[0].message.content;
      setData((prevData) => [...prevData, { type: 'bot', text }]);
      setError('');
      setTimeout(() => flatListRef.current.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      console.error('Error:', error);
      if (error.response && error.response.data) {
        console.error('Error response data:', error.response.data);
        setError(`An error occurred: ${error.response.data.error.message}`);
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

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(inputWidth, {
      toValue: 0.7,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(inputWidth, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const renderItem = ({ item }) => <AnimatedMessage item={item} />;

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    fadeInButtons();
  };

  const scrollToEnd = () => {
    flatListRef.current.scrollToEnd({ animated: true });
  };

  const scrollToTop = () => {
    flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
  };

  const fadeOutButtons = () => {
    Animated.timing(buttonOpacity, {
      toValue: 0,
      duration: 1500,
      useNativeDriver: true,
    }).start(() => {
      setShowButtons(false);
    });
  };

  const fadeInButtons = () => {
    setShowButtons(true);
    Animated.timing(buttonOpacity, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
    clearTimeout(buttonTimeoutRef.current);
    buttonTimeoutRef.current = setTimeout(() => {
      fadeOutButtons();
    }, 5000);
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Ask about volunteering, Nexolink, or anything else!"
              placeholderTextColor="#bbb"
              keyboardAppearance="dark"
              value={textInput}
              onChangeText={setTextInput}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity onPress={handleSend} style={styles.searchButton}>
              <Ionicons name="send-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsBottomSheetVisible(true)} style={styles.infoButton}>
              <Ionicons name="information-circle-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          {error ? (
            <Animated.View style={[styles.errorContainer, { opacity: fadeAnim }]}>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}
          <View style={{ height: screenHeight * 0.65 }}>
            <FlatList
              ref={flatListRef}
              data={data}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
              contentContainerStyle={{ paddingTop: 20, paddingHorizontal: 10 }}
            />
            {isLoading && <TypingIndicator />}
          </View>
        </KeyboardAvoidingView>
        {showButtons && (
          <Animated.View style={[styles.buttonContainer, { opacity: buttonOpacity }]}>
            <TouchableOpacity onPress={scrollToTop} style={styles.scrollButton}>
              <Ionicons name="arrow-up" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={scrollToEnd} style={styles.scrollButton}>
              <Ionicons name="arrow-down" size={24} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        )}
        <Modal visible={isBottomSheetVisible} transparent={true} animationType="slide">
          <View style={styles.bottomSheet}>
            <Text style={styles.bottomSheetTitle}>Nexolink</Text>
            <Text style={styles.bottomSheetText}>
              This chatbot is powered by GPT-3.5 and tailored to help you explore volunteering opportunities.
              Nexolink connects volunteers with local opportunities, empowering communities and creating meaningful change.
            </Text>
            <TouchableOpacity onPress={() => setIsBottomSheetVisible(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ChatGPT;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#1F1F1F',
    borderRadius: 15,
    marginVertical: 5,
    padding: 10,
    maxWidth: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#2C2C2C',
    borderRadius: 15,
    marginVertical: 5,
    padding: 10,
    maxWidth: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#1E1E1E',
    color: '#fff',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: '#2C2C2C',
    padding: 10,
    borderRadius: 25,
  },
  infoButton: {
    marginLeft: 10,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 120,
  },
  scrollButton: {
    backgroundColor: '#444',
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  errorContainer: {
    position: 'absolute',
    bottom: '50%',
    left: '10%',
    right: '10%',
    backgroundColor: '#ff3333',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  bottomSheetTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  bottomSheetText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
  },
  closeButton: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  typingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  typingDot: {
    fontSize: 24,
    color: '#fff',
    marginHorizontal: 2,
  },
});
