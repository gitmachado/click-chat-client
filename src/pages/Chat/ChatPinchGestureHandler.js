import React, { useState, useRef, createRef, useContext, useEffect } from 'react';
import { View, Text, Image, Animated, Dimensions, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';
import { AppContext } from '../../Context/AppContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { handleSendImage } from './chatFunctions';

const App = () => {

    const navigation = useNavigation();

    const { socket, appConfig, imageViewerPhoto, setChatImageViewerModalVisible, setImageViewerModalVisible, setConversasDoAsync, conversasDoAsync, imageViewerModalVisible, setImageViewerPhoto, conversationMessages, setConversationMessages, currentConversation, setCurrentConversation } = useContext(AppContext);

    const [panEnabled, setPanEnabled] = useState(false);
    const [input, setInput] = useState('');
    //console.log('set: ', setCurrentConversation)
    const prohibitedCharacters = [];

    const scale = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;

    const pinchRef = createRef();
    const panRef = createRef();

    const onPinchEvent = Animated.event([{
        nativeEvent: { scale }
    }],
        { useNativeDriver: true });

    const onPanEvent = Animated.event([{
        nativeEvent: {
            translationX: translateX,
            translationY: translateY
        }
    }],
        { useNativeDriver: true });

    const handlePinchStateChange = ({ nativeEvent }) => {
        // enabled pan only after pinch-zoom
        if (nativeEvent.state === State.ACTIVE) {
            setPanEnabled(true);
        }

        // when scale < 1, reset scale back to original (1)
        const nScale = nativeEvent.scale;
        if (nativeEvent.state === State.END) {
            if (nScale < 1) {
                Animated.spring(scale, {
                    toValue: 1,
                    useNativeDriver: true
                }).start();
                Animated.spring(translateX, {
                    toValue: 0,
                    useNativeDriver: true
                }).start();
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true
                }).start();

                setPanEnabled(false);
            }
        }
    };

    const base64ImageData = imageViewerPhoto ? imageViewerPhoto.base64 : null;

    return (
        <View style={{ width: '100%', height: '100%', backgroundColor: appConfig.darkTheme ? '#111b21' : 'black' }}>
            <PanGestureHandler
                onGestureEvent={onPanEvent}
                ref={panRef}
                simultaneousHandlers={[pinchRef]}
                enabled={panEnabled}
                failOffsetX={[-1000, 1000]}
                shouldCancelWhenOutside
            >
                <Animated.View>
                    <PinchGestureHandler
                        ref={pinchRef}
                        onGestureEvent={onPinchEvent}
                        simultaneousHandlers={[panRef]}
                        onHandlerStateChange={handlePinchStateChange}
                        style={{ borderWidth: 1, padding: 10 }}
                    >
                        <Animated.Image
                            source={{ uri: `data:${imageViewerPhoto.type};base64,${base64ImageData}` }}
                            style={{
                                width: '100%',
                                height: '100%',
                                transform: [{ scale }, { translateX }, { translateY }]
                            }}
                            resizeMode="contain"
                        />
                    </PinchGestureHandler>
                </Animated.View>

            </PanGestureHandler>
            <View style={[styles.statusbar, { position: 'absolute', backgroundColor: appConfig.darkTheme ? '#202c33' : '#ff9900' }]}></View>
            <View style={{ height: 65, width: '100%', borderWidth: 0, backgroundColor: appConfig.darkTheme ? '#202c33' : '#ff9900', position: 'absolute', marginTop: 24, flexDirection: 'row', elevation: 5 }}>
                <View style={{ width: '11%', height: '100%', borderWidth: 0, justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity activeOpacity={0.5} style={styles.backButton} onPress={() => { setChatImageViewerModalVisible(false); /*console.log(imageViewerModalVisible);*/ }}>
                        <Image source={require('../../attachments/iconeVoltar.png')} style={styles.backIcon} />
                    </TouchableOpacity>
                </View>
                <View style={{ height: '100%', width: '89%', borderWidth: 0, justifyContent: 'center', alignItems: 'flex-start' }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}> Visualizar Imagem </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundColor: '#202c33',
    },
    statusbar: {
        height: 24,
        width: '100%',
        backgroundColor: '#ff9900',
    },
    backButton: {
        padding: 5,
        marginLeft: 10
    },
    backIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    input: {
        flex: 1,
        borderWidth: 0.5,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 0,
        marginRight: 0,
        color: "black",
        height: 50,
        fontSize: 16,
        textAlign: 'left',
        width: '100%'
    },
});

export default App;