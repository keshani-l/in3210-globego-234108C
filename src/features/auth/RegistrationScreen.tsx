import { Button, StatusMessage } from '../../shared/ui/controls';
import { AuthField } from './AuthField';
import { AuthLayout } from './AuthLayout';
import { authApi, prepareRegistration } from './authApi';
import { useAuthForm } from './useAuthForm';
import { registrationSchema, type RegistrationFields } from './validation';

const initial: RegistrationFields = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' };

export function RegistrationScreen({ onRegistered, backToLogin }: { onRegistered: () => void; backToLogin: () => void }) {
  const [register] = authApi.useRegisterMutation();
  const form = useAuthForm(initial, registrationSchema, 'register', async (fields) => {
    await register(prepareRegistration(fields)).unwrap();
    onRegistered();
  });

  return (
    <AuthLayout title="Demo registration" description="Use sample information to try the registration form.">
      <StatusMessage text="DummyJSON simulates registration. Use an existing demo account to sign in afterward." />
      <AuthField label="First name" icon="user" autoComplete="given-name" {...form.field('firstName')} />
      <AuthField label="Last name" icon="user" autoComplete="family-name" {...form.field('lastName')} />
      <AuthField label="Email address" icon="mail" autoComplete="email" autoCapitalize="none" keyboardType="email-address" {...form.field('email')} />
      <AuthField label="Password" icon="lock" password autoComplete="new-password" {...form.field('password')} />
      <AuthField label="Confirm password" icon="lock" password autoComplete="new-password" returnKeyType="go" onSubmitEditing={form.send} {...form.field('confirmPassword')} />
      {form.requestError && <StatusMessage text={form.requestError} error />}
      <Button label={form.busy ? 'Submitting…' : 'Submit demo registration'} icon="arrow-right" busy={form.busy} onPress={form.send} />
      {!form.busy && <Button label="Back to sign in" kind="secondary" onPress={backToLogin} />}
    </AuthLayout>
  );
}
