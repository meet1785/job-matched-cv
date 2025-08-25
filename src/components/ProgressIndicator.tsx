import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export const ProgressIndicator = ({ currentStep, totalSteps, steps }: ProgressIndicatorProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto mb-10 px-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          return (
            <div key={index} className="flex flex-col items-center flex-1 relative">
              <div className="flex items-center w-full justify-center">
                <div
                  className={cn(
                    "relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 backdrop-blur-sm",
                    "border border-primary/20",
                    {
                      "bg-gradient-primary text-primary-foreground shadow-elegant scale-105": isCurrent,
                      "bg-accent text-accent-foreground": isCompleted && !isCurrent,
                      "bg-muted text-muted-foreground": !isCompleted && !isCurrent,
                    }
                  )}
                >
                  <span className="z-10">{isCompleted ? "✓" : stepNumber}</span>
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-primary/30" />
                  )}
                </div>
              </div>
              <span
                className={cn(
                  "text-[11px] mt-3 text-center tracking-wide uppercase font-medium transition-colors duration-300",
                  {
                    "text-primary": isCurrent,
                    "text-accent": isCompleted && !isCurrent,
                    "text-muted-foreground": !isCompleted && !isCurrent,
                  }
                )}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};