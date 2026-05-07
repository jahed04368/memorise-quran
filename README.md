# Memorise Quran

A React Native app built with Expo to help you memorise the Quran — tracking your progress verse by verse, surah by surah.

## Features

- **Memorise tab** — Browse all 114 surahs. Tap any surah to open its verses one at a time and mark each one as memorised.
- **Progress tracking** — Home screen shows total verses memorised, percentage of the full Quran, completed surahs, and a motivational message that updates as you progress.
- **Persistent storage** — All memorisation data is saved to the device using AsyncStorage and remains until the app is uninstalled.
- **Memorised page** — Dedicated screen showing only the surahs you have memorised. Displays verses memorised, percentage completed, and verses remaining per surah.
- **Review screen** — Read through your memorised verses for any surah with full Arabic text and English translation.
- **Bismillah handling** — The Bismillah (بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ) is shown as a header for all applicable surahs and not repeated inside verse 1. Surah Al-Fatiha (where it is verse 1) and Surah At-Tawba (which has no Bismillah) are handled correctly.
- **Arabic + English** — Verses displayed in Uthmani Arabic script with Sahih International translation, fetched from the [AlQuran Cloud API](https://alquran.cloud).

## Screens

| Screen | Description |
|---|---|
| Home (SurahList) | Hero stats card + full list of all 114 surahs |
| Verse | One verse at a time with mark/unmark memorised |
| Memorised List | Surahs with memorised verses, progress stats |
| Read Memorised | Scrollable list of memorised verses for a surah |

## Tech Stack

- [Expo](https://expo.dev) ~54
- React Native 0.81
- TypeScript
- React Navigation (Stack)
- AsyncStorage — persistent local storage
- AlQuran Cloud API — Arabic text & translations

## Getting Started

```bash
npm install
npx expo start
```

Then press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

## Project Structure

```
src/
  context/    # MemorizationContext — shared state across screens
  data/       # Surah metadata (names, verse counts)
  hooks/      # useMemorization — AsyncStorage read/write logic
  screens/    # SurahListScreen, VerseScreen, MemorizedListScreen, ReadMemorizedScreen
  types/      # TypeScript types and navigation param list
  utils/      # bismillah.ts — Bismillah detection and stripping
assets/       # App icon and splash screens
```
