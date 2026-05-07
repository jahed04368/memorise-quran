import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'memorized_verses';

type MemorizedSet = Set<string>;

const verseKey = (surahNum: number, verseNum: number) => `${surahNum}:${verseNum}`;

export function useMemorization() {
  const [memorized, setMemorized] = useState<MemorizedSet>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        const parsed: string[] = JSON.parse(raw);
        setMemorized(new Set(parsed));
      }
      setLoaded(true);
    });
  }, []);

  const persist = useCallback(async (next: MemorizedSet) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  }, []);

  const markMemorized = useCallback(async (surahNum: number, verseNum: number) => {
    setMemorized((prev) => {
      const next = new Set(prev);
      next.add(verseKey(surahNum, verseNum));
      persist(next);
      return next;
    });
  }, [persist]);

  const unmarkMemorized = useCallback(async (surahNum: number, verseNum: number) => {
    setMemorized((prev) => {
      const next = new Set(prev);
      next.delete(verseKey(surahNum, verseNum));
      persist(next);
      return next;
    });
  }, [persist]);

  const isMemorized = useCallback((surahNum: number, verseNum: number): boolean => {
    return memorized.has(verseKey(surahNum, verseNum));
  }, [memorized]);

  const getMemorizedCount = useCallback((surahNum: number): number => {
    let count = 0;
    for (const key of memorized) {
      if (key.startsWith(`${surahNum}:`)) count++;
    }
    return count;
  }, [memorized]);

  const getTotalMemorizedCount = useCallback((): number => {
    return memorized.size;
  }, [memorized]);

  return { memorized, loaded, markMemorized, unmarkMemorized, isMemorized, getMemorizedCount, getTotalMemorizedCount };
}
