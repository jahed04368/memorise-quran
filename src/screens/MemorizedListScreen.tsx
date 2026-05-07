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
  navigation: StackNavigationProp<RootStackParamList, 'MemorizedList'>;
};

export default function MemorizedListScreen({ navigation }: Props) {
  const { getMemorizedCount, getTotalMemorizedCount } = useMemorizationContext();

  const memorisedSurahs = SURAH_DATA.filter((s) => getMemorizedCount(s.number) > 0);
  const totalMemorized = getTotalMemorizedCount();
  const totalLeft = TOTAL_QURAN_VERSES - totalMemorized;
  const overallPercent = Math.round((totalMemorized / TOTAL_QURAN_VERSES) * 100);

  const renderItem = ({ item }: { item: typeof SURAH_DATA[0] }) => {
    const memorizedCount = getMemorizedCount(item.number);
    const leftCount = item.totalVerses - memorizedCount;
    const isComplete = memorizedCount >= item.totalVerses;
    const percent = Math.round((memorizedCount / item.totalVerses) * 100);

    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate('ReadMemorized', { surahNumber: item.number })}
        activeOpacity={0.7}
      >
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
          <Text style={styles.translation}>{item.translation}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${percent}%` as any }, isComplete && styles.progressFillComplete]} />
          </View>
          <View style={styles.countsRow}>
            <Text style={[styles.completedText, isComplete && styles.completedTextDone]}>
              {isComplete ? '100% completed' : `${percent}% completed`}
            </Text>
            {!isComplete && (
              <Text style={styles.leftCount}>{leftCount} left</Text>
            )}
          </View>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a3a2a" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Memorised</Text>
          <Text style={styles.headerArabic}>المحفوظ</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalMemorized}</Text>
            <Text style={styles.statLabel}>memorised</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, styles.statValuePercent]}>{overallPercent}%</Text>
            <Text style={styles.statLabel}>of Quran</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, styles.statValueLeft]}>{totalLeft}</Text>
            <Text style={styles.statLabel}>remaining</Text>
          </View>
        </View>

        <View style={styles.overallBar}>
          <View style={[styles.overallFill, { width: `${overallPercent}%` as any }]} />
        </View>
      </View>

      {memorisedSurahs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nothing memorised yet</Text>
          <Text style={styles.emptySub}>
            Go back and mark verses as you learn them.
          </Text>
        </View>
      ) : (
        <FlatList
          data={memorisedSurahs}
          keyExtractor={(item) => item.number.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingTop: 12,
    paddingBottom: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  backArrow: {
    color: '#a8d5b5',
    fontSize: 26,
    lineHeight: 28,
    marginRight: 2,
  },
  backText: {
    color: '#a8d5b5',
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  headerArabic: {
    color: '#a8d5b5',
    fontSize: 17,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 12,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statValuePercent: {
    color: '#4caf50',
  },
  statValueLeft: {
    color: '#ffb74d',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 3,
  },
  overallBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  overallFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 3,
  },
  list: {
    backgroundColor: '#f5f5f0',
    paddingTop: 10,
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  numberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
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
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 5,
    backgroundColor: '#e8f5e9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#81c784',
    borderRadius: 3,
  },
  progressFillComplete: {
    backgroundColor: '#4caf50',
  },
  countsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  completedText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '600',
  },
  completedTextDone: {
    color: '#4caf50',
  },
  leftCount: {
    fontSize: 12,
    color: '#e65100',
    fontWeight: '600',
  },
  arrow: {
    fontSize: 26,
    color: '#ccc',
    marginLeft: 8,
    lineHeight: 30,
  },
  empty: {
    flex: 1,
    backgroundColor: '#f5f5f0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  emptySub: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
});
