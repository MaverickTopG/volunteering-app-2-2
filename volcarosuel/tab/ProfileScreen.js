import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Animated, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const ChatGPT = () => {
    const [data, setData] = useState([{ type: 'bot', text: 'How may I help you?' }]);
    const apiKey = 'your-api-key';
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    const modelId = 'gpt-3.5-turbo';
    const [textInput, setTextInput] = useState('');
    const [error, setError] = useState('');
    const [inputPosition] = useState(new Animated.Value(0));
    const [inputWidth] = useState(new Animated.Value(1));
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(1)); // Initial opacity for error message

    useEffect(() => {
        const showKeyboard = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
        const hideKeyboard = Keyboard.addListener('keyboardDidHide', keyboardDidHide);

        return () => {
            showKeyboard.remove();
            hideKeyboard.remove();
        };
    }, []);

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
            setData([...data, { type: 'user', text: message }, { type: 'bot', text }]);
            setError('');
        } catch (error) {
            console.error("Error:", error.response.data);
            setError('An error occurred while fetching response. Please try again.');
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

    const renderMessage = ({ item }) => {
        return (
            <View style={item.type === 'user' ? styles.userMessageContainer : styles.botMessageContainer}>
                <Text style={styles.messageText}>{item.text}</Text>
            </View>
        );
    };

    const dismissKeyboard = () => {
        Keyboard.dismiss();
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
                    </View>
                    {error ? (
                        <Animated.View style={[styles.errorContainer, { opacity: fadeAnim }]}>
                            <Text style={styles.errorText}>{error}</Text>
                        </Animated.View>
                    ) : null}
                    <FlatList
                        data={data}
                        keyExtractor={(item, index) => index.toString()}
                        style={styles.body}
                        renderItem={renderMessage}
                        ListFooterComponent={isLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#fff6e7" />
                                <Text style={styles.loadingText}>Generating...</Text>
                            </View>
                        ) : null}
                    />
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
    );
};

export default ChatGPT;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff6e7',
    },
    body: {
        flex: 1,
        width: '100%',
        paddingTop: 20,
        paddingHorizontal: 10,
    },
    userMessageContainer: {
        flexDirection: 'row',
        alignSelf: 'flex-end',
        backgroundColor: '#fff6e7',
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
    errorContainer: {
        position: 'absolute',
        bottom:'50%',
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
    loadingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
    },
    loadingText: {
        color: '#fff6e7',
        marginLeft: 10,
    },
});
