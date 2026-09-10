import { useEvent } from 'expo';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/theme';

// Local assets only — never Supabase Storage, so a loading state never depends
// on another network fetch (docs/DESIGN.md §4, §8).
const VIDEO_SOURCE = require('@/assets/video/mascot-loading.mp4');
const MASCOT_NEUTRAL = require('@/assets/images/mascot/mascot-neutral.png');

const DEFAULT_SIZE = 120;
const BOUNCE_DISTANCE = 8;
const BOUNCE_DURATION = 600;

type MascotLoaderProps = {
  /** Width/height of the loader square, in px. */
  size?: number;
  style?: ViewStyle;
};

/**
 * Capybara loading animation for one-off waits longer than ~300ms (lesson
 * fetch, exam submit, tutor reply). Not for progressively-loading lists — use
 * a skeleton there (docs/DESIGN.md §4).
 *
 * Plays `mascot-loading.mp4` with expo-video (never expo-av — removed in
 * SDK 55). While the clip is still loading, or if it fails outright on a weak
 * device, it shows the animated static fallback instead of a blank gap.
 */
export function MascotLoader({ size = DEFAULT_SIZE, style }: MascotLoaderProps) {
  const player = useVideoPlayer(VIDEO_SOURCE, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  const { status } = useEvent(player, 'statusChange', { status: player.status });

  if (status !== 'readyToPlay') {
    return <MascotLoaderFallback size={size} style={style} />;
  }

  const dimensions = { width: size, height: size };
  return (
    <View style={[styles.container, dimensions, style]}>
      <VideoView player={player} style={dimensions} contentFit="cover" nativeControls={false} />
    </View>
  );
}

/**
 * Static fallback: `mascot-neutral` with a simple looping vertical bounce via
 * Reanimated. Rendered on its own while the video loads and whenever the video
 * can't play.
 */
export function MascotLoaderFallback({ size = DEFAULT_SIZE, style }: MascotLoaderProps) {
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withRepeat(
      withTiming(-BOUNCE_DISTANCE, {
        duration: BOUNCE_DURATION,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true,
    );
  }, [offset]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  const dimensions = { width: size, height: size };
  return (
    <View style={[styles.container, dimensions, style]}>
      <Animated.View style={animatedStyle}>
        <Image source={MASCOT_NEUTRAL} style={dimensions} contentFit="contain" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cream,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
});
