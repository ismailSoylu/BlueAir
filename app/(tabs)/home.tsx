import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundFetch from 'expo-background-fetch';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import * as TaskManager from 'expo-task-manager';
import LottieView from 'lottie-react-native';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ForecastData, ForecastItem, get5DayForecastByCity, get5DayForecastByLocation, getWeatherByCity, getWeatherByLocation, WeatherData } from '../../services/weatherService';

const THEME_KEY = 'APP_THEME';
const RECENT_CITIES_KEY = 'RECENT_CITIES';
const WEATHER_TASK = 'background-weather-task';

// Tema contexti
export const ThemeContext = createContext({
  theme: 'auto',
  isDark: false,
  setTheme: (val: 'light' | 'dark' | 'auto') => {},
});

type Lang = 'tr' | 'en' | 'ja' | 'de';
export const LanguageContext = createContext<{
  lang: Lang;
  setLang: React.Dispatch<React.SetStateAction<Lang>>;
}>({
  lang: 'tr',
  setLang: (() => {}) as React.Dispatch<React.SetStateAction<Lang>>,
});

export const translations = {
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
  },
};

// Basit şehirler listesi (Türkiye ve popüler dünya şehirleri örnek)
const CITY_LIST = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Adana', 'Antalya', 'Konya', 'Gaziantep', 'Şanlıurfa', 'Mersin',
  'Kayseri', 'Eskişehir', 'Diyarbakır', 'Samsun', 'Denizli', 'Şırnak', 'Trabzon', 'Van', 'Malatya', 'Manisa',
  'London', 'Paris', 'Berlin', 'New York', 'Moscow', 'Tokyo', 'Madrid', 'Rome', 'Porto', 'Lisbon',
  // ... daha fazla eklenebilir ...
];

// Açıklamanın ilk harfini büyüten yardımcı fonksiyon
const capitalize = (s: string) => s && s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s;

// Açıklamadaki tüm kelimelerin baş harfini büyüten yardımcı fonksiyon
const capitalizeAll = (s: string) => s.replace(/\b\w/g, c => c.toUpperCase());

// Gelişmiş arka plan hava durumu bildirimi task'i
TaskManager.defineTask(WEATHER_TASK, async () => {
  try {
    let { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') return BackgroundFetch.BackgroundFetchResult.NoData;
    let location = await Location.getCurrentPositionAsync({});
    const API_KEY = Constants.expoConfig?.extra?.OPEN_WEATHER_API_KEY;
    // Şu anki hava durumu
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&appid=${API_KEY}&units=metric&lang=tr`);
    const data = await response.json();
    // 5 günlük tahmin
    const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${location.coords.latitude}&lon=${location.coords.longitude}&appid=${API_KEY}&units=metric&lang=tr`);
    const forecastData = await forecastRes.json();
    // Saatleri al
    const now = new Date();
    const hour = now.getHours();
    // Sabah bildirimi (08:00-09:00 arası bir kere)
    if (hour === 8) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${data.name}: ${Math.round(data.main.temp)}°C, ${data.weather[0].description}`,
          body: `Rüzgar: ${(data.wind.speed * 3.6).toFixed(1)} km/h`,
        },
        trigger: null,
      });
    }
    // Akşam yağmur bildirimi (16:00-18:00 arası, yağmur varsa bir kere)
    if (hour === 17) {
      // Akşam saatlerine yakın bir forecast bul
      const eveningForecast = forecastData.list.find((item: ForecastItem) => {
        const forecastHour = new Date(item.dt * 1000).getHours();
        return forecastHour >= 18 && forecastHour <= 22;
      });
      if (eveningForecast && eveningForecast.weather[0].main.toLowerCase().includes('rain')) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${data.name}: Akşam yağmur bekleniyor!`,
            body: `Şemsiyeni unutma! Sıcaklık: ${Math.round(eveningForecast.main.temp)}°C`,
          },
          trigger: null,
        });
      }
    }
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (e) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Türkçe karakterleri İngilizce'ye çeviren fonksiyon
function turkceKarakterleriDonustur(str: string) {
  return str
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'G')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'U')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 'S')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'O')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C');
}

// İlçe-büyükşehir eşlemesi
const DISTRICT_TO_CITY: Record<string, string> = {
  'bayrampasa': 'Istanbul',
  'kağıthane': 'Istanbul',
  'kagithane': 'Istanbul',
  'esenler': 'Istanbul',
  // Gerekirse diğer ilçeler eklenebilir
};

// Lottie animasyonlarını hava durumu koduna ve gündüz/geceye göre eşleştiren yardımcı fonksiyon
const getWeatherLottie = (weatherMain: string, isNight: boolean) => {
  switch (weatherMain.toLowerCase()) {
    case 'clear':
      return isNight
        ? require('../../assets/lottie/clear-night.json')
        : require('../../assets/lottie/clear-day.json');
    case 'clouds':
      return isNight
        ? require('../../assets/lottie/partly-cloudy-night.json')
        : require('../../assets/lottie/partly-cloudy-day.json');
    case 'rain':
      return require('../../assets/lottie/rain.json');
    case 'drizzle':
      return require('../../assets/lottie/drizzle.json');
    case 'thunderstorm':
      return require('../../assets/lottie/thunder.json');
    case 'snow':
      return require('../../assets/lottie/snow.json');
    case 'mist':
    case 'fog':
    case 'haze':
    case 'smoke':
    case 'dust':
    case 'sand':
    case 'ash':
      return require('../../assets/lottie/mist.json');
    default:
      return isNight
        ? require('../../assets/lottie/partly-cloudy-night.json')
        : require('../../assets/lottie/partly-cloudy-day.json');
  }
};

export default function HomeScreen() {
  const { theme, isDark } = useContext(ThemeContext);
  const { lang, setLang } = useContext(LanguageContext);
  const t = (key: keyof typeof translations['tr']) => translations[lang as Lang][key];
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [recentCities, setRecentCities] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentCityName, setCurrentCityName] = useState('');

  // Favori şehirleri yükle
  useEffect(() => {
    const loadFavorites = async () => {
      const favs = await AsyncStorage.getItem('FAVORITE_CITIES');
      if (favs) setFavorites(JSON.parse(favs));
    };
    loadFavorites();
  }, []);

  // Geçmiş aramaları yükle
  useEffect(() => {
    const loadRecent = async () => {
      const data = await AsyncStorage.getItem(RECENT_CITIES_KEY);
      if (data) setRecentCities(JSON.parse(data));
    };
    loadRecent();
  }, []);

  // Favori ekle/kaldır
  const toggleFavorite = async (cityName: string) => {
    let newFavs;
    if (favorites.includes(cityName)) {
      newFavs = favorites.filter(fav => fav !== cityName);
    } else {
      newFavs = [...favorites, cityName];
    }
    setFavorites(newFavs);
    await AsyncStorage.setItem('FAVORITE_CITIES', JSON.stringify(newFavs));
  };

  // Favori şehirden hava durumu getir
  const fetchWeatherForFavorite = async (favCity: string) => {
    setCity(favCity);
    setLoading(true);
    setError('');
    try {
      const data = await getWeatherByCity(favCity, lang);
      setWeather(data);
      const forecastData = await get5DayForecastByCity(favCity, lang);
      setForecast(forecastData);
    } catch (err) {
      setError(t('errorNoWeather'));
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (cityName?: string) => {
    let searchCity = cityName ?? city;
    if (!searchCity.trim()) {
      setError(t('errorNoCity'));
      return;
    }
    searchCity = turkceKarakterleriDonustur(searchCity.trim());
    setLoading(true);
    setError('');
    try {
      const data = await getWeatherByCity(searchCity, lang);
      setWeather(data);
      const forecastData = await get5DayForecastByCity(searchCity, lang);
      setForecast(forecastData);
      await addRecentCity(searchCity);
    } catch (err) {
      // İlçe API'da yoksa büyükşehire yönlendir
      const lower = searchCity.toLowerCase();
      let fallbackCity = null;
      for (const district in DISTRICT_TO_CITY) {
        if (lower.includes(district)) {
          fallbackCity = DISTRICT_TO_CITY[district];
          break;
        }
      }
      if (fallbackCity) {
        try {
          const data = await getWeatherByCity(fallbackCity, lang);
          setWeather(data);
          const forecastData = await get5DayForecastByCity(fallbackCity, lang);
          setForecast(forecastData);
          setError(
            t('districtNotFound')
              .replace('{district}', capitalize(searchCity))
              .replace('{city}', capitalize(fallbackCity))
          );
        } catch {
          setError(t('errorNoWeather'));
          setWeather(null);
          setForecast(null);
        }
      } else {
        setError(t('errorNoWeather'));
        setWeather(null);
        setForecast(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByLocation = async () => {
    setLoading(true);
    setError('');
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError(t('errorNoPermission'));
        setLoading(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const data = await getWeatherByLocation(location.coords.latitude, location.coords.longitude, lang);
      setWeather(data);
      const forecastData = await get5DayForecastByLocation(location.coords.latitude, location.coords.longitude, lang);
      setForecast(forecastData);
    } catch (err) {
      setError(t('errorNoLocation'));
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  // Her gün için sadece öğlen 12:00 verilerini filtrele (günlük özet için)
  const getDailyForecast = (forecastList: ForecastItem[]) => {
    return forecastList.filter(item => item.dt_txt.includes('12:00:00'));
  };

  // Şehir adını Türkçeleştiren yardımcı fonksiyon
  const turkceSehirAdi = (name: string) => {
    name = name.trim();
    const map: Record<string, string> = {
      'Istanbul': 'İstanbul',
      'Izmir': 'İzmir',
      'Canakkale': 'Çanakkale',
      'Eskisehir': 'Eskişehir',
      'Sanliurfa': 'Şanlıurfa',
      'Sivas': 'Sivas',
      'Usak': 'Uşak',
      'Cankiri': 'Çankırı',
      'Corum': 'Çorum',
      'Gumushane': 'Gümüşhane',
      'Kutahya': 'Kütahya',
      'Mugla': 'Muğla',
      'Nevsehir': 'Nevşehir',
      'Sirnak': 'Şırnak',
      'Tekirdag': 'Tekirdağ',
      'Zonguldak': 'Zonguldak',
      'Siliviri': 'Silivri',
      'Rome': 'Roma',
      // ... gerekirse ekle ...
    };
    return map[name] || name;
  };

  // Dil değişince otomatik veri yenileme
  useEffect(() => {
    if (weather && city) {
      fetchWeather();
    } else if (weather && !city) {
      fetchWeatherByLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Geçmişe şehir ekle
  const addRecentCity = async (cityName: string) => {
    let newRecents = [cityName, ...recentCities.filter(c => c.toLowerCase() !== cityName.toLowerCase())];
    newRecents = newRecents.slice(0, 5); // En fazla 5 şehir tut
    setRecentCities(newRecents);
    await AsyncStorage.setItem(RECENT_CITIES_KEY, JSON.stringify(newRecents));
  };

  // Şehir input değişince önerileri filtrele
  const onCityInputChange = (text: string) => {
    setCity(text);
    if (text.length > 0) {
      const normalizedText = text.toLowerCase().trim();
      const filtered = CITY_LIST.filter(c => {
        const normalizedCity = c.toLowerCase().trim();
        return normalizedCity.startsWith(normalizedText) && normalizedCity !== normalizedText;
      });
      const recentFiltered = recentCities.filter(c => {
        const normalizedCity = c.toLowerCase().trim();
        return normalizedCity.startsWith(normalizedText);
      });
      setCitySuggestions([...recentFiltered, ...filtered].slice(0, 5));
    } else {
      setCitySuggestions(recentCities);
    }
  };

  // Input'a tıklanınca geçmiş aramaları öneri olarak göster
  const onInputFocus = () => {
    if (city.length === 0 && recentCities.length > 0) {
      setCitySuggestions(recentCities);
    }
  };

  // Öneriye tıklanınca input'a yaz ve arama yap
  const onSuggestionPress = (suggestion: string) => {
    setCity(suggestion);
    setCitySuggestions([]);
    fetchWeather(suggestion);
    Keyboard.dismiss();
  };

  // Her kelimenin ilk harfi büyük, geri kalanı küçük ve Türkçe karakterlere uygun
  const formatDescription = (s: string) =>
    s.split(' ').map(word =>
      word.length > 0
        ? word[0].toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR')
        : ''
    ).join(' ');

  // getModernForecastIconStyle fonksiyonu View için olacak, Image için sadece boyut verilecek
  const getModernForecastIconStyle = (isDark: boolean): ViewStyle => ({
    width: 72,
    height: 72,
    marginBottom: 8,
    backgroundColor: isDark ? '#232a36' : '#b3c6f7',
    borderRadius: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  });
  const iconImageStyle = { width: 56, height: 56 };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // useEffect ile izinleri ve task başlatmayı güncelle
  useEffect(() => {
    (async () => {
      const { status: notifStatus } = await Notifications.requestPermissionsAsync();
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (notifStatus !== 'granted' || locStatus !== 'granted') return;

      // Background fetch task'ı kaydet
      await BackgroundFetch.registerTaskAsync(WEATHER_TASK, {
        minimumInterval: 60 * 60, // 1 saat (Expo'da minimum 15dk)
        stopOnTerminate: false,
        startOnBoot: true,
      });

      // Battery optimization bypass (Android için)
      if (Platform.OS === 'android') {
        try {
          // Wake lock al (uygulamanın uykuya geçmesini engeller)
          const { activateKeepAwakeAsync, deactivateKeepAwake } = await import('expo-keep-awake');
          await activateKeepAwakeAsync();
          // Component unmount olduğunda wake lock'ı kaldır
          return () => {
            deactivateKeepAwake();
          };
        } catch (error) {
          console.log('Keep awake not available:', error);
        }
      }
    })();
  }, []);

  // Gündüz/gece ayrımı için UTC saatine forecast.city.timezone'u ekleyerek yerel saati hesapla
  const isForecastNight = (dt: number) => {
    const utcDate = new Date(dt * 1000);
    const utcHour = utcDate.getUTCHours();
    const timezoneOffset = (forecast?.city?.timezone || 0) / 3600;
    const localHour = (utcHour + timezoneOffset + 24) % 24;
    return !(localHour >= 9 && localHour < 21);
  };

  // Şehir değiştiğinde güncelle
  useEffect(() => {
    if (weather?.name) {
      setCurrentCityName(weather.name);
    }
  }, [weather]);

  return (
    <LinearGradient
      colors={isDark ? ['#232a36', '#181a20'] : ['#b3c6f7', '#e3f0ff']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
        >
          <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 8 }} showsVerticalScrollIndicator={false}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Text style={[styles.title, isDark && styles.darkText]}>{t('weather')}</Text>
            <Text style={{textAlign: 'center', fontSize: 15, color: isDark ? '#fff' : '#222', marginBottom: 4}}>
              {currentTime.toLocaleTimeString()}
            </Text>
            {/* Favori şehirler kutusu */}
            {favorites.length > 0 && (
              <View style={[styles.favBox, isDark && styles.darkFavBox]}>
                <Text style={[styles.favBoxTitle, isDark && styles.darkText]}>{t('favorites')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.favList}>
                  {favorites.map((fav, i) => (
                    <TouchableOpacity key={`fav-${fav}-${i}`} style={styles.favItem} onPress={() => fetchWeatherForFavorite(fav)} onLongPress={() => toggleFavorite(fav)}>
                      <MaterialCommunityIcons name="star" size={18} color="#FFD700" style={{ marginRight: 4 }} />
                      <Text style={styles.favText}>{fav}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            {/* Arama kutusu ve butonlar */}
            <View style={{ width: '100%', alignItems: 'center', marginBottom: 12, position: 'relative' }}>
              <TextInput
                style={[styles.input, isDark && styles.darkInput]}
                placeholder={t('searchPlaceholder')}
                placeholderTextColor={isDark ? '#aaa' : '#888'}
                value={city}
                onChangeText={onCityInputChange}
                onFocus={onInputFocus}
                autoCorrect={false}
                autoCapitalize="none"
              />
              <Text style={{ fontSize: 13, color: isDark ? '#b3c6f7' : '#888', marginTop: 2, marginBottom: 6 }}>
                {t('searchHelper')}
              </Text>
              {citySuggestions.length > 0 && (
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  style={{
                    position: 'absolute',
                    top: 62, // inputun hemen altı için ayarlandı
                    left: 0,
                    right: 0,
                    width: '100%',
                    backgroundColor: isDark ? '#232a36' : '#fff',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#e0e7ff',
                    shadowColor: '#000',
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    zIndex: 100,
                    maxHeight: 220,
                  }}
                >
                  {citySuggestions.map((s, i) => (
                    <TouchableOpacity key={`suggestion-${s}-${i}`} onPress={() => onSuggestionPress(s)} style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: isDark ? '#333' : '#eee' }}>
                      <Text style={{ color: isDark ? '#fff' : '#222', fontSize: 16 }}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.button, {flex: 1, marginRight: 6, minWidth: 0}]} onPress={() => fetchWeather()}>
                  <MaterialCommunityIcons name="magnify" size={22} color="#fff" />
                  <Text style={styles.buttonText} numberOfLines={1} ellipsizeMode="tail">{t('search')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.locationButton, {flex: 1, marginLeft: 6, minWidth: 0}]} onPress={fetchWeatherByLocation}>
                  <MaterialCommunityIcons name="map-marker" size={22} color="#fff" />
                  <Text style={styles.buttonText} numberOfLines={1} ellipsizeMode="tail">{t('findByLocation')}</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Ana hava durumu kartı */}
            {weather && (
              <TouchableOpacity style={styles.favButton} onPress={() => toggleFavorite(turkceSehirAdi(weather.name))}>
                <MaterialCommunityIcons name="star" size={28} color={favorites.includes(turkceSehirAdi(weather.name)) ? '#FFD700' : '#bbb'} />
              </TouchableOpacity>
            )}
            {loading && <ActivityIndicator size="large" color={isDark ? '#fff' : '#0000ff'} />}
            {error && (
              <Text style={[styles.error, isDark && styles.darkText]}>{error}</Text>
            )}
            {weather && (
              <View style={styles.weatherCard}>
                <Text style={styles.cityName}>{turkceSehirAdi(weather.name)}</Text>
                <View style={styles.tempRow}>
                  <View style={[getModernForecastIconStyle(isDark), { marginRight: 20, backgroundColor: 'transparent', shadowColor: 'transparent' }]}> 
                    {(() => {
                      const now = Date.now() / 1000;
                      const isNightNow = now < weather.sys.sunrise || now > weather.sys.sunset;
                      return (
                        <LottieView
                          source={getWeatherLottie(weather.weather[0].main, isNightNow)}
                          autoPlay
                          loop
                          style={{ width: 72, height: 72 }}
                        />
                      );
                    })()}
                  </View>
                  <View>
                    <Text style={styles.temperature}>{Math.round(weather.main.temp)}°C</Text>
                    <Text
                      style={[styles.description, { maxWidth: 120, flexShrink: 1 }]}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {formatDescription(weather.weather[0].description)}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailsRow}>
                  <View style={styles.detailBox}>
                    <MaterialCommunityIcons name="thermometer" size={20} color="#b3c6f7" />
                    <Text style={styles.detailLabel}>{t('feelsLike')}</Text>
                    <Text style={styles.detailValue}>{Math.round(weather.main.feels_like)}°C</Text>
                  </View>
                  <View style={styles.detailBox}>
                    <MaterialCommunityIcons name="water-percent" size={20} color="#b3c6f7" />
                    <Text style={styles.detailLabel}>{t('humidity')}</Text>
                    <Text style={styles.detailValue}>%{weather.main.humidity}</Text>
                  </View>
                  <View style={styles.detailBox}>
                    <MaterialCommunityIcons name="weather-windy" size={20} color="#b3c6f7" />
                    <Text style={styles.detailLabel}>{t('wind')}</Text>
                    <Text style={styles.detailValue}>{(weather.wind.speed * 3.6).toFixed(1)} km/sa</Text>
                  </View>
                </View>
                <View style={styles.detailsRow}>
                  <View style={styles.detailBox}>
                    <MaterialCommunityIcons name="gauge" size={20} color="#b3c6f7" />
                    <Text style={styles.detailLabel}>{t('pressure')}</Text>
                    <Text style={styles.detailValue}>{weather.main.pressure} hPa</Text>
                  </View>
                  <View style={styles.detailBox}>
                    <MaterialCommunityIcons name="weather-sunset-up" size={20} color="#b3c6f7" />
                    <Text style={styles.detailLabel}>{t('sunrise')}</Text>
                    <Text style={styles.detailValue}>{new Date(weather.sys.sunrise * 1000).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                  <View style={styles.detailBox}>
                    <MaterialCommunityIcons name="weather-sunset-down" size={20} color="#b3c6f7" />
                    <Text style={styles.detailLabel}>{t('sunset')}</Text>
                    <Text style={styles.detailValue}>{new Date(weather.sys.sunset * 1000).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</Text>
                  </View>
                </View>
              </View>
            )}
            {/* 5 günlük tahmin */}
            {forecast && (
              <View style={styles.forecastContainer}>
                <Text style={[styles.forecastTitle, isDark && styles.darkText]}>{t('forecast5')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {getDailyForecast(forecast.list).map(item => {
                    const isNight = isForecastNight(item.dt);
                    return (
                      <View style={styles.modernForecastItem} key={item.dt}>
                        <Text style={styles.modernForecastDay}>{new Date(item.dt_txt).toLocaleDateString(lang === 'de' ? 'de-DE' : lang === 'ja' ? 'ja-JP' : lang === 'en' ? 'en-US' : 'tr-TR', { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
                        <View style={getModernForecastIconStyle(isDark)}>
                          <LottieView
                            source={getWeatherLottie(item.weather[0].main, isNight)}
                            autoPlay
                            loop
                            style={{ width: 56, height: 56 }}
                          />
                        </View>
                        <Text style={styles.modernForecastTemp}>{Math.round(item.main.temp)}°C</Text>
                        <Text style={styles.modernForecastDesc} numberOfLines={2} ellipsizeMode="tail">{formatDescription(item.weather[0].description)}</Text>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )}
            {/* 3 saatlik tahmin */}
            {forecast && (
              <View style={[styles.hourlyCard, isDark && styles.darkHourlyCard, { width: '100%', alignSelf: 'center', marginTop: 12 }]}> 
                <Text style={[styles.forecastTitle, isDark && styles.darkText]}>{t('forecast3h')}</Text>
                {forecast.list && forecast.list.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {forecast.list.slice(0, 8).map(item => {
                      const utcDate = new Date(item.dt * 1000);
                      const utcHour = utcDate.getUTCHours();
                      const timezoneOffset = (forecast?.city?.timezone || 0) / 3600;
                      const localHour = (utcHour + timezoneOffset + 24) % 24;
                      const localDt = item.dt + (forecast?.city?.timezone || 0);
                      const date = new Date(localDt * 1000);
                      const today = new Date();
                      let isNight;
                      if (
                        date.getDate() === today.getDate() &&
                        date.getMonth() === today.getMonth() &&
                        date.getFullYear() === today.getFullYear() &&
                        weather?.sys?.sunrise && weather?.sys?.sunset
                      ) {
                        isNight = localDt < weather.sys.sunrise || localDt > weather.sys.sunset;
                      } else {
                        isNight = !(localHour >= 9 && localHour < 21);
                      }
                      return (
                        <View style={styles.modernForecastItem} key={item.dt + '-hourly'}>
                          <Text style={styles.modernForecastDay}>{new Date(item.dt_txt).toLocaleTimeString(lang === 'de' ? 'de-DE' : lang === 'ja' ? 'ja-JP' : lang === 'en' ? 'en-US' : 'tr-TR', { hour: '2-digit', minute: '2-digit' })}</Text>
                          <View style={getModernForecastIconStyle(isDark)}>
                            <LottieView
                              source={getWeatherLottie(item.weather[0].main, isNight)}
                              autoPlay
                              loop
                              style={{ width: 56, height: 56 }}
                            />
                          </View>
                          <Text style={styles.modernForecastTemp}>{Math.round(item.main.temp)}°C</Text>
                          <Text style={styles.modernForecastDesc} numberOfLines={2} ellipsizeMode="tail">{formatDescription(item.weather?.[0]?.description || '')}</Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                ) : (
                  <Text style={{ color: isDark ? '#fff' : '#222', textAlign: 'center', marginTop: 12 }}>{forecast ? t('loading') || 'Veri yükleniyor...' : t('noData') || 'Veri yok'}</Text>
                )}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
    color: '#333',
  },
  darkText: { color: '#fff' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    height: 50,
    paddingHorizontal: 24,
    borderRadius: 25,
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34c759',
    height: 50,
    paddingHorizontal: 24,
    borderRadius: 25,
    justifyContent: 'center',
    shadowColor: '#34c759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  weatherCard: {
    backgroundColor: '#232a36',
    borderRadius: 24,
    padding: 24,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
  },
  cityName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherIconBig: {
    width: 90,
    height: 90,
    marginRight: 16,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  description: {
    fontSize: 20,
    color: '#b3c6f7',
    textTransform: 'capitalize',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  detailBox: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#b3c6f7',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  forecastContainer: {
    marginTop: 20,
  },
  forecastTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modernForecastItem: {
    backgroundColor: '#f6f8ff',
    borderRadius: 18,
    padding: 14,
    marginRight: 14,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
    minWidth: 90,
    maxWidth: 120,
  },
  modernForecastDay: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
    fontWeight: 'bold',
  },
  modernForecastIcon: {
    width: 72,
    height: 72,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernForecastTemp: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  modernForecastDesc: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
    minHeight: 18,
  },
  hourlyCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginTop: 20,
    marginBottom: 32,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 200,
  },
  darkHourlyCard: {
    backgroundColor: '#232a36',
  },
  weatherIconSmall: {
    width: 28,
    height: 28,
    marginBottom: 2,
  },
  favList: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  favItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbe6',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ffe066',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 1,
  },
  favText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 4,
    color: '#333',
  },
  favButton: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e7ff',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  darkFavBox: {
    backgroundColor: '#232a36',
    borderColor: '#232a36',
  },
  favBoxTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    color: '#222',
    marginVertical: 12,
    minWidth: 260,
    maxWidth: 400,
  },
  darkInput: {
    backgroundColor: '#232a36',
    color: '#fff',
  },
});