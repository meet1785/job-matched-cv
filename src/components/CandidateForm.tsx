import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface CandidateData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: string;
  skills: string;
  education: string;
}

interface CandidateFormProps {
  onSubmit: (data: CandidateData) => void;
  isLoading?: boolean;
}

export const CandidateForm = ({ onSubmit, isLoading }: CandidateFormProps) => {
  const [formData, setFormData] = useState<CandidateData>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    experience: "",
    skills: "",
    education: "",
  });
  
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<CandidateData> | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof CandidateData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
    setIsProcessing(true);

    // Simulate resume parsing - in real implementation, this would call an AI service
    setTimeout(() => {
      const mockExtractedData: CandidateData = {
        fullName: "John Smith",
        email: "john.smith@email.com",
        phone: "+1 (555) 123-4567",
        location: "San Francisco, CA",
        summary: "Experienced Software Engineer with 5+ years developing scalable web applications using React, Node.js, and cloud technologies. Proven track record of leading cross-functional teams and delivering high-quality products.",
        experience: "Senior Software Engineer - Tech Corp (2022 - Present)\n• Led development of microservices architecture serving 1M+ users\n• Reduced application load time by 40% through optimization\n• Mentored 3 junior developers and improved team velocity by 25%\n\nSoftware Engineer - StartupXYZ (2020 - 2022)\n• Built responsive web applications using React and TypeScript\n• Implemented CI/CD pipelines reducing deployment time by 60%\n• Collaborated with product team to deliver 15+ features",
        skills: "JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Kubernetes, MongoDB, PostgreSQL, Git, Agile, Team Leadership",
        education: "Bachelor of Science in Computer Science\nStanford University - 2020\n\nCertifications:\n• AWS Certified Solutions Architect\n• Certified ScrumMaster (CSM)"
      };

      setExtractedData(mockExtractedData);
      setFormData(mockExtractedData);
      setIsProcessing(false);
      toast.success("Resume parsed successfully! Review and edit the extracted information.");
    }, 2000);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
          Candidate Information
        </CardTitle>
        <p className="text-muted-foreground">
          Create a new resume or upload your existing one to refine it for the job
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Existing Resume</TabsTrigger>
            <TabsTrigger value="create">Create New Resume</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-6">
            <div className="space-y-4">
              <div className="text-center p-8 border-2 border-dashed border-border rounded-lg">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">📄</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Upload Your Resume</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload your existing resume (PDF, DOC, DOCX) and we'll automatically extract the information
                    </p>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="max-w-xs mx-auto"
                      disabled={isProcessing}
                    />
                    {resumeFile && (
                      <div className="mt-3">
                        <Badge variant="secondary">{resumeFile.name}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {isProcessing && (
                <div className="text-center p-6 bg-accent/10 rounded-lg">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-sm font-medium">Parsing your resume...</p>
                  <p className="text-xs text-muted-foreground">Extracting experience, skills, and education</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="create" className="space-y-6">
            <div className="text-center p-6 bg-accent/10 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">Manual Entry</h3>
              <p className="text-sm text-muted-foreground">
                Fill out your information manually to create a new resume from scratch
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {(extractedData || !resumeFile) && (
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {extractedData && (
              <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-success text-sm">✓</span>
                  <span className="text-sm font-medium text-success">Resume data extracted successfully</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Review and edit the information below before proceeding
                </p>
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@email.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="New York, NY"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Professional Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Professional Summary</h3>
              <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  placeholder="Brief professional summary highlighting your key achievements and skills..."
                  value={formData.summary}
                  onChange={(e) => handleChange("summary", e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <Separator />

            {/* Experience */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Work Experience</h3>
              <div className="space-y-2">
                <Label htmlFor="experience">Experience Details</Label>
                <Textarea
                  id="experience"
                  placeholder="Job Title - Company Name (Start Date - End Date)&#10;• Key achievement or responsibility&#10;• Another achievement with metrics&#10;&#10;Previous Job Title - Previous Company (Start Date - End Date)&#10;• Achievement with quantifiable results"
                  value={formData.experience}
                  onChange={(e) => handleChange("experience", e.target.value)}
                  rows={8}
                />
              </div>
            </div>

            <Separator />

            {/* Skills & Education */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Skills</h3>
                <div className="space-y-2">
                  <Label htmlFor="skills">Technical & Soft Skills</Label>
                  <Textarea
                    id="skills"
                    placeholder="JavaScript, React, Node.js, Python, Project Management, Leadership, Communication"
                    value={formData.skills}
                    onChange={(e) => handleChange("skills", e.target.value)}
                    rows={6}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Education</h3>
                <div className="space-y-2">
                  <Label htmlFor="education">Education & Certifications</Label>
                  <Textarea
                    id="education"
                    placeholder="Bachelor of Science in Computer Science&#10;University Name - Graduation Year&#10;&#10;Relevant Certifications:&#10;• AWS Certified Solutions Architect&#10;• Google Cloud Professional"
                    value={formData.education}
                    onChange={(e) => handleChange("education", e.target.value)}
                    rows={6}
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:shadow-elegant transition-all duration-300 text-lg py-6"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Continue to Job Analysis"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};