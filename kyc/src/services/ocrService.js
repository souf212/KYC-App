/**
 * OCR Service
 * Integrates with OCR.space free API for text extraction
 * and provides a robust RegExp parser for Moroccan CINs.
 */

export const extractTextFromImage = async (imageUri) => {
  const formData = new FormData();
  // Using free API key. Rate limited to 500 requests / day.
  // In production, integrate your .NET Backend OCR or Google Cloud Vision here.
  formData.append('apikey', 'helloworld'); 
  formData.append('language', 'fre'); // French model
  formData.append('isOverlayRequired', 'false');
  formData.append('ocrengine', '2'); // Engine 2 is better for special characters
  
  formData.append('file', {
    uri: imageUri,
    name: `doc_${Date.now()}.jpg`,
    type: 'image/jpeg'
  });

  try {
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = await response.json();
    if (result.IsErroredOnProcessing) {
      throw new Error(result.ErrorMessage[0]);
    }
    const parsedText = result.ParsedResults?.[0]?.ParsedText || '';
    console.log('[OCR Service] Raw Extracted Text:\n--- START ---\n' + parsedText + '\n--- END ---');
    return parsedText;
  } catch (error) {
    console.warn('[OCR Service] Error extracting text:', error);
    throw new Error('OCR text recognition failed. ' + error.message);
  }
};

export const parseMoroccanCIN = (textFront = '', textBack = '') => {
  const data = {
    cin: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    cityOfBirth: '',
    gender: '',
    address: '',
    nationality: 'MAR',
    phone: '', // Needs to be entered manually
  };

  const fullText = (textFront + '\n' + textBack).replace(/\r/g, '');
  
  // 1. CIN Number: 1 or 2 uppercase letters followed by 4 to 6 digits (e.g., SA29163)
  const cinMatch = fullText.match(/\b([A-Z]{1,2}\d{4,6})\b/);
  if (cinMatch) data.cin = cinMatch[1];
  
  // 2. Date of Birth: Match any DD.MM.YYYY or DD/MM/YYYY (first date found is usually DOB)
  // Moroccan CIN date is Day/Month/Year
  const dobMatch = fullText.match(/\b(\d{2})[\.\/\-](\d{2})[\.\/\-](\d{4})\b/);
  if (dobMatch) {
    // dobMatch[1] is DD, dobMatch[2] is MM, dobMatch[3] is YYYY
    // Target format: YYYY-MM-DD
    data.birthDate = `${dobMatch[3]}-${dobMatch[2]}-${dobMatch[1]}`;
  }
  
  // 3. City of birth: "à NADOR"
  const pobMatch = fullText.match(/[aà]\s+([A-Z\s\-]+?)(?:\s*(?:Valable|Sexe|$|\n))/i);
  if (pobMatch) data.cityOfBirth = pobMatch[1].trim();

  // 4. Gender: "Sexe M" or "Sexe F"
  const genderMatch = fullText.match(/Sexe\s*([MF])/i);
  if (genderMatch) data.gender = genderMatch[1].toUpperCase();
  
  // 5. Address (from the back) - e.g. "Adresse QUARTIER OUAHDANA BENI ENSAR"
  const addressMatch = fullText.match(/Adresse\s+([A-Z\s\d\-]+)/i);
  if (addressMatch) data.address = addressMatch[1].trim();

  // 6. Names extraction (Heuristic approach)
  // Usually the lines exactly above "Né le" are Last Name and First Name
  const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 2);
  const neLeIndex = lines.findIndex(l => /N[eé][eé]?\s+le/i.test(l));
  
  if (neLeIndex >= 2) {
    // Line before "Né le" is usually Last Name
    // The line before that is First Name
    data.lastName = lines[neLeIndex - 1];
    data.firstName = lines[neLeIndex - 2];
    
    // Fallback if the parsing captured the card title
    if (data.firstName.toUpperCase().includes('NATIONALE') || data.firstName.toUpperCase().includes('IDENTITE')) {
      data.firstName = lines[neLeIndex - 1]; 
      data.lastName = ''; // Not confidently found
    }
  }

  console.log('[OCR Service] Final Parsed Data Object:', data);
  return data;
};
