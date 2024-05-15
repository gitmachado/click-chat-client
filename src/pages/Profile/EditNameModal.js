import React, { useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { AppContext } from '../../Context/AppContext';

const EditNameModal = ({ dependencies }) => {

    const { appConfig } = useContext(AppContext);

    const prohibitedCharacters = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=', '{', '}', '[', ']', '|', ':', ';', '"', "'", '<', '>', ',', '.', '?', '/', '~', '`', '\u200B', '\u2005', '\u2009', '\u3000'];

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={dependencies.editNameModalVisible}
        >
            <View style={[styles.modalContainer]}>
                <View style={[styles.editModal, { backgroundColor: appConfig.darkTheme ? '#202c33' : 'white' }]}>
                    <Text style={{ color: appConfig.darkTheme ? 'white' : "#505050" }}>{`Nome de usuário:`}</Text>

                    <TextInput
                        style={[styles.input, { color: appConfig.darkTheme ? 'white' : '#505050', borderColor: appConfig.darkTheme ? 'white' : 'gray' }]}
                        value={dependencies.name}
                        onChangeText={(text) => {
                            let filteredText = text;
                            for (let i = 0; i < prohibitedCharacters.length; i++) {
                                filteredText = filteredText.split(prohibitedCharacters[i]).join('');
                            }
                            dependencies.setName(filteredText);
                        }}
                        maxLength={15}
                    />

                    <TouchableOpacity activeOpacity={0.7} style={styles.button} onPress={() => { dependencies.setName(dependencies.name); dependencies.setEditNameModalVisible(false); }} >
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
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 5,
        height: 40,
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

export default EditNameModal;