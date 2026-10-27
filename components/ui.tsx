import { Ionicons } from '@expo/vector-icons';
import { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/lib/theme';
import { useTheme } from '@/providers/ThemeProvider';

export function Screen({ children, title, subtitle }: { children: ReactNode; title?: string; subtitle?: string }) {
  const { colors: c } = useTheme();
  return <SafeAreaView edges={['top']} style={[s.flex, { backgroundColor: c.bg }]}>
    <ScrollView style={s.flex} contentContainerStyle={s.screenContent}><View style={s.screenInner}>
      {title ? <View style={s.header}><Text accessibilityRole="header" style={[s.title, { color: c.ink }]}>{title}</Text>{subtitle ? <Text style={{ color: c.muted }}>{subtitle}</Text> : null}</View> : null}
      {children}
    </View></ScrollView>
  </SafeAreaView>;
}
export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors: c } = useTheme();
  return <View style={[s.card, { backgroundColor: c.surface, borderColor: c.line }, style]}>{children}</View>;
}
interface ButtonProps { label: string; onPress: () => void; variant?: 'primary' | 'ghost' | 'danger'; loading?: boolean; disabled?: boolean; icon?: ComponentProps<typeof Ionicons>['name']; }
export function Button({ label, onPress, variant = 'primary', loading, disabled, icon }: ButtonProps) {
  const { colors: c } = useTheme();
  const v = variant === 'primary' ? { bg: c.primary, border: c.primary, color: '#fff' } : variant === 'danger' ? { bg: c.dangerSoft, border: c.dangerLine, color: c.danger } : { bg: 'transparent', border: c.line, color: c.ink };
  return <Pressable accessibilityRole="button" onPress={onPress} disabled={disabled || loading} style={({ pressed }) => [s.button, { backgroundColor: v.bg, borderColor: v.border }, (pressed || disabled) && { opacity: 0.65 }]}>
    {loading ? <ActivityIndicator color={v.color} /> : <View style={s.buttonContent}>{icon ? <Ionicons name={icon} size={20} color={v.color} /> : null}<Text style={[s.buttonText, { color: v.color }]}>{label}</Text></View>}
  </Pressable>;
}
export function Field({ label, ...props }: { label: string } & TextInputProps) {
  const { colors: c } = useTheme();
  return <View style={s.field}><Text style={{ color: c.muted, fontSize: 13, fontWeight: '500' }}>{label}</Text><TextInput placeholderTextColor={c.muted} style={[s.input, { color: c.ink, borderColor: c.line, backgroundColor: c.surface }]} {...props} /></View>;
}
export function Sheet({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const { colors: c } = useTheme();
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}><Pressable style={s.overlay} onPress={onClose}><Pressable style={[s.sheet, { backgroundColor: c.surface }]} onPress={() => {}}><Text style={{ fontSize: 20, fontWeight: '800', color: c.ink }}>{title}</Text><View style={{ gap: 14 }}>{children}</View></Pressable></Pressable></Modal>;
}
export function ProgressBar({ pct, color, trackColor, height = 12 }: { pct: number; color?: string; trackColor?: string; height?: number }) {
  const { colors: c } = useTheme();
  return <View style={[s.track, { height, borderRadius: height / 2, backgroundColor: trackColor ?? c.primarySoft }]} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: pct }}><View style={[s.fill, { width: `${Math.min(100, Math.max(0, pct))}%`, backgroundColor: color ?? c.primary, borderRadius: height / 2 }]} /></View>;
}
export function ErrorText({ message }: { message?: string | null }) { const { colors: c } = useTheme(); return message ? <Text style={{ color: c.danger }}>{message}</Text> : null; }
const s = StyleSheet.create({
  flex: { flex: 1 }, screenContent: { alignItems: 'center', padding: 16, paddingTop: 12, paddingBottom: 132 },
  screenInner: { width: '100%', maxWidth: theme.layout.maxWidth, gap: 18 }, header: { paddingTop: 8, paddingHorizontal: 4, gap: 2 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  card: { borderRadius: theme.radius.lg, borderWidth: 1, padding: 20, ...theme.shadow.card },
  button: { minHeight: 52, borderRadius: theme.radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  buttonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, buttonText: { fontSize: 16, fontWeight: '700' },
  field: { gap: 6 }, input: { minHeight: 48, borderWidth: 1, borderRadius: theme.radius.md, paddingHorizontal: 14, fontSize: 16 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  sheet: { width: '100%', maxWidth: 480, borderRadius: theme.radius.lg, padding: 24, gap: 16 }, track: { overflow: 'hidden' }, fill: { height: '100%' },
});
