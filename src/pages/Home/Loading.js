import React, { useState, useRef, createRef, useContext, useEffect } from 'react';
import { View, Text, Image, Animated, Dimensions, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';

import logotipo from '../../attachments/logotipoWebp.webp';

const Loading = () => {
    const [loadingPhrase, setLoadingPhrase] = useState('');

    const phrases = [
        "Preparando os melhores emojis para você...",
        "Carregando doses de bom humor...",
        "Buscando pessoas incríveis...",
        "Preparando a fórmula da boa conversa...",
        "Criando momentos especiais para você...",
        "Transformando cliques em conversas memoráveis...",
        "Explorando novas conversas, um clique de cada vez...",
        "Conversas que clicam, sorrisos que ficam...",
        "Preparando novas histórias para compartilhar...",
        "Conectando corações, um clique de cada vez...",
        "Carregando energias positivas para suas conversas...",
        "Explorando o universo das palavras e emoções...",
        "Criando um ambiente acolhedor para suas conversas...",
        "Transformando cliques em laços de amizade...",
        "Carregando otimismo e boas vibrações...",
        "Aguardando a magia das palavras acontecer...",
        "Carregando a atmosfera para diálogos genuínos...",
        "Preparando o terreno para momentos de descontração...",
        "Transformando cliques em conexões humanas...",
        "Abrindo o caminho para conversas interessantes...",
        "Aguçando a curiosidade para novas descobertas...",
        "Explorando o universo das conversas interessantes...",
        "Carregando o ambiente com energias positivas...",
        "Preparando o espaço para experiências positivas..."
    ];

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * phrases.length);
        const randomPhrase = phrases[randomIndex];

        setLoadingPhrase(randomPhrase);
    }, []);

    return (
        <View style={{ position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', padding: 10 }}>
            <Image source={logotipo} style={{ width: 150, height: 150, borderRadius: 25, marginBottom: 20 }} />
            <Text style={{ color: '#505050', fontSize: 25, fontWeight: 'bold' }}>ClickChat</Text>
            <Text style={{ color: '#505050', fontSize: 19, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}> Um clique, uma conexão :) </Text>
            <ActivityIndicator style={{ marginBottom: 5 }} size="large" color={'#ff9900'} />
            <Text style={{ color: '#606060', textAlign: 'center', fontSize: 13 }}>Carregando...</Text>
        </View>
    );
};

const styles = StyleSheet.create({

});

export default Loading;