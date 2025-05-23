import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LanguageContext, ThemeContext, translations } from './home';

const THEME_KEY = 'APP_THEME';

export default function SettingsScreen() {
  const { theme, setTheme, isDark } = useContext(ThemeContext);
  const { lang, setLang } = useContext(LanguageContext);
  const t = (key: keyof typeof translations['tr']) => translations[lang][key];

  const selectTheme = async (val: 'light' | 'dark' | 'auto') => {
    setTheme(val);
    await AsyncStorage.setItem(THEME_KEY, val);
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkBg]}>
      <Text style={[styles.title, isDark && styles.darkText]}>{lang === 'tr' ? 'Ayarlar' : 'Settings'}</Text>
      <Text style={[styles.label, isDark && styles.darkText]}>{lang === 'tr' ? 'Dil' : 'Language'}</Text>
      <View style={styles.row}>
        <TouchableOpacity style={[styles.themeBtn, lang === 'tr' && styles.selectedBtn]} onPress={() => setLang('tr')}>
          <Text style={[styles.themeBtnText, lang === 'tr' && styles.selectedBtnText]}>Türkçe</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.themeBtn, lang === 'en' && styles.selectedBtn]} onPress={() => setLang('en')}>
          <Text style={[styles.themeBtnText, lang === 'en' && styles.selectedBtnText]}>English</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.label, isDark && styles.darkText]}>{lang === 'tr' ? 'Tema' : 'Theme'}</Text>
      <View style={styles.row}>
        <TouchableOpacity style={[styles.themeBtn, theme === 'light' && styles.selectedBtn]} onPress={() => selectTheme('light')}>
          <Text style={[styles.themeBtnText, theme === 'light' && styles.selectedBtnText]}>{lang === 'tr' ? 'Açık' : 'Light'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.themeBtn, theme === 'dark' && styles.selectedBtn]} onPress={() => selectTheme('dark')}>
          <Text style={[styles.themeBtnText, theme === 'dark' && styles.selectedBtnText]}>{lang === 'tr' ? 'Koyu' : 'Dark'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.themeBtn, theme === 'auto' && styles.selectedBtn]} onPress={() => selectTheme('auto')}>
          <Text style={[styles.themeBtnText, theme === 'auto' && styles.selectedBtnText]}>{lang === 'tr' ? 'Otomatik' : 'Auto'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.info, isDark && styles.darkText]}>
        {lang === 'tr'
          ? 'Otomatik modda sistem teması veya saat (19:00-07:00 arası) koyu mod olarak uygulanır.'
          : 'In auto mode, system theme or time (19:00-07:00) will be dark.'}
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: '#f5f5f5', paddingTop: 40 },
  darkBg: { backgroundColor: '#181a20' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, color: '#007AFF' },
  darkText: { color: '#fff' },
  label: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  row: { flexDirection: 'row', marginBottom: 20 },
  themeBtn: { backgroundColor: '#e3e8f7', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10, marginHorizontal: 6 },
  selectedBtn: { backgroundColor: '#007AFF' },
  themeBtnText: { fontSize: 16, color: '#333', fontWeight: 'bold' },
  selectedBtnText: { color: '#fff' },
  info: { fontSize: 13, color: '#888', textAlign: 'center', marginTop: 10, marginHorizontal: 20 },
}); 