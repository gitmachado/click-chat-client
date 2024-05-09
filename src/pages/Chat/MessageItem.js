import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ToastAndroid } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppContext } from '../../Context/AppContext';

const MessageItem = ({ item, dependencies }) => {
    const [isComponentMounted, setIsComponentMounted] = useState(true);
    const [isAllImagesAllowed, setIsAllImagesAllowed] = useState(false);

    const { appConfig, setImageViewerPhoto, setChatImageViewerModalVisible } = useContext(AppContext);

    useFocusEffect(
        React.useCallback(() => {
            // Lógica a ser executada quando a tela ganha foco
            setIsComponentMounted(true);
            return () => {
                // Lógica a ser executada quando a tela perde foco
                setIsComponentMounted(false);
            };
        }, [])
    );

    const AllowImage = (messageID) => {
        const newConversasDoAsync = [...dependencies.conversasDoAsync];

        for (let i = 0; i < newConversasDoAsync.length; i++) {
            for (let j = 0; j < newConversasDoAsync[i].messages.length; j++) {
                if (newConversasDoAsync[i].messages[j].id === messageID) {
                    newConversasDoAsync[i].messages[j].isImageAllowed = true;
                    //console.log('Permitida com sucesso!');
                    dependencies.setConversasDoAsync(newConversasDoAsync);
                    dependencies.setConversationMessages(newConversasDoAsync[i].messages);
                    return true;
                }
            }
        }
        return false;
    };

    const AllowAllImages = (messageID) => {
        const newConversasDoAsync = [...dependencies.conversasDoAsync];

        for (let i = 0; i < newConversasDoAsync.length; i++) {
            for (let j = 0; j < newConversasDoAsync[i].messages.length; j++) {
                if (newConversasDoAsync[i].messages[j].id === messageID) {
                    newConversasDoAsync[i].messages[j].isImageAllowed = true;
                    newConversasDoAsync[i].AllowAllImages = true;
                    //console.log(newConversasDoAsync[i]);
                    dependencies.setConversasDoAsync(newConversasDoAsync);
                    dependencies.setConversationMessages(newConversasDoAsync[i].messages);
                    dependencies.setCurrentConversation(newConversasDoAsync[i]);
                    return true;
                }
            }
        }
        return false;
    };

    const RefuseImage = (messageID) => {
        const newConversasDoAsync = [...dependencies.conversasDoAsync];

        for (let i = 0; i < newConversasDoAsync.length; i++) {
            for (let j = 0; j < newConversasDoAsync[i].messages.length; j++) {
                if (newConversasDoAsync[i].messages[j].id === messageID) {
                    newConversasDoAsync[i].messages[j].isImageAllowed = 'refused';
                    //console.log('Recusada com sucesso!');
                    dependencies.setConversasDoAsync(newConversasDoAsync);
                    dependencies.setConversationMessages(newConversasDoAsync[i].messages);
                    return true;
                }
            }
        }
        return false;
    };

    const renderStatusIcon = () => {
        switch (item.status) {
            case 'pending':
                return require('../../attachments/CheckPending.png');
            case 'receivedByServer':
                return require('../../attachments/CheckReceivedByServer.png');
            case 'receivedByReceptor':
                return require('../../attachments/CheckReceivedByReceptor.png');
            case 'viewedByReceptor':
                return require('../../attachments/CheckViewedToReceptor.png');
            default:
                return null;
        }
    };

    return isComponentMounted ? (
        item.image ?
            <View style={item.received ? [styles.otherMessage, { flexDirection: 'column', width: 206, paddingHorizontal: 3, paddingVertical: 3, justifyContent: 'center', alignItems: 'center' }, { backgroundColor: appConfig.darkTheme ? '#202c33' : '#F4F4F4' }] : [styles.userMessage, { flexDirection: 'column', width: 206, paddingHorizontal: 3, paddingVertical: 3, justifyContent: 'center', alignItems: 'center' }, { backgroundColor: appConfig.darkTheme ? '#c4ccb8' : '#DCF8C6' }]}>
                <TouchableOpacity activeOpacity={item.isImageAllowed == true || dependencies && dependencies.currentConversation && dependencies.currentConversation.AllowAllImages == true || !item.received ? 0.7 : 1} onPress={() => { if (item.isImageAllowed == true || dependencies.currentConversation.AllowAllImages == true || !item.received) { setImageViewerPhoto(item.image); setChatImageViewerModalVisible(true); } }} style={{ width: 200, height: item.isImageAllowed == 'refused' && item.received == true ? 50 : 200, overflow: 'hidden', borderRadius: 8 }}>
                    <Image source={{ uri: `data:${item.image.type};base64,${item.image.base64}` }} style={{ width: '100%', height: '100%', }} />
                    {item.isImageAllowed == false && item.received == true && dependencies && dependencies.currentConversation && dependencies.currentConversation.AllowAllImages == undefined && (
                        <View style={{ backgroundColor: appConfig.darkTheme ? '#111b21' : '#808080', width: '100%', height: '100%', position: 'absolute', justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ borderWidth: 0, width: '100%', height: '100%', justifyContent: 'space-around', alignItems: 'center' }}>
                                <View style={{ padding: 0, borderRadius: 6, borderWidth: 0, height: '20%', alignItems: 'center', justifyContent: 'flex-end' }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Nova imagem recebida:</Text>
                                </View>
                                <View style={{ borderWidth: 0, height: '80%', justifyContent: 'space-around' }}>
                                    <TouchableOpacity onPress={() => { AllowImage(item.id) }} activeOpacity={0.5} style={{ borderWidth: 0, backgroundColor: appConfig.darkTheme ? '#202c33' : 'white', padding: 8, borderRadius: 6, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: appConfig.darkTheme ? 'white' : '#202020', }}>PERMITIR</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { RefuseImage(item.id) }} activeOpacity={0.5} style={{ borderWidth: 0, backgroundColor: appConfig.darkTheme ? '#202c33' : 'white', padding: 8, borderRadius: 6, marginTop: -20, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: appConfig.darkTheme ? 'white' : '#202020', }}>RECUSAR</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { AllowAllImages(item.id) }} activeOpacity={0.5} style={{ borderWidth: 0, backgroundColor: appConfig.darkTheme ? '#202c33' : 'white', padding: 8, borderRadius: 6, marginTop: -20, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: appConfig.darkTheme ? 'white' : '#202020', }}>SEMPRE PERMITIR</Text>
                                        <Text style={{ color: appConfig.darkTheme ? 'white' : '#202020', fontSize: 10 }}>(Apenas nessa conversa)</Text>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </View>
                    )}
                    {item.isImageAllowed == 'refused' && item.received == true && (
                        <View style={{ backgroundColor: appConfig.darkTheme ? '#111b21' : 'gray', width: '100%', height: '100%', position: 'absolute', justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ borderWidth: 0, width: '100%', height: '100%', justifyContent: 'space-around', alignItems: 'center' }}>
                                <View style={{ padding: 0, borderRadius: 6, borderWidth: 0, height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: 'white', textAlign: 'center' }}>Você recusou esta imagem!</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </TouchableOpacity>
                <View style={{ flexDirection: item.message.length <= 15 ? 'row' : 'column', marginBottom: 2 }}>
                    <View style={{ borderWidth: 0, width: item.message.length <= 15 ? '70%' : '100%', paddingHorizontal: 5, paddingTop: 5 }}>
                        <Text style={item.received ? [{ fontSize: 16, color: appConfig.darkTheme ? 'white' : 'black', maxWidth: '100%', width: '100%', borderWidth: 0 }] : [styles.messageText]}>{item.message}</Text>
                    </View>

                    <View style={[styles.messageTime, { flexDirection: 'row', alignItems: 'flex-end', borderWidth: 0, width: item.message.length <= 15 ? '30%' : '100%', marginLeft: 0, paddingRight: 5 }]}>
                        <Text style={item.received ? [{ color: appConfig.darkTheme ? '#808080' : '#777', fontSize: 12 }] : [styles.messageTimeText, { color: appConfig.darkTheme ? '#606060' : '#808080' }]}>{item.time}</Text>
                        {item.received ? null : (
                            <View style={styles.iconContainer}>
                                {item.status && <Image source={renderStatusIcon()} style={[styles.icon]} />}
                            </View>
                        )}
                    </View>
                </View>
            </View>
            :
            <View style={item.received ? [styles.otherMessage, { backgroundColor: appConfig.darkTheme ? '#202c33' : '#F4F4F4' }] : [styles.userMessage, { backgroundColor: appConfig.darkTheme ? '#c4ccb8' : '#DCF8C6' }]}>
                <Text style={item.received ? [{ fontSize: 16, color: appConfig.darkTheme ? 'white' : 'black', maxWidth: '85%' }] : [styles.messageText]}>{item.message}</Text>
                <View style={styles.messageTime}>
                    <Text style={item.received ? [{ color: appConfig.darkTheme ? '#808080' : '#777', fontSize: 12 }] : [styles.messageTimeText, { color: appConfig.darkTheme ? '#606060' : '#808080' }]}>{item.time}</Text>
                </View>
                {item.received ? null : (
                    <View style={styles.iconContainer}>
                        {item.status && <Image source={renderStatusIcon()} style={[styles.icon]} />}
                    </View>
                )}
            </View>
    ) : null;
};

export default MessageItem;

const styles = StyleSheet.create({
    userMessage: {
        backgroundColor: '#DCF8C6',
        alignSelf: 'flex-end',
        paddingHorizontal: 9,
        paddingVertical: 6,
        margin: 5,
        borderRadius: 10,
        flexDirection: "row",
        //width: '90%',
        elevation: 1,
    },
    otherMessage: {
        backgroundColor: '#F4F4F4',
        alignSelf: 'flex-start',  // Alterado para 'flex-start' para alinhar à esquerda
        paddingHorizontal: 9,
        paddingVertical: 6,
        margin: 5,
        borderRadius: 10,
        flexDirection: 'row',
        //width: '90%',
        elevation: 1,

    },
    messageText: {
        fontSize: 16,
        color: 'black',
        //borderWidth: 1,
        maxWidth: '85%'
    },
    messageTime: {
        marginLeft: 8,
        justifyContent: 'flex-end',
    },
    messageTimeText: {
        fontSize: 12,
        color: '#777',
    },
    iconContainer: {
        marginLeft: 5,
        justifyContent: 'flex-end',
        marginBottom: 2,
    },
    icon: {
        width: 12,
        height: 12,
    },
});


/*
userMessage: {
        backgroundColor: '#DCF8C6',
        alignSelf: 'flex-end',
        paddingHorizontal: 9,
        paddingVertical: 6,
        margin: 5,
        borderRadius: 10,
        flexDirection: "row",
        Width: '90%',
        elevation: 2,
    },
    otherMessage: {
        backgroundColor: '#F4F4F4',
        alignSelf: 'flex-end',
        paddingHorizontal: 9,
        paddingVertical: 6,
        margin: 5,
        borderRadius: 10,
        flexDirection: "row",
        Width: '90%',
        elevation: 2,
    },
    messageText: {
        fontSize: 16,
        color: "black",
    },
    messageTime: {
        marginLeft: 8,
        justifyContent: "flex-end",
    },
    messageTimeText: {
        fontSize: 12,
        color: "#777",
    },
    iconContainer: {
        marginLeft: 5,
        justifyContent: "flex-end",
        marginBottom: 2,
    },
    icon: {
        width: 12,
        height: 12,
    },
*/