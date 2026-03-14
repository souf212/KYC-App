import { colors } from './colors';
import { typography } from './typography';

export const buttonStyles = {
  base: {
    minHeight: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  danger: {
    backgroundColor: colors.error,
  },
  disabled: {
    backgroundColor: colors.border,
    borderColor: colors.border,
    opacity: 0.6,
  },
  
  textBase: {
    fontSize: typography.size.button,
    fontWeight: typography.weight.bold,
  },
  textPrimary: {
    color: colors.text.inverse,
  },
  textSecondary: {
    color: colors.primary,
  },
  textDanger: {
    color: colors.text.inverse,
  },
  textDisabled: {
    color: colors.text.secondary,
  }
};
