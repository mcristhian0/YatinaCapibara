import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { MascotLoader, MascotLoaderFallback } from '@/components/MascotLoader';
import { Modal } from '@/components/Modal';
import { ProgressBar } from '@/components/ProgressBar';
import { colors, ponchoStripes, spacing, typography } from '@/theme';

// Pantalla de revisión visual — TEMPORAL. Borrar después de revisar la Fase 2.
export default function DevShowcase() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChip, setSelectedChip] = useState('uma');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.display, styles.h]}>YatiñaCapibara</Text>
        <Text style={[typography.base, styles.muted]}>Sistema de diseño — Fase 2</Text>

        <Section title="Tipografía">
          <Text style={typography.display}>Display 40 · Fraunces</Text>
          <Text style={typography.xl}>Título XL 28 · Fraunces</Text>
          <Text style={typography.lg}>Subtítulo LG 20 · Nunito Sans</Text>
          <Text style={typography.base}>Cuerpo base 16 · Nunito Sans</Text>
          <Text style={typography.sm}>Secundario SM 14</Text>
          <Text style={typography.xs}>Pie de foto XS 12</Text>
        </Section>

        <Section title="Colores de marca">
          <View style={styles.swatchRow}>
            <Swatch color={colors.brandPrimary} label="primary" />
            <Swatch color={colors.brandSecondary} label="secondary" />
            <Swatch color={colors.brandTertiary} label="tertiary" />
            <Swatch color={colors.error} label="error" />
            <Swatch color={colors.info} label="info" />
          </View>
        </Section>

        <Section title="ponchoStripes (decorativo)">
          <View style={styles.stripeRow}>
            {ponchoStripes.map((c) => (
              <View key={c} style={[styles.stripe, { backgroundColor: c }]} />
            ))}
          </View>
        </Section>

        <Section title="Button — esquina cortada (§5.2)">
          <Button label="Empezar lección" onPress={() => {}} />
          <Button label="Escuchar de nuevo" variant="secondary" onPress={() => {}} />
          <Button label="Omitir" variant="ghost" onPress={() => {}} />
          <Button label="Cargando…" loading onPress={() => {}} />
          <Button label="Deshabilitado" disabled onPress={() => {}} />
        </Section>

        <Section title="Card — borde greca (§5.3)">
          <Card title="Lección 1 · Saludos">
            <Text style={typography.base}>Aprende a saludar en aymara.</Text>
          </Card>
          <Card title="Nivel 3 · Examen" grecaColor={colors.brandTertiary}>
            <Text style={typography.base}>Greca teñida con otro color por nivel.</Text>
          </Card>
          <Card greca={false}>
            <Text style={typography.base}>Card sin greca.</Text>
          </Card>
        </Section>

        <Section title="Chip">
          <View style={styles.chipRow}>
            <Chip label="uma" selected={selectedChip === 'uma'} onPress={() => setSelectedChip('uma')} />
            <Chip
              label="jach'a"
              selected={selectedChip === "jach'a"}
              onPress={() => setSelectedChip("jach'a")}
            />
            <Chip
              label="janiwa"
              selected={selectedChip === 'janiwa'}
              onPress={() => setSelectedChip('janiwa')}
            />
            <Chip label="solo lectura" />
          </View>
        </Section>

        <Section title="ProgressBar">
          <ProgressBar progress={0.25} accessibilityLabel="Lección 1 de 4" />
          <ProgressBar progress={0.6} color={colors.brandTertiary} />
          <ProgressBar progress={1} color={colors.brandPrimary} />
        </Section>

        <Section title="Modal">
          <Button label="Abrir modal" onPress={() => setModalVisible(true)} />
        </Section>

        <Section title="EmptyState">
          <EmptyState
            title="Todavía no tienes traducciones"
            description="Escribe una palabra o frase y el capibara te ayuda."
            action={{ label: 'Ir al traductor', onPress: () => {} }}
          />
        </Section>

        <Section title="MascotLoader (video) + fallback animado">
          <View style={styles.loaderRow}>
            <View style={styles.loaderCell}>
              <MascotLoader />
              <Text style={typography.xs}>MascotLoader</Text>
            </View>
            <View style={styles.loaderCell}>
              <MascotLoaderFallback />
              <Text style={typography.xs}>Fallback</Text>
            </View>
          </View>
        </Section>
      </ScrollView>

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="¡Nivel completado!">
        <Text style={typography.base}>Desbloqueaste el nivel 2. Sigue así.</Text>
        <Button label="Continuar" onPress={() => setModalVisible(false)} />
      </Modal>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={[typography.lg, styles.sectionTitle]}>{title}</Text>
      {children}
    </View>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.swatch}>
      <View style={[styles.swatchColor, { backgroundColor: color }]} />
      <Text style={typography.xs}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  h: {
    color: colors.ink,
  },
  muted: {
    color: colors.inkMuted,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.brandPrimary,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  swatch: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  swatchColor: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  stripeRow: {
    flexDirection: 'row',
    height: 24,
    borderRadius: 4,
    overflow: 'hidden',
  },
  stripe: {
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  loaderRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  loaderCell: {
    alignItems: 'center',
    gap: spacing.xs,
  },
});
