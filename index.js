import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';

const ChatGPT = () => {
    const [data, setData] = useState([]);
    const apiKey = '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';
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    const modelId = 'gpt-3.5-turbo'; // Replace 'your-model-id' with the actual model ID
    const [textInput, setTextInput] = useState('');
    const [error, setError] = useState('');

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

    // Function to render messages with bubbles
    const renderMessage = ({ item }) => {
        return (
            <View style={item.type === 'user' ? styles.userMessageContainer : styles.botMessageContainer}>
                <Text style={styles.messageText}>{item.text}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={data}
                keyExtractor={(item, index) => index.toString()}
                style={styles.body}
                renderItem={renderMessage}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={textInput}
                    onChangeText={text => setTextInput(text)}
                    placeholder="Ask me anything!"
                />
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSend}
                >
                    <Text style={styles.buttonText}>Send</Text>
                </TouchableOpacity>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
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
        alignSelf: 'flex-end',
        backgroundColor: '#EEE',
        borderRadius: 20,
        maxWidth: '70%',
        marginBottom: 10,
        padding: 10,
    },
    botMessageContainer: {
        alignSelf: 'flex-start',
        backgroundColor: 'lightblue',
        borderRadius: 20,
        maxWidth: '70%',
        marginBottom: 10,
        padding: 10,
    },
    messageText: {
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderColor: '#e8e8e8',
    },
    input: {
        flex: 1,
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
        bottom: '50%',
    },
});
