import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Localization from 'expo-localization';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageContext, ThemeContext } from './(tabs)/home';

type Lang = 'tr' | 'en' | 'ja' | 'de'| 'pt';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [isDark, setIsDark] = useState(false);
  const supportedLanguages: Lang[] = ['tr', 'en', 'ja', 'de', 'pt'];
  function getDefaultLanguage(): Lang {
    const locales = Localization.getLocales();
    const deviceLang = locales && locales.length > 0 && locales[0].languageCode ? locales[0].languageCode : 'en';
    if (supportedLanguages.includes(deviceLang as Lang)) {
      return deviceLang as Lang;
    }
    return 'en';
  }
  const [lang, setLang] = useState<Lang>(getDefaultLanguage());
  const appState = useRef(AppState.currentState);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // ✅ Android için edge-to-edge arka plan - Modern API ile
  useEffect(() => {
    // Edge-to-edge artık app.config.js ve plugin ile yönetiliyor
    // Eski SystemUI API'si kaldırıldı
  }, []);

  // App State yönetimi
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
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
    return null;
  }

  return (
    <SafeAreaProvider>
      <LanguageContext.Provider value={{ lang, setLang }}>
        <ThemeContext.Provider value={{ theme, isDark, setTheme }}>
          <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
            <Stack
              screenOptions={{
                freezeOnBlur: false,
                gestureEnabled: true,
                headerShown: false,
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>

            {/* ✅ StatusBar edge-to-edge uyumlu */}
            <StatusBar style="light" translucent />
          </ThemeProvider>
        </ThemeContext.Provider>
      </LanguageContext.Provider>
    </SafeAreaProvider>
  );
}