import AsyncStorage from '@react-native-async-storage/async-storage';
import { SurahEdition } from '../types';

const surahKey = (n: number) => `offline:surah:${n}`;
const READY_KEY = 'offline:ready';
const TOTAL_SURAHS = 114;

export async function isOfflineReady(): Promise<boolean> {
  const val = await AsyncStorage.getItem(READY_KEY);
  return val === 'true';
}

export async function getCachedSurah(surahNumber: number): Promise<SurahEdition[] | null> {
  const raw = await AsyncStorage.getItem(surahKey(surahNumber));
  if (!raw) return null;
  return JSON.parse(raw) as SurahEdition[];
}

export async function downloadAllSurahs(
  onProgress: (current: number, total: number) => void
): Promise<void> {
  for (let i = 1; i <= TOTAL_SURAHS; i++) {
    const res = await fetch(
      `https://api.alquran.cloud/v1/surah/${i}/editions/quran-uthmani,en.sahih`
    );
    const json = await res.json();
    if (json.code === 200 && json.data.length >= 2) {
      await AsyncStorage.setItem(surahKey(i), JSON.stringify(json.data));
    }
    onProgress(i, TOTAL_SURAHS);
  }
  await AsyncStorage.setItem(READY_KEY, 'true');
}

export async function deleteOfflineData(): Promise<void> {
  const keys: string[] = [];
  for (let i = 1; i <= TOTAL_SURAHS; i++) keys.push(surahKey(i));
  keys.push(READY_KEY);
  await AsyncStorage.multiRemove(keys);
}
