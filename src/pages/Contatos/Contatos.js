import { StatusBar } from 'expo-status-bar';
import React, { useState, useContext, useEffect } from 'react';
import { ScrollView, View, Text, BackHandler, Button, StyleSheet, Image, TouchableOpacity, Modal, ToastAndroid, TouchableNativeFeedback } from 'react-native';
import { AppContext } from '../../Context/AppContext';
import { SocketContext } from '../../Context/SocketContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

const profileImage = '../../attachments/perfil.png';
const profileImageDarkTheme = '../../attachments/perfilDarkTheme.png';

const Contatos = ({ navigation }) => {

    const { isDarkThemeEnabled, userProfile, setUserProfile, addedContacts, setAddedContacts, setCurrentConversation, setConversationMessages, conversasDoAsync, setConversasDoAsync } = useContext(AppContext);
    const socket = useContext(SocketContext);

    return (
        <View style={styles.container}>
            <View style={[styles.body, { backgroundColor: isDarkThemeEnabled ? '#111b21' : 'white' }]}>
                <View style={styles.section1}>
                    <TouchableNativeFeedback style={styles.addContactContainer}>
                        <View style={styles.addContactContainerChild}>
                            <View style={styles.addContactIconContainer} onPress={() => { }}>
                                <Image source={require('../../attachments/addContact.png')} style={styles.addContactIcon} />
                            </View>
                            <View style={styles.addContactTextContainer}>
                                <Text style={[styles.addContactText, { color: isDarkThemeEnabled ? '#c1c1c1' : '#505050'}]}> Pesquisar Contato (Em Breve) </Text>
                            </View>
                        </View>
                    </TouchableNativeFeedback>
                </View>
                <View style={styles.section2}>
                    <View style={{ width: "100%" }}>
                        <Text style={{ color: isDarkThemeEnabled ? '#c1c1c1' : '#505050', fontSize: 15, fontWeight: "bold", paddingLeft: 10 }}> Meus contatos {addedContacts.length > 0 && "(" + addedContacts.length + ")"} </Text>
                    </View>
                    <ScrollView style={{ }}>

                        {addedContacts.length == 0 &&

                            <View style={{ height: 600, justifyContent: "center", alignItems: "center" }}>
                                <Text style={{ color: isDarkThemeEnabled ? '#c1c1c1' : "#707070" }}> Sua lista de contatos está vazia. </Text>
                            </View>
                        }

                        {addedContacts.map(contact => {
                            const base64ImageData = contact.photo && contact.photo.assets ? contact.photo.assets[0].base64 : null;
                            return (
                                <TouchableNativeFeedback key={contact && contact.id}
                                    onPress={() => {
                                        //let conversation = conversasDoAsync.find(conversation => conversation.id === contact.id);
                                        contact.added = true;
                                        setCurrentConversation(contact);
                                        setConversationMessages(contact.messages);
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
                                            <Image source={contact && contact.photo ? { uri: `data:${contact.photo.type};base64,${base64ImageData}` } : isDarkThemeEnabled ? require(profileImageDarkTheme) : require(profileImage)} style={styles.conversationImage} />
                                        </TouchableOpacity>
                                        <View style={styles.textContainer}>
                                            <Text style={[styles.personName, { color: isDarkThemeEnabled ? '#c1c1c1' : '#505050' }]}>{contact && contact.name || "Anônimo"}</Text>
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
                {/* 
                <View style={styles.section3}>
                   <View style={{ width: "100%" }}>
                        <Text style={{ color: "#707070", fontSize: 15, fontWeight: "bold" }}> Contatos Recentes (Em breve) </Text>
                    </View>
                </View>
                */}
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
        flex: 1,
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
    addContactTextContainer: {
        
    },
    addContactText: {
        fontWeight: 'bold',
        fontSize: 15,
        color: "#505050",
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

export default Contatos;
