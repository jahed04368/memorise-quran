export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
}

export interface SurahEdition {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

export interface QuranApiResponse {
  code: number;
  status: string;
  data: SurahEdition[];
}

export type RootStackParamList = {
  SurahList: undefined;
  Verse: { surahNumber: number };
  ReadMemorized: { surahNumber: number };
  MemorizedList: undefined;
  Settings: undefined;
};
