/**
 * PersonalInfoScreen — Step 2 of 6
 * Collects ID data using a 2-column tablet layout.
 */

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import StepIndicator from '../components/StepIndicator';
import { useKyc } from '../context/KycContext';
import { createCustomer } from '../services/api';
import { validatePersonalInfo } from '../utils/validation';
import { Dimensions } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { buttonStyles } from '../theme/buttons';

const { width } = Dimensions.get('window');
const isTablet = width > 700;

const PersonalInfoScreen = () => {
  const router = useRouter();
  const { setCustomerId, setPersonalInfo, personalInfo: existingInfo } = useKyc();

  const [form, setForm] = useState(
    existingInfo || {
      firstName: '',
      lastName: '',
      cin: '',
      birthDate: '',
      phone: '',
      address: '',
    }
  );

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    // Clear error for this field
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleNext = async () => {
    const { isValid, errors: validationErrors } = validatePersonalInfo(form);
    
    if (!isValid) {
      setErrors(validationErrors);
      Alert.alert('Invalid Information', 'Please correct the errors before continuing.');
      return;
    }

    setLoading(true);
    try {
      const formattedDate = new Date(form.birthDate).toISOString();
      const payload = { ...form, birthDate: formattedDate };

      const response = await createCustomer(payload);
      setCustomerId(response.customerId);
      setPersonalInfo(form); // Store locally
      
      router.push('/document-scan'); // Proceed to Step 3
    } catch (err) {
      Alert.alert('Network Error', err.message || 'Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  // Field Renderer
  const renderInput = (label, key, placeholder, keyboardType = 'default') => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label} <Text style={{ color: colors.error }}>*</Text></Text>
      <TextInput
        style={[styles.input, errors[key] && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor={colors.text.secondary}
        value={form[key]}
        onChangeText={(v) => handleChange(key, v)}
        keyboardType={keyboardType}
      />
      {errors[key] ? <Text style={styles.errorText}>{errors[key]}</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <StepIndicator currentStep={2} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Personal Information</Text>
            <Text style={styles.subtitle}>
              Please enter your details exactly as they appear on your ID document.
            </Text>
          </View>

          <View style={styles.formCard}>
            
            {/* 2-Column Row 1 */}
            <View style={styles.row}>
              <View style={styles.col}>{renderInput('First Name', 'firstName', 'e.g. John')}</View>
              <View style={styles.col}>{renderInput('Last Name', 'lastName', 'e.g. Doe')}</View>
            </View>

            {/* 2-Column Row 2 */}
            <View style={styles.row}>
              <View style={styles.col}>{renderInput('CIN / ID Number', 'cin', 'e.g. AB123456')}</View>
              <View style={styles.col}>{renderInput('Date of Birth', 'birthDate', 'YYYY-MM-DD', 'numbers-and-punctuation')}</View>
            </View>

            {/* 2-Column Row 3 */}
            <View style={styles.row}>
              <View style={styles.col}>{renderInput('Mobile Phone', 'phone', '+212...', 'phone-pad')}</View>
              <View style={styles.col}>{renderInput('Residential Address', 'address', 'Full address')}</View>
            </View>

          </View>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[buttonStyles.base, buttonStyles.secondary, styles.btnBack]} 
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={buttonStyles.textSecondary}>← Back</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[buttonStyles.base, buttonStyles.primary, styles.btnNext, loading && buttonStyles.disabled]} 
              onPress={handleNext}
              disabled={loading}
            >
              <Text style={buttonStyles.textPrimary}>
                {loading ? 'Processing...' : 'Next Step →'}
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: isTablet ? 40 : 20, alignItems: 'center' },
  header: { marginBottom: isTablet ? 40 : 24, width: '100%', maxWidth: 800 },
  title: { color: colors.text.primary, fontSize: isTablet ? typography.size.title : typography.size.sectionTitle, fontWeight: typography.weight.bold, marginBottom: 12 },
  subtitle: { color: colors.text.secondary, fontSize: isTablet ? typography.size.button : typography.size.body },
  
  formCard: {
    backgroundColor: colors.surface,
    padding: isTablet ? 32 : 20,
    borderRadius: 24,
    width: '100%',
    maxWidth: 800,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: isTablet ? 40 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  
  row: {
    flexDirection: isTablet ? 'row' : 'column',
    gap: isTablet ? 24 : 0,
    marginBottom: isTablet ? 8 : 0,
  },
  col: {
    flex: 1,
  },
  
  inputContainer: { marginBottom: 20 },
  label: { color: colors.text.primary, fontSize: typography.size.instruction, fontWeight: typography.weight.semiBold, marginBottom: 8, marginLeft: 4 },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    color: colors.text.primary,
    fontSize: typography.size.body,
    paddingHorizontal: 16,
    paddingVertical: 18, // Large touch targets
  },
  inputError: { borderColor: colors.error, backgroundColor: colors.error + '10' },
  errorText: { color: colors.error, fontSize: typography.size.small, marginTop: 6, marginLeft: 4 },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 800,
    gap: 12,
  },
  btnBack: {
    flex: isTablet ? 0 : 1,
    minWidth: isTablet ? 140 : 'auto',
  },
  btnNext: {
    flex: isTablet ? 0 : 2,
    minWidth: isTablet ? 200 : 'auto',
  },
});

export default PersonalInfoScreen;
