import React, { useContext, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { AppContext } from '../../Context/AppContext';

const EditAgeModal = ({ dependencies }) => {

    const { appConfig } = useContext(AppContext);
    const [tempMinAge, setTempMinAge] = useState(dependencies.searchMinAge || 18);
    const [tempMaxAge, setTempMaxAge] = useState(dependencies.searchMaxAge || 45);

    const prohibitedCharacters = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=', '{', '}', '[', ']', '|', ':', ';', '"', "'", '<', '>', ',', '.', '?', '/', '~', '`', '\u200B', '\u2005', '\u2009', '\u3000'];

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={dependencies.editSearchAgeModalVisible}
        >
            <View style={[styles.modalContainer]}>
                <View style={[styles.editModal, { backgroundColor: appConfig.darkTheme ? '#202c33' : 'white', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }]}>
                    <View style={{ width: '100%' }}>
                        <Text style={{ color: appConfig.darkTheme ? 'white' : "#505050" }}>{`Idade:`}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center', borderWidth: 0, flexWrap: 'wrap' }}>
                        <View style={{ width: '50%', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: appConfig.darkTheme ? 'white' : '#505050' }}>Min</Text>
                        </View>
                        <View style={{ width: '50%', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: appConfig.darkTheme ? 'white' : '#505050' }}>Max</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 5, width: '50%', borderWidth: 0 }}>
                            <TouchableOpacity activeOpacity={0.9} onPress={() => { if (tempMinAge > 18) { setTempMinAge(parseInt(tempMinAge) - 1) } }} style={{ borderColor: 'gray', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, width: 40, height: 40, borderWidth: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                                <Text style={{ fontSize: 25, color: 'gray' }}> {'<'} </Text>
                            </TouchableOpacity>
                            <View style={{ borderColor: 'gray', borderRightWidth: 0, borderLeftWidth: 0, width: 40, height: 40, borderWidth: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                                <Text style={{ fontSize: 20 }}> {tempMinAge} </Text>
                            </View>
                            <TouchableOpacity activeOpacity={0.9} onPress={() => { if (tempMinAge < 100 && tempMinAge < tempMaxAge) { setTempMinAge(parseInt(tempMinAge) + 1) } }} style={{ borderColor: 'gray', borderTopRightRadius: 8, borderBottomRightRadius: 8, width: 40, height: 40, borderWidth: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                                <Text style={{ fontSize: 25, color: 'gray' }}> {'>'} </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 5, width: '50%' }}>
                            <TouchableOpacity activeOpacity={0.9} onPress={() => { if (tempMaxAge > 18 && tempMaxAge > tempMinAge) { setTempMaxAge(parseInt(tempMaxAge) - 1) } }} style={{ borderColor: 'gray', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, width: 40, height: 40, borderWidth: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                                <Text style={{ fontSize: 25, color: 'gray' }}> {'<'} </Text>
                            </TouchableOpacity>
                            <View style={{ borderColor: 'gray', borderRightWidth: 0, borderLeftWidth: 0, width: 40, height: 40, borderWidth: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                                <Text style={{ fontSize: 20 }}> {tempMaxAge} </Text>
                            </View>
                            <TouchableOpacity activeOpacity={0.9} onPress={() => { if (tempMaxAge < 100) { setTempMaxAge(parseInt(tempMaxAge) + 1) } }} style={{ borderColor: 'gray', borderTopRightRadius: 8, borderBottomRightRadius: 8, width: 40, height: 40, borderWidth: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                                <Text style={{ fontSize: 25, color: 'gray' }}> {'>'} </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={[styles.button, { width: '100%' }]} onPress={() => { dependencies.setSearchMinAge(tempMinAge); dependencies.setSearchMaxAge(tempMaxAge); dependencies.setEditSearchAgeModalVisible(false); }} >
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

export default EditAgeModal;