import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-resume.jpg";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero opacity-10" />
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
            ATS-Optimized Resume Generator
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create professional, ATS-friendly resumes tailored to specific job descriptions. 
            Powered by AI and integrated with Make.com automation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              onClick={onGetStarted}
              className="bg-gradient-primary hover:shadow-elegant transition-all duration-300 text-lg px-8 py-4"
            >
              Generate Resume Now
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-4"
            >
              View Demo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border shadow-card">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-primary-foreground text-xl font-bold">AI</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Analysis</h3>
              <p className="text-muted-foreground">
                Advanced AI analyzes job descriptions and optimizes your resume for maximum ATS compatibility.
              </p>
            </div>
            
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border shadow-card">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-primary-foreground text-xl font-bold">✓</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">ATS Friendly</h3>
              <p className="text-muted-foreground">
                Ensures your resume passes through Applicant Tracking Systems with optimal formatting and keywords.
              </p>
            </div>
            
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border shadow-card">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-primary-foreground text-xl font-bold">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Make.com Integration</h3>
              <p className="text-muted-foreground">
                Seamlessly integrates with Make.com for automated resume generation and delivery workflows.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};