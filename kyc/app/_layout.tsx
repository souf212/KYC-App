/**
 * Root Layout — Expo Router entry point.
 * Wraps the entire app in KycProvider so all screens share KYC state.
 * Defines the full KYC navigation stack.
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { KycProvider } from '../src/context/KycContext';
import { colors } from '../src/theme/colors';

export default function RootLayout() {
  return (
    <KycProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.primary,
          headerTitleStyle: { fontWeight: '700' },
          headerBackTitle: '',
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
        }}
      >
        {/* KYC Onboarding Flow */}
        <Stack.Screen name="index"           options={{ headerShown: false }} />
        <Stack.Screen name="personal-info"   options={{ title: 'Personal Information' }} />
        <Stack.Screen name="document-scan"   options={{ title: 'Identity Documentation', headerBackVisible: true }} />
        <Stack.Screen name="selfie"          options={{ title: 'Selfie Verification', headerBackVisible: true }} />
        <Stack.Screen name="document-upload" options={{ title: 'Upload Proofs', headerBackVisible: true }} />
        <Stack.Screen name="signature"       options={{ title: 'Digital Signature', headerBackVisible: true }} />
        <Stack.Screen name="review"          options={{ title: 'Review & Submit', headerBackVisible: true }} />
        <Stack.Screen name="agent"           options={{ headerShown: false }} />
        {/* original screens preserved */}
        <Stack.Screen name="(tabs)"          options={{ headerShown: false }} />
        <Stack.Screen name="modal"           options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="dark" />
    </KycProvider>
  );
}
