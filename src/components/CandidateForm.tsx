import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/ui/file-upload";
import { parseResumeFile, ParsedResumeData } from "@/lib/resumeParser";

interface CandidateData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: string;
  skills: string;
  education: string;
  originalFormat?: Record<string, unknown>;
  isFromUpload?: boolean;
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
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof CandidateData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = async (file: File) => {
    setUploadedFile(file);
    setIsParsing(true);
    
    try {
      const parsedData = await parseResumeFile(file);
      setFormData({
        ...parsedData,
        originalFormat: parsedData.originalFormat,
        isFromUpload: true
      });
      
      toast({
        title: "Resume Parsed Successfully",
        description: "Your resume data has been extracted and format preserved.",
      });
    } catch (error) {
      toast({
        title: "Parsing Error",
        description: "Failed to parse resume. Please try again or fill manually.",
        variant: "destructive",
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileRemove = () => {
    setUploadedFile(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
      experience: "",
      skills: "",
      education: "",
    });
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Existing Resume</TabsTrigger>
            <TabsTrigger value="create">Create New Resume</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-6">
            <FileUpload
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              selectedFile={uploadedFile}
              isLoading={isParsing}
              accept=".pdf,.doc,.docx"
              maxSize={10}
            />
            
            {isParsing && (
              <div className="bg-accent/10 p-4 rounded-lg border">
                <p className="text-sm font-medium mb-2">Parsing your resume...</p>
                <p className="text-sm text-muted-foreground">
                  Extracting format, content, and structure information
                </p>
              </div>
            )}
            
            {formData.fullName && !isParsing && (
              <div className="bg-accent/10 p-4 rounded-lg border">
                <p className="text-sm font-medium mb-2">✓ Resume Parsed Successfully</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Name: {formData.fullName}</p>
                  <p>• Email: {formData.email}</p>
                  <p>• Format: {formData.originalFormat?.fileType || 'Unknown'}</p>
                  <p>• Skills: {formData.skills.substring(0, 50)}...</p>
                </div>
              </div>
            )}
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

        {(formData.fullName || activeTab === "create") && (
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {formData.isFromUpload && (
              <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-success text-sm">✓</span>
                  <span className="text-sm font-medium text-success">Resume data extracted and format preserved</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Review and edit the information below. Original format will be maintained during generation.
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