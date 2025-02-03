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
  // Refs
  const textInputRef = useRef(null);
  const flatListRef = useRef(null);

  // Animated value for error fade
  const [fadeAnim] = useState(new Animated.Value(1));

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

  // API configuration.
  const apiKey = 'YOUR_API_KEY_HERE';
  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  const modelId = 'gpt-3.5-turbo';

  // Control whether the input bar is visible.
  const [showInput, setShowInput] = useState(false);

  // Typing indicator component.
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

  // Animated message bubble.
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

  // Sends user input to the API or returns a custom response.
  const handleSend = async () => {
    const message = textInput.trim();
    if (!message) return;
    setIsLoading(true);
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes('what is nexolink') ||
      (lowerMessage.includes('nexolink') && lowerMessage.includes('app')) ||
      lowerMessage.includes('about this app')
    ) {
      const nexolinkResponse =
        'Nexolink is a revolutionary platform designed to connect volunteers with opportunities in their communities. It streamlines the process of finding and engaging in meaningful volunteer work, empowering you to make a positive impact. How else can I assist you today?';
      setData(prevData => [
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

    setData(prevData => [...prevData, { type: 'user', text: message }]);
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
      setData(prevData => [...prevData, { type: 'bot', text: botReply }]);
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

  const renderItem = ({ item }) => <AnimatedMessage item={item} />;
  const isChatEmpty = data.length <= 1;

  // When the logo is pressed, show the input bar and focus the TextInput.
  const handleLogoPress = () => {
    setShowInput(true);
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
    }, 100);
  };

  // When the chat area is tapped, if the input is visible, dismiss the keyboard and hide the input bar.
  const handleChatAreaPress = () => {
    if (showInput) {
      setShowInput(false);
      Keyboard.dismiss();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Chat area wrapped in TouchableWithoutFeedback so that taps outside the input hide it */}
      <TouchableWithoutFeedback onPress={handleChatAreaPress}>
        <View style={styles.chatArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.contentContainer}
          >
            {isChatEmpty ? (
              <View style={styles.centerIntroContainer}>
                <TouchableOpacity onPress={handleLogoPress}>
                  <Image
                    source={require('../../assets/spaceship.png')}
                    style={styles.logoStyle}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <Text style={styles.introTitle}>Hi, I'm Nexolink.</Text>
                <Text style={styles.introSubtitle}>How can I help you today?</Text>
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
        </View>
      </TouchableWithoutFeedback>

      {/* Render the Input Bar below the chat area, only if showInput is true */}
      {showInput && (
        <View style={styles.inputBar}>
          <TextInput
            ref={textInputRef}
            style={styles.textInput}
            placeholder="Message Nexolink"
            placeholderTextColor="#aaa"
            value={textInput}
            onChangeText={setTextInput}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ChatGPT;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e7', // Cream background
  },
  chatArea: {
    flex: 1,
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
    paddingBottom: 80, // Leaves space for the input bar
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    marginVertical: 5,
    padding: 10,
    maxWidth: '70%',
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#f5f5f5',
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
    borderTopColor: '#ccc',
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#fff',
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#333',
    borderRadius: 20,
    padding: 10,
  },
});
