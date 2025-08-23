import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface ATSScore {
  overall: number;
  categories: {
    keywords: { score: number; status: 'good' | 'warning' | 'poor'; details: string[] };
    formatting: { score: number; status: 'good' | 'warning' | 'poor'; details: string[] };
    sections: { score: number; status: 'good' | 'warning' | 'poor'; details: string[] };
    readability: { score: number; status: 'good' | 'warning' | 'poor'; details: string[] };
  };
}

interface ATSScoringProps {
  candidateData: any;
  jobData: any;
  isLoading?: boolean;
}

export const ATSScoring = ({ candidateData, jobData, isLoading }: ATSScoringProps) => {
  // Mock ATS scoring calculation
  const calculateATSScore = (): ATSScore => {
    const candidateSkills = candidateData.skills.toLowerCase().split(',').map((s: string) => s.trim());
    const jobKeywords = jobData.aiAnalysis?.keywords.map((k: string) => k.toLowerCase()) || [];
    
    const keywordMatches = jobKeywords.filter(keyword => 
      candidateSkills.some(skill => skill.includes(keyword.toLowerCase()))
    );
    
    const keywordScore = Math.min(95, (keywordMatches.length / jobKeywords.length) * 100);
    
    return {
      overall: Math.round((keywordScore + 88 + 92 + 85) / 4), // Mock overall score
      categories: {
        keywords: {
          score: Math.round(keywordScore),
          status: keywordScore >= 80 ? 'good' : keywordScore >= 60 ? 'warning' : 'poor',
          details: [
            `${keywordMatches.length}/${jobKeywords.length} job keywords found`,
            keywordScore >= 80 ? 'Excellent keyword coverage' : 'Consider adding more relevant keywords',
            'Skills section well-optimized for ATS parsing'
          ]
        },
        formatting: {
          score: 88,
          status: 'good',
          details: [
            'Clean, parseable structure detected',
            'Standard section headings used',
            'Proper bullet point formatting'
          ]
        },
        sections: {
          score: 92,
          status: 'good',
          details: [
            'All essential sections present',
            'Professional summary included',
            'Work experience properly structured'
          ]
        },
        readability: {
          score: 85,
          status: 'good',
          details: [
            'Clear, concise language used',
            'Good use of action verbs',
            'Quantifiable achievements highlighted'
          ]
        }
      }
    };
  };

  const atsScore = isLoading ? null : calculateATSScore();

  const getStatusIcon = (status: 'good' | 'warning' | 'poor') => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'poor':
        return <XCircle className="w-5 h-5 text-destructive" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-warning';
    return 'bg-destructive';
  };

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-xl">ATS Compatibility Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-sm font-medium">Analyzing ATS compatibility...</p>
            <p className="text-xs text-muted-foreground">Checking formatting, keywords, and structure</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!atsScore) return null;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-3">
          ATS Compatibility Score
          <Badge 
            variant={atsScore.overall >= 80 ? "default" : atsScore.overall >= 60 ? "secondary" : "destructive"}
            className="text-lg px-3 py-1"
          >
            {atsScore.overall}%
          </Badge>
        </CardTitle>
        <div className="space-y-2">
          <Progress 
            value={atsScore.overall} 
            className="h-3"
          />
          <p className="text-sm text-muted-foreground">
            {atsScore.overall >= 80 
              ? "Excellent! Your resume is highly optimized for ATS systems."
              : atsScore.overall >= 60 
              ? "Good score with room for improvement."
              : "Needs improvement to pass ATS filters effectively."
            }
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(atsScore.categories).map(([category, data]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(data.status)}
                  <h3 className="text-sm font-semibold capitalize">{category}</h3>
                </div>
                <span className={`text-sm font-semibold ${getScoreColor(data.score)}`}>
                  {data.score}%
                </span>
              </div>
              
              <Progress 
                value={data.score} 
                className="h-2"
              />
              
              <div className="space-y-1">
                {data.details.map((detail, index) => (
                  <p key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                    <span className="text-primary">•</span>
                    {detail}
                  </p>
                ))}
              </div>
            </div>
          ))}
          
          <div className="mt-6 p-4 bg-accent/10 rounded-lg border">
            <h4 className="text-sm font-semibold mb-2">💡 ATS Optimization Tips</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Use standard section headers (Experience, Education, Skills)</li>
              <li>• Include relevant keywords from the job description</li>
              <li>• Avoid complex formatting, tables, or graphics</li>
              <li>• Use common file formats (PDF or DOCX)</li>
              <li>• Quantify achievements with specific numbers and metrics</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};