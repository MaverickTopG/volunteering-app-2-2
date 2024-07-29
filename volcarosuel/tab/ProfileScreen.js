import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Animated, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const ChatGPT = () => {
    const [data, setData] = useState([{ type: 'bot', text: 'How may I help you?' }]);
    const apiKey = 'sk-proj-fjaLyfKk3xm7YLCSLhy5T3BlbkFJWzNG2GteXN7XN9goMdtj'; // Ensure this is your valid OpenAI API key
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    const modelId = 'gpt-3.5-turbo';
    const [textInput, setTextInput] = useState('');
    const [error, setError] = useState('');
    const [inputPosition] = useState(new Animated.Value(0));
    const [inputWidth] = useState(new Animated.Value(1));
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(1)); // Initial opacity for error message
    const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
    const [showButtons, setShowButtons] = useState(true);
    const buttonOpacity = useRef(new Animated.Value(1)).current;
    const flatListRef = useRef();
    const buttonTimeoutRef = useRef(null);

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

    const handleSend = async () => {
        const message = textInput;
        if (message.trim() === '') return;
        setIsLoading(true);
        setTextInput(''); // Clear the input field
        try {
            const response = await axios.post(apiUrl, {
                model: modelId,
                messages: [
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 1024,
                temperature: 0.5,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            const text = response.data.choices[0].message.content;
            setData(prevData => [...prevData, { type: 'user', text: message }, { type: 'bot', text }]);
            setError('');
            setTimeout(() => flatListRef.current.scrollToEnd({ animated: true }), 100);
        } catch (error) {
            console.error("Error:", error);
            if (error.response && error.response.data) {
                console.error("Error response data:", error.response.data);
                setError(`An error occurred: ${error.response.data.error.message}`);
            } else {
                setError('An error occurred while fetching response. Please try again.');
            }
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 0,
                useNativeDriver: false
            }).start(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 1000,
                    delay: 3000,
                    useNativeDriver: false
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
            useNativeDriver: false
        }).start();
    };

    const handleBlur = () => {
        setIsFocused(false);
        Animated.timing(inputWidth, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false
        }).start();
    };

    const renderItem = ({ item }) => {
        return (
            <View style={item.type === 'user' ? styles.userMessageContainer : styles.botMessageContainer}>
                <Text style={styles.messageText}>{item.text}</Text>
            </View>
        );
    };

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
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Ask me anything!"
                            placeholderTextColor="#fff"
                            value={textInput}
                            onChangeText={setTextInput}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onSubmitEditing={handleSend}
                        />
                        <TouchableOpacity onPress={handleSend} style={styles.searchButton}>
                            <Ionicons name="send-outline" size={24} color="#000" />
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
                    <FlatList
                        ref={flatListRef}
                        data={data}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index.toString()}
                        onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
                        contentContainerStyle={styles.chatContainer}
                    />
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
                <Modal
                    visible={isBottomSheetVisible}
                    transparent={true}
                    animationType="slide"
                >
                    <View style={styles.bottomSheet}>
                        <Text style={styles.bottomSheetTitle}>ChatGPT</Text>
                        <Text style={styles.bottomSheetText}>This chatbot helps you with your questions using the GPT-3.5 language model. You can ask anything and get a response generated by AI.</Text>
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
        backgroundColor: '#fff6e7',
        marginBottom:50,
    },
    chatContainer: {
        paddingTop: 20,
        paddingHorizontal: 10,
        paddingBottom: 150, // Extra padding to ensure text is not overshadowed by tab navigator
    },
    userMessageContainer: {
        flexDirection: 'row',
        alignSelf: 'flex-end',
        backgroundColor: 'black',
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 20,
        maxWidth: '70%',
        marginBottom: 10,
        padding: 10,
    },
    botMessageContainer: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        backgroundColor: 'black',
        borderRadius: 20,
        maxWidth: '70%',
        marginBottom: 10,
        padding: 10,
    },
    messageText: {
        fontSize: 17, // Increased font size
        color: 'white',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#000',
        paddingHorizontal: 10,
        paddingVertical: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    searchInput: {
        flex: 1,
        height: 50,
        backgroundColor: '#000',
        color: '#fff',
        borderColor: '#fff6e7',
        borderWidth: 1,
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 16,
    },
    searchButton: {
        marginLeft: 10,
        backgroundColor: '#fff6e7',
        padding: 10,
        borderRadius: 25,
    },
    infoButton: {
        marginLeft: 10,
        backgroundColor: 'transparent',
    },
    errorContainer: {
        position: 'absolute',
        bottom: '50%',
        left: '10%',
        right: '10%',
        backgroundColor: 'black',
        borderRadius: 20,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        color: 'white',
        fontSize: 16,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 60,
        right: 20,
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 100,
    },
    scrollButton: {
        backgroundColor: '#000',
        padding: 10,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'black',
        padding: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    bottomSheetTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff6e7',
        marginBottom: 10,
    },
    bottomSheetText: {
        fontSize: 16,
        color: '#fff6e7',
        marginBottom: 20,
    },
    closeButton: {
        fontSize: 16,
        color: '#fff6e7',
        textAlign: 'center',
    },
});
