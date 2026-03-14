import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import StepIndicator from '../components/StepIndicator';
import ProgressLoader from '../components/ProgressLoader';
import SignaturePad from '../components/SignaturePad';
import { useKyc } from '../context/KycContext';
import { uploadSignature } from '../services/api';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const SignatureScreen = () => {
  const router = useRouter();
  const { customerId, setSignatureBase64 } = useKyc();

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const handleConfirmSignature = async (base64) => {
    setLoading(true);
    try {
      await uploadSignature(customerId, base64, (pct) => setProgress(pct));
      setSignatureBase64(base64); // Save globally
      router.push('/review'); // Go to Step 7
    } catch (err) {
      Alert.alert('Upload failed', err.message || 'Could not save signature. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <StepIndicator currentStep={6} />

      {loading && (
        <View style={styles.overlay}>
          <ProgressLoader visible={loading} progress={progress} label="Saving secure signature..." />
        </View>
      )}

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        scrollEnabled={scrollEnabled}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Digital Signature</Text>
          <Text style={styles.subtitle}>
            Please sign in the box below using your finger. This signature will be used to authorize your account opening.
          </Text>
        </View>

        <View style={styles.mainLayout}>
          <SignaturePad 
            onConfirmSignature={handleConfirmSignature} 
            onBegin={() => setScrollEnabled(false)}
            onEnd={() => setScrollEnabled(true)}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, padding: 32, alignItems: 'center' },
  header: { marginBottom: 32, width: '100%', maxWidth: 800 },
  title: { color: colors.text.primary, fontSize: typography.size.title, fontWeight: typography.weight.bold, marginBottom: 12 },
  subtitle: { color: colors.text.secondary, fontSize: typography.size.body, lineHeight: 26 },
  
  mainLayout: {
    flex: 1,
    width: '100%',
    maxWidth: 800,
  },
  
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  }
});

export default SignatureScreen;
