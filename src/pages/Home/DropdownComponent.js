import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { AppContext } from '../../Context/AppContext';
import { useNavigation, useRoute } from '@react-navigation/native';

const data = [
    { label: 'Configurações', value: '1' },
];

const DropdownComponent = () => {
    const [value, setValue] = useState(null);
    const [isFocus, setIsFocus] = useState(true);

    const { appConfig, setScreen } = useContext(AppContext);

    const navigation = useNavigation();
    function handleDropdownChange(selectedItem) {
        //console.log(selectedItem.label)
        if (selectedItem.label == 'Editar Perfil') {
            setScreen("notHome");
            navigation.navigate('Editar Perfil')
        }
        if (selectedItem.label == 'Configurações') {
            setScreen("notHome");
            navigation.navigate('Config')
        }
    }

    return (
        <View style={styles.container}>
            <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                itemContainerStyle={{ width: '100%', paddingVertical: 5 }}
                containerStyle={[styles.containerStyle, { backgroundColor: appConfig.darkTheme ? '#202c33' : 'white' }]}
                activeColor={'transparent'}
                dropdownPosition="bottom"
                data={data}
                labelField="label"
                valueField="value"
                searchField="search"
                placeholder=' '
                searchPlaceholder="Search..."
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                showsVerticalScrollIndicator={false}
                onChange={item => {
                    setValue(item.value);
                    setIsFocus(false);
                }}
                visibleSelectedItem={false}
                mode={'default'}
                search={false}
                renderRightIcon={() => (
                    <Image style={styles.rightIcon} source={require('../../attachments/options.png')} />
                )}
                renderItem={(item, selected) => (
                    <View style={[styles.item, selected && { backgroundColor: 'transparent' }]}>
                        <Text style={[styles.itemText, { color: appConfig.darkTheme ? 'white' : '#505050' }]}>{item.label}</Text>
                    </View>
                )}
                onChange={(selectedItem) => handleDropdownChange(selectedItem)}
            />
        </View>
    );
};

export default DropdownComponent;

const styles = StyleSheet.create({
    container: {

    },
    dropdown: {
        paddingHorizontal: 8,
        width: 45
    },
    placeholderStyle: {
        // Adicione os estilos inline correspondentes aqui, se houver
    },
    inputSearchStyle: {
        // Adicione os estilos inline correspondentes aqui, se houver
    },
    iconStyle: {
        // Adicione os estilos inline correspondentes aqui, se houver
    },
    containerStyle: {
        width: 200,
        marginLeft: -170,
        borderRadius: 5,
        paddingTop: 10,
        paddingHorizontal: 15,
        borderWidth: 0,
        elevation: 10,
    },
    rightIcon: {
        width: 30,
        height: 30
    },
    item: {
        paddingBottom: 10
    },
    itemText: {
        fontSize: 16,
    }
});
