import {
  Modal as RNModal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type ModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Oculta la X de cierre (p. ej. si el cierre es solo por una acción). */
  hideCloseButton?: boolean;
  style?: ViewStyle;
};

export function Modal({
  visible,
  onClose,
  title,
  children,
  hideCloseButton = false,
  style,
}: ModalProps) {
  const showHeader = Boolean(title) || !hideCloseButton;

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Pressable interno sin onPress: absorbe el toque para que tocar la
            tarjeta no cierre el modal. */}
        <Pressable style={[styles.card, style]}>
          {showHeader ? (
            <View style={styles.header}>
              <Text style={[typography.xl, styles.title]}>{title ?? ''}</Text>
              {hideCloseButton ? null : (
                <Pressable
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar"
                  hitSlop={12}
                  style={styles.closeButton}>
                  <Text style={styles.closeGlyph}>✕</Text>
                </Pressable>
              )}
            </View>
          ) : null}
          <View style={styles.body}>{children}</View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    color: colors.ink,
    flexShrink: 1,
  },
  closeButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  closeGlyph: {
    ...typography.lg,
    color: colors.inkMuted,
  },
  body: {
    gap: spacing.sm,
  },
});
