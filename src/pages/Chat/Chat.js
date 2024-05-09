import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { SocketContext } from '../../Context/SocketContext';
import MessageItem from './MessageItem';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAvoidingView, Platform } from 'react-native';
import HeaderComponent from './HeaderComponent';
import { AppContext } from '../../Context/AppContext';
import { viewMessages, handleSend } from './chatFunctions';
import messaging from '@react-native-firebase/messaging';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'react-native-image-picker'
import { BackHandler } from 'react-native';

import chatBackground from '../../attachments/chatBack.png';
import chatBackgroundDarkTheme from '../../attachments/chatBackWhite.png';
import ImageViewerComponent from './ImageViewerComponent';
import PinchGestureHandler from './PinchGestureHandler';
import ChatPinchGestureHandler from './ChatPinchGestureHandler';

import EmojiSelector from 'react-native-emoji-selector'

const Chat = () => {
    const navigation = useNavigation();
    const socket = useContext(SocketContext);
    const scrollViewRef = useRef();
    const [input, setInput] = useState('');
    const deleteConversationRef = useRef(null);
    const [photo, setPhoto] = useState(null);
    const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));
    const [isEnabledEmojiTable, setIsEnabledEmojiTable] = useState(false);

    const { blockedUsers, conversationMessages, setConversationMessages, appConfig, setImageViewerPhoto, chatImageViewerModalVisible, setChatImageViewerModalVisible, imageViewerModalVisible, setImageViewerModalVisible, currentConversation, setCurrentConversation, conversasDoAsync, setConversasDoAsync } = useContext(AppContext);
    const [isComponentMounted, setIsComponentMounted] = useState(true);

    const [typing, setTyping] = useState(currentConversation ? currentConversation.typing : null);

    const prohibitedCharacters = [];

    const darkTheme = appConfig.darkTheme;

    const isBlocked = currentConversation ? blockedUsers.some(user => user.id === currentConversation.id) : null;
    if (currentConversation) {
        currentConversation.photo = isBlocked ? null : currentConversation.photo;
    }

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (isEnabledEmojiTable == true) {
                setIsEnabledEmojiTable(false);
                return true;
            } else if (chatImageViewerModalVisible == true || imageViewerModalVisible == true) {
                setChatImageViewerModalVisible(false);
                setImageViewerModalVisible(false);
                return true;
            } else {
                return false;
            }
        });

        return () => {
            backHandler.remove();
        }
    }, [navigation, chatImageViewerModalVisible, imageViewerModalVisible, isEnabledEmojiTable]);

    useEffect(() => {
        //console.log('Altura:', Math.round(screenDimensions.height), 'Largura:', Math.round(screenDimensions.width));
    }, [screenDimensions]);

    useEffect(() => {
        if (currentConversation) {
            socket.emit('updateTyping', typing, currentConversation.id);
        }
    }, [typing])

    const selectImageFromGallery = async () => {
        const res = await ImagePicker.launchImageLibrary(
            {
                includeBase64: true,
                mediaType: "photo",
                quality: 0.5,
                compressFormat: 'JPEG',
                maxWidth: 800,
                maxHeight: 600,
            },
            (res) => {
                if (res && res.assets && res.assets[0].uri) {
                    //console.log(res.assets[0])
                    setPhoto(res);
                    setImageViewerPhoto(res.assets[0]);
                    setImageViewerModalVisible(true);
                }
            }
        );
    }

    useFocusEffect(
        React.useCallback(() => {
            socket && socket.emit("requestUserLastSeen", currentConversation);
            setIsComponentMounted(true);
            viewMessages(conversationMessages, setConversationMessages, conversasDoAsync, setConversasDoAsync, setCurrentConversation, currentConversation, socket, appConfig);
            return () => {
                setTyping(false);
            };
        }, [])
    );

    useEffect(() => {
        deleteConversationRef.current = async () => {
            try {
                const storedConversations = await AsyncStorage.getItem('allConversations');
                if (storedConversations) {
                    const parsedConversations = JSON.parse(storedConversations);
                    const updatedConversations = parsedConversations.filter(conversa => conversa.id !== currentConversation.id);
                    await AsyncStorage.setItem('allConversations', JSON.stringify(updatedConversations));
                    const updatedConversasDoAsync = conversasDoAsync.filter(conversa => conversa.id !== currentConversation.id);
                    setConversasDoAsync(updatedConversasDoAsync);
                }
            } catch (error) {
                console.error('Erro ao excluir a conversa do AsyncStorage:', error);
            }

            setCurrentConversation(null);
            setConversationMessages(null);

            navigation.navigate('Home');
        }
    }, [AsyncStorage, currentConversation]);


    useEffect(() => {
        const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
            //console.log('Mensagem recebida no aplicativo:', remoteMessage);
        });

        const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp(remoteMessage => {

        });

        return () => {
            unsubscribeOnMessage();
            unsubscribeOnNotificationOpenedApp();
        };
    }, []);

    return isComponentMounted ? (
        <View style={{ backgroundColor: appConfig.darkTheme ? '#111b21' : "white", height: '100%', width: '100%' }}>
            <Image
                source={appConfig.darkTheme ? chatBackgroundDarkTheme : chatBackground} // Insira o caminho da sua imagem de fundo
                style={[styles.backgroundImage2, { opacity: appConfig.darkTheme ? 0.2 : 0.2, height: screenDimensions.height }]}
            />
            <View style={{ height: "100%" }}>

                <KeyboardAvoidingView
                    behavior={'height'}
                    style={{ flex: 1, height: '20%' }}
                >
                    <View style={[styles.container, { height: screenDimensions ? screenDimensions.height : '100%' }]}>

                        {/* Barra de status */}
                        <View style={[styles.statusbar, { backgroundColor: appConfig.darkTheme ? '#202c33' : '#ff9900' }]}></View>
                        {/* Componente de cabeçalho */}
                        <HeaderComponent navigation={navigation} deleteConversationRef={deleteConversationRef.current} />
                        {/* Lista de mensagens */}
                        <FlatList
                            contentContainerStyle={styles.flatListContent}
                            ref={scrollViewRef}
                            data={conversationMessages ? conversationMessages.slice().reverse() : []}
                            renderItem={({ item }) => <MessageItem item={item} dependencies={{ conversationMessages, setConversationMessages, darkTheme, setImageViewerPhoto, imageViewerModalVisible, setImageViewerModalVisible, currentConversation, setCurrentConversation, conversasDoAsync, setConversasDoAsync }} />}
                            keyExtractor={(item, index) => index.toString()}
                            onContentSizeChange={() => scrollViewRef.current.scrollToOffset({ offset: 0, animated: true })}
                            inverted
                        />
                        {/* Área de entrada de mensagens */}
                        {!isBlocked && (
                            <View style={styles.inputContainer}>
                                {/* Campo de entrada de texto */}
                                <View style={{ width: '83%', paddingLeft: 15, backgroundColor: appConfig.darkTheme ? '#202c33' : 'white', borderRadius: 10, flexDirection: 'row', borderWidth: appConfig.darkTheme ? 0 : 1, borderColor: '#ddd' }}>
                                    {/* <TouchableOpacity activeOpacity={0.8} onPress={() => { setIsEnabledEmojiTable(true); }} style={{ width: '15%', borderWidth: 0, justifyContent: 'center', alignItems: 'center' }}>
                                        <Image source={require('../../attachments/emotes.png')} style={{ width: 20, height: 20 }} />
                                    </TouchableOpacity> */}
                                    <View style={{ width: '83%', height: '100%', borderWidth: 0 }}>
                                        <TextInput
                                            style={[styles.input, { borderWidth: 0, color: appConfig.darkTheme ? 'white' : 'black' }]}
                                            value={input}
                                            onChangeText={(text) => {
                                                let filteredText = text;
                                                for (let i = 0; i < prohibitedCharacters.length; i++) {
                                                    filteredText = filteredText.split(prohibitedCharacters[i]).join('');
                                                }
                                                setInput(filteredText);
                                                if (text.length >= 1) {
                                                    setTyping(true);
                                                    //console.log(text);
                                                    //console.log('digitando', currentConversation.typing);
                                                }
                                                if (text.length <= 0) {
                                                    setTyping(false);
                                                    //console.log(text);
                                                    //console.log('parou');
                                                }
                                            }}
                                            onFocus={() => {
                                                //console.log('focou')
                                                setIsEnabledEmojiTable(false);
                                            }}
                                            onBlur={() => {
                                                // Esta função é chamada quando o TextInput perde foco (teclado fechado)
                                                //console.log('TextInput perdeu foco (teclado fechado)');
                                            }}
                                            placeholder="Digite uma mensagem..."
                                            maxLength={1200}
                                            placeholderTextColor="#808080"
                                        />
                                    </View>
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => { selectImageFromGallery(); }} style={{ width: '15%', borderWidth: 0, justifyContent: 'center', alignItems: 'center' }}>
                                        <Image source={require('../../attachments/clip.png')} style={{ width: 20, height: 20 }} />
                                    </TouchableOpacity>
                                </View>
                                {/* Botão de envio */}
                                <TouchableOpacity activeOpacity={0.5} style={{ width: '15%', height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => { setIsEnabledEmojiTable(false); setTyping(false); handleSend(imageViewerPhoto = null, input, setInput, currentConversation, conversationMessages, setConversationMessages, scrollViewRef, socket, setConversasDoAsync, conversasDoAsync, setCurrentConversation) }}>
                                    <View style={[styles.sendButton, { borderRadius: 10, width: '100%', justifyContent: 'center', alignItems: 'center', height: '100%' }]}>
                                        <Image source={require('../../attachments/sendIcon.png')} style={{ width: 25, height: 25 }} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </KeyboardAvoidingView >
                {imageViewerModalVisible && (
                    <PinchGestureHandler />
                )}
                {chatImageViewerModalVisible && (
                    <ChatPinchGestureHandler />
                )}
                {isEnabledEmojiTable && (
                    <EmojiSelector
                        onEmojiSelected={emoji => {
                            const newText = input + emoji;
                            setInput(newText);
                        }}
                        showSearchBar={false}
                        showSectionTitles={false}
                    />
                )}
            </View>
        </View>
    ) : null;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    // Imagem de fundo esticada para cobrir a tela
    backgroundImage: {
        flex: 1,
        opacity: 0.15,
        width: "100%",
        height: "100%",
        position: "absolute",
    },
    backgroundImage2: {
        width: "100%",
        height: "100%",
        position: "absolute",
        resizeMode: 'cover'
    },
    // Barra de status laranja
    statusbar: {
        height: 24,
        width: '100%',
        backgroundColor: '#ff9900',
    },
    // Área de entrada de mensagens (campo de texto e botão de envio)
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 10,
        paddingHorizontal: 7,
        height: 60
    },
    // Campo de entrada de texto
    input: {
        flex: 1,
        borderWidth: 0.5,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 0,
        marginRight: 0,
        color: "black",
        height: 50,
        fontSize: 15,
    },
    // Botão de envio
    sendButton: {
        backgroundColor: '#ff9900', // Cor laranja
        padding: 0,
        borderRadius: 5,
        elevation: 0,
        height: '100%'
    },
    // Texto do botão de envio
    sendButtonText: {
        color: '#fff', // Cor branca
        fontWeight: 'bold',
    },
    // Espaçamento adicional à esquerda da lista de mensagens para evitar sobreposição com o ícone do usuário
    flatListContent: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
});

export default Chat;