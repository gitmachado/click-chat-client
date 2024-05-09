import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SocketProvider } from './src/Context/SocketContext';
import { AppProvider } from './src/Context/AppContext';
import Login from './src/pages/Login/LoginScreen';
import Home from './src/pages/Home/Home';
import Chat from './src/pages/Chat/Chat';
import Profile from './src/pages/Profile/Profile';
import Privacity from "./src/pages/Privacity/Privacity";
import Contacts from "./src/pages/Contatos/Contatos";
import Config from './src/pages/Config/Config';
import Blocked from './src/pages/Blocked/Blocked';

const Stack = createStackNavigator();

const App = () => {
    return (
        <AppProvider>
            <SocketProvider>
                <NavigationContainer>
                    <Stack.Navigator initialRouteName="Login" screenOptions={{ animationEnabled: false, presentation: 'modal' }}>
                        <Stack.Screen
                            name="Login"
                            component={Login}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Home"
                            component={Home}
                            options={{
                                headerShown: false,
                                unmountOnBlur: false,
                            }}
                        />
                        <Stack.Screen
                            name="Chat"
                            component={Chat}
                            options={{
                                headerShown: false,
                                unmountOnBlur: true,
                                animationEnabled: false, // Habilitando animação
                                
                            }}
                        />
                        <Stack.Screen
                            name="Editar Perfil"
                            component={Profile}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Privacidade"
                            component={Privacity}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Contatos"
                            component={Contacts}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Config"
                            component={Config}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Blocked"
                            component={Blocked}
                            options={{ headerShown: false }}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </SocketProvider>
        </AppProvider>
    );
};

export default App;