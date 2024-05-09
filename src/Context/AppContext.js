import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [currentConversation, setCurrentConversation] = useState(null);
    const [clientInfo, setClientInfo] = useState(null);
    const [conversasDoAsync, setConversasDoAsync] = useState([]);
    const [conversationMessages, setConversationMessages] = useState([]);
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [isConnectionErrorModalVisible, setIsConnectionErrorModalVisible] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(0);
    const [registeredUsers, setRegisteredUsers] = useState(0);
    const [addedContacts, setAddedContacts] = useState([]);
    const [socketInstance, setSocketInstance] = useState(null);
    const [socket, setSocket] = useState(null);
    const [screen, setScreen] = useState(null);
    const [clientVersion, setClientVersion] = useState("v2.0.0");
    const [isVersionIncorrect, setIsVersionIncorrect] = useState(null);
    const [isDarkThemeEnabled, setIsDarkThemeEnabled] = useState(true);
    const [imageViewerPhoto, setImageViewerPhoto] = useState(null);
    const [imageViewerModalVisible, setImageViewerModalVisible] = useState(false);
    const [chatImageViewerModalVisible, setChatImageViewerModalVisible] = useState(false);
    const [homeImageViewerModalVisible, setHomeImageViewerModalVisible] = useState(false);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [appConfig, setAppConfig] = useState({});
    const [profileOptions, setProfileOptions] = useState({});
    const [isLoadingScreenVisible, setIsLoadingScreenVisible] = useState(true);

    async function onGoogleButtonPress() {
        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            const { idToken, user } = await GoogleSignin.signIn();
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);
            const authenticatedUser = await auth().signInWithCredential(googleCredential);

            return authenticatedUser;
        } catch (error) {
            console.error('Erro ao autenticar com o Google:', error);
            throw error;
        }
    }

    GoogleSignin.configure({
        webClientId: '319578592438-5h3abhrfda2vk5d8r82f7e6j0v3ldrgn.apps.googleusercontent.com',
    });

    const CarregarConversasDoAsync = async () => {
        const conversasCarregadas = await AsyncStorage.getItem('allConversations');
        if (conversasCarregadas) {
            await setConversasDoAsync(JSON.parse(conversasCarregadas));
        }
    }

    const SalvarConversasNoAsync = async () => {
        await AsyncStorage.setItem('allConversations', JSON.stringify(conversasDoAsync));
    };

    const CarregarContactsDoAsync = async () => {
        const contatosCarregados = await AsyncStorage.getItem('allContacts');
        if (contatosCarregados) {
            await setAddedContacts(JSON.parse(contatosCarregados));
        }
    }

    const SalvarContactsNoAsync = async () => {
        await AsyncStorage.setItem('allContacts', JSON.stringify(addedContacts));
    };

    const CarregarBlockedsDoAsync = async () => {
        const blockedsCarregados = await AsyncStorage.getItem('blockedUsers');
        if (blockedsCarregados) {
            await setBlockedUsers(JSON.parse(blockedsCarregados));
        }
    }

    const SalvarBlockedsNoAsync = async () => {
        await AsyncStorage.setItem('blockedUsers', JSON.stringify(blockedUsers));
    };

    const CarregarAppConfigDoAsync = async () => {
        const appConfigCarregado = await AsyncStorage.getItem('appConfig');
        if (appConfigCarregado !== null) {
            const parsedConfig = JSON.parse(appConfigCarregado);
            if (Object.keys(parsedConfig).length === 0) {
                await setAppConfig({
                    darkTheme: false,
                    readConfirmation: true,
                    disableStatus: false,
                    disableNotifications: false
                });
                //console.log('Criado app config padrão.');
                return;
            }
            await setAppConfig(parsedConfig);
            //console.log('App config carregado:', parsedConfig);
        } else {
            await setAppConfig({
                darkTheme: false,
                readConfirmation: true,
                disableStatus: false,
                disableNotifications: false
            });
            //console.log('Criado app config padrão.');
        }
    }

    const SalvarAppConfigNoAsync = async () => {
        await AsyncStorage.setItem('appConfig', JSON.stringify(appConfig));
    };

    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const storedProfile = await AsyncStorage.getItem('userProfile');

                if (storedProfile) {
                    const parsedProfile = JSON.parse(storedProfile);
                    await setUserProfile(parsedProfile);
                    //console.log('Perfil carregado do AsyncStorage (appcontext):', parsedProfile);

                    /*setName(parsedProfile.name);
                    setGender(parsedProfile.gender);
                    setAge(parsedProfile.age);
                    setSearchGender(parsedProfile.searchGender);
                    setSearchMinAge(parsedProfile.searchMinAge);
                    setSearchMaxAge(parsedProfile.searchMaxAge);
                    setPhoto(parsedProfile.photo ? parsedProfile.photo : null)*/
                    setProfileOptions({
                        name: parsedProfile?.name,
                        gender: parsedProfile?.gender,
                        age: parsedProfile?.age,
                        searchGender: parsedProfile?.searchGender,
                        searchMinAge: parsedProfile?.searchMinAge,
                        searchMaxAge: parsedProfile?.searchMaxAge,
                        photo: parsedProfile?.photo ? parsedProfile?.photo : null
                    });
                } else {
                    //console.log('Nenhum perfil encontrado no AsyncStorage.');
                    setProfileOptions({
                        name: 'Anônimo',
                        gender: 'Masculino',
                        age: 18,
                        searchGender: 'Masculino',
                        searchMinAge: 18,
                        searchMaxAge: 45,
                        photo: null
                    });
                }
            } catch (error) {
                console.error('Erro ao carregar perfil do AsyncStorage:', error);
            }
        };
        loadUserProfile();
    }, []);

    useEffect(() => {
        CarregarConversasDoAsync();
        CarregarContactsDoAsync();
        CarregarBlockedsDoAsync();
        CarregarAppConfigDoAsync();
    }, []);

    useEffect(() => {
        SalvarConversasNoAsync();
    }, [conversasDoAsync]);

    useEffect(() => {
        SalvarContactsNoAsync();
    }, [addedContacts]);

    useEffect(() => {
        SalvarBlockedsNoAsync();
    }, [blockedUsers]);

    useEffect(() => {
        SalvarAppConfigNoAsync();
    }, [appConfig]);

    return (
        <AppContext.Provider value={{

            clientInfo,
            setClientInfo,

            conversasDoAsync,
            setConversasDoAsync,

            currentConversation,
            setCurrentConversation,

            CarregarConversasDoAsync,
            SalvarConversasNoAsync,

            onGoogleButtonPress,

            conversationMessages,
            setConversationMessages,

            user,
            setUser,

            userProfile,
            setUserProfile,

            isConnectionErrorModalVisible,
            setIsConnectionErrorModalVisible,

            onlineUsers,
            setOnlineUsers,

            registeredUsers,
            setRegisteredUsers,

            addedContacts,
            setAddedContacts,

            socketInstance,
            setSocketInstance,

            socket,
            setSocket,

            screen,
            setScreen,

            clientVersion,
            setClientVersion,

            isVersionIncorrect,
            setIsVersionIncorrect,

            isDarkThemeEnabled,
            setIsDarkThemeEnabled,

            imageViewerPhoto,
            setImageViewerPhoto,

            imageViewerModalVisible,
            setImageViewerModalVisible,

            blockedUsers,
            setBlockedUsers,

            chatImageViewerModalVisible,
            setChatImageViewerModalVisible,

            homeImageViewerModalVisible,
            setHomeImageViewerModalVisible,

            appConfig,
            setAppConfig,

            profileOptions,
            setProfileOptions,

            isLoadingScreenVisible,
            setIsLoadingScreenVisible,

        }}>
            {children}
        </AppContext.Provider>
    );
};