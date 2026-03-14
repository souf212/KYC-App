import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// For Tablet Landscape mainly:
// ID Card is roughly 3.375 x 2.125 aspect ratio (1.58)
const CARD_WIDTH = width * 0.5;
const CARD_HEIGHT = CARD_WIDTH / 1.58;

const OVAL_WIDTH = width * 0.4;
const OVAL_HEIGHT = OVAL_WIDTH * 1.35;

const CameraOverlay = ({ type = 'id-card', hintText }) => {
  const isCard = type === 'id-card';

  return (
    <View style={styles.overlayContainer} pointerEvents="none">
      <View style={styles.darkBackground} />

      <View style={styles.cutoutContainer}>
        {isCard ? (
          <View style={[styles.cardFrame, { width: CARD_WIDTH, height: CARD_HEIGHT }]}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        ) : (
          <View style={[styles.ovalFrame, { width: OVAL_WIDTH, height: OVAL_HEIGHT }]} />
        )}
      </View>

      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>{hintText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  darkBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  cutoutContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFrame: {
    borderWidth: 2,
    borderColor: 'transparent', // The corners will provide the visual guide
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  ovalFrame: {
    borderWidth: 4,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    borderRadius: OVAL_HEIGHT / 2, // making it an oval
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#3B82F6',
    borderWidth: 0,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 5,
    borderLeftWidth: 5,
    borderTopLeftRadius: 10,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderBottomRightRadius: 10,
  },
  hintContainer: {
    position: 'absolute',
    bottom: height * 0.15, // 15% from bottom
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
  },
  hintText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CameraOverlay;
