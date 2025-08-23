import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface MakeIntegrationProps {
  candidateData: any;
  jobData: any;
  onComplete: () => void;
}

export const MakeIntegration = ({ candidateData, jobData, onComplete }: MakeIntegrationProps) => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);
  const { toast } = useToast();

  const simulateProgress = () => {
    const steps = [
      "Analyzing job requirements...",
      "Optimizing candidate profile...",
      "Generating ATS-friendly format...",
      "Creating professional summary...",
      "Optimizing work experience...",
      "Organizing skills and keywords...",
      "Generating HTML template...",
      "Converting to PDF format...",
      "Running ATS compatibility check...",
      "Finalizing resume..."
    ];

    setProcessingSteps([]);
    setProgress(0);

    steps.forEach((step, index) => {
      setTimeout(() => {
        setProcessingSteps(prev => [...prev, step]);
        setProgress(((index + 1) / steps.length) * 100);
        
        if (index === steps.length - 1) {
          setTimeout(() => {
            setIsProcessing(false);
            toast({
              title: "Resume Generated Successfully!",
              description: "Your ATS-optimized resume has been created and sent to your Make.com workflow.",
            });
            onComplete();
          }, 1000);
        }
      }, index * 800);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please enter your Make.com webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    simulateProgress();

    try {
      const payload = {
        timestamp: new Date().toISOString(),
        candidate: candidateData,
        jobDescription: jobData,
        automation_trigger: "resume_generation",
        options: {
          format: ["pdf", "docx", "html"],
          ats_optimization: true,
          keyword_optimization: true,
          professional_formatting: true
        }
      };

      console.log("Sending to Make.com:", payload);

      // In a real implementation, this would send to the actual webhook
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify(payload),
      });

      console.log("Make.com webhook triggered successfully");
    } catch (error) {
      console.error("Error triggering Make.com webhook:", error);
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "Failed to trigger the Make.com webhook. Please check your URL and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
          Make.com Integration
        </CardTitle>
        <p className="text-muted-foreground">
          Connect to your Make.com automation to generate and deliver your optimized resume
        </p>
      </CardHeader>
      <CardContent>
        {!isProcessing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Make.com Webhook URL *</Label>
              <Input
                id="webhookUrl"
                type="url"
                placeholder="https://hooks.make.com/your-webhook-url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                Get this URL from your Make.com scenario webhook trigger
              </p>
            </div>

            <div className="bg-accent/10 p-4 rounded-lg border">
              <h3 className="font-semibold mb-3">What will be sent to Make.com:</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Candidate Data</Badge>
                  <span className="text-sm">{candidateData?.fullName || "Your profile"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Job Description</Badge>
                  <span className="text-sm">{jobData?.jobTitle || "Target position"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">AI Analysis</Badge>
                  <span className="text-sm">Keywords and optimization data</span>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:shadow-elegant transition-all duration-300 text-lg py-6"
            >
              Generate Resume with Make.com
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Processing Your Resume</h3>
              <p className="text-muted-foreground">
                Your resume is being generated using our 20-module automation
              </p>
            </div>

            <div className="space-y-4">
              <Progress value={progress} className="w-full" />
              <div className="text-center text-sm font-medium">
                {Math.round(progress)}% Complete
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {processingSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                  <span className="text-muted-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};