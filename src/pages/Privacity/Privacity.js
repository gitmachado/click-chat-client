import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const PrivacyPolicyScreen = () => {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Política de Privacidade do ClickChat</Text>

            <Text style={styles.paragraph}>
                Seja bem-vindo ao ClickChat, um aplicativo de chat online para dispositivos móveis. Sua privacidade é
                fundamental para nós. Esta Política de Privacidade descreve como coletamos, usamos, compartilhamos
                e protegemos suas informações pessoais ao usar o aplicativo ClickChat. Ao baixar, instalar e utilizar
                nosso aplicativo, você concorda com as práticas descritas nesta política.
            </Text>

            <Text style={styles.sectionTitle}>1. Informações Coletadas</Text>
            <Text style={styles.subTitle}>1.1. Informações de Registro</Text>
            <Text style={styles.paragraph}>
                Coletamos informações básicas fornecidas por você durante o
                processo de registro, como nome e endereço de e-mail.
            </Text>

            <Text style={styles.subTitle}>1.2. Informações de Perfil</Text>
            <Text style={styles.paragraph}>
                Você pode optar por fornecer informações adicionais para personalizar seu perfil.
            </Text>

            <Text style={styles.subTitle}>1.3. Dados de Uso</Text>
            <Text style={styles.paragraph}>
                Não realizamos o registro de mensagens enviadas ou recebidas, todas as mensagem são armazenadas apenas nos dispositivos dos usuários.
            </Text>

            <Text style={styles.sectionTitle}>2. Uso de Informações:</Text>

            <Text style={styles.subTitle}>2.1. Fornecimento de Serviços:</Text>
            <Text style={styles.paragraph}>Utilizamos suas informações para operar, manter e aprimorar o ClickChat, fornecendo a você uma experiência personalizada e eficiente.</Text>

            <Text style={styles.subTitle}>2.2. Comunicação:</Text>
            <Text style={styles.paragraph}>Podemos usar suas informações para enviar notificações, atualizações do aplicativo, mensagens relacionadas ao serviço e promoções.</Text>

            <Text style={styles.subTitle}>2.3. Análise e Melhoria:</Text>
            <Text style={styles.paragraph}>Realizamos análises para entender melhor o comportamento dos usuários, otimizar o desempenho do aplicativo e desenvolver recursos novos.</Text>

            <Text style={styles.sectionTitle}> 3. Compartilhamento de Informações: </Text>

            <Text style={styles.subTitle}>3.1. Com Terceiros:</Text>
            <Text style={styles.paragraph}>Não compartilhamos suas informações  pessoais com terceiros sem o seu consentimento, exceto quando necessário para fornecer serviços relacionados ao ClickChat.</Text>

            <Text style={styles.subTitle}>3.2. Parceiros de Serviços: </Text>
            <Text style={styles.paragraph}>Podemos utilizar parceiros de serviços confiáveis para auxiliar na operação do aplicativo, os quais serão obrigados a proteger suas informações conforme esta política.</Text>

            <Text style={styles.sectionTitle}>4. Segurança:</Text>

            <Text style={styles.paragraph}>Implementamos medidas de segurança para proteger suas informações contra acesso não autorizado, uso indevido ou divulgação.</Text>

            <Text style={styles.sectionTitle}>5. Seus Direitos:</Text>

            <Text style={styles.paragraph}>Você tem o direito de escolher quais informações compartilhar em seu perfil.</Text>

            <Text style={styles.sectionTitle}>6. Crianças:</Text>

            <Text style={styles.paragraph}>O ClickChat não se destina a crianças com menos de 13 anos, e não coletamos intencionalmente informações pessoais de menores. Se tivermos conhecimento de que um usuário é menor de idade, tomaremos as medidas necessárias para excluir as informações.</Text>

            <Text style={styles.sectionTitle}>7. Alterações na Política de Privacidade:</Text>

            <Text style={styles.paragraph}>Reservamo-nos o direito de atualizar esta política periodicamente. Recomendamos que você revise-a regularmente para estar ciente de qualquer alteração.</Text>

            <Text style={styles.paragraph}>Ao utilizar o ClickChat, você concorda com os termos desta Política de Privacidade. Se tiver dúvidas ou preocupações, entre em contato conosco pelo e-mail contatoclickchat@gmail.com.</Text>

            <Text style={styles.paragraph}>
                Obrigado por escolher o ClickChat!{'\n\n'}
                Última atualização [ 16/03/2024 ]
            </Text>

            <Text> </Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "white",
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        color: "black",
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
        color: "black",
    },
    subTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 12,
        color: "black",
    },
    paragraph: {
        fontSize: 16,
        marginBottom: 12,
        textAlign: 'justify',
        color: "black",
    },
});

export default PrivacyPolicyScreen;
