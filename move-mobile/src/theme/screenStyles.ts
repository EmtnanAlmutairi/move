import { StyleSheet } from 'react-native';
import { colors, shadows, spacing } from './tokens';

export const screenStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl + 90
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'right'
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.muted,
    textAlign: 'right',
    fontSize: 15
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.sm
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center'
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.muted,
    textAlign: 'right',
    textTransform: 'uppercase',
    marginTop: spacing.lg,
    marginBottom: spacing.sm
  }
});
