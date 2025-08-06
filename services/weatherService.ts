import axios from 'axios';
import Constants from 'expo-constants';

// Hem expo constants hem de process.env'den API anahtarını dene
const API_KEY = Constants.expoConfig?.extra?.openWeatherApiKey || process.env.OPEN_WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

console.log('API Key loaded:', API_KEY ? 'YES' : 'NO');

export interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
  name: string;
  sys: {
    sunrise: number;
    sunset: number;
  };
}

export interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
  dt_txt: string;
}

export interface ForecastData {
  list: ForecastItem[];
  city: {
    name: string;
    country: string;
    timezone: number;
  };
}

// Türkçe karakterleri İngilizce karakterlere çeviren fonksiyon
const normalizeTurkishChars = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
};

// İlçe adını büyükşehir ile birleştiren fonksiyon
const combineDistrictWithCity = (district: string): string => {
  const istanbulDistricts = ['kağıthane', 'kadıköy', 'beşiktaş', 'üsküdar', 'bakırköy'];
  const normalizedDistrict = normalizeTurkishChars(district);
  
  if (istanbulDistricts.includes(normalizedDistrict)) {
    return `${district}, Istanbul`;
  }
  
  return district;
};

export const getWeatherByCity = async (city: string, lang: string = 'tr'): Promise<WeatherData> => {
  let normalizedCity = city;
  try {
    normalizedCity = combineDistrictWithCity(city);
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        q: normalizedCity,
        appid: API_KEY,
        units: 'metric',
        lang
      }
    });
    return response.data;
  } catch {
    // İlçe bulunamazsa büyükşehir için tekrar dene
    if (city !== normalizedCity) {
      try {
        const response = await axios.get(`${BASE_URL}/weather`, {
          params: {
            q: city,
            appid: API_KEY,
            units: 'metric',
            lang
          }
        });
        return response.data;
      } catch {
        throw new Error('Hava durumu bilgisi alınamadı');
      }
    }
    throw new Error('Hava durumu bilgisi alınamadı');
  }
};

export const getWeatherByLocation = async (lat: number, lon: number, lang: string = 'tr'): Promise<WeatherData> => {
  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric',
        lang
      }
    });
    return response.data;
  } catch {
    throw new Error('Hava durumu bilgisi alınamadı');
  }
};

export async function getWeatherByCoords(lat: number, lon: number) {
  const apiKey = process.env.OPEN_WEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=tr&appid=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Hava durumu alınamadı');
  return response.json();
}

export const get5DayForecastByCity = async (city: string, lang: string = 'tr'): Promise<ForecastData> => {
  try {
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric',
        lang,
      },
    });
    return response.data;
  } catch {
    throw new Error('Tahmin verisi alınamadı');
  }
};

export const get5DayForecastByLocation = async (lat: number, lon: number, lang: string = 'tr'): Promise<ForecastData> => {
  try {
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: 'metric',
        lang,
      },
    });
    return response.data;
  } catch {
    throw new Error('Tahmin verisi alınamadı');
  }
};

// Gündüz/gece ayrımı için yardımcı fonksiyon
export const isDaytime = (sunrise: number, sunset: number, timezone: number): boolean => {
  const now = Math.floor(Date.now() / 1000);
  const localTime = now + timezone;
  return localTime >= sunrise && localTime < sunset;
};

// Hava durumu ikonu için yardımcı fonksiyon
export const getWeatherIcon = (icon: string, isDay: boolean): string => {
  const baseIcon = icon.replace('n', '').replace('d', '');
  return `${baseIcon}${isDay ? 'd' : 'n'}`;
}; 