import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const { width } = Dimensions.get('window');

const STEPS = [
  { id: 1, title: 'Welcome' },
  { id: 2, title: 'Personal Info' },
  { id: 3, title: 'Scan ID' },
  { id: 4, title: 'Face Verify' },
  { id: 5, title: 'Address' },
  { id: 6, title: 'Signature' },
  { id: 7, title: 'Review' },
];

const StepIndicator = ({ currentStep }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate overall progress bar
    const progressPct = ((currentStep - 1) / (STEPS.length - 1)) * 100;
    Animated.timing(progressAnim, {
      toValue: progressPct,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const estimatedProgress = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.stepTitle}>
          Step {currentStep} of {STEPS.length}
        </Text>
        <Text style={styles.completionText}>
          {estimatedProgress}% Completed
        </Text>
      </View>

      <View style={styles.progressBarBackground}>
        <Animated.View 
          style={[
            styles.progressBarFill, 
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%']
              })
            }
          ]} 
        />
      </View>

      <View style={styles.stepsWrapper}>
        {STEPS.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isPending = step.id > currentStep;

          return (
             <View key={step.id} style={styles.stepContainer}>
               {/* Circle */}
               <View style={[
                 styles.circle,
                 isActive ? styles.activeCircle : isCompleted ? styles.completedCircle : styles.pendingCircle
               ]}>
                 <Text style={[
                   styles.stepText,
                   (isActive || isCompleted) ? styles.activeStepText : styles.pendingStepText
                 ]}>
                   {isCompleted ? '✓' : step.id}
                 </Text>
               </View>
               
               {/* Label */}
               <Text style={[
                 styles.labelText,
                 isActive ? styles.activeLabel : isCompleted ? styles.completedLabel : styles.pendingLabel
               ]} numberOfLines={2}>
                 {step.title}
               </Text>
             </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width > 800 ? '90%' : '100%',
    maxWidth: 1000,
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
  },
  completionText: {
    fontSize: typography.size.instruction,
    fontWeight: typography.weight.medium,
    color: colors.text.secondary,
  },
  progressBarBackground: {
    width: width > 800 ? '90%' : '100%',
    maxWidth: 1000,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  stepsWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: width > 800 ? '90%' : '100%',
    maxWidth: 1000,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 2,
    marginBottom: 8,
    backgroundColor: colors.background,
  },
  completedCircle: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  activeCircle: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pendingCircle: {
    backgroundColor: colors.border,
    borderColor: colors.border,
  },
  stepText: {
    fontSize: typography.size.instruction,
    fontWeight: typography.weight.bold,
  },
  activeStepText: {
    color: colors.text.inverse,
  },
  pendingStepText: {
    color: colors.text.secondary,
  },
  labelText: {
    textAlign: 'center',
    fontSize: typography.size.small,
  },
  completedLabel: {
    color: colors.success,
    fontWeight: typography.weight.semiBold,
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: typography.weight.bold,
  },
  pendingLabel: {
    color: colors.text.secondary,
    fontWeight: typography.weight.medium,
  },
});

export default StepIndicator;
