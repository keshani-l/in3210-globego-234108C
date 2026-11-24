import { describe, expect, test } from '@jest/globals';

import { loginSchema, registrationSchema } from '../validation';

const registration = {
  firstName: '  Demo  ',
  lastName: 'Traveller',
  email: 'demo@example.com',
  password: 'demoPassword',
  confirmPassword: 'demoPassword',
};

describe('login validation', () => {
  test('requires a username and password', () => {
    const result = loginSchema.safeParse({ username: ' ', password: '' });
    expect(result.error?.issues.map((issue) => issue.path[0])).toEqual(['username', 'password']);
  });

  test('trims the username while preserving the exact password', () => {
    expect(loginSchema.parse({ username: ' emilys ', password: ' pass ' })).toEqual({
      username: 'emilys',
      password: ' pass ',
    });
  });
});

describe('registration validation', () => {
  test('accepts complete matching input', () => {
    expect(registrationSchema.parse(registration).firstName).toBe('Demo');
  });

  test.each([
    { field: 'email', value: 'invalid-email', message: 'Enter a valid email address.' },
    { field: 'password', value: 'short', message: 'Use at least 8 characters for your password.' },
    { field: 'confirmPassword', value: 'different-password', message: 'Passwords do not match.' },
    { field: 'confirmPassword', value: '', message: 'Confirm your password.' },
  ])('reports a clear $field error for "$value"', ({ field, value, message }) => {
    const result = registrationSchema.safeParse({ ...registration, [field]: value });
    expect(result.error?.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: [field], message }),
    ]));
  });
});
