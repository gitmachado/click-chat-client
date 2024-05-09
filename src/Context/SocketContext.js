import React, { createContext, useEffect, useState, useContext, useRef } from 'react';
import { Modal, View, Text, ActivityIndicator, TouchableOpacity, NativeModules } from "react-native";
import { AppContext } from './AppContext';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import auth from '@react-native-firebase/auth';

import { markMessagesAsRead } from "../pages/Chat/chatFunctions";
import messaging from '@react-native-firebase/messaging';

import connection_listeners from './Socket_Listeners/connection_listeners';
import Contatos from '../pages/Contatos/Contatos';

//const { BackgroundListenerModule } = NativeModules;

const SocketContext = createContext();

//const adUnitId = "ca-app-pub-3940256099942544/1033173712"; // Código de teste 
const adUnitId = "ca-app-pub-8509836268613777/5577041911";

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
    keywords: ['fashion', 'clothing'],
});

function exibirIntersticial() {
    const unsubscribe = interstitial.addAdEventListener(AdEventType.LOADED, () => {
        interstitial.show();
        //console.log("Interstitial mostrado.")
    });

    // Start loading the interstitial straight away
    interstitial.load();

    // Unsubscribe from events on unmount
    return unsubscribe;
}

const SocketProvider = ({ children }) => {
    const [filaDeEventos, setFilaDeEventos] = useState([]);
    const [processandoFila, setProcessandoFila] = useState(false);
    const [nomesSolicitados, setNomesSolicitados] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [firstTimeConnected, setFirstTimeConnected] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const startConnectionRef = useRef(null);

    const appContext = useContext(AppContext);
    const { addedContacts, setAddedContacts, blockedUsers, isVersionIncorrect, setIsVersionIncorrect, clientVersion, navScreen, appConfig, socket, setSocket, socketInstance, registeredUsers, setRegisteredUsers, onlineUsers, setOnlineUsers, user, setUser, isConnectionErrorModalVisible, setIsConnectionErrorModalVisible, currentConversation, setCurrentConversation, conversasDoAsync, setConversasDoAsync, conversationMessages, setConversationMessages, userProfile, setUserProfile, SalvarConversasNoAsync } = appContext;

    useEffect(() => {
        //console.log("nova screen: ", navScreen)
    }, [navScreen]);

    connection_listeners(
        socket,
    );

    const enviarSolicitacaoAtualizacaoNomes = () => {
        if (nomesSolicitados == false && conversasDoAsync) {
            try {
                // Extrair os ids de usuário das conversas
                const userIds = conversasDoAsync.map(conversa => conversa.id);
                //console.log(userIds)
                // Enviar solicitação ao servidor para atualizar nomes de usuário
                socket.emit('atualizarNomesDeUsuarios', { userIds });

                // Aguardar resposta do servidor
            } catch (error) {
                console.error('Erro ao enviar solicitação de atualização de nomes:', error);
            }
            setNomesSolicitados(true);
        } else {

        }
    };

    useEffect(() => {
        if (socketInstance) {
            socketInstance.on('updateOnlineUsers', (onlineUsers) => {
                setOnlineUsers(onlineUsers);
            });

            return () => {
                socketInstance.off('updateOnlineUsers');
            };
        }
    }, [socketInstance]);

    useEffect(() => {
        if (socketInstance) {
            socketInstance.on('verifyVersion', (serverVersion) => {
                if (serverVersion == clientVersion) {
                    setIsVersionIncorrect(false);
                } else if (serverVersion !== clientVersion) {
                    setIsVersionIncorrect(true);
                    socketInstance.disconnect();
                }
            });

            return () => {
                socketInstance.off('verifyVersion');
            };
        }
    }, [socketInstance, setIsVersionIncorrect, clientVersion]);

    useEffect(() => {
        if (socketInstance) {
            socketInstance.on('updateRegisteredUsers', (registeredUsers) => {
                setRegisteredUsers(registeredUsers);
            });

            return () => {
                socketInstance.off('updateRegisteredUsers');
            };
        }
    }, [socketInstance]);


    // INTERSTITIAL ADMOB
    useEffect(() => {
        if (socketInstance) {
            socketInstance.on("sendingInterstitialOrder", () => {
                //console.log("sendingInterstitialOrder")
                exibirIntersticial();
            });

            return () => {
                socketInstance.off('sendingInterstitialOrder');
            };
        }
    }, [socketInstance]);

    useEffect(() => {
        if (socketInstance) {
            socketInstance.on('nomesAtualizados', (nomesAtualizados) => {

                const conversasAtualizadas = conversasDoAsync.map(conversa => {
                    const nomeAtualizado = nomesAtualizados.find(atualizado => atualizado.id === conversa.id);
                    if (nomeAtualizado) {
                        return { ...conversa, name: nomeAtualizado.name, gender: nomeAtualizado.gender, age: nomeAtualizado.age };
                    }
                    return conversa;
                });

                setConversasDoAsync(conversasAtualizadas);

                //console.log('contatos: ', addedContacts)
                const updatedContacts = addedContacts.map((contact) => {
                    const nomeAtualizado = nomesAtualizados.find(atualizado => atualizado.id === contact.id);
                    if (nomeAtualizado) {
                        return { ...contact, name: nomeAtualizado.name, gender: nomeAtualizado.gender, age: nomeAtualizado.age };
                    }
                    return contact;
                });

                setAddedContacts(updatedContacts);
            });

            enviarSolicitacaoAtualizacaoNomes();

            // Limpar o ouvinte quando o componente for desmontado
            return () => {
                socket.off('nomesAtualizados');
            };
        }
    }, [conversasDoAsync, addedContacts]);

    useEffect(() => {
        if (currentConversation != null) {
            markMessagesAsRead(conversationMessages, setConversationMessages, conversasDoAsync, setConversasDoAsync, setCurrentConversation, currentConversation, socket, userProfile, appConfig);
        }
    }, [conversationMessages]);

    useEffect(() => {

        if (socketInstance) {
            socketInstance.on("sendingAllPendingMessagesToReceptor", async (pendingMessages) => {

                //console.log('Pending messages received:', pendingMessages);

                for (const message of pendingMessages) {
                    // Adiciona o evento na fila para processamento sequencial
                    adicionarEventoNaFila({ event: 'processReceivedMessage', data: message });
                }
            });

            return () => {
                socketInstance.off('sendingAllPendingMessagesToReceptor');
            };
        }


    }, [filaDeEventos, socketInstance, currentConversation, conversasDoAsync, setCurrentConversation, setConversasDoAsync, setConversationMessages, conversationMessages]);

    useEffect(() => {
        if (socketInstance) {
            socketInstance.on('updateTyping', (receivedTyping, whosTypingId) => {
                //console.log('recebido: ', receivedTyping, whosTypingId)

                setConversasDoAsync(conversas => {
                    return conversas.map(conversa => {
                        if (conversa.id === whosTypingId) {
                            return { ...conversa, typing: receivedTyping };
                        }
                        return conversa;
                    });
                });

                if (currentConversation && currentConversation.id === whosTypingId) {
                    setCurrentConversation(current => {
                        return { ...current, typing: receivedTyping };
                    });
                }
            });
            return () => {
                socketInstance.off('updateTyping');
            };
        }
    }, [socketInstance, conversasDoAsync, currentConversation, setCurrentConversation, setConversasDoAsync]);

    useEffect(() => {
        // Função para verificar duplicatas
        const checkDuplicates = () => {
            const conversationIds = new Set();
            const uniqueConversations = [];

            for (const conversa of conversasDoAsync) {
                if (!conversationIds.has(conversa.id)) {
                    // Adiciona a conversa ao conjunto de IDs se ainda não estiver presente
                    conversationIds.add(conversa.id);
                    // Adiciona a conversa à lista de conversas únicas
                    uniqueConversations.push(conversa);
                }
            }

            // Verifica se há conversas duplicadas
            if (uniqueConversations.length !== conversasDoAsync.length) {
                // Remove todas as conversas do estado e substitui-as pelas conversas únicas
                setConversasDoAsync(uniqueConversations);
                //console.log('Conversas duplicadas removidas.');
            }
        };

        // Chamada da função para verificar duplicatas sempre que conversasDoAsync mudar
        checkDuplicates();

    }, [conversasDoAsync]);

    useEffect(() => {

        if (socketInstance) {

            // QUANDO A MENSAGEM É RECEBIDA NO CLIENTE
            socketInstance.on('sendingMessageToReceptor', async (receivedMessage) => {

                const timeUTC = new Date(receivedMessage.timeUTC);
                receivedMessage.time = timeUTC.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

                const isBlocked = blockedUsers.some(user => user.id === receivedMessage.from);
                //console.log('isBlocked: ', isBlocked)

                if (!isBlocked) {
                    // Envia a confirmação de recebimento do cliente para o remetente.
                    socketInstance.emit('sendingReceptorReceiptConfirmationToSender', receivedMessage);

                    // Verificar se a conversa já existe
                    const existingConversation = conversasDoAsync.find(conversa => conversa.id === receivedMessage.from);

                    if (!existingConversation) {
                        //console.log("n existe")
                        // Se não existir, criar uma nova conversa
                        const newConversation = {
                            id: receivedMessage.from,
                            name: receivedMessage.name, // Supondo que você tenha essa informação na mensagem
                            // Outras informações da conversa, se disponíveis
                            gender: receivedMessage.gender,
                            age: receivedMessage.age,
                            online: true,
                            lastSeen: new Date(),
                            messages: [receivedMessage], // Lista de mensagens da nova conversa
                            naolidas: 1, // Inicializar com uma mensagem não lida
                            photo: null,
                            typing: false,
                        };

                        // Adicionar a nova conversa à lista de conversas em memória
                        setConversasDoAsync(prevConversas => [...prevConversas, newConversation]);
                        //console.log('nova conversa: ', newConversation)

                        if (currentConversation && currentConversation.id == newConversation.id) {
                            setCurrentConversation(newConversation);
                            setConversationMessages(newConversation.messages);
                        }

                        socket.emit("requestProfileImageOfNewConversation", newConversation.id)

                    } else {

                        //console.log("entrei 2")

                        const isMessageAlreadyExists = existingConversation.messages.some(msg => msg.id === receivedMessage.id);

                        if (!isMessageAlreadyExists) {

                            if (receivedMessage.image !== null) {
                                //console.log('contem image')
                            }

                            // Se a mensagem não existir, adicionar à lista de mensagens
                            const updatedMessages = [
                                ...existingConversation.messages,
                                { ...receivedMessage, origin: 'received', id: receivedMessage.id }
                            ];

                            // Atualizar a conversa existente com as mensagens atualizadas
                            // ...

                            // Atualizar a conversa existente com as mensagens atualizadas
                            //console.log("setConversas começou", new Date().toISOString());
                            const updatedConversations = await new Promise(resolve => {
                                setConversasDoAsync(prevConversas => {
                                    const updatedConversations = prevConversas.map(conversa => {
                                        if (conversa.id === existingConversation.id) {
                                            return { ...conversa, messages: updatedMessages, typing: false, naolidas: conversa.naolidas + 1 };
                                        }
                                        return conversa;
                                    });
                                    resolve(updatedConversations);
                                    return updatedConversations;
                                });
                            });

                            // Agora você está garantido de que a modificação foi concluída
                            //console.log('setConversasDoAsync concluído', new Date().toISOString());

                            // Atualizar os estados locais
                            setConversasDoAsync(updatedConversations);

                            if (currentConversation && (currentConversation.id == existingConversation.id)) {
                                setConversationMessages(updatedMessages);
                            }

                            //console.log('Mensagem adicionada com sucesso.');
                        } else {
                            //console.log('A mensagem já existe na conversa. Não foi adicionada novamente.');
                        }
                    }
                }
            });

            return () => {
                socketInstance.off('sendingMessageToReceptor');
            };
        }
    }, [filaDeEventos, blockedUsers, socketInstance, currentConversation, conversasDoAsync, setCurrentConversation, setConversasDoAsync, setConversationMessages, conversationMessages]);

    // ========================= FILA DE EVENTOS ========================= //

    const receberMensagemDoServer = () => {
        socketInstance.emit('sendingReceptorReceiptConfirmationToSender', receivedMessage);

        let updatedMessages = null;

        const updatedConversations = conversasDoAsync.map((conversa) => {
            if (conversa.id === receivedMessage.from) {
                const existingMessages = conversa.messages || [];

                updatedMessages = [
                    ...existingMessages,
                    { ...receivedMessage, origin: 'received', id: generateUniqueId(conversasDoAsync) }
                ];

                // Atualizar o atributo naolidas
                const unreadCount = existingMessages.filter(message => !message.viewed && message.received).length + 1;
                return { ...conversa, messages: updatedMessages, naolidas: unreadCount };
            }

            return conversa;
        });

        setConversationMessages(updatedMessages);
        setConversasDoAsync(updatedConversations);
    }

    useEffect(() => {

    }, [socketInstance, currentConversation, conversasDoAsync, setCurrentConversation, setConversasDoAsync, setConversationMessages, conversationMessages]);

    const generateUniqueId = () => {
        const uniqueId = uuidv4();
        return uniqueId;
    }

    useEffect(() => {
        if (socket) {
            // QUANDO O USUÁRIO ATUALIZA O NICKNAME
            socket.on('profileUpdated', (updatedProfile) => {
                //console.log('atualizei')

                const updatedConversations = conversasDoAsync.map((conversa) => {
                    if (conversa.id === updatedProfile.id) {
                        return { ...conversa, name: updatedProfile.name, gender: updatedProfile.gender, age: updatedProfile.age };
                    }
                    return conversa;
                });
                setConversasDoAsync(updatedConversations);

                const updatedContacts = addedContacts.map((contact) => {
                    if (contact.id === updatedProfile.id) {
                        return { ...contact, name: updatedProfile.name, gender: updatedProfile.gender, age: updatedProfile.age };
                    }
                    return contact;
                });

                setAddedContacts(updatedContacts);

            });

            return () => {
                socket.off('profileUpdated');
            };
        }
    }, [socket, conversasDoAsync, setConversasDoAsync]);

    function onAuthStateChanged(user) {
        setUser(user);
    }

    useEffect(() => {
        let isMounted = true; // Adicionamos uma flag para verificar se o componente está montado

        const sendUserAuth = async () => {
            if (user !== null) {
                const { uid, displayName, email } = user;
                const fcmToken = await messaging().getToken();

                socketInstance.emit('userAuthenticated', {
                    userId: uid,
                    userInfo: {
                        displayName,
                        email,
                        fcmToken,
                    },
                });
            }
        };

        if (socketInstance && socketInstance.connected && isMounted) {
            sendUserAuth();
            socket.emit("requestRegisteredNOnline");
        }

        return () => {
            isMounted = false; // Atualizamos a flag quando o componente é desmontado
        };
    }, [user, socket, socketInstance]);


    useEffect(() => {
    }, [userProfile])

    useEffect(() => {
        if (socket) {
            // QUANDO O USUÁRIO FICA ONLINE OU OFFLINE
            socket.on('userStatusChanged', ({ userId, online, lastSeen, profileImage }) => {

                const typing = false;

                setConversasDoAsync(prevConversas => {
                    return prevConversas.map(conversa => {
                        if (conversa.id === userId) {
                            return {
                                ...conversa,
                                online,
                                typing,
                                lastSeen: lastSeen !== undefined ? lastSeen : conversa.lastSeen,
                                photo: profileImage == null ? null : profileImage == "noReset" ? conversa.photo : profileImage ? profileImage : profileImage == undefined ? conversa.photo : null
                            };
                        }
                        return conversa;
                    });
                });

                if (currentConversation !== null) {
                    setCurrentConversation(prevConversation => {
                        if (prevConversation.id === userId) {
                            return {
                                ...prevConversation,
                                online,
                                typing,
                                lastSeen: lastSeen !== undefined ? lastSeen : prevConversation.lastSeen,
                                photo: profileImage == null ? null : profileImage == "noReset" ? prevConversation.photo : profileImage ? profileImage : profileImage == undefined ? prevConversation.photo : null
                            };
                        }
                        return prevConversation;
                    });
                }

                setAddedContacts(prevContacts => {
                    return prevContacts.map(contact => {
                        if (contact.id === userId) {
                            return {
                                ...contact,
                                online,
                                typing,
                                lastSeen: lastSeen !== undefined ? lastSeen : contact.lastSeen,
                                photo: profileImage == null ? null : profileImage == "noReset" ? contact.photo : profileImage ? profileImage : profileImage == undefined ? contact.photo : null
                            };
                        }
                        return contact;
                    });
                });
            });
        }

        return () => {
            if (socket) {
                socket.off('userStatusChanged');
            }
        };
    }, [socket, conversasDoAsync, setConversasDoAsync, currentConversation, setCurrentConversation]);

    useEffect(() => {
        if (socket) {
            socket.on('responseToProfileImageOfNewConversation', ({ id, profileImage }) => {

                const updatedConversations = conversasDoAsync.map((conversa) => {
                    if (conversa.id === id) {
                        return { ...conversa, photo: profileImage };
                    }
                    return conversa;
                });

                setConversasDoAsync(updatedConversations);

            });
        }

        return () => {
            if (socket) {
                socket.off('responseToProfileImageOfNewConversation');
            }
        };
    }, [socket, conversasDoAsync, setConversasDoAsync, currentConversation, setCurrentConversation]);

    useEffect(() => {
        if (socket) {
            // RETORNO DA CONFIRMAÇÃO DE RECEBIMENTO PELO SERVIDOR
            socket.on('sendingServerReceiptConfirmationToSender', (messageId) => {

                const updatedMessages = conversationMessages.map((message) => {
                    if (message.id == messageId) {
                        return { ...message, status: 'receivedByServer' };
                    }
                    return message;
                });

                setConversationMessages(updatedMessages);

                // Atualizar conversasDoAsync após setConversationMessages
                const updatedConversations = conversasDoAsync.map((conversa) => {
                    if (conversa.id === currentConversation.id) {
                        return { ...conversa, messages: updatedMessages };
                    }
                    return conversa;
                });

                setConversasDoAsync(updatedConversations);

            });
        }

        // Limpar o ouvinte quando o componente for desmontado
        return () => {
            if (socket) {
                socket.off('sendingServerReceiptConfirmationToSender');
            }
        };
    }, [socket, conversationMessages, currentConversation, conversasDoAsync, setConversationMessages, setConversasDoAsync]);

    useEffect(() => {
        if (socket) {
            // CONFIRMAÇÃO DO RECEBIMENTO DA MENSAGEM PELO RECEPTOR
            socket.on('sendingReceptorReceiptConfirmationToSender', ({ messageId }) => {

                //console.log("messageId: ", messageId)

                if (messageId != undefined) {
                    const updatedMessages = conversationMessages.map((message) => {
                        if (message.id == messageId.id && message.status != "viewedByReceptor") {
                            return { ...message, status: 'receivedByReceptor' };
                        }
                        return message;
                    });

                    setConversationMessages(updatedMessages);

                    messageId.to_user = messageId.to_user || messageId.to;
                    messageId.to = messageId.to || messageId.to_user;


                    const updatedConversations = conversasDoAsync.map((conversa) => {
                        //console.log(conversa.id, " - ", messageId.to_user)
                        if (conversa && conversa.id && conversa.id === messageId.to_user) {
                            return { ...conversa, messages: updatedMessages };
                        }
                        return conversa;
                    });

                    //console.log('CONFIRMANDO: ', updatedConversations[0].messages)
                    setTimeout(() => {
                        //console.log('teste: ', conversasDoAsync[0].messages)
                    }, 3000);

                    setConversasDoAsync(updatedConversations);
                }
            });
        }

        return () => {
            if (socket) {
                socket.off('sendingReceptorReceiptConfirmationToSender');
            }
        };
    }, [socket, conversationMessages, conversasDoAsync]);

    useEffect(() => {
        if (socket) {
            // ATUALIZA NO CLIENT AS MENSAGENS QUE FORAM LIDAS PELO DESTINATÁRIO
            socket.on("toUpdateViewedMessages", (readedMessagesIDs) => {

                //console.log("MENSAGENS LIDAS PELO DESTINATARIO: ", readedMessagesIDs)

                //console.log("CV MSG: ", conversationMessages)
                //console.log("CVS ASYNC: ", conversasDoAsync)

                // Atualizar mensagens em conversationMessages
                if (conversationMessages) {
                    const updatedConversationMessages = conversationMessages.map((message) => {
                        // Verifica se o ID da mensagem está na lista de mensagens lidas
                        const isMessageRead = readedMessagesIDs.includes(message.id.toString());
                        if (isMessageRead == true) {
                            return { ...message, status: appConfig.readConfirmation ? 'viewedByReceptor' : 'receivedByReceptor', viewed: appConfig.readConfirmation ? true : false };
                        }
                        return message;
                    });

                    setConversationMessages(updatedConversationMessages);
                }

                // Atualizar mensagens em conversasDoAsync
                const updatedConversasDoAsync = conversasDoAsync.map((conversa) => {
                    const updatedMessages = conversa.messages.map((message) => {
                        // Verifica se o ID da mensagem está na lista de mensagens lidas
                        const isMessageRead = readedMessagesIDs.includes(message.id);
                        if (isMessageRead == true) {
                            return { ...message, status: appConfig.readConfirmation ? 'viewedByReceptor' : 'receivedByReceptor', viewed: appConfig.readConfirmation ? true : false };
                        }
                        return message;
                    });

                    return { ...conversa, messages: updatedMessages };
                });

                setConversasDoAsync(updatedConversasDoAsync);

            });
        }

        return () => {
            if (socket) {
                socket.off('toUpdateViewedMessages');
            }
        };
    }, [socket, conversationMessages, conversasDoAsync]);

    return <SocketContext.Provider value={socket}>

        {children}

        {isConnectionErrorModalVisible && !isVersionIncorrect && (
            <Modal
                transparent
                animationType="none"
                visible={isConnectionErrorModalVisible}
            >
                <View style={{ backgroundColor: "rgba(0, 0, 0, 0.3)", width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                    <View style={{ elevation: 5, width: "90%", padding: 20, borderRadius: 5, backgroundColor: "white", justifyContent: "center", alignItems: "center" }}>
                        <Text style={{ fontWeight: "bold", textAlign: "center", fontSize: 17, marginBottom: 10 }}> FALHA NA CONEXÃO </Text>
                        <View>
                            <Text style={{ textAlign: "center", fontSize: 15, fontWeight: "bold", marginBottom: 20 }}> O seu dispositivo não conseguiu se conectar ao servidor do ClickChat. </Text>
                            <Text style={{ textAlign: "center", fontSize: 15 }}> Por favor aguarde enquanto tentamos restaurar a conexão automaticamente. </Text>
                            <ActivityIndicator style={{ marginTop: 25, marginBottom: 5 }} size="large" color="orange" />
                        </View>
                        <View style={{ width: "80%", padding: 5, borderRadius: 10 }}>
                            <Text style={{ fontWeight: "bold", textAlign: "center", fontSize: 17 }}> Tentando reconectar... </Text>
                        </View>
                    </View>
                </View>
            </Modal>
        )}

        <Modal
            transparent
            animationType="none"
            visible={isVersionIncorrect}
        >
            <View style={{ backgroundColor: "rgba(0, 0, 0, 0.3)", width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                <View style={{ elevation: 5, width: "90%", padding: 20, borderRadius: 5, backgroundColor: "white", justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ fontWeight: "bold", textAlign: "center", fontSize: 17, marginBottom: 10 }}> VERSÃO INCORRETA </Text>
                    <View>
                        <Text style={{ textAlign: "center", fontSize: 15, fontWeight: "bold", marginBottom: 20 }}> Essa versão do ClickChat está desatualizada. </Text>
                        <Text style={{ textAlign: "center", fontSize: 15 }}> Toque no botão abaixo e atualize para a última versão na Play Store. </Text>
                    </View>
                    <TouchableOpacity style={{ width: "70%", padding: 10, borderRadius: 10, backgroundColor: "orange", marginTop: 20 }}>
                        <Text style={{ fontWeight: "bold", textAlign: "center", fontSize: 17, color: "white" }}> Atualizar </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>

    </SocketContext.Provider>;
};

export { SocketContext, SocketProvider };
