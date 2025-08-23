import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface JobDescriptionData {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  requiredSkills: string[];
  aiAnalysis?: {
    keywords: string[];
    requirements: string[];
    skillsGap: string[];
  };
}

interface JobDescriptionFormProps {
  onSubmit: (data: JobDescriptionData) => void;
  isLoading?: boolean;
}

export const JobDescriptionForm = ({ onSubmit, isLoading }: JobDescriptionFormProps) => {
  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    jobDescription: "",
  });
  
  const [aiAnalysis, setAiAnalysis] = useState<JobDescriptionData["aiAnalysis"]>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock AI analysis for demo purposes
    const mockAnalysis = {
      keywords: ["JavaScript", "React", "Node.js", "API", "Database", "Agile", "Leadership"],
      requirements: [
        "5+ years of software development experience",
        "Experience with React and modern JavaScript",
        "Strong problem-solving skills",
        "Experience with REST APIs",
        "Bachelor's degree in Computer Science or related field"
      ],
      skillsGap: ["Docker", "Kubernetes", "GraphQL"]
    };
    
    setAiAnalysis(mockAnalysis);
    
    const submissionData: JobDescriptionData = {
      ...formData,
      requiredSkills: mockAnalysis.keywords,
      aiAnalysis: mockAnalysis,
    };
    
    onSubmit(submissionData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const parseJobDescription = () => {
    if (formData.jobDescription) {
      // Mock parsing logic - in real implementation, this would call an AI service
      const mockKeywords = ["React", "JavaScript", "API", "Database", "Agile"];
      setAiAnalysis({
        keywords: mockKeywords,
        requirements: [
          "Extract key requirements from job description",
          "Identify critical skills and qualifications",
          "Determine experience level needed"
        ],
        skillsGap: ["GraphQL", "Docker"]
      });
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
          Job Description Analysis
        </CardTitle>
        <p className="text-muted-foreground">
          Paste the job description to analyze requirements and optimize your resume
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title *</Label>
              <input
                id="jobTitle"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Senior Software Engineer"
                value={formData.jobTitle}
                onChange={(e) => handleChange("jobTitle", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <input
                id="companyName"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Tech Company Inc."
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description *</Label>
            <Textarea
              id="jobDescription"
              placeholder="Paste the complete job description here..."
              value={formData.jobDescription}
              onChange={(e) => handleChange("jobDescription", e.target.value)}
              rows={10}
              required
            />
            <Button
              type="button"
              variant="outline"
              onClick={parseJobDescription}
              className="mt-2"
            >
              Analyze Job Description
            </Button>
          </div>

          {aiAnalysis && (
            <div className="space-y-4 p-4 bg-accent/10 rounded-lg border">
              <h3 className="text-lg font-semibold text-accent">AI Analysis Results</h3>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Key Requirements:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {aiAnalysis.requirements.map((req, index) => (
                      <li key={index} className="text-muted-foreground">{req}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Required Keywords:</h4>
                  <div className="flex flex-wrap gap-2">
                    {aiAnalysis.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Potential Skills Gap:</h4>
                  <div className="flex flex-wrap gap-2">
                    {aiAnalysis.skillsGap.map((skill, index) => (
                      <Badge key={index} variant="outline" className="border-destructive text-destructive">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-gradient-primary hover:shadow-elegant transition-all duration-300 text-lg py-6"
            disabled={isLoading || !aiAnalysis}
          >
            {isLoading ? "Generating Resume..." : "Generate Optimized Resume"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};