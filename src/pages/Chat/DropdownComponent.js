import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View, Image, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { AppContext } from '../../Context/AppContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const DropdownComponent = ({ deleteConversationRef }) => {
    const navigation = useNavigation();
    const [value, setValue] = useState(null);
    const [isFocus, setIsFocus] = useState(true);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [ActivityIndicatorVisible, setActivityIndicatorVisible] = useState(false);
    const [isBlockedRequestModalVisible, setIsBlockedRequestModalVisible] = useState(false);

    const { addedContacts, setAddedContacts, socket, setBlockedUsers, blockedUsers, appConfig, setScreen, currentConversation, conversasDoAsync, setConversasDoAsync, setCurrentConversation, setConversationMessages } = useContext(AppContext);

    const isBlocked = currentConversation && currentConversation.id && blockedUsers && blockedUsers.length > 0 ? blockedUsers.some(user => {
        if (!user || !currentConversation) {
            return false; // Se user for undefined ou null, retorne false
        }
        return user.id === currentConversation.id; // Comparar user.id com currentConversation.id
    }) : null;

    const isInAddedContacts = addedContacts && addedContacts.length > 0 ? addedContacts.some(contact => {
        if (!contact || !currentConversation) {
            return false; // Se contact for undefined ou null, retorne false
        }
        return contact.id === currentConversation.id; // Comparar contact.id com currentConversation.id
    }) : false;


    const data = [
        { label: currentConversation && currentConversation.added || isInAddedContacts ? "Remover contato" : "Adicionar contato", value: '1' },
        { label: 'Excluir conversa', value: '2' },
        { label: isBlocked ? 'Desbloquear' : 'Bloquear', value: '3' },
        //{ label: 'Denunciar (Em breve)', value: '3' },
    ];
    function handleDropdownChange(selectedItem) {
        //console.log(selectedItem.label)
        if (selectedItem.label == 'Adicionar contato') {
            addContact();
        }
        if (selectedItem.label == 'Remover contato') {
            removeContact();
        }
        if (selectedItem.label == 'Excluir conversa') {
            setConfirmModalVisible(true);
        }
        if (selectedItem.label === 'Bloquear' || selectedItem.label === 'Desbloquear') {
            setIsBlockedRequestModalVisible(true);
        }
    }

    async function deleteConversation() {
        setActivityIndicatorVisible(true);
        try {
            const storedConversations = await AsyncStorage.getItem('allConversations');
            //console.log("TESTE: ", storedConversations)
            //console.log("CURRENT: ", currentConversation)
            if (storedConversations) {
                const parsedConversations = JSON.parse(storedConversations);
                const updatedConversations = parsedConversations.filter(conversa => conversa.id !== currentConversation.id);
                await AsyncStorage.setItem('allConversations', JSON.stringify(updatedConversations));
                const updatedConversasDoAsync = conversasDoAsync.filter(conversa => conversa.id !== currentConversation.id);
                setConversasDoAsync(updatedConversasDoAsync);
                const updatedContacts = addedContacts.map((contact) => {
                    if (contact.id == currentConversation.id) {
                        return { ...contact, messages: [] };
                    }
                    return contact;
                });
                setAddedContacts(updatedContacts);
            }
        } catch (error) {
            console.error('Erro ao excluir a conversa do AsyncStorage:', error);
        }

        setCurrentConversation(null);
        setConversationMessages(null);

        setConfirmModalVisible(false);
        setActivityIndicatorVisible(false);
        navigation.navigate('Home');
    }

    const addContact = async () => {
        const updatedConversasDoAsync = conversasDoAsync.map(conversation => {
            if (conversation.id === currentConversation.id) {
                return { ...conversation, added: true };
            }
            return conversation;
        });
        setConversasDoAsync(updatedConversasDoAsync);
        setCurrentConversation(prevConversation => ({ ...prevConversation, added: true }));
        setAddedContacts(prevContacts => [...prevContacts, currentConversation]);
        setConfirmModalVisible(false);
    }

    const removeContact = async () => {
        const updatedConversasDoAsync = conversasDoAsync.map(conversation => {
            if (conversation.id === currentConversation.id) {
                return { ...conversation, added: false };
            }
            return conversation;
        });
        setConversasDoAsync(updatedConversasDoAsync);
        setCurrentConversation(prevConversation => ({ ...prevConversation, added: false }));
        setAddedContacts(prevContacts =>
            prevContacts.filter(contact => contact.id !== currentConversation.id)
        );
        setConfirmModalVisible(false);
    }

    const blockUser = async () => {
        const isUserAlreadyBlocked = blockedUsers.some(user => user.id === currentConversation.id);
        if (!isUserAlreadyBlocked) {
            const updatedBlockedUsers = [...blockedUsers, { ...currentConversation, messages: [] }];
            socket.emit('updateBlockList', updatedBlockedUsers);
            setBlockedUsers(updatedBlockedUsers);
            //console.log('Usuário bloqueado:', currentConversation.name);
        } else {
            //console.log('O usuário já está bloqueado.');
        }
        //console.log('Lista de usuários bloqueados:', blockedUsers);
    };

    const unblockUser = async () => {
        const isUserBlocked = blockedUsers.some(user => user.id === currentConversation.id);
        if (isUserBlocked) {
            const updatedBlockedUsers = blockedUsers.filter(user => user.id !== currentConversation.id);
            socket.emit('updateBlockList', updatedBlockedUsers);
            setBlockedUsers(updatedBlockedUsers);
            //console.log('Usuário desbloqueado:', currentConversation.id);
        } else {
            //console.log('O usuário não está bloqueado.');
        }
        //console.log('Lista de usuários bloqueados atualizada:', blockedUsers);
    };

    return (
        <View style={styles.container}>
            <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                itemContainerStyle={{ width: '100%', paddingVertical: 5 }}
                containerStyle={[styles.containerStyle, { backgroundColor: appConfig.darkTheme ? '#202c33' : 'white' }]}
                activeColor={'transparent'}
                dropdownPosition="bottom"
                data={data}
                labelField="label"
                valueField="value"
                searchField="search"
                placeholder=' '
                searchPlaceholder="Search..."
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                showsVerticalScrollIndicator={false}
                onChange={item => {
                    setValue(item.value);
                    setIsFocus(false);
                }}
                visibleSelectedItem={false}
                mode={'default'}
                search={false}
                renderRightIcon={() => (
                    <Image style={styles.rightIcon} source={require('../../attachments/options.png')} />
                )}
                renderItem={(item, selected) => (
                    <View style={[styles.item, selected && { backgroundColor: 'transparent' }]}>
                        <Text style={[styles.itemText, { color: appConfig.darkTheme ? 'white' : '#505050' }]}>{item.label}</Text>
                    </View>
                )}
                onChange={(selectedItem) => handleDropdownChange(selectedItem)}
            />
            {isBlockedRequestModalVisible && (
                <Modal
                    animationType="none"
                    transparent={true}
                    visible={isBlockedRequestModalVisible}
                >
                    <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: '85%', height: 200, borderRadius: 8, elevation: 5, backgroundColor: appConfig.darkTheme ? '#202c33' : 'white', alignItems: 'center', justifyContent: 'space-around' }}>
                            {isBlocked ? (
                                <View style={{ width: '85%' }}>
                                    <Text style={{ color: appConfig.darkTheme ? 'white' : '#505050', fontSize: 17, paddingVertical: 10, textAlign: 'center' }}>Deseja Desbloquear <Text style={{ fontWeight: 'bold' }}>{currentConversation.name}</Text>?</Text>
                                    <Text style={{ color: appConfig.darkTheme ? 'white' : '#505050', textAlign: 'center' }}>Usuários desbloqueados poderão enviar mensagens para você novamente.</Text>
                                    <Text style={{ color: appConfig.darkTheme ? 'white' : '#505050', paddingVertical: 10, textAlign: 'center', fontSize: 13 }}>Obs: <Text style={{ fontWeight: 'bold', color: appConfig.darkTheme ? 'white' : '#505050' }}>{currentConversation.name}</Text> não será notificado.</Text>
                                </View>
                            ) : (
                                <View style={{ width: '85%' }}>
                                        <Text style={{ color: appConfig.darkTheme ? 'white' : '#505050', fontSize: 17, paddingVertical: 10, textAlign: 'center' }}>Deseja bloquear <Text style={{ fontWeight: 'bold' }}>{currentConversation.name}</Text>?</Text>
                                        <Text style={{ color: appConfig.darkTheme ? 'white' : '#505050', textAlign: 'center' }}>Usuários bloqueados não podem enviar mensagens para você.</Text>
                                        <Text style={{ color: appConfig.darkTheme ? 'white' : '#505050', paddingVertical: 10, textAlign: 'center', fontSize: 13 }}>Obs: <Text style={{ fontWeight: 'bold', color: appConfig.darkTheme ? 'white' : '#505050' }}>{currentConversation.name}</Text> não será notificado.</Text>
                                </View>
                            )}
                            <View style={{ padding: 5, flexDirection: 'row', width: '80%', justifyContent: 'space-between' }}>
                                <TouchableOpacity onPress={() => { setIsBlockedRequestModalVisible(false); }} activeOpacity={0.7} style={{ padding: 5 }}>
                                    <Text style={{ color: appConfig.darkTheme ? 'white' : '#ff9900', fontSize: 17, fontWeight: 'bold' }}> Cancelar </Text>
                                </TouchableOpacity>
                                {isBlocked ? (
                                    <TouchableOpacity onPress={() => { unblockUser(); setIsBlockedRequestModalVisible(false); }} activeOpacity={0.7} style={{ padding: 5 }}>
                                        <Text style={{ color: appConfig.darkTheme ? 'white' : '#ff9900', fontSize: 17, fontWeight: 'bold' }}> Desbloquear </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity onPress={() => { blockUser(); setIsBlockedRequestModalVisible(false); }} activeOpacity={0.7} style={{ padding: 5 }}>
                                        <Text style={{ color: appConfig.darkTheme ? 'white' : '#ff9900', fontSize: 17, fontWeight: 'bold' }}> Bloquear </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
            <Modal
                animationType="none"
                transparent={true}
                visible={confirmModalVisible}
            >
                <TouchableOpacity
                    style={styles.confirmModalContainer}
                    activeOpacity={1}
                >
                    <View style={[styles.confirmModalContent, { backgroundColor: appConfig.darkTheme ? '#202c33' : 'white' }]}>
                        <Text style={[styles.confirmModalText, { color: appConfig.darkTheme ? 'white' : '#808080' }]}>
                            {'Deseja mesmo excluir a conversa selecionada?'}
                        </Text>
                        <View style={styles.confirmModalButtons}>
                            <TouchableOpacity onPress={() => { if (!ActivityIndicatorVisible) { setConfirmModalVisible(false); } }}>
                                <Text style={[styles.confirmButtonText, { color: appConfig.darkTheme ? 'white' : '#ff9900' }]}>Não</Text>
                            </TouchableOpacity>
                            <View style={{ width: 50 }}>
                                {ActivityIndicatorVisible && (
                                    <ActivityIndicator style={{ marginBottom: 5 }} size="large" color={appConfig.darkTheme ? 'white' : "#ff9900"} />
                                )}
                            </View>
                            <TouchableOpacity onPress={() => { if (!ActivityIndicatorVisible) { deleteConversation(); } }}>
                                <Text style={[styles.confirmButtonText, { color: appConfig.darkTheme ? 'white' : '#ff9900' }]}>Sim</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default DropdownComponent;

const styles = StyleSheet.create({
    container: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    dropdown: {
        paddingHorizontal: 8,
        width: 45,
        height: '100%',
        marginRight: 3
    },
    placeholderStyle: {
        // Adicione os estilos inline correspondentes aqui, se houver
    },
    inputSearchStyle: {
        // Adicione os estilos inline correspondentes aqui, se houver
    },
    iconStyle: {
        // Adicione os estilos inline correspondentes aqui, se houver
    },
    containerStyle: {
        width: 200,
        marginLeft: -170,
        marginTop: 5,
        borderRadius: 5,
        paddingTop: 10,
        paddingHorizontal: 15,
        borderWidth: 0,
        elevation: 10,
    },
    rightIcon: {
        width: 30,
        height: 30,
    },
    item: {
        paddingBottom: 10
    },
    itemText: {
        fontSize: 16,
    },
    confirmModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmModalContent: {
        backgroundColor: '#fff',
        padding: 10,
        paddingTop: 21,
        borderRadius: 5,
        alignItems: 'center',
        width: '80%',
        elevation: 5,
    },
    confirmModalText: {
        fontSize: 18,
        marginBottom: 10,
        color: '#333',
    },
    confirmModalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '80%',
        alignItems: 'center',
        height: 40,
    },
    confirmButtonText: {
        fontSize: 16,
        color: '#ff9900',
        fontWeight: 'bold',
    },
});
