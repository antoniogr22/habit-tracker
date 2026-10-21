import { Redirect } from 'expo-router';

export default function Index() {
  // O Stack.Protected no _layout.tsx assumirá o redirecionamento correto
  // apontando para (tabs) se logado ou (auth) se deslogado.
  return <Redirect href="/(auth)/login" />;
}
