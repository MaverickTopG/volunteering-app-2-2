import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Image, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';

const ChatGPT = () => {
    const [data, setData] = useState([{ type: 'bot', text: 'How may I help you?' }]);
    const apiKey = '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';
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    const modelId = 'gpt-3.5-turbo';
    const [textInput, setTextInput] = useState('');
    const [error, setError] = useState('');
    const [inputPosition] = useState(new Animated.Value(0));
    const [inputWidth] = useState(new Animated.Value(1));
    const [isFocused, setIsFocused] = useState(false);

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

    // Function to handle sending user messages
    const handleSend = async () => {
        const message = textInput;
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
            setData([...data, { type: 'user', text: textInput }, { type: 'bot', text }]);
            setTextInput('');
            setError('');
        } catch (error) {
            console.error("Error:", error.response.data);
            setError('An error occurred while fetching response. Please try again.');
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

    // Function to render messages with bubbles and images
    const renderMessage = ({ item }) => {
        return (
            <View style={item.type === 'user' ? styles.userMessageContainer : styles.botMessageContainer}>
                <Image
                    source={item.type === 'user' ? require('../miniasset/humanimage.png') : require('../miniasset/botimage.png')}
                    style={styles.avatar}
                />
                <Text style={styles.messageText}>{item.text}</Text>
            </View>
        );
    };

    // Function to dismiss the keyboard
    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.container}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                    <Animated.View style={[styles.inputContainer, { transform: [{ translateY: inputPosition }] }]}>
                        <Animated.View style={{ flex: inputWidth }}>
                            <TextInput
                                style={styles.input}
                                value={textInput}
                                onChangeText={text => setTextInput(text)}
                                placeholder="Ask me anything!"
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                onSubmitEditing={handleSend}
                            />
                        </Animated.View>
                        {isFocused && (
                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleSend}
                            >
                                <Text style={styles.buttonText}>Send</Text>
                            </TouchableOpacity>
                        )}
                    </Animated.View>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    <FlatList
                        data={data}
                        keyExtractor={(item, index) => index.toString()}
                        style={styles.body}
                        renderItem={renderMessage}
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
        backgroundColor: '#fff',
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
        backgroundColor: '#EEE',
        borderRadius: 20,
        maxWidth: '70%',
        marginBottom: 10,
        padding: 10,
    },
    botMessageContainer: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        backgroundColor: 'lightblue',
        borderRadius: 20,
        maxWidth: '70%',
        marginBottom: 10,
        padding: 10,
    },
    avatar: {
        width: 30,
        height: 30,
        marginRight: 10,
    },
    messageText: {
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#e8e8e8',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: "black",
        height: 40,
        borderRadius: 20,
        paddingHorizontal: 10,
        marginRight: 10,
    },
    button: {
        backgroundColor: 'lightblue',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        color: '#fff',
    },
    errorText: {
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        color: 'red',
        padding: 10,
        borderRadius: 20,
        position: 'absolute',
        alignSelf: 'center',
        top: '10%',
    },
});
