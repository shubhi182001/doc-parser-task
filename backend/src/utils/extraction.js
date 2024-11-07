const extractInformationByDocType = (text, docType = 'passport') => {
    const cleanedText = cleanText(text);
    const documentPatterns = {
      drivingLicense: {
        licenseNumber: /([A-Z]{2}\d{2}\s*\d+)/i,  
        name: /Name\s*:\s*(.*?)(?=\s+Date)/i,  
        dateOfBirth: /Date Of Birth\s*:\s*(\d{2}-\d{2}-\d{4}|\d{2}\/\d{2}\/\d{4}|\d{2}\.\d{2}\.\d{4})/i,  // added more date formats
        address: /Address:\s*([^]*?)(?=\s*$)/i,  
      }
    };
  
    const patterns = documentPatterns[docType] || documentPatterns.passport;
    const extracted = {};
  
    for (const [field, pattern] of Object.entries(patterns)) {
      const match = cleanedText.match(pattern);
      extracted[field] = match ? cleanText(match[1]) : null;
    }
    extracted.documentType = docType;
    extracted.extractedAt = new Date().toISOString();
    extracted.confidenceScore = calculateConfidenceScore(extracted);
  
    return extracted;
  };
  
  const cleanText = (text) => {
    return text ? text.trim().replace(/\s+/g, ' ') : null;
  };

  const calculateConfidenceScore = (extracted) => {
    const totalFields = Object.keys(extracted).length - 3;
    const filledFields = Object.values(extracted).filter(val => val !== null).length - 3;
    return Math.round((filledFields / totalFields) * 100);
  };
  
  module.exports = {
    extractInformationByDocType,
  };
  