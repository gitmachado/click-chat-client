import React, { useContext, useState, useRef } from 'react';
import { StyleSheet, Text, View, Image, Modal, TouchableOpacity, Animated } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { AppContext } from '../../Context/AppContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';


const ImageViewerComponent = ({ }) => {
    const navigation = useNavigation();
    const [value, setValue] = useState(null);
    const [isFocus, setIsFocus] = useState(true);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [ActivityIndicatorVisible, setActivityIndicatorVisible] = useState(false);

    const scale = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;

    const { appConfig, imageViewerPhoto } = useContext(AppContext);

    const onZoomEvent = event => {
        scale.current = event.nativeEvent.scale;
    };

    const onZoomStateChange = event => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            // Reset the scale if the pinch gesture ends
            scale.current = 1;
        }
    };

    const base64ImageData = imageViewerPhoto ? imageViewerPhoto.base64 : null;
    //console.log(imageViewerPhoto.height, imageViewerPhoto.width);

    return (
        <View style={styles.container}>
            <View style={[styles.statusbar, { backgroundColor: appConfig.darkTheme ? '#202c33' : '#ff9900' }]}></View>
            <View style={{ height: 65, width: '100%', borderWidth: 1 }}>
                <View style={{ width: '11%', height: '100%', borderWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity activeOpacity={0.5} style={styles.backButton} onPress={() => navigation.navigate('Home')}>
                        <Image source={require('../../attachments/iconeVoltar.png')} style={styles.backIcon} />
                    </TouchableOpacity>
                </View>
            </View>

            <PinchGestureHandler
                onGestureEvent={onZoomEvent}
                onHandlerStateChange={onZoomStateChange}
            >
                <View style={{ flex: 1 }} collapsable={false}>
                    <Image
                        source={{ uri: `data:${imageViewerPhoto.type};base64,${base64ImageData}` }}
                        style={{ width: '100%', height: '100%', transform: [{ scale: scale.current }] }}
                        resizeMode="contain"
                    />
                </View>
            </PinchGestureHandler>
            <View style={{ height: '10%', width: '100%', borderWidth: 1 }}>
                <View style={{ width: '11%', height: '100%', borderWidth: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity activeOpacity={0.5} style={styles.backButton} onPress={() => navigation.navigate('Home')}>
                        <Image source={require('../../attachments/iconeVoltar.png')} style={styles.backIcon} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default ImageViewerComponent;

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
    },
    backIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
});
