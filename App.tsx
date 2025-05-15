import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '@components/HomeScreen';
import ArticleScreen from '@components/ArticleScreen';

const Stack = createStackNavigator();

const App = () => (
    <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="ArticleScreen" component={ArticleScreen} />
        </Stack.Navigator>
    </NavigationContainer>
);

export default App;
