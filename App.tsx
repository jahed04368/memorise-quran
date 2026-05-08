import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import SurahListScreen from './src/screens/SurahListScreen';
import VerseScreen from './src/screens/VerseScreen';
import ReadMemorizedScreen from './src/screens/ReadMemorizedScreen';
import MemorizedListScreen from './src/screens/MemorizedListScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { MemorizationProvider } from './src/context/MemorizationContext';
import { RootStackParamList } from './src/types';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    const timer = setTimeout(() => SplashScreen.hideAsync(), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <MemorizationProvider>
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="SurahList"
        screenOptions={{
          headerStyle: { backgroundColor: '#1a3a2a' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
          cardStyle: { backgroundColor: '#f5f5f0' },
        }}
      >
        <Stack.Screen
          name="SurahList"
          component={SurahListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Verse"
          component={VerseScreen}
          options={{ title: 'Verse' }}
        />
        <Stack.Screen
          name="ReadMemorized"
          component={ReadMemorizedScreen}
          options={{ title: 'Review' }}
        />
        <Stack.Screen
          name="MemorizedList"
          component={MemorizedListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
    </MemorizationProvider>
  );
}
