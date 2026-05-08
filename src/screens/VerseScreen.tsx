import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { useMemorizationContext } from '../context/MemorizationContext';
import { SURAH_DATA } from '../data/surahData';
import { QuranApiResponse, Ayah, RootStackParamList } from '../types';
import { hasBismillahHeader, stripBismillah, BISMILLAH } from '../utils/bismillah';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Verse'>;
  route: RouteProp<RootStackParamList, 'Verse'>;
};

const audioUrl = (globalAyahNumber: number) =>
  `https://cdn.islamic.network/quran/audio/128/ar.husary/${globalAyahNumber}.mp3`;

export default function VerseScreen({ navigation, route }: Props) {
  const { surahNumber } = route.params;
  const surahMeta = SURAH_DATA[surahNumber - 1];

  const [arabicAyahs, setArabicAyahs] = useState<Ayah[]>([]);
  const [englishAyahs, setEnglishAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [verseInputValue, setVerseInputValue] = useState('1');
  const soundRef = useRef<Audio.Sound | null>(null);

  const { markMemorized, unmarkMemorized, isMemorized, getMemorizedCount } = useMemorizationContext();

  const memorizedCount = getMemorizedCount(surahNumber);
  const totalVerses = surahMeta.totalVerses;
  const percent = totalVerses > 0 ? Math.round((memorizedCount / totalVerses) * 100) : 0;

  // Unload sound on unmount
  useEffect(() => {
    return () => { stopAndUnload(); };
  }, []);

  // Stop audio and sync input when verse changes
  useEffect(() => {
    stopAndUnload();
    setVerseInputValue(String(currentVerseIndex + 1));
  }, [currentVerseIndex]);

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

  useEffect(() => {
    if (arabicAyahs.length > 0) {
      const firstUnmemorized = arabicAyahs.findIndex(
        (a) => !isMemorized(surahNumber, a.numberInSurah)
      );
      setCurrentVerseIndex(firstUnmemorized === -1 ? 0 : firstUnmemorized);
    }
  }, [arabicAyahs]);

  const stopAndUnload = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
    setIsPlaying(false);
    setIsLoadingAudio(false);
  };

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

  const handlePlayPause = async () => {
    const ayah = arabicAyahs[currentVerseIndex];
    if (!ayah) return;

    if (isPlaying && soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
      return;
    }

    if (soundRef.current) {
      await soundRef.current.playAsync();
      setIsPlaying(true);
      return;
    }

    setIsLoadingAudio(true);
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl(ayah.number) },
        { shouldPlay: true },
        (status: AVPlaybackStatus) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        }
      );
      soundRef.current = sound;
      setIsPlaying(true);
    } catch {
      Alert.alert('Error', 'Could not load audio. Check your connection.');
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleVerseJump = () => {
    const num = parseInt(verseInputValue, 10);
    if (!isNaN(num) && num >= 1 && num <= arabicAyahs.length) {
      setCurrentVerseIndex(num - 1);
    } else {
      setVerseInputValue(String(currentVerseIndex + 1));
    }
  };

  const currentArabic = arabicAyahs[currentVerseIndex];
  const currentEnglish = englishAyahs[currentVerseIndex];
  const verseMemorized = currentArabic
    ? isMemorized(surahNumber, currentArabic.numberInSurah)
    : false;

  const handleMarkMemorized = useCallback(async () => {
    if (!currentArabic) return;
    await markMemorized(surahNumber, currentArabic.numberInSurah);
    if (currentVerseIndex < arabicAyahs.length - 1) {
      setCurrentVerseIndex((i) => i + 1);
    } else {
      Alert.alert(
        'Surah Complete!',
        `MashaAllah! You have memorised all ${totalVerses} verses of ${surahMeta.englishName}.`,
        [{ text: 'Back to Surahs', onPress: () => navigation.goBack() }]
      );
    }
  }, [currentArabic, currentVerseIndex, arabicAyahs.length, surahNumber, surahMeta, totalVerses, markMemorized, navigation]);

  const handleToggleMemorized = useCallback(async () => {
    if (!currentArabic) return;
    if (verseMemorized) {
      await unmarkMemorized(surahNumber, currentArabic.numberInSurah);
    } else {
      await handleMarkMemorized();
    }
  }, [currentArabic, verseMemorized, surahNumber, unmarkMemorized, handleMarkMemorized]);

  const goToPrev = () => {
    if (currentVerseIndex > 0) setCurrentVerseIndex((i) => i - 1);
  };

  const goToNext = () => {
    if (currentVerseIndex < arabicAyahs.length - 1) setCurrentVerseIndex((i) => i + 1);
  };

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

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percent}%` as any }]} />
        </View>
        <Text style={styles.progressText}>
          {memorizedCount} / {totalVerses} memorised ({percent}%)
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.surahHeader}>
          <Text style={styles.surahArabic}>{surahMeta.arabicName}</Text>
          <Text style={styles.surahEnglish}>{surahMeta.englishName}</Text>
          <Text style={styles.surahTranslation}>{surahMeta.translation}</Text>
          {hasBismillahHeader(surahNumber) && (
            <Text style={styles.bismillah}>{BISMILLAH}</Text>
          )}
        </View>

        {currentArabic && currentEnglish && (
          <View style={styles.verseCard}>
            <View style={styles.verseBadge}>
              <Text style={styles.verseBadgeText}>
                Verse {currentArabic.numberInSurah} of {arabicAyahs.length}
              </Text>
              {verseMemorized && (
                <View style={styles.memorisedTag}>
                  <Text style={styles.memorisedTagText}>Memorised</Text>
                </View>
              )}
            </View>

            <Text style={styles.arabicText}>
              {hasBismillahHeader(surahNumber) && currentArabic.numberInSurah === 1
                ? stripBismillah(currentArabic.text)
                : currentArabic.text}
            </Text>

            {/* Audio controls */}
            <TouchableOpacity
              style={styles.playBtn}
              onPress={handlePlayPause}
              disabled={isLoadingAudio}
              activeOpacity={0.7}
            >
              {isLoadingAudio ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.playBtnText}>{isPlaying ? '⏸  Pause Recitation' : '▶  Play Recitation'}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider} />

            <Text style={styles.translationLabel}>Translation</Text>
            <Text style={styles.englishText}>{currentEnglish.text}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, currentVerseIndex === 0 && styles.navBtnDisabled]}
            onPress={goToPrev}
            disabled={currentVerseIndex === 0}
          >
            <Text style={[styles.navBtnText, currentVerseIndex === 0 && styles.navBtnTextDisabled]}>
              Previous
            </Text>
          </TouchableOpacity>

          <View style={styles.verseCounter}>
            <TextInput
              style={styles.verseInput}
              value={verseInputValue}
              onChangeText={setVerseInputValue}
              onSubmitEditing={handleVerseJump}
              onBlur={handleVerseJump}
              keyboardType="number-pad"
              returnKeyType="go"
              selectTextOnFocus
            />
            <Text style={styles.verseTotal}>/ {arabicAyahs.length}</Text>
          </View>

          <TouchableOpacity
            style={[styles.navBtn, currentVerseIndex === arabicAyahs.length - 1 && styles.navBtnDisabled]}
            onPress={goToNext}
            disabled={currentVerseIndex === arabicAyahs.length - 1}
          >
            <Text style={[styles.navBtnText, currentVerseIndex === arabicAyahs.length - 1 && styles.navBtnTextDisabled]}>
              Next
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.memoriseBtn, verseMemorized && styles.memoriseBtnDone]}
          onPress={handleToggleMemorized}
          activeOpacity={0.8}
        >
          <Text style={styles.memoriseBtnText}>
            {verseMemorized ? 'Unmark as Memorised' : "I've Memorised This Verse"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f0' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f0', padding: 24 },
  loadingText: { marginTop: 12, color: '#555', fontSize: 15 },
  errorText: { color: '#c62828', fontSize: 15, textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: '#2e7d32', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '600' },
  progressContainer: { backgroundColor: '#1a3a2a', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 },
  progressBar: { height: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#4caf50', borderRadius: 3 },
  progressText: { color: '#a8d5b5', fontSize: 11, marginTop: 5, textAlign: 'center' },
  scrollContent: { padding: 16, paddingBottom: 8 },
  surahHeader: {
    alignItems: 'center', marginBottom: 16, paddingVertical: 16,
    backgroundColor: '#fff', borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  surahArabic: { fontSize: 28, color: '#1a3a2a', fontWeight: '700', marginBottom: 4 },
  surahEnglish: { fontSize: 17, fontWeight: '600', color: '#333' },
  surahTranslation: { fontSize: 13, color: '#888', marginTop: 2 },
  bismillah: { fontSize: 22, color: '#1a3a2a', textAlign: 'center', marginTop: 14, letterSpacing: 1, writingDirection: 'rtl' },
  verseCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  verseBadge: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  verseBadgeText: { fontSize: 12, color: '#888', fontWeight: '500' },
  memorisedTag: { backgroundColor: '#e8f5e9', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  memorisedTagText: { fontSize: 11, color: '#2e7d32', fontWeight: '600' },
  arabicText: { fontSize: 28, lineHeight: 52, textAlign: 'right', color: '#1a1a1a', fontWeight: '400', writingDirection: 'rtl' },
  playBtn: {
    backgroundColor: '#2e7d32', borderRadius: 10, marginTop: 16,
    paddingVertical: 11, alignItems: 'center', justifyContent: 'center',
  },
  playBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  divider: { height: 1, backgroundColor: '#e8f5e9', marginVertical: 16 },
  translationLabel: { fontSize: 11, color: '#888', fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  englishText: { fontSize: 16, lineHeight: 26, color: '#333', fontStyle: 'italic' },
  footer: { backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderColor: '#2e7d32' },
  navBtnDisabled: { borderColor: '#ccc' },
  navBtnText: { color: '#2e7d32', fontWeight: '600', fontSize: 13 },
  navBtnTextDisabled: { color: '#ccc' },
  verseCounter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verseInput: {
    fontSize: 15, fontWeight: '700', color: '#1a3a2a',
    borderWidth: 1.5, borderColor: '#2e7d32', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    minWidth: 44, textAlign: 'center',
  },
  verseTotal: { fontSize: 13, color: '#666', fontWeight: '500' },
  memoriseBtn: {
    backgroundColor: '#2e7d32', borderRadius: 12, paddingVertical: 15, alignItems: 'center',
    shadowColor: '#2e7d32', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  memoriseBtnDone: { backgroundColor: '#81c784' },
  memoriseBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
