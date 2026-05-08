export const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

// Surah 9 (At-Tawba): no Bismillah at all.
// All others (including Al-Fatiha): show Bismillah as a header.
export function hasBismillahHeader(surahNumber: number): boolean {
  return surahNumber !== 9;
}

// Surah 1 (Al-Fatiha): Bismillah IS verse 1 — keep it in the verse text, don't strip.
// Surah 9 (At-Tawba): no Bismillah.
// All others: API prepends Bismillah to verse 1 text — strip it since it's shown as header.
export function shouldStripBismillah(surahNumber: number): boolean {
  return surahNumber !== 1 && surahNumber !== 9;
}

// Strip diacritics (harakat) and normalise alef variants so we can compare base consonants.
const HARAKAT = /[ً-ٟؐ-ؚٰ]/g;
const ALEF_VARIANTS = /[آأإٱ]/g;

function bare(s: string): string {
  return s.replace(HARAKAT, '').replace(ALEF_VARIANTS, 'ا');
}

// Bismillah bare consonants: بسم الله الرحمن الرحيم
// We find where "الرحيم" ends in the normalised text, then map that position
// back to the original string (which may have different diacritics/alef forms).
export function stripBismillah(text: string): string {
  const bareText = bare(text);
  if (!bareText.startsWith('بسم')) return text;

  const RAHEEM_BARE = 'الرحيم';
  const idx = bareText.indexOf(RAHEEM_BARE);
  if (idx === -1 || idx > 50) return text;

  const bareEndPos = idx + RAHEEM_BARE.length;

  // Walk original text char-by-char, tracking how many bare chars we've passed.
  let origPos = 0;
  let barePos = 0;
  while (origPos < text.length && barePos < bareEndPos) {
    barePos += bare(text[origPos]).length;
    origPos++;
  }

  return text.slice(origPos).trimStart();
}
