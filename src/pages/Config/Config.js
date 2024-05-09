import { StatusBar } from 'expo-status-bar';
import React, { useState, useContext, useEffect } from 'react';
import { ScrollView, View, Text, Switch, TouchableNativeFeedback, StyleSheet, Image, TouchableOpacity, Modal, ToastAndroid, ActivityIndicator } from 'react-native';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import { AppContext } from '../../Context/AppContext';

const ConfigScreen = ({ navigation }) => {

    const { appConfig, setAppConfig, socket } = useContext(AppContext);

    const [localIsDarkThemeEnabled, setLocalIsDarkThemeEnabled] = useState(appConfig.darkTheme);
    const [isReadConfirmationEnabled, setIsReadConfirmationEnable] = useState(appConfig.readConfirmation);
    const [isDisabledStatusEnabled, setIsDisabledStatusEnabled] = useState(appConfig.disableStatus);
    const [isDisabledNotificationsEnabled, setIsDisabledNotificationsEnabled] = useState(appConfig.disableNotifications);

    useEffect(() => {
        setAppConfig({
            darkTheme: localIsDarkThemeEnabled,
            readConfirmation: isReadConfirmationEnabled,
            disableStatus: isDisabledStatusEnabled,
            disableNotifications: isDisabledNotificationsEnabled
        });
        socket.emit('updateDisableNotifications', isDisabledNotificationsEnabled);
    }, [localIsDarkThemeEnabled, isReadConfirmationEnabled, isDisabledStatusEnabled, isDisabledNotificationsEnabled])


    appConfig.darkTheme ? changeNavigationBarColor('#202c33', false) : changeNavigationBarColor('white', true);

    function switchDarkTheme() {
        setLocalIsDarkThemeEnabled(!localIsDarkThemeEnabled);
    }

    return (
        <View style={[styles.mainContainer, { backgroundColor: appConfig.darkTheme ? '#111b21' : 'white' }]}>
            <View style={[styles.statusbar, { backgroundColor: appConfig.darkTheme ? '#202c33' : '#ff9900' }]}></View>

            <View style={[styles.header, { backgroundColor: appConfig.darkTheme ? '#202c33' : '#ff9900' }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Image source={require('../../attachments/iconeVoltar.png')} style={styles.backIcon} />
                </TouchableOpacity>
                <View style={styles.headerLeft}>

                    <View style={styles.headerTextContainer}>
                        <Text style={styles.profileName}> Configurações </Text>
                    </View>
                </View>
                <StatusBar style={appConfig.darkTheme ? 'light' : 'dark'} />
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', height: '89%' }}>
                <View style={{ borderBottomWidth: 1, borderColor: appConfig.darkTheme ? '#c1c1c1' : 'gray', padding: 15, paddingBottom: 15, width: '100%', borderWidth: 0, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <View style={{ width: '100%', marginBottom: 10 }}>
                        <Text style={{ color: appConfig.darkTheme ? '#c1c1c1' : '#505050', fontWeight: 'bold' }}>Exibição</Text>
                    </View>

                    <View style={{ borderWidth: 0, width: '80%' }}>
                        <View style={{ width: '100%', borderWidth: 0 }}>
                            <Text style={{ color: appConfig.darkTheme ? 'white' : '#404040', fontSize: 17 }}>Tema escuro</Text>
                        </View>
                        <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap' }}>
                            <View style={{ width: '80%', borderWidth: 0, justifyContent: 'center' }}>
                                <Text style={{ color: appConfig.darkTheme ? '#c1c1c1' : '#505050' }}>{localIsDarkThemeEnabled ? 'Ativado' : 'Desativado'}</Text>
                            </View>
                            <View style={{ borderWidth: 0, justifyContent: 'center', alignItems: 'flex-end', width: '20%' }}>
                                <Switch
                                    trackColor={{ false: "#767577", true: "#ff9900" }}
                                    thumbColor={localIsDarkThemeEnabled ? "white" : "#f4f3f4"}
                                    onValueChange={() => { setLocalIsDarkThemeEnabled(!localIsDarkThemeEnabled); }}
                                    value={localIsDarkThemeEnabled}
                                    style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }}
                                />
                            </View>
                        </View>
                    </View>

                </View>
                <View style={{ borderBottomWidth: 1, borderColor: appConfig.darkTheme ? '#c1c1c1' : 'gray', padding: 15, width: '100%', borderWidth: 0, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <View style={{ width: '100%', marginBottom: 10 }}>
                        <Text style={{ color: appConfig.darkTheme ? '#c1c1c1' : '#505050', fontWeight: 'bold' }}>Privacidade</Text>
                    </View>

                    <View style={{ borderWidth: 0, width: '80%', marginBottom: 15 }}>
                        <View style={{ width: '100%', borderWidth: 0 }}>
                            <Text style={{ color: appConfig.darkTheme ? 'white' : '#404040', fontSize: 17 }}>Confirmações de leitura</Text>
                        </View>
                        <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap' }}>
                            <View style={{ width: '80%', borderWidth: 0, justifyContent: 'center' }}>
                                <Text style={{ color: appConfig.darkTheme ? '#c1c1c1' : '#505050' }}>{isReadConfirmationEnabled ? 'Ativado' : 'Desativado'}</Text>
                            </View>
                            <View style={{ borderWidth: 0, justifyContent: 'center', alignItems: 'flex-end', width: '20%' }}>
                                <Switch
                                    trackColor={{ false: "#767577", true: "#ff9900" }}
                                    thumbColor={isReadConfirmationEnabled ? "white" : "#f4f3f4"}
                                    onValueChange={() => { setIsReadConfirmationEnable(!isReadConfirmationEnabled) }}
                                    value={isReadConfirmationEnabled}
                                    style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }}
                                />
                            </View>
                        </View>
                        <View style={{ width: '100%', justifyContent: 'center' }}>
                            <Text style={{ color: appConfig.darkTheme ? '#c1c1c1' : '#505050', textAlign: 'left' }}>Se essa opção estiver desativada, você não poderá ver nem exibir confirmações de leitura. </Text>
                        </View>
                    </View>

                </View>
                <View style={{ borderBottomWidth: 1, borderColor: appConfig.darkTheme ? '#c1c1c1' : 'gray', padding: 15, paddingBottom: 22, width: '100%', borderWidth: 0, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <View style={{ width: '100%', marginBottom: 10 }}>
                        <Text style={{ color: appConfig.darkTheme ? '#c1c1c1' : '#505050', fontWeight: 'bold' }}>Notificações</Text>
                    </View>

                    <View style={{ borderWidth: 0, width: '80%' }}>
                        <View style={{ width: '100%', borderWidth: 0 }}>
                            <Text style={{ color: appConfig.darkTheme ? 'white' : '#404040', fontSize: 17 }}>Desabilitar notificações</Text>
                        </View>
                        <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap' }}>
                            <View style={{ width: '80%', borderWidth: 0, justifyContent: 'center' }}>
                                <Text style={{ color: appConfig.darkTheme ? '#c1c1c1' : '#505050' }}>{isDisabledNotificationsEnabled ? 'Ativado' : 'Desativado'}</Text>
                            </View>
                            <View style={{ borderWidth: 0, justifyContent: 'center', alignItems: 'flex-end', width: '20%' }}>
                                <Switch
                                    trackColor={{ false: "#767577", true: "#ff9900" }}
                                    thumbColor={isDisabledNotificationsEnabled ? "white" : "#f4f3f4"}
                                    onValueChange={() => { setIsDisabledNotificationsEnabled(!isDisabledNotificationsEnabled) }}
                                    value={isDisabledNotificationsEnabled}
                                    style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }}
                                />
                            </View>
                        </View>
                        <View style={{ width: '100%', justifyContent: 'center' }}>
                            <Text style={{ color: appConfig.darkTheme ? '#c1c1c1' : '#505050', textAlign: 'left' }}>Se essa opção estiver ativada, você não receberá notificações de mensagens. </Text>
                        </View>
                    </View>

                </View>
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        height: '100%',
        width: '100%',
    },
    statusbar: {
        height: 24,
        width: "100%",
        backgroundColor: '#ff9900',
    },
    headerTextContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: "center",
        marginTop: -4,
    },
    profileName: {
        fontWeight: "bold",
        fontSize: 18,
        color: "white",
        marginTop: 2,
        marginLeft: 5
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 20,
        paddingVertical: 10,
        width: '100%',
        height: "8%",
        backgroundColor: '#ff9900',
        elevation: 5,
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
        width: "60%",
        marginLeft: 5
    },

});

export default ConfigScreen;
