import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import HomeScreen from '@components/HomeScreen';
import ArticleScreen from '@components/ArticleScreen';
import Tts from 'react-native-tts';
import {getAllNews, initNewsTable, openDB} from './db.ts';
import useStore from '@store/useStore.ts';
import ZoomOverlay from '@components/ZoomOverlay.tsx';
import useZoomStore from '@store/useZoomStore.ts';
import {useBlockBackHandler} from './useBlockBackHandler.ts';

const Stack = createStackNavigator();

/*export default function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <TestPseudoModalZoom />
    </GestureHandlerRootView>
  );
}*/

export default function App() {
  const {visible} = useZoomStore();

  // To only block back:
  useBlockBackHandler(visible);

  useEffect(() => {
    (async () => {
      await Tts.setDefaultLanguage('vi-VN');
    })();

    (async () => {
      await openDB();
      await initNewsTable();
    })();

    (async () => {
      try {
        const cachedNews = await getAllNews();
        if (Array.isArray(cachedNews)) {
          useStore.getState().setData(cachedNews);
        }
      } catch (e) {}
      useStore.getState().setHomeLoading(false);
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ArticleScreen" component={ArticleScreen} />
        </Stack.Navigator>
      </NavigationContainer>

      {!!visible && <ZoomOverlay />}
    </GestureHandlerRootView>
  );
}
