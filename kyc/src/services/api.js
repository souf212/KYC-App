/**
 * KYC API Service
 * Native fetch-based HTTP client for all KYC backend endpoints.
 * (Replaced Axios with fetch to avoid Android network restrictions)
 *
 * BASE_URL for physical devices on WiFi uses the machine's LAN IP (e.g. 192.168.x.x).
 */

const API_BASE_URL = 'http://192.168.11.166:5283/api/kyc';
const API_TIMEOUT = 30000; // 30 seconds

// ─── Helper: Fetch with Timeout ──────────────────────────────────────────────
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
};

// ─── Helper: Handle Fetch Errors ────────────────────────────────────────────
const handleFetchError = (error) => {
  let message = error.message;
  if (error.name === 'AbortError') {
    message = `Network Timeout: Request took longer than ${API_TIMEOUT}ms`;
  } else if (!navigator.onLine) {
    message = `Network Error: Cannot connect to backend at ${API_BASE_URL}. Ensure the .NET server is running on port 5283 and your device is on the same WiFi.`;
  } else {
    message = `Network Error: Cannot connect to backend at ${API_BASE_URL}. Ensure the .NET server is running on port 5283 and your device is on the same WiFi.`;
  }
  console.error('[API Error]', message);
  return new Error(message);
};

// ─── API Functions ──────────────────────────────────────────────────────────

/**
 * POST /api/kyc/customer
 * Register personal info. Returns { customerId, status, message }.
 */
export const createCustomer = async (personalInfo) => {
  try {
    console.log(`[API] POST ${API_BASE_URL}/customer`);
    const response = await fetchWithTimeout(`${API_BASE_URL}/customer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(personalInfo),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw handleFetchError(error);
  }
};

/**
 * POST /api/kyc/document
 * Upload a scanned document (CIN, Passport, utility bill).
 * @param {number} customerId
 * @param {string} type - CIN_Front | CIN_Back | Passport | UtilityBill | ProofOfAddress
 * @param {object} fileAsset - { uri, name, mimeType } from expo-image-picker or expo-document-picker
 */
export const uploadDocument = async (customerId, type, fileAsset, onUploadProgress) => {
  try {
    console.log(`[API] POST ${API_BASE_URL}/document`);
    const formData = new FormData();
    formData.append('customerId', String(customerId));
    formData.append('type', type);
    formData.append('file', {
      uri: fileAsset.uri,
      name: fileAsset.name || `document_${Date.now()}.jpg`,
      type: fileAsset.mimeType || 'image/jpeg',
    });

    const response = await fetchWithTimeout(`${API_BASE_URL}/document`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw handleFetchError(error);
  }
};

/**
 * POST /api/kyc/selfie
 * Upload a selfie photo for facial verification.
 * @param {number} customerId
 * @param {object} photoAsset - { uri, mimeType } from expo-camera
 */
export const uploadSelfie = async (customerId, photoAsset, onUploadProgress) => {
  try {
    console.log(`[API] POST ${API_BASE_URL}/selfie`);
    const formData = new FormData();
    formData.append('customerId', String(customerId));
    formData.append('file', {
      uri: photoAsset.uri,
      name: `selfie_${Date.now()}.jpg`,
      type: photoAsset.mimeType || 'image/jpeg',
    });

    const response = await fetchWithTimeout(`${API_BASE_URL}/selfie`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw handleFetchError(error);
  }
};

/**
 * POST /api/kyc/signature
 * Upload a base64-encoded signature image.
 * @param {number} customerId
 * @param {string} signatureBase64 - Data URI from react-native-signature-canvas (data:image/png;base64,...)
 */
export const uploadSignature = async (customerId, signatureBase64) => {
  try {
    console.log(`[API] POST ${API_BASE_URL}/signature`);
    const formData = new FormData();
    formData.append('customerId', String(customerId));
    formData.append('signatureBase64', signatureBase64);

    const response = await fetchWithTimeout(`${API_BASE_URL}/signature`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw handleFetchError(error);
  }
};

/**
 * POST /api/kyc/submit
 * Finalize KYC dossier. Returns { customerId, status, decision, message }.
 * @param {number} customerId
 */
export const submitDossier = async (customerId) => {
  try {
    console.log(`[API] POST ${API_BASE_URL}/submit`);
    const response = await fetchWithTimeout(`${API_BASE_URL}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw handleFetchError(error);
  }
};

export default {
  createCustomer,
  uploadDocument,
  uploadSelfie,
  uploadSignature,
  submitDossier,
};

