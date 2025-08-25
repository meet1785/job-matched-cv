import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface ATSScoreCategory { score: number; status: 'good' | 'warning' | 'poor'; details: string[] }
interface ATSScore { overall: number; categories: { keywords: ATSScoreCategory; formatting: ATSScoreCategory; sections: ATSScoreCategory; readability: ATSScoreCategory; }; }

interface CandidateData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: string;
  skills: string;
  education: string;
  isFromUpload?: boolean;
}

interface JobData {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  aiAnalysis?: {
    keywords: string[];
    requirements: string[];
    skillsGap: string[];
  };
}

interface ATSScoringProps {
  candidateData: CandidateData;
  jobData: JobData;
  isLoading?: boolean;
}

export const ATSScoring = ({ candidateData, jobData, isLoading }: ATSScoringProps) => {
  // Dynamic ATS scoring calculation (heuristic)
  const calculateATSScore = (): ATSScore => {
    const candidateSkills = candidateData.skills.toLowerCase().split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    const jobKeywords = (jobData.aiAnalysis?.keywords || []).map(k => k.toLowerCase());
    const jobRequirements = jobData.aiAnalysis?.requirements || [];

    // Keyword coverage
    const keywordMatches = jobKeywords.filter(keyword => candidateSkills.some(skill => skill.includes(keyword) || keyword.includes(skill)));
    const keywordScoreRaw = jobKeywords.length ? (keywordMatches.length / jobKeywords.length) * 100 : 0;
    const keywordScore = Math.round(Math.min(100, keywordScoreRaw));

    // Section presence
    const essentialSections: Array<[string, string]> = [
      ['summary', candidateData.summary],
      ['experience', candidateData.experience],
      ['skills', candidateData.skills],
      ['education', candidateData.education]
    ];
    const present = essentialSections.filter(([_, content]) => content && content.trim().length > 30).length;
    const sectionsScore = Math.round((present / essentialSections.length) * 100);

    // Formatting heuristics
    const bulletCount = (candidateData.experience.match(/\n?•|^-|^\*/gm) || []).length;
    const avgLineLen = candidateData.experience.split(/\n+/).filter(l => l.trim()).reduce((a,l)=>a+l.length,0) / Math.max(1, candidateData.experience.split(/\n+/).filter(l => l.trim()).length);
    let formattingScore = 70;
    if (bulletCount > 3) formattingScore += 10;
    if (avgLineLen < 180) formattingScore += 10; // shorter lines easier for parsers
    if (candidateData.isFromUpload) formattingScore += 5; // preserved structure
    formattingScore = Math.min(100, formattingScore);

    // Readability heuristic (average words per sentence + action verbs)
    const sentences = candidateData.experience.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    const totalWords = sentences.reduce((a,s)=>a+s.split(/\s+/).filter(Boolean).length,0);
    const avgWordsPerSentence = totalWords / Math.max(1, sentences.length);
    const actionVerbs = ['led','managed','developed','built','improved','optimized','designed','implemented','collaborated','created','reduced','increased','delivered'];
    const actionVerbMatches = candidateData.experience.toLowerCase().split(/\b/).filter(t => actionVerbs.includes(t.trim())).length;
    let readabilityScore = 70;
    if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 25) readabilityScore += 15; else readabilityScore -= 10;
    if (actionVerbMatches >= Math.max(3, sentences.length * 0.3)) readabilityScore += 10; else readabilityScore -= 5;
    if (candidateData.experience.length > 400) readabilityScore += 5;
    readabilityScore = Math.max(30, Math.min(100, readabilityScore));

    // Combine weighted
    const overall = Math.round((keywordScore * 0.35) + (sectionsScore * 0.2) + (formattingScore * 0.2) + (readabilityScore * 0.25));

    const mkStatus = (score: number): 'good' | 'warning' | 'poor' => score >= 80 ? 'good' : score >= 60 ? 'warning' : 'poor';

    return {
      overall,
      categories: {
        keywords: {
          score: keywordScore,
            status: mkStatus(keywordScore),
          details: [
            `${keywordMatches.length}/${jobKeywords.length || 0} job keywords matched`,
            jobKeywords.length ? `Top missing: ${jobKeywords.filter(k => !keywordMatches.includes(k)).slice(0,5).join(', ') || 'None'}` : 'No job keywords provided',
            `Skills list size: ${candidateSkills.length}`
          ]
        },
        formatting: {
          score: formattingScore,
          status: mkStatus(formattingScore),
          details: [
            `Bullet points detected: ${bulletCount}`,
            `Avg line length: ${Math.round(avgLineLen)} chars`,
            candidateData.isFromUpload ? 'Original structure preserved' : 'Manual entry structure'
          ]
        },
        sections: {
          score: sectionsScore,
          status: mkStatus(sectionsScore),
          details: [
            `Sections present: ${present}/${essentialSections.length}`,
            essentialSections.filter(([name, content]) => !content || content.trim().length <= 30).length ? 'Consider expanding missing/short sections' : 'All essential sections filled',
            jobRequirements.length ? `${jobRequirements.length} job requirements analyzed` : 'No job requirements extracted'
          ]
        },
        readability: {
          score: readabilityScore,
          status: mkStatus(readabilityScore),
          details: [
            `Avg words per sentence: ${Math.round(avgWordsPerSentence)}`,
            `Action verbs used: ${actionVerbMatches}`,
            candidateData.experience.length > 1500 ? 'Consider shortening very long experience section' : 'Experience length reasonable'
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