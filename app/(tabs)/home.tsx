import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ForecastData, ForecastItem, get5DayForecastByCity, get5DayForecastByLocation, getWeatherByCity, getWeatherByLocation, WeatherData } from '../../services/weatherService';

const THEME_KEY = 'APP_THEME';
const RECENT_CITIES_KEY = 'RECENT_CITIES';

// Tema contexti
export const ThemeContext = createContext({
  theme: 'auto',
  isDark: false,
  setTheme: (val: 'light' | 'dark' | 'auto') => {},
});

type Lang = 'tr' | 'en';
export const LanguageContext = createContext<{
  lang: Lang;
  setLang: (val: Lang) => void;
}>({
  lang: 'tr',
  setLang: () => {},
});

export const translations = {
  tr: {
    weather: 'Hava Durumu',
    favorites: 'Favori Şehirler',
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
  },
  en: {
    weather: 'Weather',
    favorites: 'Favorite Cities',
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
  },
};

// Basit şehirler listesi (Türkiye ve popüler dünya şehirleri örnek)
const CITY_LIST = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Adana', 'Antalya', 'Konya', 'Gaziantep', 'Şanlıurfa', 'Mersin',
  'Kayseri', 'Eskişehir', 'Diyarbakır', 'Samsun', 'Denizli', 'Şırnak', 'Trabzon', 'Van', 'Malatya', 'Manisa',
  'London', 'Paris', 'Berlin', 'New York', 'Moscow', 'Tokyo', 'Madrid', 'Rome', 'Porto', 'Lisbon',
  // ... daha fazla eklenebilir ...
];

export default function HomeScreen() {
  const { theme, isDark } = useContext(ThemeContext);
  const { lang } = useContext(LanguageContext);
  const t = (key: keyof typeof translations['tr']) => translations[lang as Lang][key];
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [recentCities, setRecentCities] = useState<string[]>([]);

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
    const searchCity = cityName ?? city;
    if (!searchCity.trim()) {
      setError(t('errorNoCity'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await getWeatherByCity(searchCity, lang);
      setWeather(data);
      const forecastData = await get5DayForecastByCity(searchCity, lang);
      setForecast(forecastData);
      await addRecentCity(searchCity);
    } catch (err) {
      setError(t('errorNoWeather'));
      setWeather(null);
      setForecast(null);
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
      let location = await Location.getCurrentPositionAsync({});
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
      const filtered = CITY_LIST.filter(c => c.toLowerCase().startsWith(text.toLowerCase()) && c.toLowerCase() !== text.toLowerCase());
      setCitySuggestions([...recentCities.filter(c => c.toLowerCase().startsWith(text.toLowerCase())), ...filtered].slice(0, 5));
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
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.container, isDark ? styles.darkBg : styles.lightBg]} showsVerticalScrollIndicator={false}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Text style={[styles.title, isDark && styles.darkText]}>{t('weather')}</Text>
        {/* Favori şehirler kutusu */}
        {favorites.length > 0 && (
          <View style={[styles.favBox, isDark && styles.darkFavBox]}>
            <Text style={[styles.favBoxTitle, isDark && styles.darkText]}>{t('favorites')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.favList}>
              {favorites.map((fav, i) => (
                <TouchableOpacity key={`fav-${fav}-${i}`} style={styles.favItem} onPress={() => fetchWeatherForFavorite(fav)} onLongPress={() => toggleFavorite(fav)}>
                  <Text style={styles.favText}>{fav}</Text>
                  <Text style={styles.favStar}>★</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        <View style={styles.searchContainer}>
          <View style={{ flex: 1 }}>
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
            {citySuggestions.length > 0 && (
              <View style={{ position: 'absolute', top: 52, left: 0, right: 0, zIndex: 10, backgroundColor: isDark ? '#232a36' : '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e7ff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4 }}>
                {citySuggestions.map((s, i) => (
                  <TouchableOpacity key={`suggestion-${s}-${i}`} onPress={() => onSuggestionPress(s)} style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: isDark ? '#333' : '#eee' }}>
                    <Text style={{ color: isDark ? '#fff' : '#222', fontSize: 16 }}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.button} onPress={() => fetchWeather()}>
            <Text style={styles.buttonText}>{t('search')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.locationButton} onPress={fetchWeatherByLocation}>
            <Text style={styles.buttonText}>{t('findByLocation')}</Text>
          </TouchableOpacity>
          {/* Favori ekle/kaldır butonu */}
          {weather && (
            <TouchableOpacity style={styles.favButton} onPress={() => toggleFavorite(turkceSehirAdi(weather.name))}>
              <Text style={{ fontSize: 22, color: favorites.includes(turkceSehirAdi(weather.name)) ? '#FFD700' : '#bbb' }}>★</Text>
            </TouchableOpacity>
          )}
        </View>
        {loading && <ActivityIndicator size="large" color={isDark ? '#fff' : '#0000ff'} />}
        {error ? (
          <Text style={[styles.error, isDark && styles.darkText]}>{error}</Text>
        ) : weather && (
          <View style={[styles.weatherContainer, isDark && styles.darkWeatherContainer]}>
            <Text style={[styles.cityName, isDark && styles.darkText]}>{turkceSehirAdi(weather.name)}</Text>
            <Text style={[styles.temperature, isDark && styles.darkText]}>{Math.round(weather.main.temp)}°C</Text>
            <View style={styles.iconRow}>
              <Image
                source={{ uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png` }}
                style={styles.weatherIcon}
              />
              <Text style={[styles.description, isDark && styles.darkText]}>{weather.weather[0].description}</Text>
            </View>
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, isDark && styles.darkText]}>{t('feelsLike')}</Text>
                <Text style={[styles.detailValue, isDark && styles.darkText]}>{Math.round(weather.main.feels_like)}°C</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, isDark && styles.darkText]}>{t('humidity')}</Text>
                <Text style={[styles.detailValue, isDark && styles.darkText]}>%{weather.main.humidity}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, isDark && styles.darkText]}>{t('wind')}</Text>
                <Text style={[styles.detailValue, isDark && styles.darkText]}>{(weather.wind.speed * 3.6).toFixed(1)} km/sa</Text>
              </View>
            </View>
          </View>
        )}
        {forecast && (
          <>
            <View style={styles.forecastContainer}>
              <Text style={[styles.forecastTitle, isDark && styles.darkText]}>{t('forecast5')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {getDailyForecast(forecast.list).map(item => (
                  <View style={[styles.forecastItem, isDark && styles.darkForecastItem]} key={item.dt}>
                    <Text style={[styles.forecastDay, isDark && styles.darkText]}>{new Date(item.dt_txt).toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
                    <View style={styles.iconCircle}>
                      <Image
                        source={{ uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png` }}
                        style={styles.weatherIconSmall}
                      />
                    </View>
                    <Text style={[styles.forecastTemp, isDark && styles.darkText]}>{Math.round(item.main.temp)}°C</Text>
                    <Text style={[styles.forecastDesc, isDark && styles.darkText]}>{item.weather[0].description}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
            <View style={styles.hourlyContainer}>
              <Text style={[styles.forecastTitle, isDark && styles.darkText]}>{t('forecast3h')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {forecast.list.slice(0, 8).map(item => (
                  <View style={[styles.hourlyItem, isDark && styles.darkHourlyItem]} key={item.dt + '-hourly'}>
                    <Text style={[styles.hourlyTime, isDark && styles.darkText]}>{new Date(item.dt_txt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</Text>
                    <View style={styles.iconCircleSmall}>
                      <Image
                        source={{ uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png` }}
                        style={styles.weatherIconSmall}
                      />
                    </View>
                    <Text style={[styles.hourlyTemp, isDark && styles.darkText]}>{Math.round(item.main.temp)}°C</Text>
                    <Text style={[styles.hourlyDesc, isDark && styles.darkText]}>{item.weather[0].description}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1 kaldırıldı
    // backgroundColor ve padding ScrollView'da
  },
  lightBg: { backgroundColor: '#e3f0ff' },
  darkBg: { backgroundColor: '#181a20' },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
    color: '#333',
  },
  darkText: { color: '#fff' },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginRight: 10,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    color: '#222',
  },
  darkInput: {
    backgroundColor: '#232a36',
    color: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  locationButton: {
    backgroundColor: '#34c759',
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  weatherContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  darkWeatherContainer: {
    backgroundColor: '#232a36',
    borderColor: '#232a36',
  },
  cityName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
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
  forecastItem: {
    backgroundColor: '#e3e8f7',
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 1,
    minWidth: 70,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  darkForecastItem: {
    backgroundColor: '#232a36',
    borderColor: '#232a36',
  },
  forecastDay: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  forecastTemp: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  forecastDesc: {
    fontSize: 11,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  hourlyContainer: {
    marginTop: 20,
  },
  hourlyItem: {
    backgroundColor: '#e3e8f7',
    borderRadius: 10,
    padding: 6,
    marginBottom: 6,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 1,
    minWidth: 55,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  darkHourlyItem: {
    backgroundColor: '#232a36',
    borderColor: '#232a36',
  },
  hourlyTime: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  hourlyTemp: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  hourlyDesc: {
    fontSize: 10,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  weatherIcon: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  weatherIconSmall: {
    width: 28,
    height: 28,
    marginBottom: 2,
  },
  iconCircle: {
    backgroundColor: '#b3c6f7',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  iconCircleSmall: {
    backgroundColor: '#b3c6f7',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  favList: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  favItem: {
    backgroundColor: '#fffbe6',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
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
  favStar: {
    fontSize: 16,
    color: '#FFD700',
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
});