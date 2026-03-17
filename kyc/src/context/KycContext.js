/**
 * KycContext — React Context for sharing KYC state across screens.
 *
 * Stores:
 *  - customerId: assigned by backend after POST /api/kyc/customer
 *  - personalInfo: form data from OCRPreviewScreen
 *  - uploadedDocuments: array of { type, documentId, uri }
 *  - selfieAsset: { uri, biometricId, facialScore, livenessScore }
 *  - uploadedFiles: array of { name, documentId } (utility bills)
 *  - signatureBase64: data URI from signature canvas
 */

import React, { createContext, useContext, useState } from 'react';

const KycContext = createContext(null);

export const KycProvider = ({ children }) => {
  const [customerId, setCustomerId] = useState(null);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [uploadedDocuments, setUploadedDocuments] = useState([]); // ID documents
  const [selfieAsset, setSelfieAsset] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);          // Utility bills
  const [signatureBase64, setSignatureBase64] = useState(null);

  /** Add or update a document in the uploadedDocuments list */
  const addDocument = (doc) => {
    setUploadedDocuments((prev) => {
      const idx = prev.findIndex((d) => d.type === doc.type);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = doc;
        return updated;
      }
      return [...prev, doc];
    });
  };

  /** Reset all state (e.g., after submission or restart) */
  const resetKyc = () => {
    setCustomerId(null);
    setPersonalInfo(null);
    setUploadedDocuments([]);
    setSelfieAsset(null);
    setUploadedFiles([]);
    setSignatureBase64(null);
  };

  return (
    <KycContext.Provider
      value={{
        customerId, setCustomerId,
        personalInfo, setPersonalInfo,
        uploadedDocuments, addDocument,
        selfieAsset, setSelfieAsset,
        uploadedFiles, setUploadedFiles,
        signatureBase64, setSignatureBase64,
        resetKyc,
      }}
    >
      {children}
    </KycContext.Provider>
  );
};

/** Hook to consume KycContext in any screen */
export const useKyc = () => {
  const ctx = useContext(KycContext);
  if (!ctx) throw new Error('useKyc must be used inside <KycProvider>');
  return ctx;
};

export default KycContext;
