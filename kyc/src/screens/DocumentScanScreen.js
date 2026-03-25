import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';
import StepIndicator from '../components/StepIndicator';
import ProgressLoader from '../components/ProgressLoader';
import CameraCapture from '../components/CameraCapture';
import DocumentPreview from '../components/DocumentPreview';
import { useKyc } from '../context/KycContext';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { buttonStyles } from '../theme/buttons';

const { width } = Dimensions.get('window');
const isTablet = width > 700;

const SIDES = { FRONT: 'cin_front', BACK: 'cin_back' };

const DocumentScanScreen = () => {
  const router = useRouter();
  const { addDocument, uploadedDocuments } = useKyc();

  const [docType, setDocType] = useState(null); // 'cin' | 'passport'
  const [currentSide, setCurrentSide] = useState(SIDES.FRONT);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Temporary state for the currently captured photo before confirming
  const [tempPhoto, setTempPhoto] = useState(null);

  const hasFront = uploadedDocuments.some(d => d.type === SIDES.FRONT);
  const hasBack = uploadedDocuments.some(d => d.type === SIDES.BACK);
  const isComplete = docType === 'passport' ? hasFront : (hasFront && hasBack);

  if (docType && isComplete && currentSide !== 'done') setCurrentSide('done');
  if (docType === 'cin' && hasFront && !hasBack && currentSide === SIDES.FRONT) setCurrentSide(SIDES.BACK);

  const handleCapture = (photo) => {
    setTempPhoto(photo);
  };

  const confirmPhoto = async () => {
    if (!tempPhoto) return;
    setLoading(true);
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 800));

      addDocument({
        type: currentSide,
        documentId: `local_${Date.now()}`,
        uri: tempPhoto.uri,
      });
      setTempPhoto(null);
    } catch (err) {
      Alert.alert('Upload Failed', err.message || 'Cannot upload document at this time.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const retakePhoto = () => {
    setTempPhoto(null);
  };

  const frontImg = uploadedDocuments.find(d => d.type === SIDES.FRONT)?.uri;
  const backImg = uploadedDocuments.find(d => d.type === SIDES.BACK)?.uri;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <StepIndicator currentStep={2} />

      <ScrollView style={styles.contentScrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Scan Identity Document</Text>
          <Text style={styles.subtitle}>
            Please select your document type and follow the instructions to capture it.
          </Text>
        </View>

        <View style={styles.mainLayout}>
          
          <View style={styles.cameraBox}>
            {!docType ? (
              <View style={[styles.cameraFlex, styles.centered, { backgroundColor: colors.surface }]}>
                <Text style={[styles.title, { fontSize: typography.size.sectionTitle, marginBottom: 8 }]}>Select Document Type</Text>
                <Text style={styles.subtitle}>Choose the type of ID you will be scanning today.</Text>
                
                <View style={[styles.selectionRow, { flexDirection: isTablet ? 'row' : 'column' }]}>
                  <TouchableOpacity 
                    style={[buttonStyles.base, buttonStyles.secondary, styles.selectionBtn]} 
                    onPress={() => setDocType('cin')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.selectionIcon}>🪪</Text>
                    <Text style={buttonStyles.textSecondary}>National ID Card</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[buttonStyles.base, buttonStyles.secondary, styles.selectionBtn]} 
                    onPress={() => setDocType('passport')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.selectionIcon}>🛂</Text>
                    <Text style={buttonStyles.textSecondary}>Passport</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : isComplete ? (
              <View style={[styles.cameraFlex, styles.centered, { backgroundColor: colors.surface }]}>
                <Text style={{ fontSize: 64, marginBottom: 16 }}>✅</Text>
                <Text style={[styles.title, { fontSize: typography.size.title, color: colors.success }]}>Scan Complete</Text>
                <Text style={styles.subtitle}>Your document has been securely saved.</Text>
              </View>
            ) : loading ? (
              <View style={[styles.cameraFlex, styles.centered, { backgroundColor: colors.surface }]}>
                <ProgressLoader visible={loading} progress={progress} label={`Uploading ${currentSide === SIDES.FRONT ? 'Front' : 'Back'} side...`} />
              </View>
            ) : tempPhoto ? (
              <DocumentPreview 
                photoUri={tempPhoto.uri} 
                title={`${currentSide === SIDES.FRONT ? (docType === 'passport' ? 'Data Page' : 'Front') : 'Back'} Side Preview`}
                onRetake={retakePhoto}
                onConfirm={confirmPhoto}
              />
            ) : (
              <CameraCapture 
                type="id-card" 
                hintText={`Align ${currentSide === SIDES.FRONT ? (docType === 'passport' ? 'Passport Data Page' : 'Front of ID') : 'Back of ID'} inside frame`} 
                onCapture={handleCapture}
              />
            )}
          </View>

          <View style={styles.sidePanel}>
            
            <View style={styles.instructionCard}>
              <Text style={styles.cardHeader}>Capturing Guidelines</Text>
              <Text style={styles.cardBullet}>• Place document on a flat, dark surface.</Text>
              <Text style={styles.cardBullet}>• Ensure all 4 corners are visible.</Text>
              <Text style={styles.cardBullet}>• Avoid overhead lighting glare.</Text>
            </View>

            <View style={styles.previewBox}>
              <Text style={styles.previewTitle}>Captured Documents</Text>
              <View style={styles.thumbnailsRow}>
                <View style={styles.thumbWrapper}>
                  <Text style={styles.thumbLabel}>{docType === 'passport' ? 'Data Page' : 'Front Side'}</Text>
                  <View style={styles.thumbnail}>
                    {frontImg ? (
                      <Image source={{ uri: frontImg }} style={styles.img} />
                    ) : (
                      <Text style={styles.thumbWait}>Waiting...</Text>
                    )}
                  </View>
                </View>

                {docType !== 'passport' && (
                  <View style={styles.thumbWrapper}>
                    <Text style={styles.thumbLabel}>Back Side</Text>
                    <View style={styles.thumbnail}>
                      {backImg ? (
                        <Image source={{ uri: backImg }} style={styles.img} />
                      ) : (
                        <Text style={styles.thumbWait}>Waiting...</Text>
                      )}
                    </View>
                  </View>
                )}
              </View>
              
              {/* Add a button to reset selection if they chose the wrong ID type */}
              {docType && !isComplete && !tempPhoto && !loading && (
                 <TouchableOpacity 
                   style={{ marginTop: 24, alignSelf: 'center' }} 
                   onPress={() => setDocType(null)}
                 >
                   <Text style={{ color: colors.primary, fontWeight: typography.weight.bold }}>Change Document Type</Text>
                 </TouchableOpacity>
              )}
            </View>

            <View style={styles.actionBlock}>
              {isComplete && (
                <TouchableOpacity
                  style={[buttonStyles.base, buttonStyles.primary, styles.btn]}
                  onPress={() => router.push('/ocr-preview')}
                >
                  <Text style={buttonStyles.textPrimary}>Extract Document Data →</Text>
                </TouchableOpacity>
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
    minHeight: isTablet ? 'auto' : 300, 
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
  selectionRow: {
    gap: 24,
    marginTop: 32,
    width: '100%',
    maxWidth: 600,
  },
  selectionBtn: {
    flex: 1,
    height: 140,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  selectionIcon: {
    fontSize: 48,
    marginBottom: 12,
  },

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
  cardHeader: { color: colors.primary, fontSize: typography.size.button, fontWeight: typography.weight.bold, marginBottom: 12 },
  cardBullet: { color: colors.text.secondary, fontSize: typography.size.body, marginBottom: 8, lineHeight: 22 },

  previewBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
  },
  previewTitle: { color: colors.text.primary, fontSize: typography.size.body, fontWeight: typography.weight.bold, marginBottom: 16 },
  thumbnailsRow: { flexDirection: 'row', gap: 16, flex: 1 },
  thumbWrapper: { flex: 1, alignItems: 'center' },
  thumbLabel: { color: colors.text.secondary, fontSize: typography.size.instruction, marginBottom: 8, fontWeight: typography.weight.semiBold },
  thumbnail: {
    width: '100%',
    aspectRatio: 1.58,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  thumbWait: { color: colors.text.secondary, fontSize: typography.size.small, fontStyle: 'italic' },
  img: { width: '100%', height: '100%', resizeMode: 'cover' },

  actionBlock: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  btn: {
    width: '100%',
  },
});

export default DocumentScanScreen;
