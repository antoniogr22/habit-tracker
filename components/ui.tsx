import { ReactNode } from 'react';
import {
  ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View,
} from 'react-native';
import { theme } from '@/lib/theme';

const c = theme.colors;

/** Conteúdo centralizado com largura máxima: mobile ocupa tudo, desktop fica legível. */
export function Screen({ children }: { children: ReactNode }) {
  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={s.screenContent}>
      <View style={s.screenInner}>{children}</View>
    </ScrollView>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={s.card}>{children}</View>;
}

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
}

export function Button({ label, onPress, variant = 'primary', loading, disabled }: ButtonProps) {
  const bg = variant === 'primary' ? c.primary : 'transparent';
  const color = variant === 'primary' ? '#fff' : variant === 'danger' ? c.danger : c.ink;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        s.button,
        { backgroundColor: bg, borderColor: variant === 'primary' ? c.primary : c.line },
        (pressed || disabled) && { opacity: 0.6 },
      ]}
    >
      {loading ? <ActivityIndicator color={color} /> : <Text style={[s.buttonText, { color }]}>{label}</Text>}
    </Pressable>
  );
}

export function Field({ label, ...props }: { label: string } & TextInputProps) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput placeholderTextColor={c.muted} style={s.input} {...props} />
    </View>
  );
}

export function Sheet({ visible, onClose, title, children }: {
  visible: boolean; onClose: () => void; title: string; children: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.sheet} onPress={() => {}}>
          <Text style={s.sheetTitle}>{title}</Text>
          <View style={{ gap: 14 }}>{children}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function ProgressBar({ pct, color = c.primary }: { pct: number; color?: string }) {
  return (
    <View style={s.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: pct }}>
      <View style={[s.fill, { width: `${Math.min(100, Math.max(0, pct))}%`, backgroundColor: color }]} />
    </View>
  );
}

export function ErrorText({ message }: { message?: string | null }) {
  return message ? <Text style={{ color: c.danger }}>{message}</Text> : null;
}

const s = StyleSheet.create({
  screenContent: { alignItems: 'center', padding: 16, paddingBottom: 48 },
  screenInner: { width: '100%', maxWidth: 720, gap: 16 },
  card: { backgroundColor: c.surface, borderRadius: theme.radius.md, borderWidth: 1, borderColor: c.line, padding: 16 },
  button: { minHeight: 46, borderRadius: theme.radius.sm, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  buttonText: { fontSize: 15, fontWeight: '600' },
  label: { fontSize: 13, color: c.muted, fontWeight: '500' },
  input: { minHeight: 46, borderWidth: 1, borderColor: c.line, borderRadius: theme.radius.sm, paddingHorizontal: 12, fontSize: 16, color: c.ink, backgroundColor: c.surface },
  overlay: { flex: 1, backgroundColor: 'rgba(22,36,30,0.45)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  sheet: { width: '100%', maxWidth: 480, backgroundColor: c.surface, borderRadius: theme.radius.md, padding: 20, gap: 16 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: c.ink },
  track: { height: 10, borderRadius: 5, backgroundColor: c.primarySoft, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
});
