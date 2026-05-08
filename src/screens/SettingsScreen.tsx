import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import {
  isOfflineReady,
  downloadAllSurahs,
  deleteOfflineData,
} from '../utils/offlineStorage';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Settings'>;
};

export default function SettingsScreen({ navigation }: Props) {
  const [offlineReady, setOfflineReady] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: 'Settings',
      headerStyle: { backgroundColor: '#1a3a2a' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '700' },
    });
    isOfflineReady().then(setOfflineReady);
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    setProgress(0);
    try {
      await downloadAllSurahs((current, total) => {
        setProgress(Math.round((current / total) * 100));
      });
      setOfflineReady(true);
    } catch {
      Alert.alert('Error', 'Download failed. Please check your connection and try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete offline data',
      'This will remove all downloaded Quran text. Your memorisation progress will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            await deleteOfflineData();
            setOfflineReady(false);
            setDeleting(false);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a3a2a" />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Offline Mode</Text>
        <Text style={styles.sectionDesc}>
          Download all 114 surahs so you can read and memorise without an internet connection.
          Audio is streamed only and is not included.
        </Text>

        {!offlineReady ? (
          <TouchableOpacity
            style={[styles.btn, styles.btnGreen, downloading && styles.btnDisabled]}
            onPress={handleDownload}
            disabled={downloading}
            activeOpacity={0.8}
          >
            {downloading ? (
              <View style={styles.btnInner}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.btnText}>Downloading… {progress}%</Text>
              </View>
            ) : (
              <Text style={styles.btnText}>⬇ Download for Offline Use</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View>
            <View style={styles.readyBadge}>
              <Text style={styles.readyIcon}>✓</Text>
              <Text style={styles.readyText}>All verses available offline</Text>
            </View>
            <TouchableOpacity
              style={[styles.btn, styles.btnRed, deleting && styles.btnDisabled]}
              onPress={handleDelete}
              disabled={deleting}
              activeOpacity={0.8}
            >
              {deleting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnText}>Delete Offline Data</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {downloading && (
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${progress}%` as any }]} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 21,
    marginBottom: 20,
  },
  btn: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  btnGreen: {
    backgroundColor: '#2e7d32',
  },
  btnRed: {
    backgroundColor: '#c62828',
    marginTop: 12,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  readyIcon: {
    fontSize: 18,
    color: '#2e7d32',
    fontWeight: '700',
  },
  readyText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e8f5e9',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 14,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 3,
  },
});
