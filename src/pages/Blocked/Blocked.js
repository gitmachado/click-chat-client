import { StatusBar } from 'expo-status-bar';
import React, { useState, useContext, useEffect } from 'react';
import { ScrollView, View, Text, BackHandler, Button, StyleSheet, Image, TouchableOpacity, Modal, ToastAndroid, TouchableNativeFeedback } from 'react-native';
import { AppContext } from '../../Context/AppContext';
import { SocketContext } from '../../Context/SocketContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

const profileImage = '../../attachments/perfil.png';
const profileImageDarkTheme = '../../attachments/perfilDarkTheme.png';

const Blocked = () => {

    const { blockedUsers, appConfig, userProfile, setUserProfile, addedContacts, setAddedContacts, setCurrentConversation, setConversationMessages, conversasDoAsync, setConversasDoAsync } = useContext(AppContext);
    const socket = useContext(SocketContext);
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={[styles.statusbar, { backgroundColor: appConfig.darkTheme ? '#202c33' : '#ff9900' }]}></View>
            <View style={[styles.header, { backgroundColor: appConfig.darkTheme ? '#202c33' : '#ff9900' }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Image source={require('../../attachments/iconeVoltar.png')} style={styles.backIcon} />
                </TouchableOpacity>
                <View style={styles.headerLeft}>

                    <View style={styles.headerTextContainer}>
                        <Text style={styles.profileName}> Usuários Bloqueados </Text>
                    </View>
                </View>
                <StatusBar style={appConfig.darkTheme ? 'light' : 'dark'} />
            </View>
            <View style={{ width: '100%', flex: 1, backgroundColor: appConfig.darkTheme ? '#111b21' : 'white', paddingTop: 6 }}>

                {blockedUsers.map(blocked => {
                    const base64ImageData = blocked.photo && blocked.photo.assets ? blocked.photo.assets[0].base64 : null;
                    return (
                        <TouchableNativeFeedback key={blocked && blocked.id}
                            onPress={() => {
                                setCurrentConversation(blocked);
                                setConversationMessages(blocked.messages);
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
                                    <Image source={blocked && blocked.photo ? { uri: `data:${blocked.photo.type};base64,${base64ImageData}` } : appConfig.darkTheme ? require(profileImageDarkTheme) : require(profileImage)} style={styles.conversationImage} />
                                </TouchableOpacity>
                                <View style={styles.textContainer}>
                                    <Text style={[styles.personName, { color: appConfig.darkTheme ? '#c1c1c1' : '#505050' }]}>{blocked && blocked.name || "Anônimo"}</Text>
                                    <View style={styles.lastMessageContainer}>

                                    </View>
                                </View>
                                <Text style={styles.lastMessageTime}>  </Text>
                            </View>
                        </TouchableNativeFeedback>
                    )
                })}

                {blockedUsers.length == 0 && (

                    <View style={{ width: '100%', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: appConfig.darkTheme ? 'white' : '#505050'}}> Nenhum usuário bloqueado. </Text>
                    </View>

                )}

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusbar: {
        height: 24,
        width: "100%",
        backgroundColor: '#ff9900',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 15,
        paddingVertical: 10,
        width: '100%',
        height: "8%",
        backgroundColor: '#ff9900',
        elevation: 5,
    },
    backButton: {
        padding: 5,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 5,
        justifyContent: 'space-between',
        width: "60%",
        marginLeft: 5
    },
    headerTextContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: "center",
        marginTop: -4,
    },
    body: {
        height: "89%",
        width: "100%",
        alignItems: "center",
        backgroundColor: "white",
        position: 'relative',
    },
    backIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
        justifyContent: 'flex-end',
        width: "30%",
        borderWidth: 0,
    },
    profileName: {
        fontWeight: "bold",
        fontSize: 18,
        color: "white",
        marginTop: 1
    },
    section1: {
        width: "100%",
        padding: 0,
        height: "10%",
    },
    section2: {
        width: "100%",
        height: "90%",
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
        paddingLeft: 15,
        paddingVertical: 8
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
    personName: {
        fontWeight: "bold",
        color: "#505050",
        fontSize: 15,
    },
});

export default Blocked;