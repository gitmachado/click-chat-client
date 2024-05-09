import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text, Modal, TouchableNativeFeedback } from 'react-native';
import { AppContext } from '../../Context/AppContext';
import { useFocusEffect } from '@react-navigation/native';

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import profileImage from '../../attachments/perfil.png';
import profileImageDark from '../../attachments/perfilDarkTheme.png'

import DropdownComponent from './DropdownComponent';

const HeaderComponent = ({ navigation, deleteConversationRef }) => {
    const { blockedUsers, appConfig, currentConversation, addedContacts, setAddedContacts, conversasDoAsync, setConversasDoAsync, setCurrentConversation, setImageViewerPhoto, setChatImageViewerModalVisible } = useContext(AppContext);
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [confirmAction, setConfirmAction] = useState('');
    const [isComponentMounted, setIsComponentMounted] = useState(true);
    const [base64ImageData, setBase64ImageData] = useState(null);
    const handleConfirmActionRef = useRef(null);
    const [profileImageModalVisibility, setProfileImageModalVisibility] = useState(false);

    const isBlocked = currentConversation && currentConversation.id && blockedUsers && blockedUsers.length > 0 ? blockedUsers.some(user => {
        if (!user) {
            return false; // Se user for undefined ou null, retorne false
        }
        return user.id === currentConversation.id; // Comparar user.id com currentConversation.id
    }) : null;

    useEffect(() => {
        setBase64ImageData(currentConversation && currentConversation.photo && currentConversation.photo.assets ? currentConversation.photo.assets[0].base64 : null);
        //console.log("atualizei o base64 do header")
    }, [currentConversation ? currentConversation.photo : []]);

    let lastSeen = null;

    if (currentConversation !== null) {
        lastSeen = formatDistanceToNow(currentConversation.lastSeen, { addSuffix: true, locale: ptBR });
    }

    useFocusEffect(
        React.useCallback(() => {

            return () => {

            };
        }, [])
    );

    const addContact = async () => {

        const updatedConversasDoAsync = conversasDoAsync.map(conversation => {
            // Se a conversa corresponder à currentConversation
            if (conversation.id === currentConversation.id) {
                // Atualiza o atributo added do objeto correspondente em conversasDoAsync
                return { ...conversation, added: true };
            }
            // Se não houver correspondência, retorna a conversa original
            return conversation;
        });

        // Atualiza conversasDoAsync com o novo array de conversas atualizadas
        setConversasDoAsync(updatedConversasDoAsync);

        // Atualiza o atributo added em currentConversation
        setCurrentConversation(prevConversation => ({ ...prevConversation, added: true }));

        // Adiciona currentConversation aos contatos adicionados
        setAddedContacts(prevContacts => [...prevContacts, currentConversation]);

        // Fecha o modal
        setModalVisible(false);

    }

    const removeContact = async () => {

        const updatedConversasDoAsync = conversasDoAsync.map(conversation => {
            // Se a conversa corresponder à currentConversation
            if (conversation.id === currentConversation.id) {
                // Atualiza o atributo added do objeto correspondente em conversasDoAsync
                return { ...conversation, added: false };
            }
            // Se não houver correspondência, retorna a conversa original
            return conversation;
        });

        // Atualiza conversasDoAsync com o novo array de conversas atualizadas
        setConversasDoAsync(updatedConversasDoAsync);

        setCurrentConversation(prevConversation => ({ ...prevConversation, added: false }));

        setAddedContacts(prevContacts =>
            prevContacts.filter(contact => contact.id !== currentConversation.id)
        );

        setModalVisible(false);

    }

    const handleOpenModal = () => {
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    const handleOptionSelected = (option) => {
        if (option === 'Excluir Conversa' || option === 'Denunciar Usuário') {
            // Se a opção for "Excluir Conversa" ou "Denunciar Usuário", abre o modal de confirmação
            handleCloseModal(); // Fecha o modal primário antes de abrir o modal secundário
            setConfirmAction(option);
            setConfirmModalVisible(true);
        }
    };

    const handleCloseConfirmModal = () => {
        // Fecha o modal de confirmação apenas se não houver uma ação de confirmação pendente
        if (!confirmAction) {
            setConfirmModalVisible(false);
        }
    };

    useEffect(() => {
        handleConfirmActionRef.current = async (confirmed) => {
            //console.log(`Ação confirmada para ${confirmAction}: ${confirmed ? 'Sim' : 'Não'}`);
            // Adicione sua lógica aqui...

            // Fecha o modal de confirmação
            setConfirmAction('');
            setConfirmModalVisible(false);

            if (confirmed && confirmAction === 'Excluir Conversa') {

                deleteConversationRef(confirmed, confirmAction);
                setIsComponentMounted(false);

            }

        };
    }, [deleteConversationRef, confirmAction]);

    return (
        <View style={[styles.header, { backgroundColor: appConfig.darkTheme ? '#202c33' : '#ff9900' }]}>
            <TouchableOpacity activeOpacity={0.5} style={styles.backButton} onPress={() => navigation.navigate('Home')}>
                <Image source={require('../../attachments/iconeVoltar.png')} style={styles.backIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setProfileImageModalVisibility(true); }} activeOpacity={0.6} style={styles.headerLeft}>
                <View style={styles.conversationImageContainer}>
                    <Image source={currentConversation && currentConversation.photo ? { uri: `data:${currentConversation.photo.type};base64,${base64ImageData}` } : appConfig.darkTheme ? profileImageDark : profileImage} style={styles.conversationImage} />
                </View>
                <View style={styles.headerTextContainer}>
                    <View style={{ borderWidth: 0, flexDirection: "row", alignItems: "center" }}>
                        <Text style={styles.profileName}>{currentConversation && currentConversation.name ? currentConversation.name : "Anônimo"}</Text>
                        {currentConversation && isBlocked && <Image source={require('../../attachments/block.webp')} style={{ width: 15, height: 15, marginLeft: 5 }} />}
                        {currentConversation && currentConversation.added && <Image source={require('../../attachments/myContactChatIcon.png')} style={{ width: 15, height: 15, marginLeft: 5, marginTop: 2 }} />}
                    </View>
                    <Text style={styles.lastSeen}>
                        {isBlocked ? 'Bloqueado' : currentConversation && currentConversation.typing && currentConversation.online ? 'Digitando...' : currentConversation && currentConversation.online ? 'Online' : lastSeen ? 'Visto ' + lastSeen : 'offline'}
                    </Text>
                </View>
            </TouchableOpacity>
            <View style={styles.headerRight}>
                {/* Botão para abrir o modal */}
                {/* <TouchableOpacity activeOpacity={0.5} style={styles.optionButton} onPress={handleOpenModal}>
                    <Image source={require('../../attachments/options.png')} style={styles.menuIcon} />
                </TouchableOpacity> */}
                <DropdownComponent deleteConversationRef={deleteConversationRef} />
            </View>

            {/* Modal principal */}
            <Modal
                animationType="none"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleCloseModal}
            >
                <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPress={handleCloseModal}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.modalOptionsContainer} onPress={() => { currentConversation.added || isInAddedContacts ? removeContact() : addContact() }}>
                            <Text style={styles.modalOptionText}> {currentConversation && currentConversation.added ? "Remover contato" : "Adicionar contato"} </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOptionsContainer} onPress={() => handleOptionSelected('Excluir Conversa')}>
                            <Text style={styles.modalOptionText}> Excluir Conversa </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOptionsContainer} onPress={() => { }}>
                            <Text style={styles.modalOptionText}> Denunciar (Em breve) </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOptionsContainer} onPress={() => { }}>
                            <Text style={styles.modalOptionText}> Bloquear (Em breve) </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Modal de confirmação - Excluir Conversa */}
            <Modal
                animationType="none"
                transparent={true}
                visible={confirmModalVisible && confirmAction === 'Excluir Conversa'}
                onRequestClose={handleCloseConfirmModal}
            >
                <TouchableOpacity
                    style={styles.confirmModalContainer}
                    activeOpacity={1}
                    onPress={handleCloseConfirmModal}
                >
                    <View style={styles.confirmModalContent}>
                        <Text style={styles.confirmModalText}>
                            {'Deseja mesmo excluir a conversa selecionada?'}
                        </Text>
                        <View style={styles.confirmModalButtons}>
                            <TouchableOpacity onPress={() => handleConfirmActionRef.current(false)}>
                                <Text style={styles.confirmButtonText}>Não</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleConfirmActionRef.current(true)}>
                                <Text style={styles.confirmButtonText}>Sim</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Modal de confirmação - Denunciar Usuário */}
            <Modal
                animationType="none"
                transparent={true}
                visible={confirmModalVisible && confirmAction === 'Denunciar Usuário'}
                onRequestClose={handleCloseConfirmModal}
            >
                <TouchableOpacity
                    style={styles.confirmModalContainer}
                    activeOpacity={1}
                    onPress={handleCloseConfirmModal}
                >
                    <View style={styles.confirmModalContent}>
                        <Text style={styles.confirmModalText}>
                            {'Deseja mesmo denunciar o usuário selecionado?'}
                        </Text>
                        <View style={styles.confirmModalButtons}>
                            <TouchableOpacity onPress={() => handleConfirmActionRef.current(true)}>
                                <Text style={styles.confirmButtonText}>Sim</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleConfirmActionRef.current(false)}>
                                <Text style={styles.confirmButtonText}>Não</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Modal de detalhes */}
            <Modal
                animationType="none"
                transparent={true}
                visible={modalVisible && confirmAction === 'Detalhes'}
                onRequestClose={handleCloseModal}
            >
                <TouchableOpacity style={styles.confirmModalContainer} activeOpacity={1} onPress={handleCloseModal}>
                    <View style={styles.confirmModalContent}>
                        <Text style={styles.confirmModalText}>{'Detalhes da Conversa:'}</Text>
                        {/* Adicione aqui o conteúdo específico para mostrar detalhes da conversa */}
                        {/* Por exemplo: */}
                        <Text>{'Conteúdo dos Detalhes da Conversa'}</Text>
                        {/* ... */}
                    </View>
                </TouchableOpacity>
            </Modal>

            {profileImageModalVisibility &&
                <Modal animationType="none" transparent={true} visible={profileImageModalVisibility}>
                    <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity activeOpacity={1} style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                            onPress={() => {
                                setProfileImageModalVisibility(false);
                            }}
                        >
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={1} onPress={() => { if (currentConversation && currentConversation.photo !== null) { setImageViewerPhoto(currentConversation.photo.assets[0]); setProfileImageModalVisibility(false); setChatImageViewerModalVisible(true); } }} style={{ width: 300, height: 300, borderRadius: 8, elevation: 2, overflow: 'hidden' }}>
                            <Image source={currentConversation && currentConversation.photo ? { uri: `data:${currentConversation.photo.type};base64,${currentConversation.photo.assets[0].base64}` } : appConfig.darkTheme ? profileImageDark : profileImage} style={{ width: '100%', height: '100%' }} />
                            <View style={{ position: 'absolute', height: 50, width: '100%', backgroundColor: 'rgba(0, 0, 0, 0.3)', paddingHorizontal: 10, justifyContent: 'center' }}>
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}> {currentConversation.name} </Text>
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13, marginLeft: 1 }}> {currentConversation.gender == 1 ? 'Feminino' : 'Masculino'}, {currentConversation.age || 18} </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </Modal>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        backgroundColor: '#ff9900', // Laranja escuro
        height: 65,
        elevation: 3,
        zIndex: 10,
        width: '100%',
    },
    backButton: {
        padding: 5,
    },
    backIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 5,
        justifyContent: 'space-between',
        width: "78.6%",
        height: '100%',
        justifyContent: "flex-start",
        marginLeft: 5,
        marginBottom: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: "15%",
        height: '100%',
        borderWidth: 0,
        marginBottom: 2
    },
    headerTextContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: "center",
        marginTop: -4,
    },
    profileImage: {
        width: 32,
        height: 32,
        borderRadius: 20,
    },
    profileImageContainer: {
        marginRight: 10,
        backgroundColor: "#fff",
        borderRadius: 250,
        padding: 5,
        elevation: 0,
    },
    profileName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff', // Branco
        textShadowColor: 'rgba(0, 0, 0, 0.1)', // Cor da sombra
        textShadowOffset: { width: 1, height: 1 }, // Offset da sombra
        textShadowRadius: 1 // Raio da sombra
    },
    lastSeen: {
        fontSize: 11,
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.1)', // Cor da sombra
        textShadowOffset: { width: 1, height: 1 }, // Offset da sombra
        textShadowRadius: 1 // Raio da sombra
    },
    iconButton: {
        padding: 10,
    },
    icon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        marginRight: 10,
    },
    optionButton: {
        padding: 10,
        marginRight: 10,
        borderRadius: 5,
    },
    optionButtonText: {
        color: '#fff', // Branco
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: "20%",
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 5,
        alignItems: 'flex-start',
        width: '91%',
        justifyContent: 'center',
        elevation: 5,
        paddingBottom: 5
    },
    modalOptionText: {
        fontSize: 19,
        color: '#333',
    },
    confirmModalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmModalContent: {
        backgroundColor: '#fff',
        padding: 25,
        borderRadius: 5,
        alignItems: 'center',
        width: '80%',
        elevation: 5,
    },
    confirmModalText: {
        fontSize: 18,
        marginBottom: 20,
        color: '#333',
    },
    confirmModalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    confirmButtonText: {
        fontSize: 16,
        color: '#ff9900',
        fontWeight: 'bold',
    },
    menuIcon: {
        width: 30,
        height: 30,
    },
    modalOptionsContainer: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderWidth: 0,
        width: "100%"
    },
    conversationImageContainer: {
        width: 44,
        height: 44,
        elevation: 2,
        marginRight: 10,
        borderRadius: 100,
        overflow: "hidden",
    },
    conversationImage: {
        width: "100%",
        height: "100%",
    },
});

export default HeaderComponent;