import React, { useContext, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { AppContext } from '../../Context/AppContext';

const EditAgeModal = ({ dependencies }) => {

    const { appConfig } = useContext(AppContext);
    const [tempAge, setTempAge] = useState(dependencies.age);

    const prohibitedCharacters = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=', '{', '}', '[', ']', '|', ':', ';', '"', "'", '<', '>', ',', '.', '?', '/', '~', '`', '\u200B', '\u2005', '\u2009', '\u3000'];

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={dependencies.editAgeModalVisible}
        >
            <View style={[styles.modalContainer]}>
                <View style={[styles.editModal, { backgroundColor: appConfig.darkTheme ? '#202c33' : 'white', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }]}>
                    <View style={{ width: '30%' }}>
                        <Text style={{ color: appConfig.darkTheme ? 'white' : "#505050" }}>{`Idade:`}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 5, width: '100%' }}>
                        <TouchableOpacity activeOpacity={0.9} onPress={() => { if (tempAge > 18) { setTempAge(parseInt(tempAge) - 1) } }} style={{ borderColor: 'gray', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, width: 50, height: 50, borderWidth: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                            <Text style={{ fontSize: 25, color: 'gray' }}> {'<'} </Text>
                        </TouchableOpacity>
                        <View style={{ borderColor: 'gray', borderRightWidth: 0, borderLeftWidth: 0, width: 50, height: 50, borderWidth: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                            <Text style={{ fontSize: 20, color: 'gray' }}> {tempAge} </Text>
                        </View>
                        <TouchableOpacity activeOpacity={0.9} onPress={() => { if (tempAge < 100) { setTempAge(parseInt(tempAge) + 1) } }} style={{ borderColor: 'gray', borderTopRightRadius: 8, borderBottomRightRadius: 8, width: 50, height: 50, borderWidth: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                            <Text style={{ fontSize: 25, color: 'gray' }}> {'>'} </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={[styles.button, { width: '100%', marginTop: 10 }]} onPress={() => { dependencies.setAge(tempAge); dependencies.setEditAgeModalVisible(false); }} >
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

export default EditAgeModal;