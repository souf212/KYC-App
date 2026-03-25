/**
 * UploadProgress Component
 * Displays an animated progress bar during file uploads.
 *
 * Props:
 *   - visible (bool)   : whether the overlay is shown
 *   - progress (0-100) : upload percentage
 *   - label (string)   : current step label (e.g. "Uploading CIN...")
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

const UploadProgress = ({ visible, progress = 0, label = 'Uploading...' }) => {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in/out
    Animated.timing(opacityAnim, {
      toValue: visible ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [visible, opacityAnim]);

  useEffect(() => {
    // Smooth progress bar width animation
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress, widthAnim]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
      <View style={styles.card}>
        <Text style={styles.label}>{label}</Text>

        {/* Progress bar track */}
        <View style={styles.track}>
          <Animated.View
            style={[
              styles.fill,
              {
                width: widthAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          />
        </View>

        <Text style={styles.pct}>{Math.round(progress)}%</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 15, 40, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  card: {
    width: '78%',
    backgroundColor: '#1A2244',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 179, 255, 0.25)',
  },
  label: {
    color: '#CBD5E1',
    fontSize: 15,
    marginBottom: 18,
    fontFamily: 'System',
    textAlign: 'center',
  },
  track: {
    width: '100%',
    height: 8,
    backgroundColor: '#2D3A5A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  pct: {
    color: '#3B82F6',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 14,
  },
});

export default UploadProgress;
