import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, View, Button, TouchableNativeFeedback, Text, Image, Animated } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import { useFocusEffect } from '@react-navigation/native';
import { AppContext } from '../../Context/AppContext';

TrackPlayer.registerPlaybackService(() => require('./service.js'));

const App = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const animatedValue1 = new Animated.Value(0);
    const animatedValue2 = new Animated.Value(0);
    const [currentTrack, setCurrentTrack] = useState(null);

    const { isDarkThemeEnabled } = useContext(AppContext);

    useEffect(() => {
        const initializePlayer = async () => {
            await TrackPlayer.setupPlayer();
            startStreaming(); // Inicia a reprodução assim que o player estiver configurado
        };

        initializePlayer();

        return () => {
            stopStreaming();
        };
    }, []);


    const animateText = (value) => {
        Animated.loop(
            Animated.timing(value, {
                toValue: 1,
                duration: 10000, // Duração da animação em milissegundos
                useNativeDriver: true, // Usa o driver nativo para uma animação mais suave e contínua
            })
        ).start();
    };

    useEffect(() => {
        if (isPlaying) {
            animateText(animatedValue1);
            setTimeout(() => {
                animateText(animatedValue2);
            }, 5000); // Atraso de 2 segundos (2000 milissegundos)
        }
    }, [isPlaying]);

    const translateX1 = animatedValue1.interpolate({
        inputRange: [0, 1],
        outputRange: [200, -200],
    });

    const translateX2 = animatedValue2.interpolate({
        inputRange: [0, 1],
        outputRange: [200, -200],
    });

    const startStreaming = async () => {
        await TrackPlayer.add({
            id: '1',
            //url: 'http://mediaserv30.live-streams.nl:8000/live',
            url: 'http://192.168.1.6:8000',
            title: 'Jamendo Lounge',
        });

        await TrackPlayer.setVolume(1);
        await TrackPlayer.play();
        setIsPlaying(true);
    };

    const stopStreaming = async () => {
        await TrackPlayer.stop();
        setIsPlaying(false);
    };

    useFocusEffect(
        React.useCallback(() => {

            console.log('teste')
            animateText(animatedValue1);
            setTimeout(() => {
                animateText(animatedValue2);
            }, 5000); // Atraso de 2 segundos (2000 milissegundos)

            return () => {

            };
        }, [])
    );

    return (
        <View style={[styles.audioStreamContainer, { borderBottomWidth: isDarkThemeEnabled ? 0 : 0, borderTopWidth: isDarkThemeEnabled ? 0 : 0, borderColor: 'white', backgroundColor: isDarkThemeEnabled ? '#25333d' : '#212121' }]}>
            <View style={styles.section1}>
                <TouchableNativeFeedback onPress={isPlaying ? stopStreaming : startStreaming}>
                    <View style={styles.playIconContainer}>
                        <Image source={isPlaying ? require('../../attachments/pause.png') : require('../../attachments/play.png')} style={styles.playIcon} />
                    </View>
                </TouchableNativeFeedback>
            </View>

            <View style={styles.radioTextWrapper}>
                {/* <Animated.View style={[styles.radioTextContainer, { transform: [{ translateX: translateX1 }] }]}> */}
                    <Text style={styles.radioText}> Ao Vivo </Text>
                {/* </Animated.View> /*}
                {/*
                    {isPlaying &&
                    <Animated.View style={[{ position: 'absolute' }, styles.radioTextContainer, { transform: [{ translateX: translateX2 }] }]}>
                        <Text style={styles.radioText}> Nome da música da musica la la la </Text>
                    </Animated.View>
                }
                */}
            </View>

            <View style={styles.section3}>
                <View style={styles.soundWaveGifContainer}>
                    {isPlaying && (
                        <Image source={require('../../attachments/sound_wave.gif')} style={styles.soundWaveGif} />
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    radioTextWrapper: {
        overflow: 'hidden', // Esconde qualquer conteúdo que ultrapasse os limites do contêiner
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    audioStreamContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#202020',
        flexDirection: 'row',
        height: '5%',
        elevation: 5
    },
    playIcon: {
        width: '80%',
        height: '80%',
    },
    playIconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0,
    },
    soundWaveGif: {
        width: 35,
        height: 30,
    },
    soundWaveGifContainer: {
        borderWidth: 0,
        marginLeft: 7,
        height: '100%',
        justifyContent: 'center'
    },
    radioTextContainer: {
        borderWidth: 0,
        height: '100%',
        justifyContent: 'center',
        width: "500%", // Largura fixa para o container de texto
    },
    radioText: {
        color: 'white',
        fontWeight: 'bold',
    },
    section1: {
        width: '40%',
        borderWidth: 0,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    section3: {
        width: '40%',
        borderWidth: 0,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
});

export default App;