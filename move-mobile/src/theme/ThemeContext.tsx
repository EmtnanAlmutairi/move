import React, { createContext, useContext, useState } from 'react';

// ─── MOVE Theme System ────────────────────────────────────────────────────────
//
// DUAL-ENERGY brand: Lime (#B5FF45) + Orange (#FF7A18)
// Matches the web landing page brand exactly.
//
// LIGHT is the PRIMARY identity — warm cream, energetic, clean.
// DARK is an opt-in inversion — same personality, dark surfaces.
// Both modes use the same accent colors. Neither feels like a different app.
// ─────────────────────────────────────────────────────────────────────────────

export const LIGHT = {
  mode: 'light' as const,

  // Page & Surface — warm cream (web landing page brand)
  background:      '#F7F7F5',
  card:            '#FFFFFF',
  cardSoft:        '#F1F1EE',
  cardDark:        '#111111',

  // Typography
  text:            '#111111',
  textSub:         '#6F6F68',
  textInverse:     '#FFFFFF',
  muted:           '#6F6F68',

  // Brand Orange — actions, icons, CTAs
  primary:         '#FF7A18',
  primaryDark:     '#D96010',
  gradientStart:   '#FF7A18',
  gradientEnd:     '#FF7A18',

  // Brand Lime — energy, XP, achievements
  lime:            '#FF7A18',
  limeGradStart:   '#FF7A18',
  limeGradEnd:     '#FF7A18',

  // Semantic
  line:            'rgba(17,17,17,0.09)',
  success:         '#16A34A',
  successLight:    '#22C55E',
  warning:         '#F59E0B',
  error:           '#EF4444',

  // Gamification — lime is XP energy
  xpGradStart:     '#FF7A18',
  xpGradEnd:       '#FF7A18',
  levelPurple:     '#FF7A18',
  streakFire:      '#FF7A18',

  // Accent surface — featured / hero tiles in light mode (warm cream tint)
  accentSurface:   '#FFFFFF',
  accentBorder:    'rgba(17,17,17,0.09)',
  accentText:      '#111111',
  accentMuted:     'rgba(17,17,17,0.48)',
  accentSubtext:   'rgba(17,17,17,0.52)',

  // Navigation chrome
  navBg:           'rgba(255,255,255,0.95)',
  navBorder:       'rgba(17,17,17,0.07)',
  navIconInactive: '#8A8A84',
  navShadow:       '#111111',
};

export const DARK = {
  mode: 'dark' as const,

  // Page & Surface — deep neutral
  background:      '#0F0F0F',
  card:            '#1B1B1B',
  cardSoft:        '#262626',
  cardDark:        '#0A0A0A',

  // Typography
  text:            '#F2EDE6',
  textSub:         '#9A9288',
  textInverse:     '#111111',
  muted:           '#726C64',

  // Brand Orange — same intensity in dark mode
  primary:         '#FF7A18',
  primaryDark:     '#D96010',
  gradientStart:   '#FF7A18',
  gradientEnd:     '#FF7A18',

  // Brand Lime — slightly softened for dark
  lime:            '#FF7A18',
  limeGradStart:   '#FF7A18',
  limeGradEnd:     '#FF7A18',

  // Semantic — slightly brighter for dark surfaces
  line:            'rgba(255,255,255,0.08)',
  success:         '#22C55E',
  successLight:    '#4ADE80',
  warning:         '#F59E0B',
  error:           '#F87171',

  // Gamification
  xpGradStart:     '#FF7A18',
  xpGradEnd:       '#FF7A18',
  levelPurple:     '#FF7A18',
  streakFire:      '#FF7A18',

  // Accent surface — featured / hero tiles in dark mode (pure dark)
  accentSurface:   '#111111',
  accentBorder:    'rgba(255,122,24,0.22)',
  accentText:      '#FFFFFF',
  accentMuted:     'rgba(255,255,255,0.45)',
  accentSubtext:   'rgba(255,255,255,0.50)',

  // Navigation chrome
  navBg:           'rgba(18,18,18,0.97)',
  navBorder:       'rgba(255,255,255,0.06)',
  navIconInactive: '#555050',
  navShadow:       '#000000',
};

export type ThemeTokens = typeof LIGHT | typeof DARK;

const DEFAULT_CTX = { theme: LIGHT as ThemeTokens, isDark: false, toggleTheme: () => {} };
const Ctx = createContext(DEFAULT_CTX);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false); // LIGHT is the primary brand experience
  return (
    <Ctx.Provider value={{ theme: isDark ? DARK : LIGHT, isDark, toggleTheme: () => setIsDark((v) => !v) }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);
