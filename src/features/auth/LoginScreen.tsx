import { Platform } from 'react-native';

import { useAppSelector } from '../../app/store';
import { Button, StatusMessage } from '../../shared/ui/controls';
import { AuthField } from './AuthField';
import { AuthLayout } from './AuthLayout';
import { authApi, prepareLogin } from './authApi';
import { useAuthForm } from './useAuthForm';
import { loginSchema, type LoginFields } from './validation';

const initial: LoginFields = { username: '', password: '' };

export function LoginScreen({ openRegistration, registered }: { openRegistration: () => void; registered?: boolean }) {
  const [login] = authApi.useLoginMutation();
  const form = useAuthForm(initial, loginSchema, 'login', (fields) => login(prepareLogin(fields)).unwrap());
  const auth = useAppSelector((state) => state.auth);

  return (
    <AuthLayout title="Welcome back" description="Sign in with your DummyJSON demo account.">
      {registered && <StatusMessage text="Demo registration complete. Sign in with an existing DummyJSON account." />}
      {auth.status === 'signedOut' && auth.notice && <StatusMessage text={auth.notice} />}
      <AuthField label="Username" icon="user" autoCapitalize="none" autoComplete="username" autoCorrect={false} {...form.field('username')} />
      <AuthField label="Password" icon="lock" password autoComplete="current-password" returnKeyType="go" onSubmitEditing={form.send} {...form.field('password')} />
      {form.requestError && <StatusMessage text={form.requestError} error />}
      <Button label={form.busy ? 'Signing in…' : 'Sign in'} icon="arrow-right" busy={form.busy} onPress={form.send} />
      {!form.busy && <Button label="Try demo registration" kind="secondary" onPress={openRegistration} />}
      {Platform.OS === 'web' && <StatusMessage text="Your browser session ends when you refresh or close this page." />}
    </AuthLayout>
  );
}
