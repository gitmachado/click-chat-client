import { useEffect, useContext, useRef, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import { AppContext } from '../AppContext';
import { AppState } from "react-native";
import io from 'socket.io-client';

const connection_listeners = () => {

    const appContext = useContext(AppContext);
    const {
        socket,
        setSocket,
        user,
        setIsConnectionErrorModalVisible,
        socketInstance,
        setSocketInstance,
        setUserProfile,
        clientVersion,
        isVersionIncorrect,
        setIsVersionIncorrect,
    } = appContext;

    const startConnectionRef = useRef(null);
    const socketInstanceRef = useRef(null);

    const [isConnected, setIsConnected] = useState(false);
    const [stateApp, setStateApp] = useState("active");

    useEffect(() => {

        if (socketInstance) {
            socketInstance.on('connect', async () => {

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

                if (user == null) {
                    if (socketInstance) {
                        const fetchData = async () => {
                            if (user && socket) {
                                const { uid, displayName, email } = user;

                                const fcmToken = await messaging().getToken();

                                socket.emit('userAuthenticated', {
                                    userId: uid,
                                    userInfo: {
                                        displayName,
                                        email,
                                        fcmToken,
                                    },
                                });
                            }
                        };

                        fetchData();
                    }
                }

                setIsConnectionErrorModalVisible(false);
                //ToastAndroid.show("Conectado ao servidor!", ToastAndroid.SHORT);
            });
            socketInstance.on('disconnect', () => {
                //console.log("appState: ", stateApp)
                const currentAppState = AppState.currentState;
                //console.log('Estado atual do aplicativo:', currentAppState);
                //setIsConnectionErrorModalVisible(true);
                setIsConnected(false);
                if (currentAppState == "active" && !isVersionIncorrect && !isConnected) {
                    //startConne5555ctionRef.current();
                }
            });
            socketInstance.on('connect_error', (error) => {
                if(error.message == "Versão do cliente incorreta"){
                    //setIsConnectionErrorModalVisible(true);
                    setIsVersionIncorrect(true);
                }
            });
        }

    }, [socketInstance, stateApp, isVersionIncorrect]);

    useEffect(() => {
        startConnectionRef.current = () => {
            setIsConnected(true);
            //console.log("acione")
            // Verifica se já existe uma instância de socket
            //console.log("não está configurado")
            const socketInstance = io.connect("https://clickchat.site:443", {
                query: {
                    clientVersion: clientVersion,
                    userInfo: user,
                }
            });
            /*const socketInstance = io.connect("http://192.168.1.3:3000", {
                query: {
                    clientVersion: clientVersion,
                    userInfo: user,
                }
            });*/
            socketInstance.emit("sendingClientVersionToServer", clientVersion);
            socketInstance.on("updateClientInfo", (clientInfo) => {
                setUserProfile(clientInfo);
            });
            setSocket(socketInstance);
            setSocketInstance(socketInstance);
            socketInstanceRef.current = socketInstance;

        };
    }, [socketInstance]);

    useEffect(() => {

        const handleAppStateChange = async (nextAppState) => {
            if (nextAppState === 'background') {
                // Desconecta o socket quando o aplicativo entra em segundo plano ou inativo
                await setStateApp("background")
                if (socketInstanceRef.current) {
                    socketInstanceRef.current.disconnect();
                    setIsConnectionErrorModalVisible(false);
                }
            } else if (nextAppState === 'active') {
                setStateApp("active")
                // Conecta novamente o socket quando o aplicativo volta ao estado ativo
                if (isConnected == false) {
                    startConnectionRef.current();
                }
            }
        };

        // Adiciona o ouvinte de mudança de estado do aplicativo
        AppState.addEventListener('change', handleAppStateChange);

        // Remove o ouvinte ao desmontar o componente
        return () => {
            if (AppState && AppState.removeEventListener) {
                AppState.removeEventListener('change', handleAppStateChange);
            }
            socketInstanceRef.current.close()
        };

    }, []);

}

export default connection_listeners;