// Routes.js
import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from './pages/Login/LoginScreen';
import Home from './pages/Home/Home';
import Chat from './pages/Chat/Chat';
import { AppContext } from './Context/AppContext';

const Stack = createNativeStackNavigator();

const Routes = () => {
  const { currentScreen } = useContext(AppContext);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {currentScreen === 'Login' && (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
        {currentScreen === 'Home' && (
          <Stack.Screen
            name="Home"
            component={Home}
            options={{ headerShown: false }}
          />
        )}
        {currentScreen === 'Chat' && (
          <Stack.Screen
            name="Chat"
            component={Chat}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Routes;
