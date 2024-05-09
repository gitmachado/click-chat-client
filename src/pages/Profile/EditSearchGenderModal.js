import React, { useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import { AppContext } from '../../Context/AppContext';

const EditSearchGenderModal = ({ dependencies }) => {

    const { appConfig } = useContext(AppContext);

    const prohibitedCharacters = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=', '{', '}', '[', ']', '|', ':', ';', '"', "'", '<', '>', ',', '.', '?', '/', '~', '`', '\u200B', '\u2005', '\u2009', '\u3000'];

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={dependencies.editSearchGenderModalVisible}
        >
            <View style={[styles.modalContainer]}>
                <View style={[styles.editModal, { backgroundColor: appConfig.darkTheme ? '#202c33' : 'white' }]}>
                    <Text style={{ color: appConfig.darkTheme ? 'white' : "#505050" }}>{`Sexo:`}</Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
                        <TouchableOpacity activeOpacity={0.7} onPress={() => { dependencies.setSearchGender(0); }} style={{ width: '40%', height: 60, borderWidth: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', borderRadius: 5 }}>
                            {dependencies.searchGender !== 1 && (
                                <View style={{ backgroundColor: '#ff9900', borderWidth: 0, borderColor: 'white', borderRadius: 5, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', padding: 1, position: 'absolute', top: -5, left: -5 }}>
                                    <Image source={require('../../attachments/ok.png')} style={{ width: '100%', height: '100%', marginBottom: 3 }} />
                                </View>
                            )}
                            <Image source={require('../../attachments/masculino2.png')} style={{ width: 20, height: 20, marginBottom: 3 }} />
                            <Text style={{ color: 'white', fontWeight: 'bold' }}> Masculino </Text>
                        </TouchableOpacity>

                        <TouchableOpacity activeOpacity={0.7} onPress={() => { dependencies.setSearchGender(1); }} style={{ width: '40%', height: 60, borderWidth: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', borderRadius: 5 }}>
                            {dependencies.searchGender == 1 && (
                                <View style={{ backgroundColor: '#ff9900', borderWidth: 0, borderColor: 'white', borderRadius: 5, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', padding: 1, position: 'absolute', top: -5, left: -5 }}>
                                    <Image source={require('../../attachments/ok.png')} style={{ width: '100%', height: '100%', marginBottom: 3 }} />
                                </View>
                            )}
                            <Image source={require('../../attachments/feminino2.png')} style={{ width: 20, height: 20, marginBottom: 3 }} />
                            <Text style={{ color: 'white', fontWeight: 'bold' }}> Feminino </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={() => { dependencies.setSearchGender(dependencies.searchGender); dependencies.setEditSearchGenderModalVisible(false); }} >
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
        padding: 15,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 5,
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

export default EditSearchGenderModal;