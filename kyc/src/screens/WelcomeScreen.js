/**
 * WelcomeScreen — Step 1 of 6
 * Landing page for the Digital Counter Terminal.
 */

import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { useKyc } from '../context/KycContext';
import StepIndicator from '../components/StepIndicator';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { buttonStyles } from '../theme/buttons';

const { width } = Dimensions.get('window');
const isTablet = width > 700;

const WelcomeScreen = () => {
  const router = useRouter();
  const { resetKyc } = useKyc();

  // Reset KYC state when arriving at the welcome screen
  useEffect(() => {
    resetKyc();
  }, [resetKyc]);

  const slideAnim = useRef(new Animated.Value(30)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  // Animate on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <StepIndicator currentStep={1} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[
          styles.mainCard, 
          { 
            opacity: fadeAnim, 
            transform: [{ translateY: slideAnim }] 
          }
        ]}>
          <View style={styles.headerSection}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>NX</Text>
            </View>
            <Text style={styles.bankName}>NexBank Digital</Text>
            <Text style={styles.title}>Welcome to Easy Onboarding</Text>
            <Text style={styles.subtitle}>
              Open your banking account in just a few minutes using our secure digital terminal.
            </Text>
          </View>

          {/* Steps Overview (What you will need) */}
          <View style={styles.stepsOverviewBox}>
            <Text style={styles.overviewTitle}>What you will need</Text>
            
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <View style={styles.iconCircle}>
                  <Text style={styles.featureIcon}>🪪</Text>
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>ID Document</Text>
                  <Text style={styles.featureDesc}>Physical ID Card or Passport</Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.iconCircle}>
                  <Text style={styles.featureIcon}>🤳</Text>
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Facial Scan</Text>
                  <Text style={styles.featureDesc}>Quick liveness selfie</Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.iconCircle}>
                  <Text style={styles.featureIcon}>✍️</Text>
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>Digital Signature</Text>
                  <Text style={styles.featureDesc}>Sign directly on screen</Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[buttonStyles.base, buttonStyles.primary, styles.btn]}
            activeOpacity={0.8}
            onPress={() => router.push('/document-scan')}
          >
            <Text style={buttonStyles.textPrimary}>Start My Application →</Text>
          </TouchableOpacity>
          
          <View style={styles.footerInfo}>
             <Text style={styles.footerIcon}>🔒</Text>
             <Text style={styles.footerText}>
               Your personal data is encrypted and securely processed.
             </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: isTablet ? 40 : 20,
  },
  mainCard: {
    backgroundColor: colors.surface,
    padding: isTablet ? 48 : 24,
    borderRadius: 32,
    width: '100%',
    maxWidth: isTablet ? 800 : '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.05,
    shadowRadius: 32,
    elevation: 8,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoBadgeText: {
    fontSize: typography.size.sectionTitle,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  bankName: {
    color: colors.primary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  title: {
    color: colors.text.primary,
    fontSize: isTablet ? 42 : 32,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: isTablet ? typography.size.button : typography.size.body,
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: 500,
  },
  stepsOverviewBox: {
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: isTablet ? 32 : 24,
    width: '100%',
    marginBottom: 40,
  },
  overviewTitle: {
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.button,
    marginBottom: 24,
  },
  featureList: {
    flexDirection: isTablet ? 'row' : 'column',
    justifyContent: 'space-between',
    gap: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    color: colors.text.primary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.body,
    marginBottom: 4,
  },
  featureDesc: {
    color: colors.text.secondary,
    fontSize: typography.size.instruction,
    lineHeight: 20,
  },
  btn: {
    width: isTablet ? '70%' : '100%',
    paddingVertical: 20,
    borderRadius: 100, // pill shape for a more premium look
    marginBottom: 32,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerIcon: {
    fontSize: 14,
  },
  footerText: {
    color: colors.text.secondary,
    fontSize: typography.size.small,
    fontWeight: typography.weight.medium,
  },
});

export default WelcomeScreen;
