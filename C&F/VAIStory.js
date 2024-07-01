import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { GiftedChat, Bubble, Send, InputToolbar } from 'react-native-gifted-chat';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import axios from 'axios';

const ChatGPT = () => {
    const [messages, setMessages] = useState([]);
    const apiKey = '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';
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    const modelId = 'gpt-3.5-turbo';
    const [textInput, setTextInput] = useState('');
    const [error, setError] = useState('');
    const [recording, setRecording] = useState(null);

    const onSend = (messages = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
        const userMessage = messages[0].text;
        processMessageToChatGPT(userMessage);
    };

    const processMessageToChatGPT = async (userMessage) => {
        const apiMessages = messages.map((messageObject) => {
            let role = messageObject.user._id === 2 ? "assistant" : "user";
            return { role: role, content: messageObject.text };
        });

        const apiRequestBody = {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "Answer it like the person is looking for volunteering opportunities that are legible for a teenager (13-17 years old)" },
                ...apiMessages,
                { role: "user", content: userMessage }
            ]
        };

        try {
            const response = await axios.post(apiUrl, apiRequestBody, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const botMessage = {
                _id: Math.random().toString(36).substring(7),
                text: response.data.choices[0].message.content,
                createdAt: new Date(),
                user: {
                    _id: 2,
                    name: 'ChatGPT',
                    avatar: 'https://placeimg.com/140/140/any',
                },
            };
            setMessages(previousMessages => GiftedChat.append(previousMessages, botMessage));
            setError('');
            Speech.speak(response.data.choices[0].message.content);
        } catch (error) {
            console.error("Error:", error.response.data);
            setError('An error occurred while fetching response. Please try again.');
        }
    };

    const startRecording = async () => {
        try {
            console.log('Requesting permissions..');
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
            console.log('Starting recording..');
            const { recording } = await Audio.Recording.createAsync(
                Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
            );
            setRecording(recording);
            console.log('Recording started');
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        console.log('Stopping recording..');
        setRecording(undefined);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log('Recording stopped and stored at', uri);
        // Here you can implement sending the voice message to the server
    };

    const renderSend = (props) => (
        <Send {...props}>
            <View style={styles.sendingContainer}>
                <Ionicons name="send" size={24} color="#0078fe" />
            </View>
        </Send>
    );

    const renderBubble = (props) => (
        <Bubble
            {...props}
            wrapperStyle={{
                right: {
                    backgroundColor: '#0078fe',
                },
                left: {
                    backgroundColor: '#e5e5ea',
                },
            }}
            textStyle={{
                right: {
                    color: '#fff',
                },
                left: {
                    color: '#000',
                },
            }}
        />
    );

    const renderInputToolbar = (props) => (
        <InputToolbar
            {...props}
            containerStyle={styles.inputToolbar}
            primaryStyle={{ alignItems: 'center' }}
        />
    );

    const renderComposer = (props) => (
        <View style={styles.composerContainer}>
            <TextInput
                {...props}
                style={styles.input}
                value={textInput}
                onChangeText={text => setTextInput(text)}
                placeholder="Ask follow up..."
                onFocus={() => setTextInput(textInput)}
            />
            <TouchableOpacity onPress={recording ? stopRecording : startRecording}>
                <MaterialIcons name="keyboard-voice" size={24} color="#0078fe" style={styles.voiceIcon} />
            </TouchableOpacity>
        </View>
    );

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <GiftedChat
                    messages={messages}
                    onSend={messages => onSend(messages)}
                    user={{
                        _id: 1,
                    }}
                    renderBubble={renderBubble}
                    renderSend={renderSend}
                    renderInputToolbar={renderInputToolbar}
                    renderComposer={renderComposer}
                    placeholder="Type a message..."
                    alwaysShowSend
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

export default ChatGPT;

const styles = StyleSheet.create({
    sendingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        marginBottom: 5,
    },
    inputToolbar: {
        borderTopWidth: 1,
        borderTopColor: '#e8e8e8',
        backgroundColor: '#f9f9f9',
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    composerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#e8e8e8",
        height: 40,
        borderRadius: 20,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    voiceIcon: {
        marginLeft: 10,
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
