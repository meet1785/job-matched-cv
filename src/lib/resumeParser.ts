// Resume parsing utilities for extracting data from uploaded files

export interface ParsedResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: string;
  skills: string;
  education: string;
  originalFormat: {
    fileType: string;
    fileName?: string;
    fileSize?: number;
    structure: any;
    styling: any;
  };
}

export const parseResumeFile = async (file: File): Promise<ParsedResumeData> => {
  const fileName = file.name;
  const fileType = file.type || fileName.split('.').pop() || '';
  
  try {
    let extractedText = '';
    
    // Extract text based on file type
    if (file.type === 'application/pdf') {
      extractedText = await extractTextFromPDF(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               file.name.endsWith('.docx')) {
      extractedText = await extractTextFromDOCX(file);
    } else if (file.type === 'application/msword' || file.name.endsWith('.doc')) {
      extractedText = await extractTextFromDOC(file);
    } else {
      // Fallback: try to read as text
      extractedText = await file.text();
    }

    // Parse the extracted text
    const parsedData = parseTextContent(extractedText, fileType);
    
    return {
      ...parsedData,
      originalFormat: {
        fileType: fileType,
        fileName: fileName,
        fileSize: file.size,
        structure: detectResumeStructure(extractedText),
        styling: detectResumeStyle(extractedText)
      }
    };
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error('Failed to parse resume file');
  }
};

// Extract text from PDF files
const extractTextFromPDF = async (file: File): Promise<string> => {
  // For now, we'll use a simple approach. In production, you'd use pdf-parse or similar
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Simple PDF text extraction (limited but functional for basic resumes)
  let text = '';
  for (let i = 0; i < uint8Array.length - 1; i++) {
    if (uint8Array[i] === 40 && uint8Array[i + 1] !== 40) { // Look for text strings in PDF
      let j = i + 1;
      while (j < uint8Array.length && uint8Array[j] !== 41) {
        if (uint8Array[j] >= 32 && uint8Array[j] <= 126) {
          text += String.fromCharCode(uint8Array[j]);
        }
        j++;
      }
      text += ' ';
    }
  }
  
  return text.length > 50 ? text : 'PDF parsing requires additional libraries. Please use DOCX or plain text format.';
};

// Extract text from DOCX files
const extractTextFromDOCX = async (file: File): Promise<string> => {
  // Basic DOCX text extraction - in production, use mammoth.js or similar
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Convert to string and look for text patterns
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const content = decoder.decode(uint8Array);
  
  // Extract readable text (basic approach)
  const textMatch = content.match(/[\w\s@.,;:!?()-]+/g);
  return textMatch ? textMatch.join(' ').replace(/\s+/g, ' ').trim() : 
    'DOCX parsing requires additional libraries. Please fill manually or use plain text.';
};

// Extract text from DOC files
const extractTextFromDOC = async (file: File): Promise<string> => {
  return 'DOC format parsing requires specialized libraries. Please convert to DOCX or fill manually.';
};

// Parse extracted text content into structured data
const parseTextContent = (text: string, fileType: string): Omit<ParsedResumeData, 'originalFormat'> => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Extract email
  const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
  const emailMatch = text.match(emailRegex);
  const email = emailMatch ? emailMatch[0] : '';

  // Extract phone
  const phoneRegex = /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
  const phoneMatch = text.match(phoneRegex);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // Extract name (usually first non-email line)
  const nameRegex = /^[A-Z][a-z]+ [A-Z][a-z]+/m;
  const nameMatch = text.match(nameRegex);
  let fullName = nameMatch ? nameMatch[0] : '';
  
  // If no name found, try first line that looks like a name
  if (!fullName) {
    const firstWords = lines[0]?.split(' ');
    if (firstWords && firstWords.length >= 2 && firstWords.every(word => /^[A-Za-z]+$/.test(word))) {
      fullName = firstWords.slice(0, 2).join(' ');
    }
  }

  // Extract location (look for city, state patterns)
  const locationRegex = /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),?\s*([A-Z]{2}|[A-Z][a-z]+)/g;
  const locationMatch = text.match(locationRegex);
  const location = locationMatch ? locationMatch[0] : '';

  // Extract experience section
  const experienceKeywords = ['experience', 'employment', 'work history', 'professional experience'];
  const skillsKeywords = ['skills', 'technical skills', 'competencies'];
  const educationKeywords = ['education', 'academic', 'qualifications'];
  
  const experience = extractSection(text, experienceKeywords, skillsKeywords.concat(educationKeywords));
  const skills = extractSection(text, skillsKeywords, educationKeywords.concat(['experience']));
  const education = extractSection(text, educationKeywords, ['experience', 'skills']);
  
  // Extract summary (usually after name and contact info)
  const summaryKeywords = ['summary', 'objective', 'profile', 'about'];
  let summary = extractSection(text, summaryKeywords, experienceKeywords);
  
  // If no explicit summary section, try to extract first paragraph after contact info
  if (!summary) {
    const contactInfoEnd = Math.max(
      text.indexOf(email),
      text.indexOf(phone),
      text.indexOf(location)
    );
    if (contactInfoEnd > -1) {
      const afterContact = text.substring(contactInfoEnd + 50);
      const paragraphs = afterContact.split('\n\n');
      summary = paragraphs[0]?.trim() || '';
    }
  }

  return {
    fullName: fullName || 'Name not found',
    email: email || 'Email not found',
    phone: phone || 'Phone not found', 
    location: location || 'Location not found',
    summary: summary || 'Summary not found',
    experience: experience || 'Experience not found',
    skills: skills || 'Skills not found',
    education: education || 'Education not found'
  };
};

// Extract a section based on keywords
const extractSection = (text: string, sectionKeywords: string[], stopKeywords: string[]): string => {
  const lowerText = text.toLowerCase();
  
  // Find section start
  let sectionStart = -1;
  for (const keyword of sectionKeywords) {
    const index = lowerText.indexOf(keyword.toLowerCase());
    if (index > -1) {
      sectionStart = index;
      break;
    }
  }
  
  if (sectionStart === -1) return '';
  
  // Find section end
  let sectionEnd = text.length;
  for (const stopKeyword of stopKeywords) {
    const index = lowerText.indexOf(stopKeyword.toLowerCase(), sectionStart + 50);
    if (index > -1 && index < sectionEnd) {
      sectionEnd = index;
    }
  }
  
  return text.substring(sectionStart, sectionEnd).trim();
};

// Detect resume structure
const detectResumeStructure = (text: string) => {
  const sections = [];
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('summary') || lowerText.includes('objective')) sections.push('summary');
  if (lowerText.includes('experience') || lowerText.includes('employment')) sections.push('experience');
  if (lowerText.includes('skills') || lowerText.includes('competencies')) sections.push('skills');
  if (lowerText.includes('education') || lowerText.includes('academic')) sections.push('education');
  
  return {
    sections,
    layout: 'single-column', // Default assumption
    hasHeaders: sections.length > 0
  };
};

// Detect resume style
const detectResumeStyle = (text: string) => {
  return {
    hasBullets: text.includes('•') || text.includes('*') || text.includes('-'),
    hasNumbers: /\d/.test(text),
    formatting: 'standard'
  };
};

export const preserveResumeFormat = (originalFormat: any, newContent: any) => {
  return {
    ...newContent,
    formatInstructions: {
      ...originalFormat,
      preserveStructure: true,
      maintainStyling: true,
      instructions: [
        "Maintain original font family and size",
        "Preserve section order and layout", 
        "Keep consistent spacing and margins",
        "Use same bullet point style",
        "Maintain color scheme"
      ]
    }
  };
};