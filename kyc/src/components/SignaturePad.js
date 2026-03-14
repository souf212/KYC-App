import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { buttonStyles } from '../theme/buttons';

const SignaturePad = ({ onConfirmSignature, onBegin, onEnd }) => {
  const sigRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [previewBase64, setPreviewBase64] = useState(null);

  const handleSignature = (signature) => {
    // Signature is a Base64 string of the image
    setPreviewBase64(signature);
  };

  const handleClear = () => {
    sigRef.current?.clearSignature();
    setIsEmpty(true);
    setPreviewBase64(null);
    if (onEnd) onEnd();
  };

  const handleDone = () => {
    if (isEmpty) return;
    sigRef.current?.readSignature(); // Triggers handleSignature via onOK
  };

  const submitSignature = () => {
    if (previewBase64) {
      onConfirmSignature(previewBase64);
    }
  };

  return (
    <View style={styles.container}>
      {previewBase64 ? (
        <View style={styles.previewContainer}>
          <Image 
            source={{ uri: previewBase64 }} 
            style={styles.previewImage} 
            resizeMode="contain" 
          />
          <Text style={styles.previewText}>Signature Preview</Text>
        </View>
      ) : (
        <View style={styles.padContainer}>
          <SignatureCanvas
            ref={sigRef}
            onBegin={() => {
              setIsEmpty(false);
              if (onBegin) onBegin();
            }}
            onEnd={() => {
              if (onEnd) onEnd();
            }}
            onOK={handleSignature}
            onEmpty={() => setIsEmpty(true)}
            descriptionText=""
            clearText="Clear"
            confirmText="Save"
            autoClear={false}
            imageType="image/png"
            backgroundColor={colors.surface}
            penColor={colors.primary}
            style={styles.signature}
            webStyle={`
              .m-signature-pad { box-shadow: none; border: none; }
              .m-signature-pad--body { border: 2px dashed ${colors.border}; border-radius: 12px; }
              .m-signature-pad--footer { display: none; }
            `}
          />
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[buttonStyles.base, buttonStyles.secondary, styles.button]} 
          onPress={handleClear}
          disabled={isEmpty && !previewBase64}
        >
          <Text style={buttonStyles.textSecondary}>Clear</Text>
        </TouchableOpacity>

        {previewBase64 ? (
          <TouchableOpacity 
            style={[buttonStyles.base, buttonStyles.primary, styles.button]} 
            onPress={submitSignature}
          >
            <Text style={buttonStyles.textPrimary}>Confirm Signature</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[buttonStyles.base, buttonStyles.primary, styles.button, isEmpty && buttonStyles.disabled]} 
            onPress={handleDone}
            disabled={isEmpty}
          >
            <Text style={buttonStyles.textPrimary}>View Preview</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  padContainer: {
    flex: 1,
    minHeight: 300,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  signature: {
    flex: 1,
  },
  previewContainer: {
    flex: 1,
    minHeight: 300,
    backgroundColor: colors.surface,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    marginBottom: 24,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewText: {
    position: 'absolute',
    bottom: 16,
    color: colors.text.secondary,
    fontSize: typography.size.instruction,
    fontWeight: typography.weight.medium,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  button: {
    minWidth: 160,
  }
});

export default SignaturePad;
