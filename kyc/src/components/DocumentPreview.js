import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { buttonStyles } from '../theme/buttons';

const DocumentPreview = ({ photoUri, title, onRetake, onConfirm }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title || 'Document Preview'}</Text>
      
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: photoUri }} 
          style={styles.image} 
          resizeMode="contain" 
        />
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[buttonStyles.base, buttonStyles.secondary, styles.button]} 
          onPress={onRetake}
        >
          <Text style={buttonStyles.textSecondary}>Retake Photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[buttonStyles.base, buttonStyles.primary, styles.button]} 
          onPress={onConfirm}
        >
          <Text style={buttonStyles.textPrimary}>Confirm & Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: typography.size.sectionTitle,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: 24,
  },
  imageContainer: {
    width: '100%',
    flex: 1,
    maxHeight: 400,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: 32,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  button: {
    minWidth: 180,
  }
});

export default DocumentPreview;
