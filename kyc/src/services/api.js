/**
 * KYC API Service
 * Axios-based HTTP client for all KYC backend endpoints.
 *
 * BASE_URL uses 10.0.2.2 which is the Android Emulator's alias for the host machine's localhost.
 * For physical devices on same WiFi, replace with your machine's LAN IP (e.g. 192.168.x.x).
 */

import axios from 'axios';

// ─── Axios Instance ────────────────────────────────────────────────────────────
const api = axios.create({
  // Pour appareil physique (Expo Go) : IP LAN du PC
  // Port 5283 = port HTTP configuré dans Properties/launchSettings.json
  baseURL: 'http://192.168.11.130:5283/api/kyc',
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
});

// Request interceptor — log outgoing requests in development
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — log errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = error.response?.data?.error || error.message;
    if (!error.response) {
      message = `Network Error: Cannot connect to backend at ${api.defaults.baseURL}. Ensure the .NET server is running on port 5283 and your device is on the same WiFi.`;
    }
    console.error('[API Error]', message, error.response?.status);
    return Promise.reject(new Error(message));
  },
);

// ─── API Functions ─────────────────────────────────────────────────────────────

/**
 * POST /api/kyc/customer
 * Register personal info. Returns { customerId, status, message }.
 */
export const createCustomer = async (personalInfo) => {
  const response = await api.post('/customer', personalInfo, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

/**
 * POST /api/kyc/document
 * Upload a scanned document (CIN, Passport, utility bill).
 * @param {number} customerId
 * @param {string} type - CIN_Front | CIN_Back | Passport | UtilityBill | ProofOfAddress
 * @param {object} fileAsset - { uri, name, mimeType } from expo-image-picker or expo-document-picker
 */
export const uploadDocument = async (customerId, type, fileAsset, onUploadProgress) => {
  const formData = new FormData();
  formData.append('customerId', String(customerId));
  formData.append('type', type);
  formData.append('file', {
    uri: fileAsset.uri,
    name: fileAsset.name || `document_${Date.now()}.jpg`,
    type: fileAsset.mimeType || 'image/jpeg',
  });

  const response = await api.post('/document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(pct);
      }
    },
  });
  return response.data;
};

/**
 * POST /api/kyc/selfie
 * Upload a selfie photo for facial verification.
 * @param {number} customerId
 * @param {object} photoAsset - { uri, mimeType } from expo-camera
 */
export const uploadSelfie = async (customerId, photoAsset, onUploadProgress) => {
  const formData = new FormData();
  formData.append('customerId', String(customerId));
  formData.append('file', {
    uri: photoAsset.uri,
    name: `selfie_${Date.now()}.jpg`,
    type: photoAsset.mimeType || 'image/jpeg',
  });

  const response = await api.post('/selfie', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(pct);
      }
    },
  });
  return response.data;
};

/**
 * POST /api/kyc/signature
 * Upload a base64-encoded signature image.
 * @param {number} customerId
 * @param {string} signatureBase64 - Data URI from react-native-signature-canvas (data:image/png;base64,...)
 */
export const uploadSignature = async (customerId, signatureBase64) => {
  const formData = new FormData();
  formData.append('customerId', String(customerId));
  formData.append('signatureBase64', signatureBase64);

  const response = await api.post('/signature', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * POST /api/kyc/submit
 * Finalize KYC dossier. Returns { customerId, status, decision, message }.
 * @param {number} customerId
 */
export const submitDossier = async (customerId) => {
  const response = await api.post('/submit', { customerId }, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

export default api;
