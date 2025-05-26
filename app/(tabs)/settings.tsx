import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
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
    <LinearGradient
      colors={isDark ? ['#232a36', '#181a20'] : ['#b3c6f7', '#e3f0ff']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.card, isDark && styles.darkCard]}>
          <Text style={[styles.title, isDark && styles.darkText]}>{t('settingsTitle')}</Text>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="translate" size={22} color={isDark ? '#b3c6f7' : '#007AFF'} style={{ marginRight: 8 }} />
              <Text style={[styles.label, isDark && styles.darkText]}>{t('language')}</Text>
            </View>
            <View style={styles.row}>
              <TouchableOpacity style={[styles.themeBtn, lang === 'tr' && styles.selectedBtn]} onPress={() => setLang('tr')}>
                <Text style={[styles.themeBtnText, lang === 'tr' && styles.selectedBtnText]}>Türkçe</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.themeBtn, lang === 'en' && styles.selectedBtn]} onPress={() => setLang('en')}>
                <Text style={[styles.themeBtnText, lang === 'en' && styles.selectedBtnText]}>English</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.themeBtn, lang === 'ja' && styles.selectedBtn]} onPress={() => setLang('ja')}>
                <Text style={[styles.themeBtnText, lang === 'ja' && styles.selectedBtnText]}>日本語</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.themeBtn, lang === 'de' && styles.selectedBtn]} onPress={() => setLang('de')}>
                <Text style={[styles.themeBtnText, lang === 'de' && styles.selectedBtnText]}>Deutsch</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="theme-light-dark" size={22} color={isDark ? '#b3c6f7' : '#007AFF'} style={{ marginRight: 8 }} />
              <Text style={[styles.label, isDark && styles.darkText]}>{t('theme')}</Text>
            </View>
            <View style={styles.row}>
              <TouchableOpacity style={[styles.themeBtn, theme === 'light' && styles.selectedBtn]} onPress={() => selectTheme('light')}>
                <MaterialCommunityIcons name="white-balance-sunny" size={18} color={theme === 'light' ? '#fff' : '#007AFF'} style={{ marginRight: 4 }} />
                <Text style={[styles.themeBtnText, theme === 'light' && styles.selectedBtnText]}>{t('light')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.themeBtn, theme === 'dark' && styles.selectedBtn]} onPress={() => selectTheme('dark')}>
                <MaterialCommunityIcons name="weather-night" size={18} color={theme === 'dark' ? '#fff' : '#007AFF'} style={{ marginRight: 4 }} />
                <Text style={[styles.themeBtnText, theme === 'dark' && styles.selectedBtnText]}>{t('dark')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.themeBtn, theme === 'auto' && styles.selectedBtn]} onPress={() => selectTheme('auto')}>
                <MaterialCommunityIcons name="autorenew" size={18} color={theme === 'auto' ? '#fff' : '#007AFF'} style={{ marginRight: 4 }} />
                <Text style={[styles.themeBtnText, theme === 'auto' && styles.selectedBtnText]}>{t('auto')}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={[styles.info, isDark && styles.darkText]}>{t('info')}</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: 'transparent', paddingTop: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    margin: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  darkCard: {
    backgroundColor: '#232a36',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, color: '#007AFF', textAlign: 'center' },
  darkText: { color: '#fff' },
  label: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    justifyContent: 'center',
  },
  themeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3e8f7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 6,
    flexShrink: 1,
    marginVertical: 4,
  },
  selectedBtn: { backgroundColor: '#007AFF' },
  themeBtnText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    flexShrink: 1,
  },
  selectedBtnText: { color: '#fff' },
  info: { fontSize: 13, color: '#888', textAlign: 'center', marginTop: 10, marginHorizontal: 20 },
}); 