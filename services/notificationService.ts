import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundFetch from 'expo-background-fetch';
import type { NotificationTriggerInput } from 'expo-notifications';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { getWeatherByLocation } from './weatherService';

const BACKGROUND_WEATHER_TASK = 'BACKGROUND_WEATHER_TASK';

// Bildirim izinlerini kontrol et ve iste
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
};

// Bildirim gönderme fonksiyonu
export const sendNotification = async (title: string, body: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: null,
  });
};

// Arka plan görevi tanımı
TaskManager.defineTask(BACKGROUND_WEATHER_TASK, async () => {
  try {
    const lastLocation = await AsyncStorage.getItem('lastLocation');
    if (!lastLocation) return BackgroundFetch.Result.NoData;

    const { latitude, longitude } = JSON.parse(lastLocation);
    const weather = await getWeatherByLocation(latitude, longitude);

    // Sabah bildirimi (06:00-08:00 arası)
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 6 && hour < 8) {
      await sendNotification(
        'Günaydın! 🌅',
        `Bugün ${weather.weather[0].description} bekleniyor. Sıcaklık ${Math.round(weather.main.temp)}°C.`
      );
    }

    // Yağmur uyarısı
    if (weather.weather[0].main.toLowerCase().includes('rain')) {
      await sendNotification(
        'Yağmur Uyarısı! 🌧️',
        'Bugün yağmur bekleniyor. Şemsiyenizi yanınıza almayı unutmayın.'
      );
    }

    return BackgroundFetch.Result.NewData;
  } catch (error) {
    return BackgroundFetch.Result.Failed;
  }
});

// Arka plan görevini başlat
export const startBackgroundTask = async () => {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_WEATHER_TASK, {
      minimumInterval: 3600, // 1 saat
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (error) {
    console.error('Arka plan görevi başlatılamadı:', error);
  }
};

// Arka plan görevini durdur
export const stopBackgroundTask = async () => {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_WEATHER_TASK);
  } catch (error) {
    console.error('Arka plan görevi durdurulamadı:', error);
  }
}; 

// Doğum günü bildirimi planlama
export const scheduleBirthdayNotification = async (date: Date, name: string, lang: string) => {
  // Bildirim mesajlarını diller için ayarla
  const messages: Record<string, { title: string; body: string }> = {
    tr: {
      title: 'Doğum Günü Kutlu Olsun! 🎂',
      body: `Doğum günün kutlu olsun, ${name}!`,
    },
    en: {
      title: 'Happy Birthday! 🎂',
      body: `Happy birthday, ${name}!`,
    },
    ja: {
      title: 'お誕生日おめでとう！🎂',
      body: `お誕生日おめでとう、${name}さん！`,
    },
    de: {
      title: 'Alles Gute zum Geburtstag! 🎂',
      body: `Alles Gute zum Geburtstag, ${name}!`,
    },
  };
  const msg = messages[lang] || messages['en'];

  if (Platform.OS === 'ios') {
    // iOS: ileri tarihli calendar trigger ile planla
    await Notifications.scheduleNotificationAsync({
      content: {
        title: msg.title,
        body: msg.body,
        sound: true,
      },
      trigger: {
        type: 'calendar',
        hour: 9,
        minute: 0,
        repeats: false,
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
      } as NotificationTriggerInput,
    });
  } else {
    // Android: sadece bugünkü doğum günleri için hemen bildir
    const today = new Date();
    if (
      today.getDate() === date.getDate() &&
      today.getMonth() === date.getMonth()
    ) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: msg.title,
          body: msg.body,
          sound: true,
        },
        trigger: null,
      });
    }
  }
}; 