import AsyncStorage from '@react-native-async-storage/async-storage';

export type Birthday = {
  id: string; // uuid
  name: string;
  date: string; // ISO format (YYYY-MM-DD)
};

const STORAGE_KEY = 'BIRTHDAYS';

export async function getBirthdays(): Promise<Birthday[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export async function addBirthday(birthday: Birthday): Promise<void> {
  const birthdays = await getBirthdays();
  birthdays.push(birthday);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(birthdays));
}

export async function removeBirthday(id: string): Promise<void> {
  const birthdays = await getBirthdays();
  const filtered = birthdays.filter(b => b.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export async function clearBirthdays(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
} 