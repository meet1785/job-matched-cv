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
    structure: any;
    styling: any;
  };
}

export const parseResumeFile = async (file: File): Promise<ParsedResumeData> => {
  // Simulate resume parsing - in production, this would use actual parsing libraries
  const fileName = file.name;
  const fileType = file.type || fileName.split('.').pop() || '';
  
  // Mock extracted data based on file analysis
  const mockParsedData: ParsedResumeData = {
    fullName: "John Smith",
    email: "john.smith@email.com", 
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    summary: "Experienced software engineer with 5+ years in full-stack development. Proficient in React, Node.js, and cloud technologies. Passionate about creating scalable solutions and leading development teams.",
    experience: `Senior Software Engineer | TechCorp Inc. | 2021 - Present
• Led development of microservices architecture serving 100K+ users
• Implemented CI/CD pipelines reducing deployment time by 60%
• Mentored junior developers and conducted code reviews

Software Engineer | StartupXYZ | 2019 - 2021  
• Built responsive web applications using React and TypeScript
• Collaborated with cross-functional teams on product features
• Optimized database queries improving performance by 40%`,
    skills: "JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, MongoDB, PostgreSQL, Git, Agile",
    education: `Bachelor of Science in Computer Science | State University | 2019
• Graduated Magna Cum Laude (GPA: 3.8/4.0)
• Relevant Coursework: Data Structures, Algorithms, Database Systems`,
    originalFormat: {
      fileType: fileType,
      structure: {
        sections: ['header', 'summary', 'experience', 'skills', 'education'],
        layout: 'single-column',
        font: 'Arial',
        fontSize: '11pt'
      },
      styling: {
        colors: ['#000000', '#333333'],
        margins: '1 inch',
        spacing: '1.15',
        bullets: 'standard'
      }
    }
  };

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return mockParsedData;
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