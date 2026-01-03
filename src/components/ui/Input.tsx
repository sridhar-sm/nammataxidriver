import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors } from '../../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../../constants/spacing';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  prefix?: string;
}

export function Input({
  label,
  error,
  containerStyle,
  prefix,
  ...props
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}
        <TextInput
          style={[
            styles.input,
            prefix && styles.inputWithPrefix,
            error && styles.inputError,
            props.multiline && styles.multiline,
          ]}
          placeholderTextColor={colors.text.secondary}
          {...props}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  prefix: {
    fontSize: fontSize.lg,
    color: colors.text.secondary,
    paddingLeft: spacing.md,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.lg,
    color: colors.text.primary,
  },
  inputWithPrefix: {
    paddingLeft: spacing.xs,
  },
  inputError: {
    borderColor: colors.danger,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  error: {
    fontSize: fontSize.xs,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});
