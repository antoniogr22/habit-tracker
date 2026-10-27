import { Ionicons } from '@expo/vector-icons';
import { ComponentProps, ReactNode } from 'react';
import {
  ActivityIndicator, Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/lib/theme';

const c = theme.colors;

/**
 * Conteúdo centralizado com largura máxima: no celular ocupa tudo, no desktop mantém proporção de app.
 * Inclui o cabeçalho da tela (título + subtítulo), já que as abas não usam o header nativo.
 */
export function Screen({ children, title, subtitle }: { children: ReactNode; title?: string; subtitle?: string }) {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.screenContent}>
        <View style={s.screenInner}>
          {title ? (
            <View style={s.header}>
              <Text accessibilityRole="header" style={s.title}>{title}</Text>
              {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
            </View>
          ) : null}
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  icon?: ComponentProps<typeof Ionicons>['name'];
}

const buttonVariants = {
  primary: { bg: c.primary, border: c.primary, color: '#fff' },
  ghost: { bg: 'transparent', border: c.line, color: c.ink },
  danger: { bg: c.dangerSoft, border: c.dangerLine, color: c.danger },
} as const;

export function Button({ label, onPress, variant = 'primary', loading, disabled, icon }: ButtonProps) {
  const v = buttonVariants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        s.button,
        { backgroundColor: v.bg, borderColor: v.border },
        (pressed || disabled) && { opacity: 0.65 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.color} />
      ) : (
        <View style={s.buttonContent}>
          {icon ? <Ionicons name={icon} size={20} color={v.color} /> : null}
          <Text style={[s.buttonText, { color: v.color }]}>{label}</Text>
        </View>
      )}
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

export function ProgressBar({ pct, color = c.primary, trackColor = c.primarySoft, height = 12 }: {
  pct: number; color?: string; trackColor?: string; height?: number;
}) {
  return (
    <View
      style={[s.track, { height, borderRadius: height / 2, backgroundColor: trackColor }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: pct }}
    >
      <View style={[s.fill, { width: `${Math.min(100, Math.max(0, pct))}%`, backgroundColor: color, borderRadius: height / 2 }]} />
    </View>
  );
}

export function ErrorText({ message }: { message?: string | null }) {
  return message ? <Text style={{ color: c.danger }}>{message}</Text> : null;
}

const s = StyleSheet.create({
  // paddingBottom generoso: a barra de abas flutua sobre o conteúdo.
  screenContent: { alignItems: 'center', padding: 16, paddingTop: 12, paddingBottom: 132 },
  screenInner: { width: '100%', maxWidth: theme.layout.maxWidth, gap: 18 },
  header: { paddingTop: 8, paddingHorizontal: 4, gap: 2 },
  title: { fontSize: 32, fontWeight: '800', color: c.ink, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: c.muted },
  card: {
    backgroundColor: c.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: c.line,
    padding: 20,
    ...theme.shadow.card,
  },
  button: { minHeight: 52, borderRadius: theme.radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  buttonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  buttonText: { fontSize: 16, fontWeight: '700' },
  label: { fontSize: 13, color: c.muted, fontWeight: '500' },
  input: { minHeight: 48, borderWidth: 1, borderColor: c.line, borderRadius: theme.radius.md, paddingHorizontal: 14, fontSize: 16, color: c.ink, backgroundColor: c.surface },
  overlay: { flex: 1, backgroundColor: 'rgba(22,36,30,0.45)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  sheet: { width: '100%', maxWidth: 480, backgroundColor: c.surface, borderRadius: theme.radius.lg, padding: 24, gap: 16 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: c.ink },
  track: { overflow: 'hidden' },
  fill: { height: '100%' },
});
