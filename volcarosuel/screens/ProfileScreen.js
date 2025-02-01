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
    ActivityIndicator,
    Modal,
    FlatList,
    Dimensions, // Imported Dimensions
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const ChatGPT = () => {
    const [data, setData] = useState([{ type: 'bot', text: 'How may I help you?' }]);
    const apiKey = ''; // Replace with your valid OpenAI API key
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
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

    // Get screen dimensions
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

    const handleSend = async () => {
        const message = textInput;
        if (message.trim() === '') return;
        setIsLoading(true);
        setTextInput(''); // Clear the input field
        try {
            const response = await axios.post(
                apiUrl,
                {
                    model: modelId,
                    messages: [
                        {
                            role: 'user',
                            content: message,
                        },
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
            const text = response.data.choices[0].message.content;
            setData((prevData) => [
                ...prevData,
                { type: 'user', text: message },
                { type: 'bot', text },
            ]);
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

    const renderItem = ({ item }) => {
        return (
            <View
                style={
                    item.type === 'user'
                        ? styles.userMessageContainer
                        : styles.botMessageContainer
                }
            >
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
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Ask me anything!"
                            placeholderTextColor="black"
                            keyboardAppearance="dark" 
                            value={textInput}
                            onChangeText={setTextInput}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onSubmitEditing={handleSend}
                        />
                        <TouchableOpacity onPress={handleSend} style={styles.searchButton}>
                            <Ionicons name="send-outline" size={24} color="#000" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setIsBottomSheetVisible(true)}
                            style={styles.infoButton}
                        >
                            <Ionicons name="information-circle-outline" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                    {error ? (
                        <Animated.View style={[styles.errorContainer, { opacity: fadeAnim }]}>
                            <Text style={styles.errorText}>{error}</Text>
                        </Animated.View>
                    ) : null}
                    {/* Added a View wrapper with height set to 50% of screen height */}
                    <View style={{ height: screenHeight * 0.65 }}>
                        <FlatList
                            ref={flatListRef}
                            data={data}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => index.toString()}
                            onContentSizeChange={() =>
                                flatListRef.current.scrollToEnd({ animated: true })
                            }
                            contentContainerStyle={{ paddingTop: 20, paddingHorizontal: 10 }}
                        />
                    </View>
                    {/* End of modification */}
                </KeyboardAvoidingView>
                {showButtons && (
                    <Animated.View style={[styles.buttonContainer, { opacity: buttonOpacity }]}>
                        <TouchableOpacity onPress={scrollToTop} style={styles.scrollButton}>
                            <Ionicons name="arrow-up" size={24} color="#fff6e7" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={scrollToEnd} style={styles.scrollButton}>
                            <Ionicons name="arrow-down" size={24} color="#fff6e7" />
                        </TouchableOpacity>
                    </Animated.View>
                )}
                <Modal visible={isBottomSheetVisible} transparent={true} animationType="slide">
                    <View style={styles.bottomSheet}>
                        <Text style={styles.bottomSheetTitle}>Ordix</Text>
                        <Text style={styles.bottomSheetText}>
                            This chatbot helps you with your questions using the GPT-3.5 language
                            model. You can ask anything and get a response generated by Ordix!
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
        backgroundColor: '#fff6e7',
    },
    userMessageContainer: {
        alignSelf: 'flex-end',
        backgroundColor: '#fff6e7',
        borderRadius: 20,
        borderWidth: 0,
        borderColor: '#333',
        marginVertical: 5,
        padding: 10,
        maxWidth: '70%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    botMessageContainer: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff6e7',
        borderRadius: 20,
        marginVertical: 5,
        padding: 10,
        maxWidth: '70%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    messageText: {
        fontSize: 17,
        color: 'black',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff6e7',
        paddingHorizontal: 10,
        paddingVertical: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    searchInput: {
        flex: 1,
        height: 50,
        backgroundColor: '#fff6e7',
        color: '#000',
        borderColor: '#333',
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
    buttonContainer: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 120,
    },
    scrollButton: {
        backgroundColor: '#000',
        padding: 12,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    infoButton: {
        marginLeft: 10,
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
    },
    errorText: {
        color: 'white',
        fontSize: 16,
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff6e7',
        padding: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    bottomSheetTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 10,
    },
    bottomSheetText: {
        fontSize: 16,
        color: 'black',
        marginBottom: 20,
    },
    closeButton: {
        fontSize: 16,
        color: 'black',
        textAlign: 'center',
    },
});
