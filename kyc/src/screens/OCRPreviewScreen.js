/**
 * OCRPreviewScreen — Step 3
 * Simulates OCR extraction and allows user to confirm/edit details.
 */
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
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
  Dimensions,
} from 'react-native';
import StepIndicator from '../components/StepIndicator';
import ProgressLoader from '../components/ProgressLoader';
import { useKyc } from '../context/KycContext';
import { createCustomer, uploadDocument } from '../services/api';
import { validatePersonalInfo } from '../utils/validation';
import { extractTextFromImage, parseMoroccanCIN } from '../services/ocrService';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { buttonStyles } from '../theme/buttons';

const { width } = Dimensions.get('window');
const isTablet = width > 700;

const OCRPreviewScreen = () => {
  const router = useRouter();
  const { setCustomerId, setPersonalInfo, uploadedDocuments } = useKyc();

  const [phase, setPhase] = useState('extracting'); // extracting | review
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    cin: '',
    birthDate: '',
    phone: '',
    address: '',
    nationality: '',
    gender: '',
    cityOfBirth: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    let isMounted = true;

    const performActualOCR = async () => {
      try {
        // Find front and back images from KycContext
        const frontDoc = uploadedDocuments.find(d => d.type === 'cin_front' || d.type === 'passport');
        const backDoc = uploadedDocuments.find(d => d.type === 'cin_back');

        if (!frontDoc) {
          throw new Error('No identity document image found. Please rescan.');
        }

        // 1. Send Front Document
        let p = 10;
        setProgress(p);
        
        const frontText = await extractTextFromImage(frontDoc.uri);
        p = backDoc ? 50 : 90;
        setProgress(p);

        // 2. Send Back Document (if exists)
        let backText = '';
        if (backDoc && isMounted) {
          backText = await extractTextFromImage(backDoc.uri);
          setProgress(90);
        }

        if (isMounted) {
          // 3. Parse Data locally
          setProgress(100);
          const parsedData = parseMoroccanCIN(frontText, backText);
          
          setForm(prev => ({ ...prev, ...parsedData }));
          setPhase('review');
        }
      } catch (err) {
        if (isMounted) {
          console.error(err);
          Alert.alert('OCR Failed', err.message || 'Could not parse the document. You can enter details manually.');
          setPhase('review'); // allow manual entry fallback
        }
      }
    };

    performActualOCR();

    return () => { isMounted = false; };
  }, [uploadedDocuments]);

  const handleChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleConfirm = async () => {
    // Validate only core fields expected by KYC backend
    const { isValid, errors: validationErrors } = validatePersonalInfo({
      firstName: form.firstName, lastName: form.lastName, cin: form.cin,
      birthDate: form.birthDate, phone: form.phone, address: form.address
    });
    
    if (!isValid && Object.keys(validationErrors).length > 0) {
      // Check if the only errors are phone/address since OCR might miss them
      if (!form.phone) validationErrors.phone = "Phone is required";
      if (!form.address) validationErrors.address = "Address is required";
      
      setErrors(validationErrors);
      Alert.alert('Missing Info', 'Please fill in missing fields like phone number.');
      return;
    }

    setLoading(true);
    try {
      const formattedDate = new Date(form.birthDate).toISOString();
      const payload = { 
        firstName: form.firstName,
        lastName: form.lastName,
        cin: form.cin,
        birthDate: formattedDate,
        phone: form.phone,
        address: form.address
      };

      // 1. Create customer with extracted data
      const response = await createCustomer(payload);
      const newCustomerId = response.customerId;
      
      setCustomerId(newCustomerId);
      setPersonalInfo({ ...form });

      // 2. Upload documents we captured in Step 2 securely now that we have ID
      if (uploadedDocuments.length > 0) {
        for (const doc of uploadedDocuments) {
          if (doc.documentId && String(doc.documentId).startsWith('local_')) {
             await uploadDocument(
               newCustomerId,
               doc.type,
               { uri: doc.uri, name: `${doc.type}.jpg`, mimeType: 'image/jpeg' }
             );
          }
        }
      }
      
      router.push('/selfie'); // Proceed to Step 4
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not verify data.');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label, key, placeholder, keyboardType = 'default', autoCapitalize = 'words') => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, form[key] && { color: colors.success }]}>
        {label} {form[key] ? '✅' : <Text style={{ color: colors.error }}>*</Text>}
      </Text>
      <TextInput
        style={[styles.input, errors[key] && styles.inputError, form[key] && phase === 'review' && styles.inputExtracted]}
        placeholder={placeholder}
        placeholderTextColor={colors.text.secondary}
        value={form[key]}
        onChangeText={(v) => handleChange(key, v)}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {errors[key] ? <Text style={styles.errorText}>{errors[key]}</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <StepIndicator currentStep={3} />

      {phase === 'extracting' ? (
        <View style={styles.extractingContainer}>
          <Text style={{ fontSize: 64, marginBottom: 24 }}>⚙️</Text>
          <Text style={styles.title}>Extracting Data</Text>
          <Text style={styles.subtitle}>Analyzing ID document using OCR...</Text>
          <View style={{ width: '50%', marginTop: 32 }}>
            <ProgressLoader visible={true} progress={progress} label="Parsing text and MRZ" />
          </View>
        </View>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            <View style={styles.header}>
              <Text style={styles.title}>Confirm Details</Text>
              <Text style={styles.subtitle}>
                We successfully extracted your information! Please verify and fill in any missing details.
              </Text>
            </View>

            <View style={styles.formCard}>
              <View style={styles.row}>
                <View style={styles.col}>{renderInput('First Name', 'firstName', 'e.g. SOUFIANE', 'default', 'characters')}</View>
                <View style={styles.col}>{renderInput('Last Name', 'lastName', 'e.g. EL-OTMANI', 'default', 'characters')}</View>
              </View>

              <View style={styles.row}>
                <View style={styles.col}>{renderInput('CIN Number', 'cin', 'e.g. SA29163', 'default', 'characters')}</View>
                <View style={styles.col}>{renderInput('Date of Birth', 'birthDate', 'YYYY-MM-DD', 'numbers-and-punctuation')}</View>
              </View>

              <View style={styles.row}>
                 <View style={styles.col}>{renderInput('Gender', 'gender', 'M/F', 'default', 'characters')}</View>
                 <View style={styles.col}>{renderInput('City of Birth', 'cityOfBirth', 'e.g. NADOR', 'default', 'characters')}</View>
              </View>

              <View style={styles.row}>
                <View style={styles.col}>{renderInput('Mobile Phone', 'phone', '+212...', 'phone-pad')}</View>
                <View style={styles.col}>{renderInput('Residential Address', 'address', 'Address')}</View>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[buttonStyles.base, buttonStyles.secondary, styles.btnBack]} 
                onPress={() => router.back()}
                disabled={loading}
              >
                <Text style={buttonStyles.textSecondary}>← Rescan ID</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[buttonStyles.base, buttonStyles.primary, styles.btnNext, loading && buttonStyles.disabled]} 
                onPress={handleConfirm}
                disabled={loading}
              >
                <Text style={buttonStyles.textPrimary}>
                  {loading ? 'Processing...' : 'Confirm & Proceed →'}
                </Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  extractingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  },
  
  row: {
    flexDirection: isTablet ? 'row' : 'column',
    gap: isTablet ? 24 : 0,
    marginBottom: isTablet ? 8 : 0,
  },
  col: { flex: 1 },
  
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
    paddingVertical: 18,
  },
  inputError: { borderColor: colors.error, backgroundColor: colors.error + '10' },
  inputExtracted: { borderColor: colors.success + '40', backgroundColor: colors.success + '05' },
  errorText: { color: colors.error, fontSize: typography.size.small, marginTop: 6, marginLeft: 4 },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 800,
    gap: 12,
  },
  btnBack: { flex: isTablet ? 0 : 1, minWidth: isTablet ? 140 : 'auto' },
  btnNext: { flex: isTablet ? 0 : 2, minWidth: isTablet ? 200 : 'auto' },
});

export default OCRPreviewScreen;
