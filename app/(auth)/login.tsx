import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ErrorText, Field } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/providers/ThemeProvider';

export default function Login() {
  const { colors: c } = useTheme();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setInfo(null);
    if (!email.trim() || password.length < 6) return setError('Informe e-mail e uma senha de pelo menos 6 caracteres.');
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim() || null } }, // lido pelo trigger handle_new_user
        });
        if (error) throw error;
        if (!data.session) setInfo('Conta criada. Confirme o e-mail que enviamos para entrar.');
      }
    } catch (e: any) {
      setError(e.message ?? 'Algo deu errado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <View style={s.box}>
            <Text style={[s.title, { color: c.ink }]} >{mode === 'login' ? 'Entrar' : 'Criar conta'}</Text>
            <Text style={[s.sub, { color: c.muted }]} >Hábitos pequenos, repetidos todo dia, levam às suas metas.</Text>

            {mode === 'signup' && <Field label="Nome" value={name} onChangeText={setName} autoComplete="name" />}
            <Field label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
            <Field label="Senha" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" onSubmitEditing={submit} />

            <ErrorText message={error} />
            {info && <Text style={{ color: c.primary }}>{info}</Text>}

            <Button label={mode === 'login' ? 'Entrar' : 'Criar conta'} onPress={submit} loading={loading} />
            <Button
              label={mode === 'login' ? 'Ainda não tenho conta' : 'Já tenho conta'}
              variant="ghost"
              onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setInfo(null); }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  box: { width: '100%', maxWidth: 400, gap: 14 },
  title: { fontSize: 30, fontWeight: '800' },
  sub: { fontSize: 15, marginBottom: 6 },
});
