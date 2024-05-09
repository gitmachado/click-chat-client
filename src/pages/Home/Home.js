import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useContext, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TouchableNativeFeedback, Image, ScrollView, Animated, Modal, ActivityIndicator, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppContext } from '../../Context/AppContext';
import { SocketContext } from '../../Context/SocketContext';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import changeNavigationBarColor from 'react-native-navigation-bar-color';

import DropdownComponent from './DropdownComponent';

import CheckPending from '../../attachments/CheckPending.png';
import CheckReceivedByServer from '../../attachments/CheckReceivedByServer.png';
import CheckReceivedByReceptor from '../../attachments/CheckReceivedByReceptor.png';
import CheckViewedByReceptor from '../../attachments/CheckViewedToReceptor.png';

import CheckPendingDark from '../../attachments/CheckPendingDark.png';
import CheckReceivedByServerDark from '../../attachments/CheckReceivedByServerDark.png';
import CheckReceivedByReceptorDark from '../../attachments/CheckReceivedByReceptorDark.png';

import profileImage from '../../attachments/perfil.png';
import profileImageDark from '../../attachments/perfilDarkTheme.png';
import profileImageDarkTheme from '../../attachments/perfilDarkTheme.png';

import contactIcon from '../../attachments/myContactIcon.png';
import contactIconWhite from '../../attachments/myContactChatIcon.png';

import HomePinchGestureHandler from './HomePinchGestureHandler';

import { SwiperFlatList } from 'react-native-swiper-flatlist';
import Loading from './Loading';

function Home() {
    const navigation = useNavigation();
    const socket = useContext(SocketContext);

    const appContext = useContext(AppContext);
    const {
        socketInstance,
        appConfig,
        profileOptions,
        isLoadingScreenVisible,
        setIsLoadingScreenVisible,
    } = appContext;

    appConfig.darkTheme ? changeNavigationBarColor('#202c33', false) : changeNavigationBarColor('white', true);

    const [searchUserModalVisibility, setSearchUserModalVisibility] = useState(false);
    const [profileImageModalVisibility, setProfileImageModalVisibility] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [optionsModalVisibility, setOptionsModalVisibility] = useState(false);
    const [nullNewConversationModalVisibility, setNullNewConversationModalVisibility] = useState(false);

    setTimeout(() => {
        setIsLoadingScreenVisible(false);
    }, 7000);

    const {
        screen,
        setScreen,
        setCurrentConversation,
        setConversasDoAsync,
        conversasDoAsync,
        setConversationMessages,
        onlineUsers,
        user,
        registeredUsers,
        addedContacts,
        blockedUsers,
        homeImageViewerModalVisible,
        setHomeImageViewerModalVisible,
        setImageViewerPhoto,
        userProfile,
    } = useContext(AppContext);

    const { width } = Dimensions.get('window');

    const [isAdLoaded, setIsAdLoaded] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const [swiperIndex, setSwiperIndex] = useState(0);
    const [swiperPosition, setSwiperPosition] = useState(50);
    const swiperRef = useRef(null);

    const handleIndexChanged = (index) => {
        //console.log(swiperIndex);
        setSwiperIndex(index);
    };

    const scrollToIndex = (index) => {
        swiperRef.current.scrollToIndex({ index });
    };

    const navigationPosition = useRef(new Animated.Value(50)).current;

    const handleScrollSwiper = (event, state, context) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const screenWidth = layoutMeasurement.width;
        const contentWidth = contentSize.width;
        const scrollOffset = contentOffset.x;

        const barWidth = 110; // Largura da barra em pixels

        const initialPosition = 50; // Posição inicial da barra
        const finalPosition = screenWidth - barWidth - 50; // Posição final da barra, subtraindo a largura da barra e o deslocamento inicial da posição inicial

        // Calcular a posição da barra com base no deslocamento do swiper
        const barPosition = (scrollOffset / (contentWidth - screenWidth)) * (finalPosition - initialPosition) + initialPosition;

        setSwiperPosition(barPosition);
        Animated.spring(navigationPosition, {
            toValue: barPosition,
            useNativeDriver: true,
        }).start();
    };

    useFocusEffect(
        React.useCallback(() => {
            setScreen("Home");
        }, [])
    );

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            //console.log(screen)
            if (screen == "Home" && homeImageViewerModalVisible == false) {
                return true;
            } else {
                if (homeImageViewerModalVisible == true) {
                    setHomeImageViewerModalVisible(false);
                    return true;
                }
            }
            return false;
        });

        return () => {
            backHandler.remove();
        }
    }, [navigation, screen, homeImageViewerModalVisible]);

    const handleScroll = () => {
        setIsScrolling(true);
    };

    const handleScrollEnd = () => {
        setIsScrolling(false);
    };

    useEffect(() => {
        const onFocus = () => {
            setCurrentConversation(null);
        };

        const onBlur = () => {

        };

        const focusListener = navigation.addListener('focus', onFocus);
        const blurListener = navigation.addListener('blur', onBlur);

        return () => {
            focusListener();
            blurListener();
        };
    }, [navigation]);

    useEffect(() => {
        if (socket) {
            socket.removeAllListeners('randomUser');
            socket.on('randomUser', (randomUser) => {
                //console.log('opa')
                if (randomUser == null) {
                    setNullNewConversationModalVisibility(true);
                    setSearchUserModalVisibility(false);
                } else {
                    const existingConversation = conversasDoAsync.find(conv => conv.id == randomUser.id_user);

                    if (existingConversation) {
                        setCurrentConversation(existingConversation);
                        setConversationMessages(existingConversation.messages);
                        setSearchUserModalVisibility(false);
                        setScreen("notHome");
                        navigation.navigate('Chat')
                    } else {
                        const newConversationData = {
                            id: randomUser.id_user,
                            name: randomUser.name,
                            gender: randomUser.gender,
                            age: randomUser.age,
                            online: randomUser.online,
                            lastSeen: randomUser.lastSeen,
                            naolidas: 0,
                            messages: [],
                            photo: randomUser.profileImage,
                            added: null,
                            typing: false,
                        };

                        const matchedAddedContact = addedContacts.find(contact => contact.id === newConversationData.id);

                        if (matchedAddedContact) {
                            newConversationData.added = true;
                        } else {
                            newConversationData.added = false;
                        }

                        setCurrentConversation(newConversationData);
                        //setConversasDoAsync(updatedConversations);

                        setConversationMessages([]);

                        setSearchUserModalVisibility(false);

                        setScreen("notHome");
                        navigation.navigate('Chat')
                    }
                }
            });
        }
    }, [socket, conversasDoAsync])

    const handleNewConversation = async () => {
        //console.log('enviando: ', profileOptions)
        setSearchUserModalVisibility(true);
        socket && socket.emit('newConversation', profileOptions);
    };

    const changeOptionsModalVisibility = (value) => {
        setOptionsModalVisibility(value);
    };

    const handleCancel = () => {
        setSearchUserModalVisibility(false);
    };

    const textStyle = { color: "#f57791", fontSize: 50 };

    const tabListData = [
        { name: "Conversas", component: <Text style={textStyle}>ALL</Text> },
        { name: "Contatos", component: <Text style={textStyle}>SKIN CARE</Text> },
    ];

    return (
        <View style={styles.container}>
            <View style={[styles.statusbar, { backgroundColor: appConfig.darkTheme ? '#202c33' : '#ff9900' }]}></View>
            {profileImageModalVisibility && (
                <View style={styles.statusbar2}></View>
            )}
            <View style={[styles.header, { backgroundColor: appConfig.darkTheme ? '#202c33' : '#ff9900' }]}>

                {searchUserModalVisibility &&
                    <Modal animationType="none" transparent={true} visible={searchUserModalVisibility} onRequestClose={() => setSearchUserModalVisibility(false)}>
                        <View style={styles.modalContainer}>
                            <View style={[styles.modalContent, { backgroundColor: appConfig.darkTheme ? '#202c33' : 'white' }]}>
                                <>
                                    <ActivityIndicator style={{ marginBottom: 5 }} size="large" color={appConfig.darkTheme ? 'white' : "#ff9900"} />
                                    <Text style={{ color: appConfig.darkTheme ? '#c1c1c1' : '#808080' }}> Buscando nova interação...</Text>
                                    <TouchableOpacity onPress={() => handleCancel()}>
                                        <Text style={{ fontSize: 17, fontWeight: "bold", color: appConfig.darkTheme ? 'white' : "#ff9900", marginTop: 5 }}>Cancelar</Text>
                                    </TouchableOpacity>
                                </>
                            </View>
                        </View>
                    </Modal>
                }

                {optionsModalVisibility &&
                    <Modal
                        animationType="none"
                        transparent={true}
                        visible={optionsModalVisibility}
                    >
                        <TouchableOpacity style={styles.optionsModalContainer} activeOpacity={1} onPress={() => { setOptionsModalVisibility(false) }}>
                            <View style={styles.optionsModalContent}>
                                <TouchableOpacity style={styles.modalOptionsContainer} onPress={() => { setOptionsModalVisibility(false); setScreen("notHome"); navigation.navigate('Editar Perfil'); }}>
                                    <Text style={styles.modalOptionText}> Editar Perfil </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalOptionsContainer} onPress={() => { setOptionsModalVisibility(false); setScreen("notHome"); navigation.navigate('Config'); }}>
                                    <Text style={styles.modalOptionText}> Configurações </Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Modal>
                }

                {profileImageModalVisibility &&
                    <Modal animationType="none" transparent={true} visible={profileImageModalVisibility}>
                        <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableOpacity activeOpacity={1} style={styles.profileModalContainer}
                                onPress={() => {
                                    setProfileImageModalVisibility(false);
                                }}
                            >
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={1} onPress={() => { if (selectedConversation && selectedConversation.photo !== null) { setImageViewerPhoto(selectedConversation.photo.assets[0]); setProfileImageModalVisibility(false); setHomeImageViewerModalVisible(true); } }} style={{ width: 300, height: 300, borderRadius: 8, elevation: 2, overflow: 'hidden' }}>
                                <Image source={selectedConversation && selectedConversation.photo ? { uri: `data:${selectedConversation.photo.type};base64,${selectedConversation.photo.assets[0].base64}` } : appConfig.darkTheme ? profileImageDark : profileImage} style={styles.profileModalImage} />
                                <View style={{ position: 'absolute', height: 50, width: '100%', backgroundColor: 'rgba(0, 0, 0, 0.3)', paddingHorizontal: 10, justifyContent: 'center' }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}> {selectedConversation.name} </Text>
                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13, marginLeft: 1 }}> {selectedConversation.gender == 1 ? 'Feminino' : 'Masculino'}, {selectedConversation.age || 18} </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </Modal>
                }

                <TouchableOpacity onPress={() => { setScreen("notHome"); navigation.navigate('Editar Perfil'); }} style={styles.leftHeaderContainer}>
                    <View style={styles.smallButton}>
                        <Image source={require('../../attachments/gear.png')} style={styles.menuIcon} />
                    </View>
                </TouchableOpacity>
                <View style={styles.centerHeaderContainer} >
                    <Text style={styles.headerText}> ClickChat </Text>
                </View>
                <View style={styles.rightHeaderContainer}>
                    <DropdownComponent />
                </View>

            </View>

            {/* <View style={{ width: '100%', height: '5%', flexDirection: 'row' }}>
                
                    <View style={{ width: '30%', height: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', backgroundColor: '#202020', elevation: 5 }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', borderRadius: 10, paddingRight: 15, marginLeft: 5, backgroundColor: 'white' }}>
                        <Image source={require('../../attachments/coin.gif')} style={{ width: 30, height: 30 }} />
                        <Text style={{ color: 'black', fontWeight: 'bold' }}>15</Text>
                    </View>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}> (14:36) </Text>
                </View>

                <View style={{ width: '100%', height: '100%' }}>
                    <AudioStream />
                </View>
            </View>*/}

            <View style={{ marginTop: 0, backgroundColor: appConfig.darkTheme ? '#202c33' : 'black', width: '100%', height: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 50 }}>
                <View style={{ width: 110, borderWidth: 0, justifyContent: 'center', alignItems: 'center' }} onTouchEnd={() => scrollToIndex(0)}>
                    <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold', padding: 5 }}> Conversas </Text>
                </View>
                <View style={{ width: 110, borderWidth: 0, justifyContent: 'center', alignItems: 'center' }} onTouchEnd={() => scrollToIndex(1)}>
                    <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold', padding: 5 }}> Contatos </Text>
                </View>
            </View>
            <View style={[{ backgroundColor: appConfig.darkTheme ? '#202c33' : 'black', height: 3, width: '100%' }]}>
                <Animated.View style={[{ height: '100%', width: 110, backgroundColor: appConfig.darkTheme ? '#ff9900' : '#ff9900' }, { transform: [{ translateX: navigationPosition }] }]}></Animated.View>
            </View>

            <SwiperFlatList style={styles.wrapper} ref={swiperRef} onScroll={handleScrollSwiper} showsPagination={false} loop={false} showsButtons={false} onIndexChanged={handleIndexChanged}>

                <View style={[styles.mainContainer, { backgroundColor: appConfig.darkTheme ? '#111b21' : 'white' }, { width: width }]}>
                    {conversasDoAsync.length === 0 ? (
                        <View style={{ width: "100%", flexGrow: 1, alignItems: "center", justifyContent: "center", paddingTop: 30 }}>
                            <Text style={[styles.noConversationsText, { color: appConfig.darkTheme ? '#c1c1c1' : '#808080' }]}> Sua tela de bate-papo está vazia. </Text>
                        </View>
                    ) : (
                        <ScrollView contentContainerStyle={[styles.containerMenu, { backgroundColor: appConfig.darkTheme ? '#111b21' : 'white' }]}>

                            {conversasDoAsync.map((conversation) => {
                                if (!conversation) { return null; }

                                // Acessando a última mensagem da conversa
                                const lastMessage = conversation.messages && conversation.messages.length > 0 ? conversation.messages[conversation.messages.length - 1] : null;
                                const lastMessageTime = lastMessage ? lastMessage.time : '';

                                const isReceivedMessage = lastMessage && lastMessage.received; // Verificando se a última mensagem é 'received'

                                const maxCharacters = 20; // Defina o número máximo de caracteres desejado
                                const truncatedMessage = lastMessage ? lastMessage.message.replace(/(\r\n|\n|\r)/gm, ' ').slice(0, maxCharacters) : '';

                                const truncatedMessageWithEmoji = lastMessage && lastMessage.image ? '📷 ' + truncatedMessage : truncatedMessage;

                                const isBlocked = blockedUsers.some(user => user.id === conversation.id);

                                conversation.photo = isBlocked ? null : conversation.photo;

                                const base64ImageData = conversation.photo && conversation.photo.assets ? conversation.photo.assets[0].base64 : null;

                                return (
                                    <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple((appConfig.darkTheme ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.18)'), false)} key={conversation.id} style={styles.conversation} disabled={isScrolling}
                                        onPress={() => {
                                            setCurrentConversation(conversation);
                                            setConversationMessages(conversation.messages);
                                            setScreen("notHome");
                                            navigation.navigate('Chat', {
                                                animation: 'slide_from_right', // Definindo a animação de slide
                                            });
                                        }}
                                    >
                                        <View style={[styles.conversation2, { borderColor: appConfig.darkTheme ? '#c1c1c1' : 'rgba(0, 0, 0, 0.2)' }]}>
                                            <TouchableOpacity style={styles.conversationImageContainer} activeOpacity={0.6}
                                                onPress={() => {
                                                    setSelectedConversation(conversation);
                                                    setProfileImageModalVisibility(true);
                                                    //console.log("conversa selecionada: ", conversation.name)
                                                }}
                                            >
                                                <Image
                                                    source={conversation.photo ?
                                                        { uri: `data:${conversation.photo.type};base64,${base64ImageData}` } :
                                                        (appConfig.darkTheme ? profileImageDark : profileImage)
                                                    }
                                                    style={styles.conversationImage}
                                                />
                                            </TouchableOpacity>
                                            <View style={styles.textContainer}>
                                                <View style={{ borderWidth: 0, flexDirection: "row", alignItems: "center" }}>
                                                    <Text style={[styles.personName, { color: appConfig.darkTheme ? 'white' : '#505050' }]}>{conversation.name || "Anônimo"}</Text>
                                                    {isBlocked && <Image source={require('../../attachments/block.webp')} style={{ width: 15, height: 15, marginLeft: 5 }} />}
                                                    {conversation && conversation.added && <Image source={appConfig.darkTheme ? contactIconWhite : contactIcon} style={{ width: 15, height: 15, marginLeft: 5, marginTop: 2 }} />}
                                                </View>
                                                <View style={styles.lastMessageContainer}>
                                                    {isReceivedMessage ? null : !conversation.typing && (
                                                        <>
                                                            {lastMessage && lastMessage.status === 'pending' && (
                                                                <Image source={appConfig.darkTheme ? CheckPendingDark : CheckPending} style={styles.viewCheckIcon} />
                                                            )}
                                                            {lastMessage && lastMessage.status === 'receivedByServer' && (
                                                                <Image source={CheckReceivedByServer} style={styles.viewCheckIcon} />
                                                            )}
                                                            {lastMessage && lastMessage.status === 'receivedByReceptor' && (
                                                                <Image source={CheckReceivedByReceptor} style={styles.viewCheckIcon} />
                                                            )}
                                                            {lastMessage && lastMessage.status === 'viewedByReceptor' && (
                                                                <Image source={CheckViewedByReceptor} style={styles.viewCheckIcon} />
                                                            )}
                                                        </>
                                                    )}
                                                    {!conversation.typing && lastMessage && lastMessage.image && (
                                                        <Image source={require('../../attachments/cam.png')} style={{ width: 14, height: 14, marginRight: 6 }} />
                                                    )}
                                                    <Text style={[styles.lastMessage, { color: appConfig.darkTheme ? '#c1c1c1' : '#808080' }]}>{conversation.typing && !isBlocked && conversation.online ? 'Digitando...' : truncatedMessage}{lastMessage && conversation.typing == false && lastMessage.message.length > maxCharacters ? '...' : ''}</Text>
                                                </View>
                                            </View>

                                            <View style={{ alignItems: 'center', marginRight: 10 }}>
                                                {conversation.naolidas > 0 && (
                                                    <View style={{ backgroundColor: '#ff9900', borderRadius: 250, width: 20, height: 20, marginTop: 5, justifyContent: "center", alignItems: "center" }}>
                                                        <Text style={{ fontWeight: "bold", color: "white", fontSize: 12 }}> {conversation.naolidas} </Text>
                                                    </View>
                                                )}
                                                <Text style={[styles.lastMessageTime, { marginTop: conversation.naolidas ? 5 : 0 }, { color: appConfig.darkTheme ? '#c1c1c1' : '#808080' }]}>{lastMessageTime}</Text>
                                            </View>

                                        </View>

                                    </TouchableNativeFeedback>
                                );
                            })}
                        </ScrollView>
                    )}

                    <TouchableOpacity activeOpacity={0.6} style={[styles.button, { backgroundColor: appConfig.darkTheme ? '#ff9900' : '#ff9900' }]} onPress={() => { if (user !== null) { handleNewConversation() } }}>
                        <Image source={require('../../attachments/icone.png')} style={styles.icon} />
                    </TouchableOpacity>

                </View>

                <View style={[styles.body, { backgroundColor: appConfig.darkTheme ? '#111b21' : 'white' }, { width: width }]}>

                    <View style={styles.section2}>
                        <ScrollView style={{ paddingTop: 6 }}>

                            {addedContacts.map(contact => {
                                const base64ImageData = contact.photo && contact.photo.assets ? contact.photo.assets[0].base64 : null;
                                return (
                                    <TouchableNativeFeedback key={contact && contact.id}
                                        onPress={() => {
                                            let conversation = conversasDoAsync.find(conversation => conversation.id === contact.id);
                                            if (conversation) {
                                                setCurrentConversation(conversation);
                                                setConversationMessages(conversation.messages);
                                            } else {
                                                setCurrentConversation(contact);
                                                setConversationMessages([]);
                                            }
                                            setScreen('notHome')
                                            navigation.navigate('Chat');
                                        }}
                                    >
                                        <View style={styles.conversation}>
                                            <TouchableOpacity style={styles.conversationImageContainer} activeOpacity={0.80}
                                                onPress={() => {
                                                    /*setSelectedConversation(addedContacts);
                                                    setProfileImageModalVisibility(true);
                                                    console.log("conversa selecionada: ", addedContacts.name)*/
                                                }}
                                            >
                                                <Image source={contact && contact.photo ? { uri: `data:${contact.photo.type};base64,${base64ImageData}` } : appConfig.darkTheme ? profileImageDarkTheme : profileImage} style={styles.conversationImage} />
                                            </TouchableOpacity>
                                            <View style={styles.textContainer}>
                                                <Text style={[styles.personName, { color: appConfig.darkTheme ? '#c1c1c1' : '#505050' }]}>{contact && contact.name || "Anônimo"}</Text>
                                                <View style={styles.lastMessageContainer}>

                                                </View>
                                            </View>
                                            <Text style={styles.lastMessageTime}>  </Text>
                                        </View>
                                    </TouchableNativeFeedback>
                                )
                            })}
                        </ScrollView>
                    </View>
                    {addedContacts.length == 0 &&

                        <View style={{ position: 'absolute', width: '100%', height: '100%', justifyContent: "center", alignItems: "center" }}>
                            <Text style={{ color: appConfig.darkTheme ? '#c1c1c1' : "#707070", fontSize: 15 }}> Sua lista de contatos está vazia. </Text>
                        </View>
                    }
                    {/* 
                <View style={styles.section3}>
                   <View style={{ width: "100%" }}>
                        <Text style={{ color: "#707070", fontSize: 15, fontWeight: "bold" }}> Contatos Recentes (Em breve) </Text>
                    </View>
                </View>
                */}
                </View>

            </SwiperFlatList>


            <View style={{ width: "100%", backgroundColor: appConfig.darkTheme ? '#111b21' : 'white' }}>
                <BannerAd
                    size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                    //unitId="ca-app-pub-3940256099942544/9214589741" // Código de teste
                    unitId="ca-app-pub-8509836268613777/9692542598"
                    onAdLoaded={() => {
                        setIsAdLoaded(true);
                    }}
                    onAdClosed={() => {
                        setIsAdLoaded(false);
                    }}
                    onAdFailedToLoad={(error) => {
                        setIsAdLoaded(false);
                    }}
                    visible={isAdLoaded}
                    style={{ width: '100%', display: isAdLoaded ? 'flex' : 'none' }}
                />
            </View>

            <StatusBar style={appConfig.darkTheme ? 'light' : 'dark'} />
            {homeImageViewerModalVisible && (
                <HomePinchGestureHandler />
            )}
            {isLoadingScreenVisible && (
                <Loading />
            )}
            {nullNewConversationModalVisibility &&
                <Modal animationType="none" transparent={true} visible={nullNewConversationModalVisibility}>
                    <View style={[styles.modalContainer]}>
                        <View style={[styles.modalContent, { backgroundColor: appConfig.darkTheme ? '#202c33' : 'white', width: '80%' }]}>
                            <Text style={{ fontSize: 17, fontWeight: "bold", color: appConfig.darkTheme ? 'white' : "#ff9900", marginBottom: 10 }}>Nenhum usuário encontrado!</Text>
                            <View style={{ width: '100%', paddingVertical: 0 }}>
                                <Text style={{ color: appConfig.darkTheme ? '#c1c1c1' : '#808080' }}>Não foram encontrados usuários disponíveis com a seguinte descrição:</Text>
                            </View>
                            <View style={{ width: '100%', paddingVertical: 10 }}>
                                <Text style={{ color: appConfig.darkTheme ? '#c1c1c1' : '#808080' }}>Sexo: {profileOptions.searchGender == 1 ? 'Feminino' : 'Masculino'}</Text>
                                <Text style={{ color: appConfig.darkTheme ? '#c1c1c1' : '#808080' }}>Idade: {profileOptions.searchMinAge} {'-'} {profileOptions.searchMaxAge}</Text>
                            </View>
                            <View style={{ width: '100%', paddingVertical: 10 }}>
                                <Text style={{ color: appConfig.darkTheme ? '#c1c1c1' : '#808080' }}>Por favor, tente novamente mais tarde.</Text>
                                <TouchableOpacity activeOpacity={0.7} onPress={() => { setNullNewConversationModalVisibility(false); setScreen("notHome"); navigation.navigate('Editar Perfil'); }} style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: 10, backgroundColor: '#ff9900', padding: 8, borderRadius: 5 }}>
                                    <Image source={require('../../attachments/gear.png')} style={{ width: 20, height: 20 }} />
                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15, }}>Alterar configurações de busca</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity onPress={() => { setNullNewConversationModalVisibility(false); }}>
                                <Text style={{ fontSize: 17, fontWeight: "bold", color: appConfig.darkTheme ? 'white' : "#ff9900", marginTop: 5 }}>Fechar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            }
        </View>
    )
}

export default Home;

const styles = StyleSheet.create({
    statusbar: {
        height: 24,
        width: "100%",
        backgroundColor: '#ff9900',
    },
    statusbar2: {
        height: 24,
        width: "100%",
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        position: "absolute",
        top: 0
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 5,
        paddingVertical: 10,
        width: '100%',
        height: "8%",
        backgroundColor: '#ff9900',
        elevation: 5,
        //borderTopWidth: 0.3,

    },
    mainContainer: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        backgroundColor: "white",
        position: 'relative',
        paddingTop: 6
    },
    leftHeaderContainer: {
        width: "12%",
        height: '100%',
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: 5,
    },
    centerHeaderContainer: {
        width: "80%",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 0
    },
    menuIcon: {
        width: 30,
        height: 30,
    },
    rightHeaderContainer: {
        width: "8%",
        justifyContent: "center",
        marginLeft: '-1%',
        alignItems: "center",
        borderWidth: 0,
        flexDirection: 'column'
    },
    smallButton: {

    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 23,
        color: "#fff",
        width: "80%",
        textAlign: "center",
    },
    buttonText: {
        color: 'black',
    },
    input: {
        flex: 1,
        height: 40,
    },
    searchButton: {
        padding: 10,
    },
    searchIcon: {
        width: 20,
        height: 20,
    },
    button: {
        position: 'absolute',
        bottom: 23,
        right: 20,
        width: 55,
        height: 55,
        backgroundColor: '#ff9900',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    contatosButton: {
        position: 'absolute',
        bottom: 160,
        right: 20,
        width: 55,
        height: 55,
        backgroundColor: '#ff9900',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    icon: {
        width: 30,
        height: 30,
    },
    contatosIcon: {
        width: 37,
        height: 37,
    },
    containerMenu: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: 'white',
        justifyContent: "flex-start",
    },
    conversation2: {
        flexDirection: 'row',
        alignItems: 'center',
        width: "100%",
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    personImage: {
        width: 50,
        height: 50,
        borderRadius: 200,
    },
    textContainer: {
        flex: 1,
    },
    personName: {
        fontWeight: 'bold',
        fontSize: 16,
        color: "#505050",
    },
    lastMessage: {
        color: '#707070',
    },
    lastMessageTime: {
        color: '#707070',
        fontSize: 12,
    },
    input: {
        flex: 1,
        height: 40,
    },
    searchButton: {
        padding: 10,
    },

    dropdownMenu: {
        position: 'absolute',
        top: 40,
        left: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        elevation: 5,
        padding: 10,
    },
    dropdownItem: {
        paddingVertical: 10,
    },
    dropdownText: {
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.3)'
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        marginTop: 50
    },
    profileContainer: {

        borderRadius: 10,
        alignItems: 'center',
        elevation: 5,
        height: '100%',
        width: '100%',
        borderRadius: 5,
    },
    transparentContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
    },
    viewCheckIcon: {
        width: 14,
        height: 14,
        marginRight: 5,
    },
    lastMessageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    noConversationsText: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 0,
        marginTop: -35,
        color: '#808080',
        borderWidth: 0,
        width: "100%",
    },
    conversationImageContainer: {
        width: 50,
        height: 50,
        elevation: 2,
        marginRight: 10,
        borderRadius: 100,
        overflow: "hidden",
    },
    conversationImage: {
        width: "100%",
        height: "100%",
    },
    profileModalImage: {
        width: "100%",
        height: "100%",
    },
    interrogationIcon: {
        width: 24,
        height: 24,
        marginLeft: 9
    },
    modalOptionText: {
        fontSize: 17,
        color: '#333',
    },
    modalOptionsContainer: {
        paddingVertical: 3,
        paddingHorizontal: 0,
        borderWidth: 0,
        width: "100%"
    },
    optionsModalContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        marginTop: '12%',
        marginRight: '6%'
    },
    optionsModalContent: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        alignItems: 'flex-start',
        elevation: 5,
    },
    addContactContainerChild: {
        height: "100%",
        alignItems: "center",
        flexDirection: "row",
        paddingLeft: 15,
    },
    addContactIconContainer: {
        width: 50,
        height: 50,
        elevation: 2,
        backgroundColor: '#ff9900',
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    addContactIcon: {
        width: "65%",
        height: "65%",
    },
    addContactText: {
        fontWeight: 'bold',
        fontSize: 15,
        color: "#505050",
    },
    body: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        backgroundColor: "white",
        position: 'relative',
    },
    section1: {
        width: "100%",
        padding: 0,
        height: "10%",
    },
    section2: {
        width: "100%",
        height: "100%",
        paddingLeft: 0,
    },
    section3: {
        width: "100%",
        height: "80%",
        paddingLeft: 10,
    },
    conversation: {
        flexDirection: 'row',
        alignItems: 'center',
        width: "100%",
        paddingLeft: 10,
        paddingVertical: 6
    },
});