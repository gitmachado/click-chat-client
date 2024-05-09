import uuid from 'react-native-uuid';
import { ToastAndroid } from 'react-native';

export const generateUniqueId = (conversasDoAsync) => {
    const uniqueId = uuid.v4();
    return uniqueId;
};

export const handleSend = async (imageViewerPhoto, input, setInput, currentConversation, conversationMessages, setConversationMessages, scrollViewRef, socket, setConversasDoAsync, conversasDoAsync, setCurrentConversation) => {
    if (!currentConversation) {
        return;
    }
    if (input && imageViewerPhoto == null) {
        setInput('');
        const nowUTC = new Date().toISOString();
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const const_id = generateUniqueId(conversasDoAsync);
        const newMessage = {
            id: const_id,
            from: "settedOnServer",
            to: currentConversation.id,
            timeUTC: nowUTC,
            time: `${hours}:${minutes}`,
            status: "pending",
            message: input,
            received: false,
            image: null,
            isImageAllowed: null,
        };

        const updatedMessages = [...conversationMessages, newMessage];
        setConversationMessages(updatedMessages);

        setCurrentConversation({
            ...currentConversation,
            messages: updatedMessages
        });

        const isFirstMessage = currentConversation.messages.length === 0;

        if (isFirstMessage) {
            const newConversationData = {
                id: currentConversation.id,
                name: currentConversation.name,
                gender: currentConversation.gender,
                age: currentConversation.age,
                online: currentConversation.online,
                lastSeen: currentConversation.lastSeen,
                naolidas: 0,
                messages: [newMessage],
                photo: currentConversation.photo
            };

            //console.log("nova: ", newConversationData)

            const updatedConversations = [...conversasDoAsync, newConversationData];

            setConversasDoAsync(updatedConversations)

        } else {
            const updatedConversations = conversasDoAsync.map((conversa) => {
                if (conversa.id === currentConversation.id) {
                    return { ...conversa, messages: updatedMessages };
                }
                return conversa; // Mantenha as outras conversas inalteradas
            });

            setConversasDoAsync(updatedConversations);
        }

        // Rola a tela para baixo
        if (scrollViewRef.current) { setTimeout(() => { scrollViewRef.current.scrollToOffset({ offset: 0, animated: true }); }, 0); }

        // Envia a mensagem
        socket.emit('newMessage', newMessage);

    }
};

export const handleSendImage = async (imageViewerPhoto, input, setInput, currentConversation, conversationMessages, setConversationMessages, scrollViewRef, socket, setConversasDoAsync, conversasDoAsync, setCurrentConversation) => {
    if (imageViewerPhoto.type == 'image/gif') {
        ToastAndroid.show(`GIFs estão temporariamente desativados.`, ToastAndroid.SHORT);
    } else {
        if (setCurrentConversation) {
            //console.log('disponível')
        } else {
            //console.log(' n disponível')
        }
        setInput('');
        const nowUTC = new Date().toISOString();
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const const_id = generateUniqueId(conversasDoAsync);
        const newMessage = {
            id: const_id,
            from: "settedOnServer",
            to: currentConversation.id,
            timeUTC: nowUTC,
            time: `${hours}:${minutes}`,
            status: "pending",
            message: input,
            received: false,
            image: imageViewerPhoto,
            isImageAllowed: false,
        };

        const updatedMessages = [...conversationMessages, newMessage];
        setConversationMessages(updatedMessages);

        setCurrentConversation({
            ...currentConversation,
            messages: updatedMessages
        });

        const isFirstMessage = currentConversation.messages.length === 0;

        if (isFirstMessage) {
            const newConversationData = {
                id: currentConversation.id,
                name: currentConversation.name,
                gender: currentConversation.gender,
                age: currentConversation.age,
                online: currentConversation.online,
                lastSeen: currentConversation.lastSeen,
                naolidas: 0,
                messages: [newMessage],
                photo: currentConversation.photo
            };

            //console.log("nova: ", newConversationData)

            const updatedConversations = [...conversasDoAsync, newConversationData];

            setConversasDoAsync(updatedConversations)

        } else {
            const updatedConversations = conversasDoAsync.map((conversa) => {
                if (conversa.id === currentConversation.id) {
                    return { ...conversa, messages: updatedMessages };
                }
                return conversa; // Mantenha as outras conversas inalteradas
            });

            setConversasDoAsync(updatedConversations);
        }

        if (setCurrentConversation) {
            //console.log('disponível')
        } else {
            //console.log(' n disponível')
        }
        // Envia a mensagem
        socket.emit('newMessage', newMessage);
    }
};

/*export const viewMessages = (conversationMessages, setConversationMessages, conversasDoAsync, setConversasDoAsync, currentConversation, socket) => {
  let readMessages = [];

  const updatedMessages = conversationMessages.map(message => {
    if (!message.viewed && message.received === 'true') {
      message.viewed = true;
      readMessages.push({ message });
    }
    return message;
  });

  if (readMessages.length > 0) {
    setConversationMessages(updatedMessages);

    const updatedConversations = conversasDoAsync.map(conversa => {
      if (conversa.id === currentConversation.id) {
        const updatedMessages = conversa.messages.map(m =>
          m.id === readMessages[0].message.id ? readMessages[0].message : m
        );
        return { ...conversa, messages: updatedMessages, naolidas: 0 }; // Configura naolidas para zero
      }
      return conversa;
    });

    setConversasDoAsync(updatedConversations);

    socket.emit("viewedMessages", readMessages);
  }
};*/

export const viewMessages = (
    conversationMessages,
    setConversationMessages,
    conversasDoAsync,
    setConversasDoAsync,
    setCurrentConversation,
    currentConversation,
    socket,
    appConfig
) => {
    // Filtrar mensagens que precisam ser marcadas como lidas

    let messagesToMarkAsRead = {};
    messagesToMarkAsRead.messageIDs = [];

    if (conversationMessages) {
        conversationMessages.filter(message => !message.viewed && message.received == true).forEach(message => {
            if (!messagesToMarkAsRead.from) {
                messagesToMarkAsRead.from = message.from;
            }
            messagesToMarkAsRead.messageIDs.push(message.id);
        });
    }

    if (messagesToMarkAsRead.messageIDs.length > 0) {
        // Atualizar o estado local das mensagens
        const updatedMessages = conversationMessages.map(message => {
            // Verifica se o ID da mensagem está na lista de mensagens para marcar como lida
            const shouldMarkAsRead = messagesToMarkAsRead.messageIDs.some(item => item.messageId == message.id);

            // Se deve marcar como lida, retorna uma nova mensagem com viewed: true,
            // caso contrário, retorna a mensagem original.
            return shouldMarkAsRead ? { ...message, viewed: true } : message;
        });

        setConversationMessages(updatedMessages);

        setCurrentConversation(prevState => ({
            ...prevState,
            messages: updatedMessages
        }));

        // Atualizar o estado local das conversas
        const updatedConversations = conversasDoAsync.map(conversa => {
            if (conversa.id === currentConversation.id) {
                const updatedMessages = conversa.messages.map(m =>
                    messagesToMarkAsRead.messageIDs.some(item => item.messageId == m.id) ?
                        { ...m, viewed: true } : m
                );
                return { ...conversa, messages: updatedMessages, naolidas: 0 };
            }
            return conversa;
        });

        setConversasDoAsync(updatedConversations);
        if (appConfig.readConfirmation) {
            socket.emit("viewedMessages", messagesToMarkAsRead);
        }
    } else {
        const updatedConversations = conversasDoAsync.map(conversa => {
            if (conversa.id === currentConversation.id) {
                return { ...conversa, naolidas: 0 };
            }
            return conversa;
        });

        setConversasDoAsync(updatedConversations);
    }
};

// No lado do cliente

export const markMessagesAsRead = (
    conversationMessages,
    setConversationMessages,
    conversasDoAsync,
    setConversasDoAsync,
    setCurrentConversation,
    currentConversation,
    socket,
    userProfile,
    appConfig
) => {
    // Filtrar mensagens que precisam ser marcadas como lidas

    const messagesToMarkAsRead = {};
    messagesToMarkAsRead.messageIDs = [];

    if (conversationMessages) {
        conversationMessages.filter(message => !message.viewed && message.received == true && message.from !== userProfile?.id).forEach(message => {
            if (!messagesToMarkAsRead.from) {
                messagesToMarkAsRead.from = message.from;
            }
            messagesToMarkAsRead.messageIDs.push(message.id);
        });
    }

    if (messagesToMarkAsRead.messageIDs.length > 0) {
        // Atualizar o estado local das mensagens
        const updatedMessages = conversationMessages.map(message => {
            // Verifica se o ID da mensagem está na lista de mensagens para marcar como lida
            const shouldMarkAsRead = messagesToMarkAsRead.messageIDs.includes(message.id);

            // Se deve marcar como lida, retorna uma nova mensagem com viewed: true,
            // caso contrário, retorna a mensagem original.
            return shouldMarkAsRead ? { ...message, viewed: true } : message;
        });

        setConversationMessages(updatedMessages);

        setCurrentConversation(prevState => ({
            ...prevState,
            messages: updatedMessages
        }));

        // Atualizar o estado local das conversas
        const updatedConversations = conversasDoAsync.map(conversa => {
            if (conversa.id === currentConversation.id) {
                const updatedMessages = conversa.messages.map(m =>
                    messagesToMarkAsRead.messageIDs.includes(m.id) ? { ...m, viewed: true } : m
                );
                return { ...conversa, messages: updatedMessages, naolidas: 0 };
            }
            return conversa;
        });

        setConversasDoAsync(updatedConversations);

        // Enviar para o servidor que as mensagens foram visualizadas
        if (appConfig.readConfirmation) {
            socket.emit("viewedMessages", messagesToMarkAsRead);
        }
    }
};