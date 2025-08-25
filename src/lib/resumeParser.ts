// Resume parsing utilities for extracting data from uploaded files
import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';

// Set the worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

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
    structure: Record<string, unknown>;
    styling: Record<string, unknown>;
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

// Extract text from PDF files using pdf.js
const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent: any = await page.getTextContent();
      // Sort items by their y, then x position to reduce jumbling (PDFs often have reading order issues)
      const items = (textContent.items || []).map((item: any) => {
        return {
          str: 'str' in item ? item.str : '',
            // pdf.js v3+ uses transform array [a,b,c,d,e(fx),f(fy)]
          x: item.transform ? item.transform[4] : (item.hasOwnProperty('x') ? item.x : 0),
          y: item.transform ? item.transform[5] : (item.hasOwnProperty('y') ? item.y : 0)
        };
      }).filter(i => i.str);

      items.sort((a: any, b: any) => {
        // Allow small y deltas to be considered same line
        const yDiff = Math.abs(a.y - b.y);
        if (yDiff < 4) return a.x - b.x; // same line, sort by x
        return b.y - a.y; // pdf y origin bottom-left; invert for top-down
      });

      // Group into lines
      const lines: string[] = [];
      let currentLine: { y: number; parts: string[] } | null = null;
      for (const it of items) {
        if (!currentLine) {
          currentLine = { y: it.y, parts: [it.str] };
          continue;
        }
        if (Math.abs(it.y - currentLine.y) < 4) {
          currentLine.parts.push(it.str);
        } else {
          lines.push(currentLine.parts.join(' ').replace(/\s+/g, ' ').trim());
          currentLine = { y: it.y, parts: [it.str] };
        }
      }
      if (currentLine) lines.push(currentLine.parts.join(' ').replace(/\s+/g, ' ').trim());

      // Keep blank line between pages for paragraph separation
      fullText += lines.join('\n') + '\n\n';
    }

    return fullText.replace(/\n{3,}/g, '\n\n').trim();
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return 'PDF parsing failed. Please try uploading a different format or fill manually.';
  }
};

// Extract text from DOCX files using mammoth.js
const extractTextFromDOCX = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting DOCX text:', error);
    return 'DOCX parsing failed. Please try uploading a different format or fill manually.';
  }
};

// Extract text from DOC files
const extractTextFromDOC = async (file: File): Promise<string> => {
  return 'DOC format parsing requires specialized libraries. Please convert to DOCX or fill manually.';
};

// Parse extracted text content into structured data
const parseTextContent = (text: string, fileType: string): Omit<ParsedResumeData, 'originalFormat'> => {
  // Normalise spacing
  const cleaned = text
    .replace(/\u2022/g, '•')
    .replace(/\r/g, '')
    .replace(/\t+/g, ' ')
    .replace(/ {2,}/g, ' ')
    .replace(/\f/g, '\n')
    .trim();

  const rawLines = cleaned.split(/\n+/).map(l => l.trim());
  const lines = rawLines.filter(l => l.length > 0);

  // Extract email (first plausible one)
  // Allow stray spaces around dots or before TLD (common PDF extraction artifact)
  const compactForEmail = cleaned.replace(/\s+([.@])/g, '$1').replace(/([.@])\s+/g, '$1');
  const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
  const emailMatch = compactForEmail.match(emailRegex);
  const email = emailMatch?.[0] || '';

  // Extract phone (international tolerant). Prefer line containing digits > 9 and separators.
  const phoneRegex = /(?:(?:\+|00)?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?){2,4}\d{2,6}/g;
  let phone = '';
  const phoneCandidates = cleaned.match(phoneRegex) || [];
  if (phoneCandidates.length) {
    phone = phoneCandidates
      .map(p => p.replace(/[^+\d]/g, ''))
      .sort((a, b) => b.length - a.length)[0];
    // Reformat phone nicely
    if (phone.startsWith('1') && phone.length === 11) phone = '+' + phone[0] + ' ' + phone.slice(1);
  }

  // Heuristic name detection: first line(s) before first heading or contact block,
  // containing 2-4 capitalized words, not an email/phone
  const headingKeywords = [
    'summary','professional summary','objective','profile','experience','work experience','employment',
    'projects','technical skills','skills','education','certifications','achievements','publications',
    'strengths','core competencies'
  ];
  const headingRegex = new RegExp('^(' + headingKeywords.map(k => k.replace(/ /g, '\\s+')).join('|') + ')(:)?$', 'i');

  let fullName = '';
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (!line) continue;
    if (headingRegex.test(line.toLowerCase())) break;
    if (email && line.includes(email)) continue;
    if (phone && line.replace(/[^+\d]/g, '').includes(phone.replace(/[^+\d]/g, ''))) continue;
    const words = line.split(/\s+/);
    if (words.length >= 2 && words.length <= 5 && words.every(w => /^[A-Z][A-Za-z'’.-]*$/.test(w))) {
      fullName = words.join(' ');
      break;
    }
  }
  if (!fullName) {
    // Fallback: first two capitalized words overall
    const candidate = cleaned.match(/^[A-Z][A-Za-z'’.-]*\s+[A-Z][A-Za-z'’.-]*/);
    fullName = candidate?.[0] || '';
  }

  // Location: prefer line with city + country/state not containing education keywords
  let location = '';
  const educationWords = ['bachelor','university','certificate','diploma','school','college','engineering'];
  for (const line of lines.slice(0, 20)) {
    const lower = line.toLowerCase();
    if (educationWords.some(w => lower.includes(w))) continue;
    if (/[A-Za-z].*,\s*[A-Za-z]{2,}(?:\s*[A-Za-z]{2,})?/.test(line) && !line.includes('@')) {
      location = line;
      break;
    }
  }

  // Build a structured map of sections by scanning headings
  interface Section { name: string; index: number; }
  const sections: Section[] = [];
  lines.forEach((line, idx) => {
    const normal = line.toLowerCase().replace(/\s+/g, ' ');
    const stripped = normal.replace(/:$/, '');
    if (headingKeywords.some(k => stripped === k || stripped.includes(k))) {
      sections.push({ name: stripped, index: idx });
    } else if (/^[A-Z\s&]{5,}$/.test(line) && line.length < 70 && headingKeywords.some(k => stripped.includes(k))) {
      sections.push({ name: stripped, index: idx });
    }
  });
  sections.sort((a,b) => a.index - b.index);

  const getSectionText = (primaryNames: string[], altNames: string[] = []): string => {
    const allNames = primaryNames.concat(altNames).map(n => n.toLowerCase());
    const sec = sections.find(s => allNames.some(n => s.name === n || s.name.includes(n)));
    if (!sec) return '';
    const thisIdx = sec.index;
    const nextSec = sections.find(s => s.index > thisIdx);
    const slice = lines.slice(thisIdx + 1, nextSec ? nextSec.index : undefined);
    return slice.join('\n').trim();
  };

  const summary = getSectionText(['summary','professional summary','profile','objective','about']) || (() => {
    // Fallback: paragraph after name / contact (first 1200 chars boundary)
    const contactBlockEnd = lines.findIndex(l => email && l.includes(email)) + 1 || 0;
    const after = lines.slice(contactBlockEnd, contactBlockEnd + 10).join('\n');
    const para = after.split(/\n{2,}/)[0];
    return para.trim();
  })();

  const experienceRaw = getSectionText(['experience','work experience','professional experience','employment','work history']);
  const educationRaw = getSectionText(['education','academic background','qualifications']);
  let skillsRaw = getSectionText(['skills','technical skills','technical','core competencies','competencies','strengths']);

  // Normalise skills: join bullet / comma / semicolon separated into comma list
  if (skillsRaw) {
    const skillLines = skillsRaw.split(/\n+/).filter(l => l);
    const tokens: string[] = [];
    skillLines.forEach(l => {
      const cleanedLine = l.replace(/^[-•*]\s*/, '');
      if (cleanedLine.split(/[,;•]/).length > 1) {
        cleanedLine.split(/[,;•]/).forEach(p => tokens.push(p.trim()));
      } else {
        tokens.push(cleanedLine.trim());
      }
    });
    skillsRaw = Array.from(new Set(tokens.filter(t => t && t.length < 64))).join(', ');
  }

  // If experience content seems jumbled (single very long line), attempt bullet reconstitution
  const normaliseBullets = (block: string) => {
    if (!block) return '';
    // Insert newlines before common bullet or role indicators if missing
    let out = block
      .replace(/\s*[-•]\s*/g, '\n• ')
      .replace(/(?<!\n)(\b[A-Z][A-Za-z&/]+\s+Inc\.|\b[0-9]{4}\b)/g, '\n$1');
    // Merge broken month-year lines (e.g., 'Oct' '\n2024')
    out = out.replace(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\n\s*(\d{4})/g, '$1 $2');
    // Merge date ranges split around bullet markers
    out = out.replace(/(\d{4})\n•\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)/g, '$1 - $2');
    out = out.replace(/\n{3,}/g, '\n\n');
    return out.trim();
  };

  const experience = normaliseBullets(experienceRaw);
  const education = normaliseBullets(educationRaw);
  const skills = skillsRaw;

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

export const preserveResumeFormat = <T extends object>(
  originalFormat: Record<string, unknown>,
  newContent: T
): T & { formatInstructions: Record<string, unknown> } => {
  return {
    ...(newContent as T),
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