// ─── MOVE Design System — Brand Primitives ───────────────────────────────────
//
// DUAL-ENERGY brand: Lime (#B5FF45) energy + Orange (#FF7A18) fire
// This matches the web landing page brand exactly.
//
// Usage rules:
//   Orange  → primary actions, icons, active states, hero backgrounds
//   Lime    → XP, achievements, streaks, energy indicators
//   Lime→Orange gradient → signature brand stripe, XP badges, earned achievements
//   Orange→Amber gradient → hero cards (readable against white text)
//
// Screens that import `colors` directly get the light mode palette.
// Theme-aware screens use the `useTheme()` hook from ThemeContext.
// ─────────────────────────────────────────────────────────────────────────────

export const colors = {
  // ── Page & Surface ───────────────────────────────────────────────────────
  background:     '#F7F7F5',   // neutral app background
  card:           '#FFFFFF',
  cardSoft:       '#F1F1EE',   // subtle fill — inputs, chips
  cardDark:       '#111111',   // inverse accent surface

  // ── Typography ───────────────────────────────────────────────────────────
  text:           '#111111',
  muted:          '#6F6F68',

  // ── Brand: Orange (warmth, fire, strength) ───────────────────────────────
  primary:        '#FF7A18',   // MOVE Orange — web landing page exact
  primaryDark:    '#D96010',
  gradientStart:  '#FF7A18',
  gradientEnd:    '#FF7A18',

  // ── Brand: Lime (energy, electricity, speed) ─────────────────────────────
  lime:           '#FF7A18',   // keep one primary color
  limeGradStart:  '#FF7A18',   // keep one primary color
  limeGradEnd:    '#FF7A18',   // XP / achievement gradient end (→ orange)

  // ── Semantic ─────────────────────────────────────────────────────────────
  line:           'rgba(17,17,17,0.09)',  // matches web --line
  success:        '#16A34A',
  successLight:   '#22C55E',
  warning:        '#F59E0B',
  error:          '#EF4444',

  // ── Gamification ─────────────────────────────────────────────────────────
  xpGold:         '#FF7A18',
  xpGradStart:    '#FF7A18',
  xpGradEnd:      '#FF7A18',   // orange end — the brand stripe
  levelPurple:    '#FF7A18',
  streakFire:     '#FF7A18',

  // ── Recovery / Injury (warm medical palette) ─────────────────────────────
  injuryLow:      '#F79A3E',   // monitoring — amber
  injuryMed:      '#FF7A5C',   // moderate — salmon
  injuryHigh:     '#E74424',   // severe — red-orange
};

export const spacing = {
  xs:  8,
  sm:  12,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 40,
};

export const radius = {
  sm:   8,
  md:   12,
  lg:   18,
  xl:   24,
  xxl:  32,
  pill: 999,
};

export const shadows = {
  sm: {
    shadowColor: '#5A4A38',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#5A4A38',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: '#5A4A38',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  brand: {
    shadowColor: '#FF7A18',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
};

export const typography = {
  displayXL: { fontSize: 48, fontWeight: '800' as const, letterSpacing: 0, lineHeight: 54 },
  display:   { fontSize: 40, fontWeight: '800' as const, letterSpacing: 0, lineHeight: 46 },
  h1:        { fontSize: 30, fontWeight: '800' as const, letterSpacing: 0, lineHeight: 36 },
  h2:        { fontSize: 24, fontWeight: '800' as const, letterSpacing: 0, lineHeight: 30 },
  h3:        { fontSize: 22, fontWeight: '800' as const, lineHeight: 28 },
  h4:        { fontSize: 18, fontWeight: '700' as const, lineHeight: 24 },
  body:      { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyStrong:{ fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  caption:   { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
  label:     { fontSize: 11, fontWeight: '700' as const, lineHeight: 16, letterSpacing: 0 },
  kicker:    { fontSize: 10, fontWeight: '800' as const, letterSpacing: 0 },
};
