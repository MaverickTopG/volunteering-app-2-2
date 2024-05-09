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
            <TextInput
                style={styles.input}
                value={textInput}
                onChangeText={text => setTextInput(text)}
                placeholder=" Ask me anything!"
            />
            <TouchableOpacity
                style={styles.button}
                onPress={handleSend}
            >
                <Text style={styles.buttonText}>Let's Go</Text>
            </TouchableOpacity>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
};

export default ChatGPT;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
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
        borderRadius: 10,
        maxWidth: '70%',
        marginBottom: 10,
        padding: 10,
    },
    botMessageContainer: {
        alignSelf: 'flex-start',
        backgroundColor: 'lightblue',
        borderRadius: 10,
        maxWidth: '70%',
        marginBottom: 10,
        padding: 10,
    },
    messageText: {
        fontSize: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: "black",
        width: '90%',
        height: 60,
        marginBottom: 10,
        borderRadius: 10,
        paddingHorizontal: 10,
    },
    button: {
        backgroundColor: 'lightblue',
        width: '90%',
        height: 60,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        fontSize: 25,
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
