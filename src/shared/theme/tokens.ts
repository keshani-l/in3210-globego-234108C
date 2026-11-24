export const colors = {
  background: '#F0F8F7',
  heading: '#123C3C',
  text: '#365C5C',
  primary: '#006B60',
  onPrimary: '#FFFFFF',
  surface: '#FFFFFF',
  tint: '#E0F3EF',
  border: '#91AAA6',
  muted: '#496865',
  danger: '#A12732',
  dangerSurface: '#FFF1F2',
} as const;

export const typography = {
  title: { fontSize: 48, fontWeight: '700' },
  body: { fontSize: 18, fontWeight: '400' },
  heading: { fontSize: 32, fontWeight: '700' },
  copy: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  label: { fontSize: 15, fontWeight: '600' },
  caption: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
} as const;

export const spacing = {
  small: 8,
  large: 24,
  tiny: 4,
  medium: 16,
  extraLarge: 32,
} as const;

export const radius = { control: 12, panel: 24 } as const;
export const touchTarget = 48;
