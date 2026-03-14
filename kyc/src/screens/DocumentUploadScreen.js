import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import StepIndicator from '../components/StepIndicator';
import ProgressLoader from '../components/ProgressLoader';
import { useKyc } from '../context/KycContext';
import { uploadDocument } from '../services/api';
import { Dimensions } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { buttonStyles } from '../theme/buttons';

const { width } = Dimensions.get('window');
const isTablet = width > 700;

const DocumentUploadScreen = () => {
  const router = useRouter();
  const { customerId, uploadedFiles, setUploadedFiles } = useKyc();

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'cancel' || result.canceled) return;

      const file = result.assets ? result.assets[0] : result;
      if (file.size > 10 * 1024 * 1024) {
        Alert.alert('File too large', 'Please select a file smaller than 10MB.');
        return;
      }

      setLoading(true);
      const res = await uploadDocument(
        customerId,
        'ProofOfAddress',
        { uri: file.uri, name: file.name, mimeType: file.mimeType },
        (pct) => setProgress(pct),
      );

      setUploadedFiles((prev) => [...prev, { name: file.name, documentId: res.documentId }]);
    } catch (err) {
      Alert.alert('Upload Failed', err.message || 'Could not upload the file.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleNext = () => {
    router.push('/signature');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <StepIndicator currentStep={5} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Proof of Address</Text>
          <Text style={styles.subtitle}>
            Upload a recent utility bill or bank statement (PDF, JPG, PNG). This step is optional but recommended.
          </Text>
        </View>

        {loading ? (
          <View style={styles.progressCard}>
            <ProgressLoader visible={true} progress={progress} label="Uploading Document..." />
          </View>
        ) : (
          <TouchableOpacity style={styles.dropzone} onPress={pickFile} activeOpacity={0.7}>
            <Text style={styles.dropzoneIcon}>📄</Text>
            <Text style={styles.dropzoneText}>Tap to select a file from your device</Text>
            <Text style={styles.dropzoneSubText}>Max size: 10MB</Text>
          </TouchableOpacity>
        )}

        {uploadedFiles.length > 0 && (
          <View style={styles.filesList}>
            <Text style={styles.listTitle}>Uploaded Files:</Text>
            {uploadedFiles.map((f, i) => (
              <View key={i} style={styles.fileItem}>
                <Text style={styles.fileIcon}>✓</Text>
                <Text style={styles.fileName} numberOfLines={1}>{f.name}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[buttonStyles.base, buttonStyles.secondary, styles.skipBtn]} onPress={handleNext}>
          <Text style={buttonStyles.textSecondary}>Skip for now</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[buttonStyles.base, buttonStyles.primary, styles.nextBtn]} onPress={handleNext}>
           <Text style={buttonStyles.textPrimary}>Next Step →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 32, flexGrow: 1, alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 40, width: '100%', maxWidth: 600 },
  title: { color: colors.text.primary, fontSize: typography.size.title, fontWeight: typography.weight.bold, marginBottom: 12 },
  subtitle: { color: colors.text.secondary, fontSize: typography.size.body, textAlign: 'center', lineHeight: 24 },
  
  dropzone: {
    width: '100%', maxWidth: 600, height: 200,
    backgroundColor: colors.surface,
    borderWidth: 2, borderColor: colors.primary, borderStyle: 'dashed',
    borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    marginBottom: 32,
  },
  dropzoneIcon: { fontSize: 48, marginBottom: 16 },
  dropzoneText: { color: colors.primary, fontSize: typography.size.button, fontWeight: typography.weight.bold, marginBottom: 8 },
  dropzoneSubText: { color: colors.text.secondary, fontSize: typography.size.instruction },
  
  progressCard: { width: '100%', maxWidth: 600, padding: 32, backgroundColor: colors.surface, borderRadius: 16, marginBottom: 32 },
  
  filesList: { width: '100%', maxWidth: 600, backgroundColor: colors.surface, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: colors.border },
  listTitle: { color: colors.text.primary, fontSize: typography.size.body, fontWeight: typography.weight.bold, marginBottom: 16 },
  fileItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  fileIcon: { color: colors.success, fontSize: typography.size.body, marginRight: 12, fontWeight: typography.weight.bold },
  fileName: { color: colors.text.primary, fontSize: typography.size.body, flex: 1 },
  
  footer: {
    flexDirection: isTablet ? 'row' : 'column-reverse', 
    justifyContent: isTablet ? 'space-between' : 'center',
    alignItems: 'center',
    gap: isTablet ? 0 : 16,
    padding: isTablet ? 24 : 16,
    paddingHorizontal: isTablet ? 32 : 16, 
    backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  skipBtn: {
    flex: isTablet ? 0 : 1,
    width: isTablet ? 'auto' : '100%',
  },
  nextBtn: {
    flex: isTablet ? 0 : 2,
    width: isTablet ? 'auto' : '100%',
  },
});

export default DocumentUploadScreen;
