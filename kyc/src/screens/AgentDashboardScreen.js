import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useKyc } from '../context/KycContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { buttonStyles } from '../theme/buttons';
import { useRouter } from 'expo-router';

const AgentDashboardScreen = () => {
  const router = useRouter();
  const {
    customerId,
    personalInfo,
    uploadedDocuments,
    selfieAsset,
    uploadedFiles,
    signatureBase64,
    resetKyc,
  } = useKyc();

  const handleDecision = (type) => {
    let msg = '';
    if (type === 'approve') msg = 'Are you sure you want to approve this KYC application?';
    if (type === 'reject') msg = 'Are you sure you want to REJECT this KYC application?';
    if (type === 'retake') msg = 'Request customer to retake missing or blurry documents?';

    Alert.alert(
      'Confirm Action',
      msg,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          style: type === 'reject' ? 'destructive' : 'default', 
          onPress: () => finalizeDecision(type) 
        },
      ]
    );
  };

  const finalizeDecision = (type) => {
    Alert.alert('Success', `Application ${type}d successfully.`);
    resetKyc();
    router.replace('/');
  };

  if (!personalInfo) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No Active KYC Session</Text>
        <TouchableOpacity style={[buttonStyles.base, buttonStyles.primary]} onPress={() => router.replace('/')}>
          <Text style={buttonStyles.textPrimary}>Go to Start</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const frontImg = uploadedDocuments.find(d => d.type === 'cin_front')?.uri;
  const backImg  = uploadedDocuments.find(d => d.type === 'cin_back')?.uri;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Agent Terminal Dashboard</Text>
          <Text style={styles.subtitle}>Reviewing Application ID: #{customerId || 'PENDING'}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Awaiting Review</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.contentGrid}>
          
          {/* Left Column: Data & Address */}
          <View style={styles.col}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Customer Information</Text>
              <InfoRow label="First Name" value={personalInfo.firstName} />
              <InfoRow label="Last Name" value={personalInfo.lastName} />
              <InfoRow label="ID Number" value={personalInfo.cin} />
              <InfoRow label="Date of Birth" value={new Date(personalInfo.birthDate).toLocaleDateString()} />
              <InfoRow label="Phone" value={personalInfo.phone} />
              <InfoRow label="Address" value={personalInfo.address} />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Address Proof (Optional)</Text>
              {uploadedFiles && uploadedFiles.length > 0 ? (
                uploadedFiles.map((f, i) => (
                  <View key={i} style={styles.fileRow}>
                    <Text style={styles.fileName}>📄 {f.name}</Text>
                    <TouchableOpacity><Text style={styles.viewLink}>View</Text></TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyField}>Not provided</Text>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Customer Signature</Text>
              {signatureBase64 ? (
                <Image source={{ uri: signatureBase64 }} style={styles.sigImg} resizeMode="contain" />
              ) : (
                 <Text style={styles.emptyField}>Awaiting Signature...</Text>
              )}
            </View>
          </View>

          {/* Right Column: Biometrics & Documents */}
          <View style={styles.col}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Identity Document</Text>
              <View style={styles.docGrid}>
                <View style={styles.docItem}>
                  <Text style={styles.docLabel}>Front Side</Text>
                  {frontImg ? <Image source={{ uri: frontImg }} style={styles.docThumb} /> : <View style={styles.docEmpty}><Text style={styles.emptyField}>Pending</Text></View>}
                </View>
                <View style={styles.docItem}>
                  <Text style={styles.docLabel}>Back Side</Text>
                  {backImg ? <Image source={{ uri: backImg }} style={styles.docThumb} /> : <View style={styles.docEmpty}><Text style={styles.emptyField}>Pending</Text></View>}
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Biometric Verification</Text>
              <View style={styles.bioRow}>
                {selfieAsset ? (
                  <>
                    <Image source={{ uri: selfieAsset.uri }} style={styles.selfieThumb} />
                    <View style={styles.scores}>
                      <ScoreBox label="Facial Match" value={selfieAsset.facialScore} />
                      <ScoreBox label="Liveness Valid" value={selfieAsset.livenessScore} />
                    </View>
                  </>
                ) : (
                  <Text style={styles.emptyField}>Awaiting Biometrics...</Text>
                )}
              </View>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Footer Controls */}
      <View style={styles.footer}>
        <TouchableOpacity style={[buttonStyles.base, buttonStyles.danger, styles.actionBtn]} onPress={() => handleDecision('reject')}>
          <Text style={buttonStyles.textDanger}>Reject KYC</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[buttonStyles.base, buttonStyles.secondary, styles.actionBtn]} onPress={() => handleDecision('retake')}>
          <Text style={buttonStyles.textSecondary}>Request Retake</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[buttonStyles.base, buttonStyles.primary, styles.actionBtn, {backgroundColor: colors.success}]} onPress={() => handleDecision('approve')}>
          <Text style={buttonStyles.textPrimary}>Approve KYC</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const ScoreBox = ({ label, value }) => {
  const pct = Math.round((value ?? 0) * 100);
  const color = pct >= 80 ? colors.success : pct >= 60 ? colors.warning : colors.error;
  return (
    <View style={styles.scoreBox}>
      <Text style={[styles.scoreVal, { color }]}>{pct}%</Text>
      <Text style={styles.scoreLabel}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  emptyText: { color: colors.text.secondary, fontSize: typography.size.sectionTitle, marginBottom: 24, fontWeight: typography.weight.bold },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { color: colors.text.primary, fontSize: typography.size.title, fontWeight: typography.weight.bold },
  subtitle: { color: colors.text.secondary, fontSize: typography.size.body, marginTop: 4 },
  statusBadge: { backgroundColor: colors.warning + '20', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  statusText: { color: colors.warning, fontWeight: typography.weight.bold },
  
  scroll: { padding: 24 },
  contentGrid: {
    flexDirection: 'row',
    gap: 24,
  },
  col: { flex: 1, gap: 24 },
  
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { color: colors.primary, fontSize: typography.size.sectionTitle, fontWeight: typography.weight.bold, marginBottom: 20, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 12 },
  
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.background, paddingBottom: 8 },
  infoLabel: { color: colors.text.secondary, fontSize: typography.size.body },
  infoValue: { color: colors.text.primary, fontSize: typography.size.body, fontWeight: typography.weight.semiBold, flex: 1, textAlign: 'right' },
  
  fileRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  fileName: { color: colors.text.primary },
  viewLink: { color: colors.primary, fontWeight: typography.weight.bold },
  
  sigImg: { width: '100%', height: 120, backgroundColor: colors.background, borderRadius: 8 },
  
  docGrid: { flexDirection: 'row', gap: 16 },
  docItem: { flex: 1 },
  docLabel: { color: colors.text.secondary, marginBottom: 8, fontSize: typography.size.instruction },
  docThumb: { width: '100%', aspectRatio: 1.58, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  docEmpty: { width: '100%', aspectRatio: 1.58, borderRadius: 8, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  emptyField: { color: colors.text.secondary, fontStyle: 'italic' },
  
  bioRow: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  selfieThumb: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: colors.border },
  scores: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  scoreBox: { alignItems: 'center', backgroundColor: colors.background, padding: 16, borderRadius: 12, flex: 1, marginHorizontal: 8 },
  scoreVal: { fontSize: typography.size.title, fontWeight: typography.weight.bold },
  scoreLabel: { color: colors.text.secondary, fontSize: typography.size.small, marginTop: 4 },

  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    padding: 24,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: {
    minWidth: 160,
  }
});

export default AgentDashboardScreen;
