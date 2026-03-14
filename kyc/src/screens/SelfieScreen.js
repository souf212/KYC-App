import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import StepIndicator from '../components/StepIndicator';
import ProgressLoader from '../components/ProgressLoader';
import CameraCapture from '../components/CameraCapture';
import VerificationStatus from '../components/VerificationStatus';
import { useKyc } from '../context/KycContext';
import { uploadSelfie } from '../services/api';
import { Dimensions } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { buttonStyles } from '../theme/buttons';

const { width } = Dimensions.get('window');
const isTablet = width > 700;

const SelfieScreen = () => {
  const router = useRouter();
  const { customerId, setSelfieAsset } = useKyc();

  const [phase, setPhase] = useState('guide'); // 'guide' | 'camera' | 'uploading' | 'result'
  const [resultStatus, setResultStatus] = useState(null); // 'success' | 'error'
  const [progress, setProgress] = useState(0);
  const [livenessHint, setLivenessHint] = useState('Please look at the camera');

  useEffect(() => {
    if (phase === 'camera') {
      const seq1 = setTimeout(() => setLivenessHint('Blink your eyes'), 2500);
      const seq2 = setTimeout(() => setLivenessHint('Turn head slightly left'), 5000);
      const seq3 = setTimeout(() => setLivenessHint('Perfect. Hold still.'), 7500);
      return () => { clearTimeout(seq1); clearTimeout(seq2); clearTimeout(seq3); };
    }
  }, [phase]);

  const handleCapture = async (photo) => {
    setPhase('uploading');
    try {
      const result = await uploadSelfie(
        customerId,
        { uri: photo.uri, name: 'selfie.jpg', mimeType: 'image/jpeg' },
        (pct) => setProgress(pct),
      );

      setSelfieAsset({
        uri: photo.uri,
        biometricId: result.biometricId,
        facialScore: result.facialScore,
        livenessScore: result.livenessScore,
      });

      setResultStatus('success');
      setPhase('result');
    } catch (err) {
      setResultStatus('error');
      setPhase('result');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <StepIndicator currentStep={4} />

      <ScrollView style={styles.contentScrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Facial Verification</Text>
          <Text style={styles.subtitle}>
            Please follow the instructions on the screen to verify your identity.
          </Text>
        </View>

        <View style={styles.mainLayout}>
          
          <View style={styles.cameraBox}>
            {phase === 'result' ? (
              <VerificationStatus 
                status={resultStatus} 
                onRetry={() => setPhase('camera')} 
                onContinue={() => router.push('/document-upload')} // Next is document upload
              />
            ) : phase === 'uploading' ? (
              <View style={[styles.cameraFlex, styles.centered]}>
                <ProgressLoader visible={true} progress={progress} label="Analyzing Facial Features..." />
              </View>
            ) : phase === 'camera' ? (
              <CameraCapture type="oval-face" hintText={livenessHint} onCapture={handleCapture} />
            ) : (
              <View style={[styles.cameraFlex, styles.centered, { backgroundColor: colors.surface }]}>
                 <Text style={{ fontSize: 72, marginBottom: 20 }}>👤</Text>
                 <Text style={styles.previewTitle}>Ready for your scan?</Text>
              </View>
            )}
          </View>

          <View style={styles.sidePanel}>
            <View style={styles.instructionCard}>
              <Text style={styles.cardHeader}>Verification Tips</Text>
              <Text style={styles.cardBullet}>• Ensure your face is well-lit.</Text>
              <Text style={styles.cardBullet}>• Remove any sunglasses or hats.</Text>
              <Text style={styles.cardBullet}>• Maintain a neutral expression.</Text>
              <Text style={styles.cardBullet}>• Follow the on-screen prompts.</Text>
            </View>

            <View style={styles.actionBlock}>
              {phase === 'guide' ? (
                <TouchableOpacity style={[buttonStyles.base, buttonStyles.primary, styles.btn]} onPress={() => setPhase('camera')}>
                  <Text style={buttonStyles.textPrimary}>📷 Start Camera</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.hintText}>Follow instructions on the camera screen.</Text>
              )}
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { justifyContent: 'center', alignItems: 'center', padding: 32 },
  
  contentScrollView: { flex: 1 },
  contentContainer: { padding: 32, paddingBottom: 64 },
  header: { marginBottom: 24, maxWidth: 800 },
  title: { color: colors.text.primary, fontSize: typography.size.title, fontWeight: typography.weight.bold, marginBottom: 8 },
  subtitle: { color: colors.text.secondary, fontSize: typography.size.body, lineHeight: 24 },

  mainLayout: {
    flex: 1,
    flexDirection: isTablet ? 'row' : 'column',
    gap: isTablet ? 32 : 16,
    flexWrap: 'nowrap',
  },

  cameraBox: {
    flex: isTablet ? 6 : 1,
    minHeight: isTablet ? 'auto' : 350,
    minWidth: isTablet ? 400 : '100%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cameraFlex: {
    flex: 1,
    width: '100%',
  },
  previewTitle: { color: colors.text.primary, fontSize: typography.size.button, fontWeight: typography.weight.bold },

  sidePanel: {
    flex: isTablet ? 4 : 0,
    minWidth: isTablet ? 300 : '100%',
    justifyContent: 'space-between',
    gap: 16,
  },
  instructionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { color: colors.primary, fontSize: typography.size.button, fontWeight: typography.weight.bold, marginBottom: 16 },
  cardBullet: { color: colors.text.secondary, fontSize: typography.size.body, marginBottom: 12, lineHeight: 24 },

  actionBlock: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    width: '100%',
  },
  hintText: {
    color: colors.text.secondary,
    fontSize: typography.size.instruction,
    textAlign: 'center',
  }
});

export default SelfieScreen;
