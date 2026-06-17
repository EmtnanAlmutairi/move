import { StyleSheet } from 'react-native';
import { colors, spacing } from './tokens';

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
    fontWeight: '800',
    color: colors.text,
    textAlign: 'right'
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.muted,
    textAlign: 'right'
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center'
  }
});
