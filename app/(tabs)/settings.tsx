import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useContext, useEffect, useState } from 'react';
import { Linking, PixelRatio, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addBirthday, Birthday, getBirthdays, removeBirthday } from '../../services/birthdayService';
import { scheduleBirthdayNotification } from '../../services/notificationService';
import { LanguageContext, ThemeContext } from './home';
// uuid yerine basit bir id fonksiyonu
const simpleId = () => Math.random().toString(36).substr(2, 9) + Date.now();

const THEME_KEY = 'APP_THEME';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.ismailjacob.blueAir';
const DEVELOPER_PLAY_STORE_URL = 'https://play.google.com/store/apps/developer?id=Nova+Orion';

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
    rateUs: 'Bizi desteklemek ister misiniz? Uygulamamızı beğendiyseniz 5 yıldız verebilirsiniz!',
    rateButton: '5 Yıldız Ver',
    birthdayAddTitle: 'Doğum Günü Ekle',
    birthdayNamePlaceholder: 'İsim',
    birthdayDatePlaceholder: 'Tarih',
    birthdayAddError: 'Lütfen isim ve tarih girin',
    daysLeft: '{days} gün kaldı',
    allApps: 'Tüm Uygulamalarımız',
    allAppsDescription: 'Diğer uygulamalarımızı keşfedin',
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
    birthdayAddTitle: 'Add Birthday',
    birthdayNamePlaceholder: 'Name',
    birthdayDatePlaceholder: 'Date',
    birthdayAddError: 'Please enter a name and date',
    daysLeft: '{days} days left',
    allApps: 'All Our Apps',
    allAppsDescription: 'Discover our other apps',
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
    birthdayAddTitle: '誕生日を追加',
    birthdayNamePlaceholder: '名前',
    birthdayDatePlaceholder: '日付',
    birthdayAddError: '名前と日付を入力してください',
    daysLeft: 'あと{days}日',
    allApps: '全てのアプリ',
    allAppsDescription: '他のアプリを見つける',
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
    birthdayAddTitle: 'Geburtstag hinzufügen',
    birthdayNamePlaceholder: 'Name',
    birthdayDatePlaceholder: 'Datum',
    birthdayAddError: 'Bitte Name und Datum eingeben',
    daysLeft: 'Noch {days} Tage',
    allApps: 'Alle unsere Apps',
    allAppsDescription: 'Entdecken Sie unsere anderen Apps',
  },
  pt: {
    weather: 'Tempo',
    favorites: 'Favoritos',
    searchPlaceholder: 'Digite o nome da cidade',
    search: 'Buscar',
    findByLocation: 'Encontrar por Localização',
    feelsLike: 'Sensação',
    humidity: 'Umidade',
    wind: 'Vento',
    forecast5: 'Previsão de 5 dias',
    forecast3h: 'Previsão de 3 horas',
    errorNoCity: 'Por favor, digite o nome da cidade',
    errorNoWeather: 'Não foi possível obter os dados do tempo',
    errorNoLocation: 'Não foi possível obter o tempo por localização',
    errorNoPermission: 'Permissão de localização negada',
    searchHelper: 'Você pode procurar por cidade, país ou região.',
    tabHome: 'Início',
    tabSettings: 'Configurações',
    settingsTitle: 'Configurações',
    language: 'Idioma',
    theme: 'Tema',
    light: 'Claro',
    dark: 'Escuro',
    auto: 'Automático',
    info: 'No modo automático, o tema do sistema ou a hora (19:00-07:00) será escuro.',
    loading: 'Carregando dados...',
    noData: 'Sem dados',
    districtNotFound: '{district} não encontrado, mostrando tempo para {city}.',
    pressure: 'Pressão',
    sunrise: 'Nascer do Sol',
    sunset: 'Pôr do Sol',
    rateUs: 'Gostaria de nos apoiar? Se você gostou do aplicativo, pode nos dar 5 estrelas!',
    rateButton: 'Avaliar 5 Estrelas',
    birthdayAddTitle: 'Adicionar Aniversário',
    birthdayNamePlaceholder: 'Nome',
    birthdayDatePlaceholder: 'Data',
    birthdayAddError: 'Por favor, digite um nome e uma data',
    daysLeft: 'Faltam {days} dias',
    allApps: 'Todos os Nossos Apps',
    allAppsDescription: 'Descubra nossos outros aplicativos',
  },
};

// Doğum gününe kaç gün kaldığını hesaplayan fonksiyon
const daysUntilBirthday = (dateStr: string) => {
  const today = new Date();
  const [, month, day] = dateStr.split('-').map(Number);
  let next = new Date(today.getFullYear(), month - 1, day);
  if (next < today) next = new Date(today.getFullYear() + 1, month - 1, day);
  const diff = Math.ceil((next.getTime() - today.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
  return diff;
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

  const openDeveloperStore = () => {
    Linking.openURL(DEVELOPER_PLAY_STORE_URL);
  };

  const [bdayName, setBdayName] = useState('');
  const [bdayDate, setBdayDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    getBirthdays().then(setBirthdays);
  }, [refresh]);

  const handleAddBirthday = async () => {
    if (!bdayName.trim() || !bdayDate) {
      setAddError(t('birthdayAddError'));
      return;
    }
    setAddError('');
    try {
      // Timezone sorununu çözmek için local date string kullan
      const year = bdayDate.getFullYear();
      const month = String(bdayDate.getMonth() + 1).padStart(2, '0');
      const day = String(bdayDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      await addBirthday({ id: simpleId(), name: bdayName.trim(), date: dateString });
      await scheduleBirthdayNotification(bdayDate, bdayName.trim(), lang);
      setBdayName('');
      setBdayDate(null);
      setRefresh(r => !r);
    } catch (err) {
      setAddError('Hata: ' + (err instanceof Error ? err.message : String(err)));
      console.log('Doğum günü ekleme hatası:', err);
    }
  };

  const handleRemoveBirthday = async (id: string) => {
    await removeBirthday(id);
    setRefresh(r => !r);
  };

  return (
    <LinearGradient
      colors={isDark ? ['#232a36', '#181a20'] : ['#b3c6f7', '#e3f0ff']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          <View style={[styles.card, isDark && styles.darkCard]}>
            <Text style={[styles.title, isDark && styles.darkText]} allowFontScaling numberOfLines={1} adjustsFontSizeToFit>{t('settingsTitle')}</Text>
            {/* --- DOĞUM GÜNÜ EKLEME --- */}
            <View style={{ width: '100%', marginBottom: 20, alignItems: 'center' }}>
              <Text style={[styles.label, isDark && styles.darkText]} allowFontScaling numberOfLines={1} adjustsFontSizeToFit>{t('birthdayAddTitle')}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, width: '100%', gap: 8 }}>
                <TextInput
                  style={{
                    backgroundColor: isDark ? '#232a36' : '#fff',
                    color: isDark ? '#fff' : '#222',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#e0e7ff',
                    paddingHorizontal: 14,
                    height: 48,
                    fontSize: 16 * PixelRatio.getFontScale(),
                    flex: 1,
                  }}
                  placeholder={t('birthdayNamePlaceholder')}
                  placeholderTextColor={isDark ? '#aaa' : '#888'}
                  value={bdayName}
                  onChangeText={setBdayName}
                  allowFontScaling
                  maxLength={32}
                  returnKeyType="done"
                  accessible accessibilityLabel={t('birthdayNamePlaceholder')}
                />
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ backgroundColor: '#e3e8f7', borderRadius: 16, height: 48, minWidth: 48, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10, flexDirection: 'row' }}>
                  <MaterialCommunityIcons name="calendar" size={22 * PixelRatio.getFontScale()} color="#007AFF" />
                  <Text style={{ color: '#007AFF', fontSize: 13 * PixelRatio.getFontScale(), marginLeft: 4, minWidth: 0, maxWidth: '100%', flexShrink: 1 }} numberOfLines={1} adjustsFontSizeToFit allowFontScaling>
                    {bdayDate ? bdayDate.toLocaleDateString() : t('birthdayDatePlaceholder')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAddBirthday} style={{ backgroundColor: '#4caf50', borderRadius: 16, height: 48, width: 48, justifyContent: 'center', alignItems: 'center' }} accessibilityLabel="Ekle">
                  <MaterialCommunityIcons name="plus" size={26 * PixelRatio.getFontScale()} color="#fff" />
                </TouchableOpacity>
              </View>
              {showDatePicker && (
                <DateTimePicker
                  value={bdayDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(e: DateTimePickerEvent, date?: Date) => {
                    setShowDatePicker(false);
                    if (date) {
                      // Timezone sorununu çözmek için tarihi local timezone'a ayarla
                      const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                      setBdayDate(localDate);
                    }
                  }}
                  maximumDate={new Date()}
                />
              )}
              {addError ? (
                <Text style={{ color: '#e53935', fontSize: 13 * PixelRatio.getFontScale(), marginBottom: 4, minWidth: 0, maxWidth: '100%', flexShrink: 1 }} allowFontScaling numberOfLines={2} adjustsFontSizeToFit>{addError}</Text>
              ) : null}
              {/* Doğum günleri listesi */}
              {birthdays.length > 0 && (
                <View style={{ width: '100%', marginTop: 10 }}>
                  {birthdays.map(b => (
                    <View key={b.id} style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 6,
                      backgroundColor: isDark ? '#232a36' : '#f8fafc',
                      borderRadius: 8,
                      padding: 8
                    }}>
                      <MaterialCommunityIcons name="cake-variant" size={20} color="#ffb347" style={{ marginRight: 8 }} />
                      <Text style={{ color: isDark ? '#fffbe6' : '#222', fontWeight: 'bold', flex: 1, minWidth: 0, maxWidth: '100%', flexShrink: 1 }} allowFontScaling numberOfLines={1} adjustsFontSizeToFit>
                        {b.name} - {new Date(b.date).toLocaleDateString()} ({t('daysLeft').replace('{days}', daysUntilBirthday(b.date).toString())})
                      </Text>
                      <TouchableOpacity onPress={() => handleRemoveBirthday(b.id)}>
                        <MaterialCommunityIcons name="delete" size={20} color="#e53935" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="translate" size={22} color={isDark ? '#b3c6f7' : '#007AFF'} style={{ marginRight: 8 }} />
                <Text style={[styles.label, isDark && styles.darkText]} allowFontScaling numberOfLines={1} adjustsFontSizeToFit>{t('language')}</Text>
              </View>
              <View style={styles.row}>
                <TouchableOpacity style={[styles.themeBtn, lang === 'tr' && styles.selectedBtn]} onPress={() => setLang('tr')}>
                  <Text style={[styles.themeBtnText, lang === 'tr' && styles.selectedBtnText]} allowFontScaling numberOfLines={1} adjustsFontSizeToFit>Türkçe</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.themeBtn, lang === 'en' && styles.selectedBtn]} onPress={() => setLang('en')}>
                  <Text style={[styles.themeBtnText, lang === 'en' && styles.selectedBtnText]} allowFontScaling numberOfLines={1} adjustsFontSizeToFit>English</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.themeBtn, lang === 'ja' && styles.selectedBtn]} onPress={() => setLang('ja')}>
                  <Text style={[styles.themeBtnText, lang === 'ja' && styles.selectedBtnText]} allowFontScaling numberOfLines={1} adjustsFontSizeToFit>日本語</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.themeBtn, lang === 'de' && styles.selectedBtn]} onPress={() => setLang('de')}>
                  <Text style={[styles.themeBtnText, lang === 'de' && styles.selectedBtnText]} allowFontScaling numberOfLines={1} adjustsFontSizeToFit>Deutsch</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.themeBtn, lang === 'pt' && styles.selectedBtn]} onPress={() => setLang('pt')}>
                  <Text style={[styles.themeBtnText, lang === 'pt' && styles.selectedBtnText]} allowFontScaling numberOfLines={1} adjustsFontSizeToFit>Português</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="theme-light-dark" size={22} color={isDark ? '#b3c6f7' : '#007AFF'} style={{ marginRight: 8 }} />
                <Text style={[styles.label, isDark && styles.darkText]} allowFontScaling numberOfLines={1} adjustsFontSizeToFit>{t('theme')}</Text>
              </View>
              <View style={styles.row}>
                <TouchableOpacity style={[styles.themeBtn, theme === 'light' && styles.selectedBtn]} onPress={() => selectTheme('light')}>
                  <MaterialCommunityIcons name="white-balance-sunny" size={18} color={theme === 'light' ? '#fff' : '#007AFF'} style={{ marginRight: 4 }} />
                  <Text style={[styles.themeBtnText, theme === 'light' && styles.selectedBtnText]} allowFontScaling numberOfLines={1} adjustsFontSizeToFit>{t('light')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.themeBtn, theme === 'dark' && styles.selectedBtn]} onPress={() => selectTheme('dark')}>
                  <MaterialCommunityIcons name="weather-night" size={18} color={theme === 'dark' ? '#fff' : '#007AFF'} style={{ marginRight: 4 }} />
                  <Text style={[styles.themeBtnText, theme === 'dark' && styles.selectedBtnText]} allowFontScaling numberOfLines={1} adjustsFontSizeToFit>{t('dark')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.themeBtn, theme === 'auto' && styles.selectedBtn]} onPress={() => selectTheme('auto')}>
                  <MaterialCommunityIcons name="autorenew" size={18} color={theme === 'auto' ? '#fff' : '#007AFF'} style={{ marginRight: 4 }} />
                  <Text style={[styles.themeBtnText, theme === 'auto' && styles.selectedBtnText]} allowFontScaling numberOfLines={1} adjustsFontSizeToFit>{t('auto')}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="star" size={22} color={isDark ? '#b3c6f7' : '#007AFF'} style={{ marginRight: 8 }} />
                <Text style={[styles.label, isDark && styles.darkText, styles.centeredLabel]} allowFontScaling numberOfLines={2} adjustsFontSizeToFit>{t('rateUs')}</Text>
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
                <Text style={[styles.rateButtonText, isDark && styles.darkRateButtonText]} allowFontScaling numberOfLines={1} adjustsFontSizeToFit>
                  {t('rateButton')}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="google-play" size={22} color={isDark ? '#b3c6f7' : '#007AFF'} style={{ marginRight: 8 }} />
                <Text style={[styles.label, isDark && styles.darkText]} allowFontScaling numberOfLines={1} adjustsFontSizeToFit>{t('allApps')}</Text>
              </View>
              <Text style={[styles.allAppsDescription, isDark && styles.darkText]} allowFontScaling numberOfLines={2} adjustsFontSizeToFit>
                {t('allAppsDescription')}
              </Text>
              <TouchableOpacity 
                style={[styles.allAppsButton, isDark && styles.darkAllAppsButton]} 
                onPress={openDeveloperStore}
              >
                <MaterialCommunityIcons name="google-play" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={[styles.allAppsButtonText]} allowFontScaling numberOfLines={1} adjustsFontSizeToFit>
                  {t('allApps')}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.info, isDark && styles.darkText]} allowFontScaling numberOfLines={3} adjustsFontSizeToFit>{t('info')}</Text>
            <Text style={[styles.brandText, isDark && styles.darkBrandText]} allowFontScaling numberOfLines={1} adjustsFontSizeToFit>
              Nova Orion
            </Text>
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
  allAppsDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    marginHorizontal: 10,
  },
  allAppsButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignSelf: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  darkAllAppsButton: {
    backgroundColor: '#2E7D32',
  },
  allAppsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  brandText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  darkBrandText: {
    color: '#777',
  },
}); 