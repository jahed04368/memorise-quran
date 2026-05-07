import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { SURAH_DATA, TOTAL_QURAN_VERSES } from '../data/surahData';
import { useMemorizationContext } from '../context/MemorizationContext';
import { RootStackParamList } from '../types';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'SurahList'>;
};

function motivationalLabel(count: number): string {
  if (count === 0) return 'Begin your journey today';
  if (count < 10) return 'Every verse counts — keep going';
  if (count < 50) return 'MashaAllah, you are building momentum';
  if (count < 200) return 'SubhanAllah, great progress!';
  if (count < 500) return 'Remarkable dedication, keep it up';
  return 'MashaAllah, you are an inspiration';
}

export default function SurahListScreen({ navigation }: Props) {
  const { getMemorizedCount, getTotalMemorizedCount } = useMemorizationContext();

  const totalMemorized = getTotalMemorizedCount();
  const overallPercent = Math.round((totalMemorized / TOTAL_QURAN_VERSES) * 100);
  const completedSurahs = SURAH_DATA.filter((s) => getMemorizedCount(s.number) >= s.totalVerses).length;

  const renderItem = ({ item }: { item: typeof SURAH_DATA[0] }) => {
    const memorizedCount = getMemorizedCount(item.number);
    const percent = item.totalVerses > 0
      ? Math.round((memorizedCount / item.totalVerses) * 100)
      : 0;
    const isComplete = memorizedCount >= item.totalVerses;

    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate('Verse', { surahNumber: item.number })}
        activeOpacity={0.7}
      >
        <View style={styles.rowLeft}>
          <View style={[styles.numberBadge, isComplete && styles.numberBadgeComplete]}>
            <Text style={[styles.numberText, isComplete && styles.numberTextComplete]}>
              {isComplete ? '✓' : item.number}
            </Text>
          </View>
          <View style={styles.nameContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.englishName}>{item.englishName}</Text>
              <Text style={styles.arabicName}>{item.arabicName}</Text>
            </View>
            <Text style={styles.translation}>{item.translation} · {item.totalVerses} verses</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${percent}%` as any }, isComplete && styles.progressFillComplete]} />
            </View>
          </View>
        </View>
        <Text style={[styles.percent, isComplete && styles.percentComplete]}>
          {percent}%
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a3a2a" />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Memorise Quran</Text>
          <Text style={styles.headerArabic}>حفظ القرآن</Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroStats}>
            <View style={styles.heroMain}>
              <Text style={styles.heroCount}>{totalMemorized}</Text>
              <Text style={styles.heroLabel}>verses memorised</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroSide}>
              <Text style={styles.heroPercent}>{overallPercent}%</Text>
              <Text style={styles.heroSideLabel}>of Quran</Text>
              <Text style={styles.heroSurahs}>{completedSurahs} surah{completedSurahs !== 1 ? 's' : ''} complete</Text>
            </View>
          </View>
          <View style={styles.overallBar}>
            <View style={[styles.overallFill, { width: `${overallPercent}%` as any }]} />
          </View>
          <Text style={styles.motivational}>{motivationalLabel(totalMemorized)}</Text>
        </View>

        {totalMemorized > 0 && (
          <TouchableOpacity
            style={styles.memorisedBtn}
            onPress={() => navigation.navigate('MemorizedList')}
            activeOpacity={0.8}
          >
            <Text style={styles.memorisedBtnText}>View Memorised Verses</Text>
            <Text style={styles.memorisedBtnArrow}>›</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={SURAH_DATA}
        keyExtractor={(item) => item.number.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#1a3a2a',
  },
  header: {
    backgroundColor: '#1a3a2a',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerArabic: {
    color: '#a8d5b5',
    fontSize: 17,
  },
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroMain: {
    flex: 1,
    alignItems: 'center',
  },
  heroCount: {
    color: '#fff',
    fontSize: 52,
    fontWeight: '800',
    lineHeight: 56,
    letterSpacing: -1,
  },
  heroLabel: {
    color: '#a8d5b5',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  heroDivider: {
    width: 1,
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 16,
  },
  heroSide: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  heroPercent: {
    color: '#4caf50',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  heroSideLabel: {
    color: '#a8d5b5',
    fontSize: 12,
    fontWeight: '500',
  },
  heroSurahs: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 2,
  },
  overallBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  overallFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 4,
  },
  motivational: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  memorisedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4caf50',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  memorisedBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  memorisedBtnArrow: {
    color: '#fff',
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '300',
  },
  list: {
    backgroundColor: '#f5f5f0',
    paddingTop: 8,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  numberBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numberBadgeComplete: {
    backgroundColor: '#4caf50',
  },
  numberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2e7d32',
  },
  numberTextComplete: {
    color: '#fff',
    fontSize: 16,
  },
  nameContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  englishName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  arabicName: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '500',
  },
  translation: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e8f5e9',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#81c784',
    borderRadius: 2,
  },
  progressFillComplete: {
    backgroundColor: '#4caf50',
  },
  percent: {
    fontSize: 16,
    fontWeight: '700',
    color: '#bbb',
    marginLeft: 10,
    width: 44,
    textAlign: 'right',
  },
  percentComplete: {
    color: '#4caf50',
  },
});
