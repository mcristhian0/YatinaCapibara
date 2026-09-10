import { Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import {
  NunitoSans_400Regular,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
} from '@expo-google-fonts/nunito-sans';
import { useFonts } from 'expo-font';

// Loads the two families the design system needs (docs/DESIGN.md §2). The keys
// here are the names components reference through `fontFamily` in
// src/theme/typography.ts — keep both lists in sync.
export function useAppFonts(): { fontsReady: boolean; fontError: Error | null } {
  const [loaded, error] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
  });

  // If a face fails to load we still let the app through (it falls back to the
  // system font) rather than hanging on the splash screen forever.
  return { fontsReady: loaded || error !== null, fontError: error };
}
