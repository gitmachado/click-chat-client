import { StatusBar } from 'expo-status-bar';
import React, { useState, useContext, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, TouchableNativeFeedback, StyleSheet, Image, TouchableOpacity, Modal, ToastAndroid, ActivityIndicator } from 'react-native';
import { AppContext } from '../../Context/AppContext';
import { SocketContext } from '../../Context/SocketContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'
import * as ImagePicker from 'react-native-image-picker'

import profileImage from '../../attachments/perfil.png';
import profileImageDarkTheme from '../../attachments/perfilDarkTheme.png';
import saveProfileImage from '../../attachments/ok.png';

import DropdownComponent from './DropdownComponent';

import EditNameModal from './EditNameModal';
import EditGenderModal from './EditGenderModal';
import EditAgeModal from './EditAgeModal';
import EditSearchGenderModal from './EditSearchGenderModal';
import EditSearchAgeModal from './EditSearchAgeModal';

import EditNameIcon from '../../attachments/contatos.png';
import EditGenderIcon from '../../attachments/genders.png';
import EditAgeIcon from '../../attachments/age.png';

import EditNameIconDarkTheme from '../../attachments/contatosDark.png';
import EditGenderIconDarkTheme from '../../attachments/gendersDark.png';
import EditAgeIconDarkTheme from '../../attachments/ageDark.png';

const ProfileEditScreen = ({ navigation }) => {

    const { userProfile, setUserProfile, appConfig, profileOptions, setProfileOptions, setScreen } = useContext(AppContext);
    const socket = useContext(SocketContext);

    const [name, setName] = useState(profileOptions ? profileOptions.name : userProfile?.name || '');
    const [gender, setGender] = useState(profileOptions ? profileOptions.gender : userProfile?.gender || 0);
    const [age, setAge] = useState(profileOptions ? profileOptions.age : userProfile?.age || 18);
    const [searchGender, setSearchGender] = useState(profileOptions ? profileOptions.searchGender : userProfile?.searchGender || 'Masculino');
    const [searchMinAge, setSearchMinAge] = useState(profileOptions ? profileOptions.searchMinAge : userProfile?.searchMinAge || 18);
    const [searchMaxAge, setSearchMaxAge] = useState(profileOptions ? profileOptions.searchMaxAge : userProfile?.searchMaxAge || 45);
    const [photo, setPhoto] = useState(profileOptions ? profileOptions?.photo : null);

    const [editNameModalVisible, setEditNameModalVisible] = useState(false);
    const [editGenderModalVisible, setEditGenderModalVisible] = useState(false);
    const [editAgeModalVisible, setEditAgeModalVisible] = useState(false);
    const [editSearchGenderModalVisible, setEditSearchGenderModalVisible] = useState(false);
    const [editSearchAgeModalVisible, setEditSearchAgeModalVisible] = useState(false);

    const [loading, setLoading] = useState(false);
    const [optionsModalVisibility, setOptionsModalVisibility] = useState(false);

    const changeOptionsModalVisibility = (value) => {
        setOptionsModalVisibility(value);
    };

    const prohibitedCharacters = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=', '{', '}', '[', ']', '|', ':', ';', '"', "'", '<', '>', ',', '.', '?', '/', '~', '`', '\u200B', '\u2005', '\u2009', '\u3000'];

    const LoadingModal = () => {
        return (
            <Modal
                transparent={true}
                visible={loading}
                animationType="none"
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0)' }}>
                    <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 20, elevation: 5 }}>
                        <ActivityIndicator size="large" color="#ff9900" />
                        <Text style={{ marginBottom: 0, marginTop: 10 }}> Aguardando análise do servidor... </Text>
                    </View>
                </View>
            </Modal>
        );
    };

    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const storedProfile = await AsyncStorage.getItem('userProfile');

                if (storedProfile) {
                    const parsedProfile = JSON.parse(storedProfile);
                    await setUserProfile(parsedProfile);
                    console.log('Perfil carregado do AsyncStorage:', parsedProfile);

                    setName(parsedProfile.name);
                    setGender(parsedProfile.gender);
                    setAge(parsedProfile.age);
                    setSearchGender(parsedProfile.searchGender);
                    setSearchMinAge(parsedProfile.searchMinAge);
                    setSearchMaxAge(parsedProfile.searchMaxAge);
                    setPhoto(parsedProfile.photo ? parsedProfile.photo : null)
                } else {
                    console.log('Nenhum perfil encontrado no AsyncStorage.');
                }
            } catch (error) {
                console.error('Erro ao carregar perfil do AsyncStorage:', error);
            }
        };
        loadUserProfile();
    }, []);

    const saveProfileToAsyncStorage = async (profile) => {
        try {
            await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
            console.log('Perfil salvo no AsyncStorage:', profile);
        } catch (error) {
            console.error('Erro ao salvar perfil no AsyncStorage:', error);
        }
    };

    const saveProfile = async (userProfile) => {
        const updatedProfile = {
            name: name || 'Anônimo',
            gender: gender || 'Masculino',
            age: age || 18,
            searchGender: searchGender || 'Masculino',
            searchMinAge: searchMinAge || 18,
            searchMaxAge: searchMaxAge || 45,
            photo: photo ? photo : null,
        };

        if (photo) {
            const validImageExtensions = ['jpg', 'jpeg', 'png'];
            const imageUri = photo.assets[0].uri;
            const imageExtension = imageUri.split('.').pop().toLowerCase();
            if (!validImageExtensions.includes(imageExtension)) {
                ToastAndroid.show(`Imagens do tipo '${imageExtension}' não são permitidas.`, ToastAndroid.SHORT);
                setPhoto(null);
                return;
            }
        }

        try {
            setLoading(true);
            console.log("enviando: ", updatedProfile)
            socket.emit('updateProfile', updatedProfile, (callbackData) => {
                if (callbackData.success) {
                    setLoading(false);
                    setScreen("Home");
                    navigation.navigate('Home')
                    saveProfileToAsyncStorage(updatedProfile);
                    setUserProfile(updatedProfile);
                    setProfileOptions(updatedProfile);
                } else {
                    console.error(callbackData.message);
                }
            });
        } catch (error) {
            console.error('Erro ao enviar informações para o servidor:', error);
        }
    };

    const incrementAge = () => {
        if (age < 100) {
            setAge(age + 1);
        }
    };

    const decrementAge = () => {
        if (age > 18) {
            setAge(age - 1);
        }
    };

    const selectImageFromGallery = async () => {
        const res = await ImagePicker.launchImageLibrary(
            {
                includeBase64: true,
                mediaType: "photo",
                quality: 0.5,
                compressFormat: 'JPEG',
                maxWidth: 800,
                maxHeight: 600,
            },
            (res) => {
                if (res && res.assets && res.assets[0].uri) {
                    console.log(res.assets[0].uri)
                    setPhoto(res);
                }
            }

        );
    }

    const deleteProfileImage = () => { setPhoto(null) }

    return (
        <View style={{ flex: 1 }}>

            <View style={[styles.statusbar, { backgroundColor: appConfig.darkTheme ? '#202c33' : '#ff9900' }]}></View>
            {editNameModalVisible && (
                <View style={[styles.statusbar2, { backgroundColor: appConfig.darkTheme ? '#202c33' : 'ff9900' }]}></View>
            )}
            <View style={[styles.header, { backgroundColor: appConfig.darkTheme ? '#202c33' : '#ff9900' }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Image source={require('../../attachments/iconeVoltar.png')} style={styles.backIcon} />
                </TouchableOpacity>
                <View style={styles.headerLeft}>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.profileName}> Editar Perfil </Text>
                    </View>
                </View>
                <View style={styles.rightHeaderContainer}>
                    <DropdownComponent />
                </View>
                <StatusBar style={appConfig.darkTheme ? 'light' : 'dark'} />
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>

                <View style={[styles.container, { backgroundColor: appConfig.darkTheme ? '#111b21' : "white" }]}>

                    <View style={styles.photoContainer}>
                        <TouchableOpacity activeOpacity={photo ? 1 : 0.8} onPress={() => { !photo && selectImageFromGallery() }} style={styles.profileImageContainer}>
                            {photo ? (
                                <Image source={{ uri: photo.assets[0].uri }} style={styles.profileImage} />
                            ) : (
                                <Image source={appConfig.darkTheme ? profileImageDarkTheme : profileImage} style={styles.plusIcon} />
                            )}
                            {!photo ? (
                                <View style={styles.plusIconContainer}>
                                    <Image source={require('../../attachments/icone.png')} style={styles.plusIcon} />
                                </View>
                            ) : (
                                <TouchableOpacity onPress={deleteProfileImage} style={styles.plusIconContainer}>
                                    <Image source={require('../../attachments/minus.png')} style={styles.plusIcon} />
                                </TouchableOpacity>
                            )
                            }
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.searchTitle, { color: appConfig.darkTheme ? '#c1c1c1' : '#606060' }]}>INFORMAÇÕES DE PERFIL</Text>

                    <View style={[styles.card, { backgroundColor: appConfig.darkTheme ? '#202c33' : 'white' }]}>
                        <TouchableNativeFeedback onPress={() => { setEditNameModalVisible(true); }}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '10%', justifyContent: 'center', alignItems: 'flex-end' }}>
                                    <Image source={appConfig.darkTheme ? EditNameIconDarkTheme : EditNameIcon} style={styles.backIcon} />
                                </View>
                                <View style={styles.editButton}>
                                    <Text style={[styles.label, { color: appConfig.darkTheme ? '#c1c1c1' : '#606060' }]}>Nome de usuário: </Text>
                                    <Text style={{ color: appConfig.darkTheme ? '#999999' : '#808080', textAlign: "left", flex: 1, paddingLeft: 7 }}>{name || 'Anônimo'}</Text>
                                </View>
                            </View>
                        </TouchableNativeFeedback>
                    </View>

                    <View style={[styles.card, { backgroundColor: appConfig.darkTheme ? '#202c33' : 'white' }]}>
                        <TouchableNativeFeedback onPress={() => { setEditGenderModalVisible(true); }}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '10%', justifyContent: 'center', alignItems: 'flex-end' }}>
                                    <Image source={appConfig.darkTheme ? EditGenderIconDarkTheme : EditGenderIcon} style={styles.backIcon} />
                                </View>
                                <View style={styles.editButton}>
                                    <Text style={[styles.label, { color: appConfig.darkTheme ? '#c1c1c1' : '#606060' }]}>Sexo: </Text>
                                    <Text style={{ color: appConfig.darkTheme ? '#999999' : '#808080', textAlign: "left", flex: 1, paddingLeft: 7 }}>{gender == 1 ? 'Feminino' : 'Masculino'}</Text>
                                </View>
                            </View>
                        </TouchableNativeFeedback>
                    </View>

                    <View style={[styles.card, { backgroundColor: appConfig.darkTheme ? '#202c33' : 'white' }]}>
                        <TouchableNativeFeedback onPress={() => { setEditAgeModalVisible(true); }}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '10%', justifyContent: 'center', alignItems: 'flex-end' }}>
                                    <Image source={appConfig.darkTheme ? EditAgeIconDarkTheme : EditAgeIcon} style={styles.backIcon} />
                                </View>
                                <View style={styles.editButton}>
                                    <Text style={[styles.label, { color: appConfig.darkTheme ? '#c1c1c1' : '#606060' }]}>Minha Idade: </Text>
                                    <Text style={{ color: appConfig.darkTheme ? '#999999' : '#808080', textAlign: "left", flex: 1, paddingLeft: 7 }}>{age || 18}</Text>
                                </View>
                            </View>
                        </TouchableNativeFeedback>
                    </View>

                    <Text style={[styles.searchTitle, { color: appConfig.darkTheme ? '#c1c1c1' : '#606060' }]}>ESTOU PROCURANDO</Text>

                    <View style={[styles.card, { backgroundColor: appConfig.darkTheme ? '#202c33' : 'white' }]}>
                        <TouchableNativeFeedback onPress={() => { setEditSearchGenderModalVisible(true); }}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '10%', justifyContent: 'center', alignItems: 'flex-end' }}>
                                    <Image source={appConfig.darkTheme ? EditGenderIconDarkTheme : EditGenderIcon} style={styles.backIcon} />
                                </View>
                                <View style={styles.editButton}>
                                    <Text style={[styles.label, { color: appConfig.darkTheme ? '#c1c1c1' : '#606060' }]}>Sexo: </Text>
                                    <Text style={{ color: appConfig.darkTheme ? '#999999' : '#808080', textAlign: "left", flex: 1, paddingLeft: 7 }}>{searchGender == 1 ? 'Feminino' : 'Masculino'}</Text>
                                </View>
                            </View>
                        </TouchableNativeFeedback>
                    </View>

                    <View style={[styles.card, { backgroundColor: appConfig.darkTheme ? '#202c33' : 'white' }]}>
                        <TouchableNativeFeedback onPress={() => { setEditSearchAgeModalVisible(true); }}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '10%', justifyContent: 'center', alignItems: 'flex-end' }}>
                                    <Image source={appConfig.darkTheme ? EditAgeIconDarkTheme : EditAgeIcon} style={styles.backIcon} />
                                </View>
                                <View style={styles.editButton}>
                                    <Text style={[styles.label, { color: appConfig.darkTheme ? '#c1c1c1' : '#606060' }]}>Idade de: </Text>
                                    <Text style={{ color: appConfig.darkTheme ? '#999999' : '#808080', textAlign: "left", flex: 1, paddingLeft: 7 }}>{searchMinAge || 18} {'-'} {searchMaxAge || 45}</Text>
                                </View>
                            </View>
                        </TouchableNativeFeedback>
                    </View>


                    {editNameModalVisible && < EditNameModal dependencies={{ editNameModalVisible, setEditNameModalVisible, name, setName }} />}
                    {editGenderModalVisible && < EditGenderModal dependencies={{ editGenderModalVisible, setEditGenderModalVisible, gender, setGender }} />}
                    {editAgeModalVisible && < EditAgeModal dependencies={{ editAgeModalVisible, setEditAgeModalVisible, age, setAge }} />}
                    {editSearchGenderModalVisible && < EditSearchGenderModal dependencies={{ editSearchGenderModalVisible, setEditSearchGenderModalVisible, searchGender, setSearchGender }} />}
                    {editSearchAgeModalVisible && < EditSearchAgeModal dependencies={{ editSearchAgeModalVisible, setEditSearchAgeModalVisible, searchMinAge, searchMaxAge, setSearchMinAge, setSearchMaxAge }} />}

                </View>
            </ScrollView>
            <TouchableOpacity activeOpacity={0.7} style={styles.saveProfileButton} onPress={() => saveProfile(userProfile)}>
                <Image source={saveProfileImage} style={styles.saveProfileImageIcon} />
            </TouchableOpacity>
            <LoadingModal />
        </View>
    );
};

const styles = StyleSheet.create({
    statusbar: {
        height: 24,
        width: "100%",
        backgroundColor: '#ff9900',
    },
    rightHeaderContainer: {
        width: "30%",
        justifyContent: "center",
        alignItems: "flex-end",
        borderWidth: 0,
    },
    smallButton: {
        padding: 10,
    },
    menuIcon: {
        width: 30,
        height: 30,
    },
    statusbar2: {
        height: 24,
        width: "100%",
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        position: "absolute",
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
        width: "66.5%",
        marginLeft: 5,
    },
    headerTextContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: "center",
        marginTop: -4,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    button: {
        backgroundColor: '#ff9900',
        padding: 15,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 5,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 16,
        elevation: 2,
        width: '100%',
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        flexDirection: 'row'
    },
    photoContainer: {
        alignItems: 'center',
        margin: 20,
    },
    photo: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginBottom: 16,
    },
    editButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 5,
        padding: 16,
        width: '90%',
    },
    editIcon: {
        fontSize: 20,
        color: "#707070",
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        padding: 8,
        width: '100%',
        borderRadius: 5,
        marginTop: 8,
        color: "black",
    },
    searchTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 8,
        color: "#707070",
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "rgba(0, 0, 0, 0.2)",
    },
    editModal: {
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 7,
        width: '80%',
        elevation: 5,
    },
    label: {
        fontWeight: 'bold',
        color: "#707070",
    },
    profileImage: {
        width: "100%",
        height: "100%",
    },
    profileImageContainer: {
        borderColor: "gray",
        width: 200,
        height: 200,
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 2,
    },
    plusIcon: {
        width: "100%",
        height: "100%",
        resizeMode: "contain",
    },
    plusIconContainer: {
        width: 20,
        height: 20,
        borderColor: "gray",
        position: "absolute",
        backgroundColor: '#ff9900',
        top: 175,
        left: 175,
        padding: 3,
        borderRadius: 5,
    },
    saveProfileButton: {
        backgroundColor: '#ff9900',
        width: 55,
        height: 55,
        borderRadius: 10,
        padding: 5,
        position: "absolute",
        top: "85%",
        left: "78%",
        elevation: 2,
    },
    saveProfileImageIcon: {
        width: "100%",
        height: "100%",
    },
    modalOptionText: {
        fontSize: 17,
        color: '#333',
    },
    modalOptionsContainer: {
        paddingVertical: 3,
        paddingHorizontal: 0,
        borderWidth: 0,
        width: "100%"
    },
    optionsModalContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        marginTop: '12%',
        marginRight: '6%'
    },
    optionsModalContent: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        alignItems: 'flex-start',
        elevation: 5,
    },
});

export default ProfileEditScreen;
