import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LanguageContext, ThemeContext } from './home';

const THEME_KEY = 'APP_THEME';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.ismailjacob.blueAir';

// translations tipini genişlet
export const translations: Record<string, Record<string, string>> = {
  tr: {
    weather: 'Hava Durumu',
    favorites: 'Favorilerim',
    searchPlaceholder: 'Şehir adı girin',
    search: 'Ara',
    findByLocation: 'Konumdan Bul',
    feelsLike: 'Hissedilen',
    humidity: 'Nem',
    wind: 'Rüzgar',
    forecast5: '5 Günlük Tahmin',
    forecast3h: '3 Saatlik Tahminler',
    errorNoCity: 'Lütfen bir şehir adı girin',
    errorNoWeather: 'Hava durumu bilgisi alınamadı',
    errorNoLocation: 'Konumdan hava durumu alınamadı',
    errorNoPermission: 'Konum izni verilmedi',
    searchHelper: 'Şehir, ülke veya bölge adı arayabilirsiniz.',
    tabHome: 'Anasayfa',
    tabSettings: 'Ayarlar',
    settingsTitle: 'Ayarlar',
    language: 'Dil',
    theme: 'Tema',
    light: 'Açık',
    dark: 'Koyu',
    auto: 'Otomatik',
    info: 'Otomatik modda sistem teması veya saat (19:00-07:00 arası) koyu mod olarak uygulanır.',
    loading: 'Veri yükleniyor...',
    noData: 'Veri yok',
    districtNotFound: '{district} bulunamadı, {city} için hava durumu gösteriliyor.',
    pressure: 'Basınç',
    sunrise: 'G. Doğumu',
    sunset: 'G. Batımı',
    rateUs: 'Bizi desteklemek ister misiniz? Uygulamamızı beğendiyseniz 5 yıldız verebilirsiniz! (Buton Play Storea yüklendikten sonra aktif olacaktır.)',
    rateButton: '5 Yıldız Ver',
  },
  en: {
    weather: 'Weather',
    favorites: 'My Favorites',
    searchPlaceholder: 'Enter city name',
    search: 'Search',
    findByLocation: 'Find by Location',
    feelsLike: 'Feels Like',
    humidity: 'Humidity',
    wind: 'Wind',
    forecast5: '5 Day Forecast',
    forecast3h: '3 Hourly Forecasts',
    errorNoCity: 'Please enter a city name',
    errorNoWeather: 'Could not fetch weather data',
    errorNoLocation: 'Could not fetch weather by location',
    errorNoPermission: 'Location permission denied',
    searchHelper: 'You can search for a city, country, or region.',
    tabHome: 'Home',
    tabSettings: 'Settings',
    settingsTitle: 'Settings',
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    auto: 'Auto',
    info: 'In auto mode, system theme or time (19:00-07:00) will be dark.',
    loading: 'Loading data...',
    noData: 'No data',
    districtNotFound: '{district} not found, showing weather for {city}.',
    pressure: 'Pressure',
    sunrise: 'Sunrise',
    sunset: 'Sunset',
    rateUs: 'Would you like to support us? If you like the app, you can give 5 stars!',
    rateButton: 'Rate 5 Stars',
  },
  ja: {
    weather: '天気',
    favorites: 'お気に入り',
    searchPlaceholder: '都市名を入力',
    search: '検索',
    findByLocation: '現在地で検索',
    feelsLike: '体感',
    humidity: '湿度',
    wind: '風',
    forecast5: '5日間予報',
    forecast3h: '3時間ごとの予報',
    errorNoCity: '都市名を入力してください',
    errorNoWeather: '天気情報を取得できませんでした',
    errorNoLocation: '現在地の天気を取得できませんでした',
    errorNoPermission: '位置情報の許可がありません',
    searchHelper: '都市、国、または地域名で検索できます。',
    tabHome: 'ホーム',
    tabSettings: '設定',
    settingsTitle: '設定',
    language: '言語',
    theme: 'テーマ',
    light: 'ライト',
    dark: 'ダーク',
    auto: '自動',
    info: '自動モードでは、システムテーマまたは時間（19:00～07:00）はダークになります。',
    loading: 'データを読み込み中...',
    noData: 'データなし',
    districtNotFound: '{district}が見つかりませんでした。{city}の天気を表示しています。',
    pressure: '気圧',
    sunrise: '日の出',
    sunset: '日の入り',
    rateUs: '応援していただけますか？アプリが気に入ったら5つ星をお願いします！',
    rateButton: '5つ星を付ける',
  },
  de: {
    weather: 'Wetter',
    favorites: 'Favoriten',
    searchPlaceholder: 'Stadtname eingeben',
    search: 'Suchen',
    findByLocation: 'Nach Standort suchen',
    feelsLike: 'Gefühlt',
    humidity: 'Luftfeuchtigkeit',
    wind: 'Wind',
    forecast5: '5-Tage-Vorhersage',
    forecast3h: '3-Stunden-Vorhersage',
    errorNoCity: 'Bitte geben Sie einen Stadtnamen ein',
    errorNoWeather: 'Wetterdaten konnten nicht abgerufen werden',
    errorNoLocation: 'Wetter am Standort konnte nicht abgerufen werden',
    errorNoPermission: 'Standortberechtigung verweigert',
    searchHelper: 'Sie können nach Stadt, Land oder Region suchen.',
    tabHome: 'Startseite',
    tabSettings: 'Einstellungen',
    settingsTitle: 'Einstellungen',
    language: 'Sprache',
    theme: 'Thema',
    light: 'Hell',
    dark: 'Dunkel',
    auto: 'Automatisch',
    info: 'Im Automatikmodus wird das Systemthema oder die Zeit (19:00-07:00) als Dunkelmodus angewendet.',
    loading: 'Daten werden geladen...',
    noData: 'Keine Daten',
    districtNotFound: '{district} wurde nicht gefunden, Wetter für {city} wird angezeigt.',
    pressure: 'Luftdruck',
    sunrise: 'Sonnenaufgang',
    sunset: 'Sonnenuntergang',
    rateUs: 'Möchten Sie uns unterstützen? Wenn Ihnen die App gefällt, geben Sie bitte 5 Sterne!',
    rateButton: '5 Sterne geben',
  },
};

export default function SettingsScreen() {
  const { theme, setTheme, isDark } = useContext(ThemeContext);
  const { lang, setLang } = useContext(LanguageContext);
  const t = (key: string) => translations[lang][key];

  const selectTheme = async (val: 'light' | 'dark' | 'auto') => {
    setTheme(val);
    await AsyncStorage.setItem(THEME_KEY, val);
  };

  const openPlayStore = () => {
    Linking.openURL(PLAY_STORE_URL);
  };

  return (
    <LinearGradient
      colors={isDark ? ['#232a36', '#181a20'] : ['#b3c6f7', '#e3f0ff']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
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
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="star" size={22} color={isDark ? '#b3c6f7' : '#007AFF'} style={{ marginRight: 8 }} />
                <Text style={[styles.label, isDark && styles.darkText, styles.centeredLabel]}>{t('rateUs')}</Text>
                <MaterialCommunityIcons name="star" size={22} color={isDark ? '#b3c6f7' : '#007AFF'} style={{ marginLeft: 8 }} />
              </View>
              <View style={styles.starsContainer}>
                <MaterialCommunityIcons name="star" size={22} color="#FFD700" />
                <MaterialCommunityIcons name="star" size={22} color="#FFD700" />
                <MaterialCommunityIcons name="star" size={22} color="#FFD700" />
                <MaterialCommunityIcons name="star" size={22} color="#FFD700" />
                <MaterialCommunityIcons name="star" size={22} color="#FFD700" />
              </View>
              <TouchableOpacity 
                style={[styles.rateButton, isDark && styles.darkRateButton]} 
                onPress={openPlayStore}
              >
                <Text style={[styles.rateButtonText, isDark && styles.darkRateButtonText]}>
                  {t('rateButton')}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.info, isDark && styles.darkText]}>{t('info')}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: 'transparent', paddingTop: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
  },
  darkCard: {
    backgroundColor: '#232a36',
  },
  section: {
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'center',
    width: '100%',
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#007AFF', textAlign: 'center' },
  darkText: { color: '#fff' },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333', textAlign: 'center' },
  centeredLabel: {
    flex: 1,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    justifyContent: 'center',
    width: '100%',
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
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    flexShrink: 1,
    textAlign: 'center',
  },
  selectedBtnText: { color: '#fff' },
  info: { fontSize: 12, color: '#888', textAlign: 'center', marginTop: 10, marginHorizontal: 10 },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
    width: '100%',
  },
  rateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignSelf: 'center',
    marginBottom: 10,
  },
  darkRateButton: {
    backgroundColor: '#4a90e2',
  },
  rateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  darkRateButtonText: {
    color: '#fff',
  },
}); 