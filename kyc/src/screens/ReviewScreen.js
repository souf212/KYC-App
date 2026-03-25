import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import StepIndicator from '../components/StepIndicator';
import { useKyc } from '../context/KycContext';
import { submitDossier } from '../services/api';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { buttonStyles } from '../theme/buttons';

const { width } = Dimensions.get('window');
const isTablet = width > 700;

const ReviewScreen = () => {
  const router = useRouter();
  const {
    customerId,
    personalInfo,
    uploadedDocuments,
    selfieAsset,
    signatureBase64,
    resetKyc,
  } = useKyc();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!customerId) {
      Alert.alert('Error', 'Missing customer ID. Please restart the application.');
      return;
    }

    Alert.alert(
      'Confirm Submission',
      'Are you sure you want to finalize this KYC application?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', style: 'default', onPress: doSubmit },
      ]
    );
  };

  const doSubmit = async () => {
    setLoading(true);
    try {
      const res = await submitDossier(customerId);
      setResult(res);
    } catch (err) {
      Alert.alert('Submission failed', err.message || 'Could not submit dossier. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    const isApproved = result.decision === 'Approved';
    const isReview   = result.decision === 'ManualReview';

    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={{ fontSize: 100, marginBottom: 24 }}>
          {isApproved ? '🎉' : isReview ? '⏳' : '❌'}
        </Text>
        <Text style={[styles.resultTitle, { color: isApproved ? colors.success : isReview ? colors.warning : colors.error }]}>
          {isApproved ? 'Application Approved!' : isReview ? 'Under Manual Review' : 'Application Rejected'}
        </Text>
        <Text style={styles.resultMsg}>{result.message}</Text>

        <View style={styles.resultCard}>
          <Text style={styles.resultRow}>
            <Text style={styles.resultKey}>Customer ID: </Text>
            <Text style={styles.resultVal}>#{result.customerId}</Text>
          </Text>
          <Text style={styles.resultRow}>
            <Text style={styles.resultKey}>Final Decision: </Text>
            <Text style={styles.resultVal}>{result.decision}</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={[buttonStyles.base, buttonStyles.primary, { marginTop: 32 }]}
          onPress={() => { resetKyc(); router.replace('/'); }}
        >
          <Text style={buttonStyles.textPrimary}>Start New Onboarding</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const frontImg = uploadedDocuments.find(d => d.type === 'cin_front')?.uri;
  const backImg  = uploadedDocuments.find(d => d.type === 'cin_back')?.uri;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <StepIndicator currentStep={6} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Review & Submit</Text>
          <Text style={styles.subtitle}>Please verify all collected information with the customer.</Text>
        </View>

        <View style={styles.grid}>
          {/* Column 1: Info & Files */}
          <View style={styles.column}>
            <SectionCard title="👤 Personal Information" onEdit={() => router.push('/ocr-preview')}>
              {personalInfo ? (
                <>
                  <InfoRow label="Full Name" value={`${personalInfo.firstName} ${personalInfo.lastName}`} />
                  <InfoRow label="CIN"       value={personalInfo.cin || personalInfo.cIN} />
                  <InfoRow label="Mobile"    value={personalInfo.phone} />
                  <InfoRow label="Address"   value={personalInfo.address} />
                  <InfoRow label="Dob"       value={new Date(personalInfo.birthDate).toLocaleDateString()} />
                </>
              ) : <Text style={styles.missing}>⚠️ Missing information</Text>}
            </SectionCard>
          </View>

          {/* Column 2: Documents & Selfie */}
          <View style={styles.column}>
            <SectionCard title="🪪 Identity Document" onEdit={() => router.push('/document-scan')}>
              <View style={styles.docGrid}>
                <View style={styles.docItem}>
                  <Text style={styles.docLabel}>Front</Text>
                  {frontImg ? <Image source={{ uri: frontImg }} style={styles.docThumb} /> : <Text style={styles.missing}>Missing</Text>}
                </View>
                <View style={styles.docItem}>
                  <Text style={styles.docLabel}>Back</Text>
                  {backImg ? <Image source={{ uri: backImg }} style={styles.docThumb} /> : <Text style={styles.missing}>Missing</Text>}
                </View>
              </View>
            </SectionCard>

            <SectionCard title="🤳 Biometric Verification" onEdit={() => router.push('/selfie')}>
              {selfieAsset ? (
                <View style={styles.selfieRow}>
                  <Image source={{ uri: selfieAsset.uri }} style={styles.selfieThumb} />
                  <View style={styles.scores}>
                    <ScoreBadge label="Match" value={selfieAsset.facialScore} />
                    <ScoreBadge label="Live"  value={selfieAsset.livenessScore} />
                  </View>
                </View>
              ) : <Text style={styles.missing}>⚠️ Selfie missing</Text>}
            </SectionCard>
          </View>

          {/* Column 3: Signature & Submit */}
          <View style={styles.column}>
            <SectionCard title="✍️ Customer Signature" onEdit={() => router.push('/signature')}>
              {signatureBase64 ? (
                <View style={styles.sigPreview}>
                  <Image source={{ uri: signatureBase64 }} style={styles.sigImg} resizeMode="contain" />
                </View>
              ) : <Text style={styles.missing}>⚠️ Signature missing</Text>}
            </SectionCard>

            <View style={styles.submitCard}>
              <Text style={styles.submitDisclaimer}>
                By tapping Submit, you confirm that the customer is physically present and verifies this data.
              </Text>
              <TouchableOpacity
                style={[buttonStyles.base, buttonStyles.primary, loading && buttonStyles.disabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={buttonStyles.textPrimary}>{loading ? 'Submitting...' : 'Submit Application'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// ─── Reusable Bits ──────────────────────────────────────────────────────────

const SectionCard = ({ title, children, onEdit }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
      <TouchableOpacity onPress={onEdit}>
        <Text style={styles.editBtn}>Edit</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.cardBody}>{children}</View>
  </View>
);

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const ScoreBadge = ({ label, value }) => {
  const pct = Math.round((value ?? 0) * 100);
  const color = pct >= 80 ? colors.success : pct >= 60 ? colors.warning : colors.error;
  return (
    <View style={styles.scoreBadge}>
      <Text style={[styles.scoreVal, { color }]}>{pct}%</Text>
      <Text style={styles.scoreLabel}>{label}</Text>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered:  { justifyContent: 'center', alignItems: 'center', padding: 40 },
  scroll:    { padding: 40, alignItems: 'center' },
  
  header:    { marginBottom: isTablet ? 40 : 24, width: '100%', maxWidth: 1200 },
  title:     { color: colors.text.primary, fontSize: isTablet ? 36 : 28, fontWeight: '800', marginBottom: 12 },
  subtitle:  { color: colors.text.secondary, fontSize: isTablet ? 18 : 16 },

  grid: {
    flexDirection: isTablet ? 'row' : 'column',
    flexWrap: isTablet ? 'wrap' : 'nowrap',
    width: '100%',
    maxWidth: 1200,
    gap: 24,
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    minWidth: isTablet ? 320 : '100%',
    gap: 24,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  cardTitle: { color: colors.text.primary, fontSize: typography.size.body, fontWeight: typography.weight.bold },
  editBtn:   { color: colors.primary, fontSize: typography.size.instruction, fontWeight: typography.weight.bold },
  cardBody:  { padding: 20 },

  infoRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoLabel: { color: colors.text.secondary, fontSize: typography.size.instruction },
  infoValue: { color: colors.text.primary, fontSize: typography.size.instruction, fontWeight: typography.weight.bold, flex: 1, textAlign: 'right', marginLeft: 16 },

  missing:   { color: colors.error, fontSize: typography.size.instruction, fontStyle: 'italic' },
  skipped:   { color: colors.text.secondary, fontSize: typography.size.instruction, fontStyle: 'italic' },
  
  fileRow:       { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  fileIcon:      { fontSize: 16, marginRight: 12 },
  fileName:      { color: colors.text.primary, fontSize: typography.size.instruction, flex: 1 },
  uploadedBadge: { color: colors.success, fontWeight: typography.weight.bold, marginLeft: 8 },

  docGrid:   { flexDirection: 'row', gap: 16 },
  docItem:   { flex: 1 },
  docLabel:  { color: colors.text.secondary, fontSize: typography.size.small, marginBottom: 8 },
  docThumb:  { width: '100%', aspectRatio: 1.58, borderRadius: 8, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },

  selfieRow: { flexDirection: 'row', gap: 24, alignItems: 'center' },
  selfieThumb: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.background, borderWidth: 2, borderColor: colors.border },
  scores:    { flex: 1, flexDirection: 'row', gap: 16, justifyContent: 'space-around' },
  scoreBadge:{ alignItems: 'center' },
  scoreVal:  { fontSize: typography.size.sectionTitle, fontWeight: typography.weight.bold },
  scoreLabel:{ color: colors.text.secondary, fontSize: typography.size.small, marginTop: 4 },

  sigPreview: { backgroundColor: colors.background, borderRadius: 8, padding: 8, height: 120, borderWidth: 1, borderColor: colors.border },
  sigImg:     { width: '100%', height: '100%' },

  submitCard: {
    backgroundColor: colors.primary + '10',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    marginTop: 8,
  },
  submitDisclaimer: { color: colors.text.secondary, fontSize: typography.size.small, lineHeight: 20, marginBottom: 20, textAlign: 'center' },

  // Post Submission Result
  resultTitle: { fontSize: isTablet ? 36 : 28, fontWeight: typography.weight.bold, marginBottom: 16, textAlign: 'center' },
  resultMsg:   { color: colors.text.secondary, fontSize: isTablet ? typography.size.button : typography.size.body, textAlign: 'center', lineHeight: 28, marginBottom: 40, maxWidth: 600 },
  resultCard: {
    backgroundColor: colors.surface, borderRadius: 24, borderWidth: 1,
    borderColor: colors.border, padding: 32, marginBottom: 32, minWidth: isTablet ? 400 : '100%',
  },
  resultRow: { fontSize: typography.size.button, marginBottom: 12 },
  resultKey: { color: colors.text.secondary },
  resultVal: { color: colors.text.primary, fontWeight: typography.weight.bold },
});

export default ReviewScreen;
