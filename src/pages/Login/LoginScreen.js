import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Home from '../Home/Home';
import { SocketContext } from '../../Context/SocketContext';
import { AppContext } from '../../Context/AppContext';
import messaging from '@react-native-firebase/messaging';
// Obter o token FCM
const fcmToken = messaging().getToken();

import LogoImage from '../../attachments/logotipo.jpg';
import GoogleLogo from '../../attachments/google-logo.webp';

function App() {
    const navigation = useNavigation();
    const socket = useContext(SocketContext);
    const [initializing, setInitializing] = useState(true);
    const { user, setUser, onGoogleButtonPress, isDarkThemeEnabled } = useContext(AppContext);
    const [autoLoginEventSent, setAutoLoginEventSent] = useState(false);
    const [currentScreen, setCurrentScreen] = useState('Login');

    function onAuthStateChanged(user) {
        setUser(user);
        if (initializing) setInitializing(false);
    }

    useEffect(() => {
        const fetchData = async () => {
            const subscriber = auth().onAuthStateChanged(onAuthStateChanged);

            if (user && socket && !autoLoginEventSent) {
                const { uid, displayName, email } = user;

                // Obter o token FCM de forma assíncrona
                const fcmToken = await messaging().getToken();
                //fcmToken.toString();

                /*socket.emit('userAuthenticated', {
                  userId: uid,
                  userInfo: {
                    displayName,
                    email,
                    fcmToken,
                  },
                });*/

                /*console.log({
                  userId: uid,
                  userInfo: {
                    displayName,
                    email,
                    fcmToken,
                  },
                })*/

                setAutoLoginEventSent(true);
            }

            if (user) {
                if (currentScreen == "Login") {
                    navigation.navigate('Home');
                }
            }

            return subscriber;
        };

        fetchData();
    }, [user, socket, autoLoginEventSent]);

    const handleGoogleSignIn = async () => {
        try {
            const authenticatedUser = await onGoogleButtonPress();
            if (socket && authenticatedUser) {
                const { uid, displayName, email } = authenticatedUser.user;

                const fcmToken = await messaging().getToken();

                /*socket.emit('userAuthenticated', {
                  userId: uid,
                  userInfo: {
                    displayName,
                    email,
                    fcmToken, // Adicione o token FCM ao objeto userInfo
                  },
                });*/
            }
        } catch (error) {
            console.error('Erro ao autenticar com o Google:', error);
        }
    };

    useEffect(() => {
        const unsubscribeFocus = navigation.addListener('focus', () => {
            setCurrentScreen('Login');
        });

        const unsubscribeBlur = navigation.addListener('blur', () => {
            setCurrentScreen(null);
        });

        return () => {
            unsubscribeFocus();
            unsubscribeBlur();
        };
    }, [navigation]);

    if (initializing) return null;

    if (!user) {
        return (
            <View style={[styles.container, { backgroundColor: isDarkThemeEnabled ? 'white' : 'white' }]}>
                <View style={{ justifyContent: "center", alignItems: "center", height: "20%" }}></View>

                <View style={{ justifyContent: "center", alignItems: "center", height: "50%" }}>
                    <Image source={LogoImage} style={styles.logo} />
                    <Text style={[styles.appName]}>ClickChat</Text>
                    <Text style={[styles.slogan]}>Conheça pessoas, converse anonimamente.</Text>
                    <View style={{ borderRadius: 5, elevation: 3, backgroundColor: '#fff' }}>
                        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
                            <Image source={GoogleLogo} style={{ width: 25, height: 25, marginRight: 8 }} />
                            <Text style={styles.googleButtonText}>Entrar com o Google</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={[{ color: "#404040", marginTop: "2%", fontSize: 12, textAlign: "center" }]}> Sua privacidade e anonimato serão preservados. </Text>
                </View>

                <View style={{ justifyContent: "center", alignItems: "center", height: "20%" }}></View>

                <TouchableOpacity onPress={() => navigation.navigate('Privacidade')}>
                    <Text style={[styles.policyText]}>
                        Ao continuar, você concorda com nossas{' '}
                        <Text
                            style={styles.policyTextLink}
                            onPress={() => navigation.navigate('Privacidade')}
                        >
                            Políticas de Privacidade.
                        </Text>{' '}
                    </Text>
                </TouchableOpacity>
            </View >
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "white",
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 20,
        borderRadius: 10,
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        color: "#404040",
    },
    slogan: {
        fontSize: 15,
        marginBottom: 20,
        color: "#404040",
    },
    googleButton: {
        backgroundColor: '#fc7a00',
        padding: 10,
        borderRadius: 5,
        flexDirection: 'row',
        elevation: 0,
    },
    googleButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    policyText: {
        fontSize: 11,
        marginTop: 20,
        textAlign: 'center',
        color: "#404040",
        paddingHorizontal: 16
    },
    policyTextLink: {
        fontSize: 11,
        color: 'blue',
        textDecorationLine: 'underline',
    },
});

export default App;
