import React, { useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import { AppContext } from '../../Context/AppContext';

const EditGenderModal = ({ dependencies }) => {

    const { appConfig } = useContext(AppContext);

    const prohibitedCharacters = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=', '{', '}', '[', ']', '|', ':', ';', '"', "'", '<', '>', ',', '.', '?', '/', '~', '`', '\u200B', '\u2005', '\u2009', '\u3000'];

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={dependencies.editGenderModalVisible}
        >
            <View style={[styles.modalContainer]}>
                <View style={[styles.editModal, { backgroundColor: appConfig.darkTheme ? '#202c33' : 'white' }]}>
                    <Text style={{ color: appConfig.darkTheme ? 'white' : "#505050" }}>{`Sexo:`}</Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
                        <TouchableOpacity activeOpacity={0.7} onPress={() => { dependencies.setGender(0); }} style={{ width: '40%', height: 60, borderWidth: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', borderRadius: 5 }}>
                            {dependencies.gender !== 1 && (
                                <View style={{ backgroundColor: '#ff9900', borderWidth: 0, borderColor: 'white', borderRadius: 5, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', position: 'absolute', top: -5, left: -5, overflow: 'hidden' }}>
                                    <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', borderBottomLeftRadius: 3, borderBottomRightRadius: 3, width: '100%', height: '50%', position: 'absolute', top: 0 }}></View>
                                    <Image source={require('../../attachments/ok.png')} style={{ width: '100%', height: '100%' }} />
                                </View>
                            )}
                            <Image source={require('../../attachments/masculino2.png')} style={{ width: 20, height: 20, marginBottom: 3 }} />
                            <Text style={{ color: 'white', fontWeight: 'bold' }}> Masculino </Text>
                        </TouchableOpacity>

                        <TouchableOpacity activeOpacity={0.7} onPress={() => { dependencies.setGender(1); }} style={{ width: '40%', height: 60, borderWidth: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', borderRadius: 5 }}>
                            {dependencies.gender == 1 && (
                                <View style={{ backgroundColor: '#ff9900', borderWidth: 0, borderColor: 'white', borderRadius: 5, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', position: 'absolute', top: -5, left: -5, overflow: 'hidden' }}>
                                    <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', borderBottomLeftRadius: 3, borderBottomRightRadius: 3, width: '100%', height: '50%', position: 'absolute', top: 0 }}></View>
                                    <Image source={require('../../attachments/ok.png')} style={{ width: '100%', height: '100%' }} />
                                </View>
                            )}
                            <Image source={require('../../attachments/feminino2.png')} style={{ width: 20, height: 20, marginBottom: 3 }} />
                            <Text style={{ color: 'white', fontWeight: 'bold' }}> Feminino </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={() => { dependencies.setGender(dependencies.gender); dependencies.setEditGenderModalVisible(false); }} >
                        <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', borderBottomLeftRadius: 6, borderBottomRightRadius: 6, width: '100%', height: '50%', position: 'absolute', top: 0 }}></View>
                        <Text style={{ color: "white", fontWeight: "bold", fontSize: 15 }}> PRONTO </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({

    button: {
        backgroundColor: '#ff9900',
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 5,
        overflow: 'hidden'
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
});

export default EditGenderModal;