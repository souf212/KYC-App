import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { buttonStyles } from '../theme/buttons';
import * as ImageManipulator from 'expo-image-manipulator';
import CameraOverlay from './CameraOverlay';

const CameraCapture = ({ type = 'id-card', hintText, onCapture }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          {permission.canAskAgain 
            ? 'We need your permission to show the camera' 
            : 'Camera access denied. Please enable it in Settings.'}
        </Text>
        <TouchableOpacity 
          style={[buttonStyles.base, buttonStyles.primary]} 
          onPress={() => {
            if (permission.canAskAgain) {
              requestPermission();
            } else {
              import('expo-linking').then(Linking => Linking.openSettings());
            }
          }}
        >
          <Text style={buttonStyles.textPrimary}>
            {permission.canAskAgain ? 'Grant permission' : 'Open Settings'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (cameraRef.current && !isCapturing) {
      setIsCapturing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          base64: false,
        });

        // Vigorously compress image using expo-image-manipulator to beat 1MB OCR limit
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 800 } }],
          { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );

        onCapture(manipulatedImage);
      } catch (e) {
        console.error('Capture error', e);
      } finally {
        setIsCapturing(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing={type === 'face' || type === 'oval-face' ? 'front' : 'back'}
        ref={cameraRef}
      >
        <CameraOverlay type={type} hintText={hintText} />
        
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.captureButton} 
            onPress={handleCapture}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <ActivityIndicator color={colors.primary} size="large" />
            ) : (
              <View style={styles.captureInner} />
            )}
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    overflow: 'hidden',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: typography.size.body,
    color: colors.text.primary,
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 100,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
  },
});

export default CameraCapture;
