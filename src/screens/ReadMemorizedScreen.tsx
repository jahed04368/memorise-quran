import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { useMemorizationContext } from '../context/MemorizationContext';
import { SURAH_DATA } from '../data/surahData';
import { QuranApiResponse, Ayah, RootStackParamList } from '../types';
import { hasBismillahHeader, stripBismillah, BISMILLAH } from '../utils/bismillah';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'ReadMemorized'>;
  route: RouteProp<RootStackParamList, 'ReadMemorized'>;
};

export default function ReadMemorizedScreen({ navigation, route }: Props) {
  const { surahNumber } = route.params;
  const surahMeta = SURAH_DATA[surahNumber - 1];

  const [arabicAyahs, setArabicAyahs] = useState<Ayah[]>([]);
  const [englishAyahs, setEnglishAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isMemorized, getMemorizedCount } = useMemorizationContext();
  const memorizedCount = getMemorizedCount(surahNumber);

  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [loadingAyah, setLoadingAyah] = useState<number | null>(null);
  const [downloadingAyah, setDownloadingAyah] = useState<number | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => { stopAndUnload(); };
  }, []);

  const stopAndUnload = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
    setPlayingAyah(null);
    setLoadingAyah(null);
  };

  const handlePlayPause = async (ayah: { number: number; numberInSurah: number }) => {
    const url = `https://cdn.islamic.network/quran/audio/128/ar.husary/${ayah.number}.mp3`;

    if (playingAyah === ayah.number && soundRef.current) {
      await soundRef.current.pauseAsync();
      setPlayingAyah(null);
      return;
    }

    await stopAndUnload();
    setLoadingAyah(ayah.number);
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true },
        (status: AVPlaybackStatus) => {
          if (status.isLoaded && status.didJustFinish) {
            setPlayingAyah(null);
          }
        }
      );
      soundRef.current = sound;
      setPlayingAyah(ayah.number);
    } catch {
      Alert.alert('Error', 'Could not load audio.');
    } finally {
      setLoadingAyah(null);
    }
  };

  const handleDownload = async (ayah: { number: number; numberInSurah: number }) => {
    const url = `https://cdn.islamic.network/quran/audio/128/ar.husary/${ayah.number}.mp3`;
    setDownloadingAyah(ayah.number);
    try {
      const fileName = `surah_${surahNumber}_ayah_${ayah.numberInSurah}.mp3`;
      const localUri = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.downloadAsync(url, localUri);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri, {
          mimeType: 'audio/mpeg',
          dialogTitle: `Save ${surahMeta.englishName} — Verse ${ayah.numberInSurah}`,
          UTI: 'public.mp3',
        });
      } else {
        Alert.alert('Downloaded', fileName);
      }
    } catch {
      Alert.alert('Error', 'Could not download audio.');
    } finally {
      setDownloadingAyah(null);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      title: surahMeta.englishName,
      headerStyle: { backgroundColor: '#1a3a2a' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '700' },
    });
  }, [navigation, surahMeta]);

  useEffect(() => {
    fetchSurah();
  }, [surahNumber]);

  const fetchSurah = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih`
      );
      const json: QuranApiResponse = await res.json();
      if (json.code === 200 && json.data.length >= 2) {
        setArabicAyahs(json.data[0].ayahs);
        setEnglishAyahs(json.data[1].ayahs);
      } else {
        setError('Failed to load surah data.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const memorizedAyahs = arabicAyahs.filter((a) =>
    isMemorized(surahNumber, a.numberInSurah)
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Loading {surahMeta.englishName}...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchSurah}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a3a2a" />
      <View style={styles.subHeader}>
        <Text style={styles.subHeaderText}>
          {memorizedCount} memorised verse{memorizedCount !== 1 ? 's' : ''} · {surahMeta.arabicName}
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {hasBismillahHeader(surahNumber) && (
          <Text style={styles.bismillah}>{BISMILLAH}</Text>
        )}
        {memorizedAyahs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No memorised verses yet.</Text>
          </View>
        ) : (
          memorizedAyahs.map((arabic) => {
            const english = englishAyahs[arabic.numberInSurah - 1];
            const displayText = hasBismillahHeader(surahNumber) && arabic.numberInSurah === 1
              ? stripBismillah(arabic.text)
              : arabic.text;
            return (
              <View key={arabic.numberInSurah} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.versePill}>
                    <Text style={styles.versePillText}>{arabic.numberInSurah}</Text>
                  </View>
                  <View style={styles.memorisedBadge}>
                    <Text style={styles.memorisedBadgeText}>Memorised</Text>
                  </View>
                </View>
                <Text style={styles.arabicText}>{displayText}</Text>

                <View style={styles.audioRow}>
                  <TouchableOpacity
                    style={styles.playBtn}
                    onPress={() => handlePlayPause(arabic)}
                    disabled={loadingAyah === arabic.number}
                    activeOpacity={0.7}
                  >
                    {loadingAyah === arabic.number ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.playBtnText}>
                        {playingAyah === arabic.number ? '⏸ Pause' : '▶ Play'}
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.downloadBtn}
                    onPress={() => handleDownload(arabic)}
                    disabled={downloadingAyah === arabic.number}
                    activeOpacity={0.7}
                  >
                    {downloadingAyah === arabic.number ? (
                      <ActivityIndicator size="small" color="#2e7d32" />
                    ) : (
                      <Text style={styles.downloadBtnText}>⬇ Download</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.divider} />
                <Text style={styles.translationLabel}>Translation</Text>
                <Text style={styles.englishText}>{english?.text ?? ''}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f0',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#555',
    fontSize: 15,
  },
  errorText: {
    color: '#c62828',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  subHeader: {
    backgroundColor: '#1a3a2a',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 14,
  },
  subHeaderText: {
    color: '#a8d5b5',
    fontSize: 13,
    textAlign: 'center',
  },
  scroll: {
    padding: 14,
    paddingBottom: 32,
  },
  bismillah: {
    fontSize: 24,
    color: '#1a3a2a',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
    writingDirection: 'rtl',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  versePill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  versePillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2e7d32',
  },
  memorisedBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  memorisedBadgeText: {
    fontSize: 11,
    color: '#2e7d32',
    fontWeight: '600',
  },
  arabicText: {
    fontSize: 26,
    lineHeight: 50,
    textAlign: 'right',
    color: '#1a1a1a',
    writingDirection: 'rtl',
  },
  audioRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  playBtn: {
    flex: 1, backgroundColor: '#2e7d32', borderRadius: 10,
    paddingVertical: 10, alignItems: 'center', justifyContent: 'center', minHeight: 40,
  },
  playBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  downloadBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#2e7d32', borderRadius: 10,
    paddingVertical: 10, alignItems: 'center', justifyContent: 'center', minHeight: 40,
  },
  downloadBtnText: { color: '#2e7d32', fontWeight: '700', fontSize: 14 },
  divider: {
    height: 1,
    backgroundColor: '#e8f5e9',
    marginVertical: 14,
  },
  translationLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  englishText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#444',
    fontStyle: 'italic',
  },
});
