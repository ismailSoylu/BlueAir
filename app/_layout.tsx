import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import 'react-native-reanimated';
import { LanguageContext, ThemeContext } from './(tabs)/home';

import { useColorScheme } from '@/hooks/useColorScheme';

type Lang = 'tr' | 'en' | 'ja' | 'de';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState<Lang>('tr');
  const appState = useRef(AppState.currentState);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // App State yönetimi - uygulama arka plana geçtiğinde state'i koru
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
        // Uygulama tekrar aktif olduğunda gerekli işlemleri yap
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem('APP_THEME');
      if (saved === 'light' || saved === 'dark' || saved === 'auto') setTheme(saved);
    };
    loadTheme();
  }, []);

  useEffect(() => {
    if (theme === 'auto') {
      const updateTheme = () => {
        const hour = new Date().getHours();
        setIsDark(colorScheme === 'dark' || hour < 7 || hour > 19);
      };
      updateTheme();
      const interval = setInterval(updateTheme, 60 * 1000);
      return () => clearInterval(interval);
    } else {
      setIsDark(theme === 'dark');
    }
  }, [theme, colorScheme]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      <ThemeContext.Provider value={{ theme, isDark, setTheme }}>
        <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
          <Stack
            screenOptions={{
              // Uygulama arka planda kalırken state'i koru
              freezeOnBlur: false,
              // Navigation state'ini koru
              gestureEnabled: true,
              // Header'ı gizle (eğer gerekirse)
              headerShown: false,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </ThemeContext.Provider>
    </LanguageContext.Provider>
  );
}
