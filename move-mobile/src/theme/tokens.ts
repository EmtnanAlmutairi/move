export const colors = {
  background: '#F7F4EF',
  card: '#FFFFFF',
  cardSoft: '#FFF5F1',
  text: '#161412',
  muted: '#8A8177',
  primary: '#FF5C39',
  primaryDark: '#E74424',
  gradientStart: '#FF4E2A',
  gradientEnd: '#FFA24A',
  line: '#F0E6DE',
  success: '#30B36A',
  warning: '#F79A3E'
};

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  pill: 999
};

export const shadows = {
  sm: {
    shadowColor: '#1A1208',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3
  },
  md: {
    shadowColor: '#1A1208',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.11,
    shadowRadius: 18,
    elevation: 8
  },
  lg: {
    shadowColor: '#1A1208',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 16
  }
};

export const typography = {
  display: { fontSize: 36, fontWeight: '900' as const, lineHeight: 42 },
  h1: { fontSize: 28, fontWeight: '800' as const, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '800' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '700' as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
  label: { fontSize: 13, fontWeight: '700' as const, lineHeight: 18 }
};
