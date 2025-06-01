import axios from 'axios';
import Constants from 'expo-constants';

const API_KEY = Constants.expoConfig?.extra?.openWeatherApiKey;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
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
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
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

export const getWeatherByCity = async (city: string, lang: string = 'tr'): Promise<WeatherData> => {
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
  } catch (error) {
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
  } catch (error) {
    throw new Error('Hava durumu bilgisi alınamadı');
  }
};

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
  } catch (error) {
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
  } catch (error) {
    throw new Error('Tahmin verisi alınamadı');
  }
}; 