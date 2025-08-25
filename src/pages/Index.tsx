import { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { CandidateForm } from "@/components/CandidateForm";
import { JobDescriptionForm } from "@/components/JobDescriptionForm";
import { Suspense, lazy } from 'react';
const MakeIntegration = lazy(() => import("@/components/MakeIntegration").then(m => ({ default: m.MakeIntegration })));
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

type Step = "hero" | "candidate" | "job" | "integration" | "complete";

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

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>("hero");
  const [candidateData, setCandidateData] = useState<CandidateData | null>(null);
  const [jobData, setJobData] = useState<JobDescriptionData | null>(null);
  
  const steps = ["Candidate Info", "Job Analysis", "Generate Resume"];
  const stepNumbers = {
    hero: 0,
    candidate: 1,
    job: 2,
    integration: 3,
    complete: 3,
  };

  const handleGetStarted = () => {
    setCurrentStep("candidate");
  };

  const handleCandidateSubmit = (data: CandidateData) => {
    setCandidateData(data);
    setCurrentStep("job");
  };

  const handleJobSubmit = (data: JobDescriptionData) => {
    setJobData(data);
    setCurrentStep("integration");
  };

  const handleIntegrationComplete = () => {
    setCurrentStep("complete");
  };

  const handleReset = () => {
    setCurrentStep("hero");
    setCandidateData(null);
    setJobData(null);
  };

  if (currentStep === "hero") {
    return (
      <main className="min-h-screen bg-background">
        <HeroSection onGetStarted={handleGetStarted} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-4"><ThemeToggle /></div>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Resume Generator</h1>
            <p className="text-muted-foreground">Create your ATS-optimized resume in 3 easy steps</p>
          </div>

          {currentStep !== "complete" && (
            <ProgressIndicator 
              currentStep={stepNumbers[currentStep]} 
              totalSteps={steps.length} 
              steps={steps} 
            />
          )}

          {currentStep === "candidate" && (
            <CandidateForm onSubmit={handleCandidateSubmit} />
          )}

          {currentStep === "job" && candidateData && (
            <JobDescriptionForm onSubmit={handleJobSubmit} candidateSkills={candidateData.skills} />
          )}

          {currentStep === "integration" && candidateData && jobData && (
            <Suspense fallback={<div className="text-center py-12 text-sm text-muted-foreground">Loading integration module...</div>}>
              <MakeIntegration 
                candidateData={candidateData}
                jobData={jobData}
                onComplete={handleIntegrationComplete}
              />
            </Suspense>
          )}

          {currentStep === "complete" && (
            <div className="text-center py-12">
              <div className="max-w-2xl mx-auto">
                <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-primary-foreground text-3xl">✓</span>
                </div>
                <h2 className="text-3xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                  Resume Generated Successfully!
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Your ATS-optimized resume has been generated and processed through our 
                  20-module Make.com automation. You should receive your formatted resume 
                  shortly via the configured delivery method.
                </p>
                <div className="space-y-4">
                  <div className="bg-accent/10 p-4 rounded-lg border inline-block">
                    <p className="text-sm font-medium mb-2">What happens next:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Resume formatted in HTML, PDF, and DOCX</li>
                      <li>• ATS compatibility score calculated</li>
                      <li>• Files stored in Google Drive</li>
                      <li>• Email notification sent</li>
                    </ul>
                  </div>
                </div>
                <Button 
                  onClick={handleReset}
                  className="bg-gradient-primary hover:shadow-elegant transition-all duration-300 mt-6"
                >
                  Generate Another Resume
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Index;
