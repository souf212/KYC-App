import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { buttonStyles } from '../theme/buttons';

const VerificationStatus = ({ status, onRetry, onContinue }) => {
  const isSuccess = status === 'success';

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, isSuccess ? styles.iconSuccess : styles.iconError]}>
        <Text style={[styles.iconText, { color: isSuccess ? colors.success : colors.error }]}>
          {isSuccess ? '✓' : '✖'}
        </Text>
      </View>
      
      <Text style={styles.title}>
        {isSuccess ? 'Face Verified Successfully' : 'Face Mismatch'}
      </Text>
      
      <Text style={styles.message}>
        {isSuccess 
          ? 'Your identity has been verified. You can now proceed to the next step.' 
          : 'We could not verify your face against the ID provided. Please try again in better lighting.'}
      </Text>

      {isSuccess ? (
        <TouchableOpacity style={[buttonStyles.base, buttonStyles.primary, styles.button]} onPress={onContinue}>
          <Text style={buttonStyles.textPrimary}>Continue</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[buttonStyles.base, buttonStyles.primary, styles.button]} onPress={onRetry}>
          <Text style={buttonStyles.textPrimary}>Retry Verification</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconSuccess: {
    backgroundColor: colors.success + '20', // 20% opacity
    borderWidth: 2,
    borderColor: colors.success,
  },
  iconError: {
    backgroundColor: colors.error + '20',
    borderWidth: 2,
    borderColor: colors.error,
  },
  iconText: {
    fontSize: 48,
  },
  title: {
    fontSize: typography.size.sectionTitle,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 400,
  },
  button: {
    width: '100%',
    maxWidth: 300,
  }
});

export default VerificationStatus;
